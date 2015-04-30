/**
 * IN THE FUTURE, THIS PART WILL BE TOTALLY REWRITTEN WITH REACT.JS
 */
var model, geom, meshes, sketch_name;

var modifyNavbar = function(data){
	if(data.account != undefined){
		$('#login-button')
			.text("你好呀，"+data.account)
			.attr('href', '"/profile"')
			.attr('data-account', data.account);
		$('#signup-button').text("登出").addClass('logout');
		$('#signup-button').removeAttr("data-toggle").removeAttr('data-target').attr('href', '/logout');
		
	} else {
		console.log(data);			
	}
}

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

var drawSketch = function(doc){
	fetchModel(doc.three.model, function(){
		sketch_name = doc.name;
		model.param = doc.three.param;
		if(doc.three.camera){
			three.camera.up = new THREE.Vector3(doc.three.camera.up.x, doc.three.camera.up.y, doc.three.camera.up.z);
			three.camera.position = THREE.Vector3(doc.three.camera.position.x, doc.three.camera.position.y, doc.three.camera.position.z);
			three.camera.lookat = THREE.Vector3(doc.three.camera.lookat.x, doc.three.camera.lookat.y, doc.three.camera.lookat.z);

		}
		drawModel(model);
	});

	two.canvas.clear();
	two.canvas.loadFromDatalessJSON(doc.two);
	two.canvas.renderAll();

}

var fetchModel = function(modelName, andThen){
	$.get('/loadModels',{model:modelName}, function(data){
		model = JSON.parse(data)[0];
		andThen(model);
	});

}

var saveSketch = function(sketch_name){
	if(model != undefined){
		console.log($('#login-button').attr('data-account'));
		var tobeSent = {
				type : "sketch",
				account : $('#login-button').attr('data-account'),
				name : sketch_name ? sketch_name : $('#sketch-name').val(),
				three: {model:model.name, param:model.param, camera:{position:three.camera.position, up:three.camera.up, lookat:three.camera.lookat}},
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

var loadSketchList = function(account){
	$.get('/loadSketchList',{account: account}, function(data){
		var lists = JSON.parse(data);

		lists.forEach(function(item){
			$('#table-content').append($('<a href=# id="'+item.name+'-entry">'+item.name+'</a><p>'))

			$('#'+item.name+'-entry').click(function(){
				$.get('/loadSingleSketch', {name : item.name}, function(doc){
					$('#load-modal').modal('toggle');
					
					drawSketch( JSON.parse(doc) );
		
				})
			})
		});	
	});

}

var initUploadHandler = function(accountName){
	$('.upload-holder').css("visibility", "visible");

	$("#upload-image").fileinput({
		uploadUrl: '/uploadImage/',
		uploadAsyc : true,
		showPreview: false
	}).on('filebatchuploadsuccess', function(event, data, previewID, index){
		$("#image-container").append($('<a href=#><img src="./images/'+accountName +'/'+
			data.response.file+
			'" class="select col-md-3"></a>')
		);

		$('.select').on('click', function(e){
			console.log($('#repeat').get(0));
	
			two.addImage(e.target.getAttribute('src'),
				$('#tint-color').attr('data-color'), $('#trans').attr('data-trans'), $('#repeat').attr('data-repeat'));
			$('#gallery-modal').modal('toggle');
		})
	});

}

var getImageList = function(accountName){
	$.get('/userImageList/'+accountName, function(data){
		data.forEach(function(name){
			$("#image-container").append($('<a href=#><img src="./images/'+
				accountName +'/'+
				name+'" class="select col-md-3"></a>'));
		})

		$('.select').on('click', function(e){
			two.addImage(
				e.target.getAttribute('src'),
				$('#tint-color').attr('data-color'), $('#trans').attr('data-trans'), $('#repeat').attr('data-repeat'));
			$('#gallery-modal').modal('toggle');
		})

	})			

}

var checkLogged = function(){
	$.get('/check_logged', function(data){
		if(data.account != undefined){
			var accountName = data.account;
		
			modifyNavbar(data);
			
			getImageList(accountName)

			loadSketchList(accountName);

			initUploadHandler(accountName);
		}

	})

}

$('#base-color').colorPicker({
	colorformat : 'rgba',
	alignment : 'br',
	onSelect : function(ui, color){
		two.canvas.backgroundColor = color;
		two.canvas.renderAll();
	}
})

$('#tint-color').colorPicker({
	colorformat : 'rgba',
	alignment : 'br',
	onSelect : function(ui, color){
		$('#tint-color').attr('data-color', color);
	}
})

$('.modal').on('show.bs.modal', function () {
	$(this).find('.modal-body').css({
		width:'auto', //probably not needed
		height:'auto', //probably not needed 
		'max-height':'100%'
	});
});

$('#trans').click(function(){
	if(!$('#trans').attr('data-trans') || $('#trans').attr('data-trans') == "false"){
		$('#trans').attr('data-trans', 'true');
	} else {
		$('#trans').attr('data-trans', 'false');
	}
	console.log($('#trans').attr('data-trans'));
})

$('#repeat').click(function(){
	if(!$('#repeat').attr('data-repeat') || $('#repeat').attr('data-repeat') == "false"){
		$('#repeat').attr('data-repeat', 'true');
	} else {
		$('#repeat').attr('data-repeat', 'false');
	}
	console.log($('#repeat').attr('data-repeat'));
})


$('.select').on('click', function(e){
	console.log($('#repeat'));
	two.addImage(
		e.target.getAttribute('src'),
		$('#tint-color').attr('data-color'),
		$('#trans').attr('data-trans'),
		$('#repeat').attr('data-repeat')
		);
	$('#gallery-modal').modal('toggle');
})


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

	checkLogged();

	$('.signup').on('click', function(){
		$.post('/signup', {
			name: $('#name1').val(),
			email: $('#email1').val(),
			phone: $('#phone1').val(),
			account: $('#account1').val(),
			password: $('#passwd1').val()
		}, function(data){
			checkLogged();
			$('#signup-modal').modal('hide');
		});
	});

	$('.login').on('click', function(){
		console.log($('#account2').val());
		$.post('/login', {
			account: $('#account2').val(),
			password: $('#passwd3').val()
		}, function(data){
			checkLogged();
			$('#login-modal').modal('hide');
		})
	});


	materialParam = {
		mainType: 'phong',
		opacity : {val: 1, min:0., max:1., name: '透明度', type: 'slider'}
	}

	texture = new THREE.Texture( two.canvas.getElement() );
	texture.needsUpdate = true;

	two.canvas.on('after:render', function(){
		texture.needsUpdate = true;
	});


	material = new Tautology.Material(materialParam, texture);

})
