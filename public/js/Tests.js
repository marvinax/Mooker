/**
 * IN THE FUTURE, THIS PART WILL BE TOTALLY REWRITTEN WITH REACT.JS
 */
var model, geom, meshes, sketch_name;

var updateSliderBars = function (model) {
	$('#parameters').empty();

	Object.keys(model.param).forEach(function(p){
		var param_name = model.param[p].name;

		$('<div class="input-group input-group-html5">')
			.append('<span class=input-group-addon>'+param_name+'<span>')
			.append($('<span class="input-group-addon addon-range">')
				.append($('<input>')
					.attr({
						id: model.name+'-'+param_name+'-range',
						type:"range",
						min:model.param[p].min*2000,
						max:model.param[p].max*2000,
						value:model.param[p].val*2000
					})))
			.append($('<input class=form-control>')
				.attr({
					id: model.name+'-'+param_name+'-text',
					value: model.param[p].val
				}))
			.after('<br>')
			.appendTo($('#parameters'));


		$('#'+model.name+'-'+param_name+'-range').on('input change', function(){
			model.param[p].val = this.value/2000;
			geom.update();
			$('#'+model.name+'-'+param_name+'-text').val(this.value/2000);
		});

		$('#'+model.name+'-'+param_name+'-text').on('change', function(){
			model.param[p].val = this.value;
			geom.update();
			$('#'+model.name+'-'+param_name+'-range').val(this.value*2000);
		})
	})
};

var drawModel = function(model){
	for(var i = 0; i < three.scene.children.length; i++){
		if(three.scene.children[i].type == "Object3D"){
			three.scene.remove(three.scene.children[i]);
		}
	}

	geom = new Tautology.Geometry(model);
	meshes = new THREE.Object3D();

	meshes.add(
		new THREE.Mesh(geom.geom, material.materials.outside),
		new THREE.Mesh(geom.geom, material.materials.inside)
	);

	three.scene.add(meshes);
	// two.canvas.clear();
	updateSliderBars(model);
}

var fetchModel = function(modelName, andThen){
	$.get('/loadModels',{model:modelName}, function(data){
		model = JSON.parse(data)[0];
		andThen(model);
	});

}

var saveSketch = function(sketch_name){
	if(model != undefined){
		var tobeSent = {
				type : "sketch",
				name : sketch_name ? sketch_name : $('#sketch-name').val(),
				three: {model:model.name, param:model.param},
				two: two.canvas.toDatalessObject()
			};

		$.ajax({
			url: '/saveSketch',
			type: "POST",
			data: JSON.stringify(tobeSent),
			contentType:"application/json",
			dataType: "json",
			complete : function(xhr){
				console.log(xhr.responseJSON)
			}
		})
	}
}

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

$('.save').on('click', function(){
	if(sketch_name){
		saveSketch(sketch_name);	
	} else {
		$('#save-modal').modal('toggle');
	}
})

$('#save-sketch').on('click', function(){
	saveSketch(sketch_name);
});

$('.choose-model').on('click', function(){
	fetchModel($(this).attr("data-model"), function(model){
		drawModel(model);

		$('#new-modal').modal('toggle');
		sketch_name = undefined;

		two.canvas.clear();
		two.canvas.backgroundColor = 'rgba(255, 255, 255, 1)';
		two.canvas.renderAll();

		$('#model-adjustion-collapse').collapse('show');
		$('#surface-design-collapse').collapse('show');
	});
});


$(document).ready(function(){

	two = new UI.Two('two-viewport');
	three = new UI.Three('three-viewport');

	materialParam = {
		mainType: 'phong',
		opacity : {val: 0.5, min:0., max:1., name: '透明度', type: 'slider'}
	}

	texture = new THREE.Texture( two.canvas.getElement() );
	texture.needsUpdate = true;

	two.canvas.on('after:render', function(){
		texture.needsUpdate = true;
	});


	material = new Tautology.Material(materialParam, texture);

	$.get('/loadSketchList', function(data){
		var lists = JSON.parse(data);

		lists.forEach(function(item){
			$('#table-content').append($('<a href=# id="'+item.name+'-entry">'+item.name+'</a><p>'))

			$('#'+item.name+'-entry').click(function(){
				$.get('/loadSingleSketch', {name : item.name}, function(doc){
					$('#load-modal').modal('toggle');
					
					doc_explained = JSON.parse(doc);
					console.log(doc_explained);

					fetchModel(doc_explained.three.model, function(){
						sketch_name = doc_explained.name;
						model.param = doc_explained.three.param;
						drawModel(model);
					});

					two.canvas.clear();
					two.canvas.loadFromDatalessJSON(doc_explained.two);
					two.canvas.renderAll();
					
				})
			})
		});
		
	})

})
