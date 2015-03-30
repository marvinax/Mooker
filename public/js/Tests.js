two = new UI.Two('two-viewport');
three = new UI.Three('three-viewport');

$('#color').colorPicker({
	colorformat : 'rgba',
	alignment : 'br',
	onSelect : function(ui, color){
		two.canvas.backgroundColor = color;
		two.canvas.renderAll();
	}
})

$('.modal').on('show.bs.modal', function () {
	$(this).find('.modal-body').css({
		width:'auto', //probably not needed
		height:'auto', //probably not needed 
		'max-height':'100%'
	});
});

$('.select').on('click', function(e){
	two.addImage(e.target.getAttribute('src'));
	$('#gallery-modal').modal('toggle');
})


$("#upload-image").fileinput({
	uploadUrl: '/uploadImage/',
	uploadAsyc : true,
	showPreview: false
}).on('filebatchuploadsuccess', function(event, data, previewID, index){
	$("#image-container").append($('<a href=#><img src="./images/'+
		data.response.file+
		'" class="select col-md-3"></a>')
	);

	$('.select').on('click', function(e){
		two.addImage(e.target.getAttribute('src'));
		$('#gallery-modal').modal('toggle');
	})
});

$('#text-Kerning-range').on('input change', function(){
	$('#text-Kerning-text').val(this.value/2000);
});

$('#text-Kerning-text').on('change', function(){
	$('#text-Kerning-range').val(this.value*2000);
})

$('#text-Size-range').on('input change', function(){
	$('#text-Size-text').val(this.value/2000);
});

$('#text-Size-text').on('change', function(){
	$('#text-Size-range').val(this.value*2000);
})



$('#confirm-text').on('click', function(){
	two.addText(
		$('input#text').val(),
		'Helvetica normal',
		parseFloat($('#text-Size-text').val()),
		parseFloat($('#text-Kerning-text').val())
	);
	$('#text-modal').modal('toggle');
})

$('#deleteButton').on('click', function(){
	two.removeSelectedObject();
	two.canvas.renderAll();
});

$('#save-sketch').on('click', function(){
	var idString = $('.model-select-button.active').attr('id');
	if(idString){

		var selectedModel = modelManager.models.filter(function(model){
			return model.name === idString.split('-')[0];
		})[0];

		$.get('/saveSketch',
			{
				type : "sketch",
				name : $('#sketch-name').val(),
				three: selectedModel.param,
				two: two.canvas.toJSON()
			},
			function(data){
				console.log(data);
			}
		);

		$('#save-modal').modal('toggle');
	}
});

$.get('/loadModels', function(data){

	var material = {
		mainType: 'phong',
		opacity : {val: 0.5, min:0., max:1., name: '透明度', type: 'slider'}
	}

	var models = JSON.parse(data);
	console.log(models);

	modelManager = new Tautology.ModelManager(models, material, two.canvas);
	modelManager.select(models[1].name, three.scene);

	modelManager.models.forEach(function(elem){
		$('#'+elem.name+'-button').on('click', function(){
			modelManager.select(elem.name, three.scene);
			$('.panel-collapse').collapse('hide');
			$('#'+elem.name+'-panel').collapse('show');
		});

		
		Object.keys(elem.param).forEach(function(p){
			var name = elem.param[p].name;

			$('#'+elem.name+'-'+name+'-range').on('input change', function(){

				elem.param[p].val = this.value/2000;
				elem.geom.update();
				console.log($('#'+elem.name+'-'+name+'-text').get(0));
				$('#'+elem.name+'-'+name+'-text').val(this.value/2000);
			});

			$('#'+elem.name+'-'+name+'-text').on('change', function(){
				elem.param[p].val = this.value;
				elem.geom.update();
				$('#'+elem.name+'-'+name+'-range').val(this.value*2000);
			})
		})
	});

	$.get('/loadSketchList', function(data){
		var lists = JSON.parse(data);

		lists.forEach(function(item){
			$('#table-content').append($('<a href=# id="'+item.name+'-entry">'+item.name+'</a><p>'))

			$('#'+item.name+'-entry').click(function(){
				$.get('/loadSingleSketch', {name : item.name}, function(data){
					$('#load-modal').modal('toggle');
					
					var doc = JSON.parse(data);

					two.canvas.clear();
					two.canvas.loadFromJSON(doc.two);
					two.canvas.renderAll();
					
				})
			})
		});
		
	})

})
