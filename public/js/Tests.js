two = new UI.Two('two-viewport');
three = new UI.Three('three-viewport');

modelManager = new Tautology.ModelManager(models, material, two.canvas);

modelManager.select((Object.keys(this.models))[0], three.scene);

Object.keys(models).forEach(function(key){

	$('#'+key+'-button').on('click', function(){
		modelManager.select(key, three.scene);
		$('.panel-collapse').collapse('hide');
		$('#'+key+'-panel').collapse('show');
	});


	Object.keys(models[key].model.param).forEach(function(p){
		var name = models[key].model.param[p].name;

		$('#'+key+'-'+name+'-range').on('input change', function(){
			models[key].model.param[p].val = this.value/2000;
			modelManager.models[key].geom.update();
			$('#'+key+'-'+name+'-text').val(this.value/2000);
		});

		$('#'+key+'-'+name+'-text').on('change', function(){
			models[key].model.param[p].val = this.value;
			modelManager.models[key].geom.update();
			$('#'+key+'-'+name+'-range').val(this.value*2000);
		})
	})
});

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

$("#upload-image").fileinput({
	uploadUrl: '/uploadImage/',
	uploadAsyc : true,
	showPreview: false
}).on('filebatchuploadsuccess', function(event, data, previewID, index){
	console.log('did i recevied anything?');
	$("#image-container").append($('<a href=# class="select"><img src="./images/'+data.response.file+'" class="col-md-3"></a>'));
});

$('.select').on('click', function(e){
	two.addImage(e.target.getAttribute('src'));
    $('#gallery-modal').modal('toggle');
})