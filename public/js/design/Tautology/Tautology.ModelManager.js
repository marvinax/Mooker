Tautology.ModelManager = function(models, materialParam, canvas){
	this.models = models;

	this.texture = new THREE.Texture( canvas.getElement() );
	this.texture.needsUpdate = true;

	this.material = new Tautology.Material(materialParam, this.texture);

	canvas.on('after:render', function(){
		this.texture.needsUpdate = true;
	}.bind(this));

	this.init();
}

Tautology.ModelManager.prototype.constructor = Tautology.ModelManager;

Tautology.ModelManager.prototype.init = function(){
	this.models.forEach(function(elem){
		
		elem.geom = new Tautology.Geometry(elem);
		elem.meshes = new THREE.Object3D();

		elem.meshes.add(
			new THREE.Mesh(elem.geom.geom, this.material.materials.outside),
			new THREE.Mesh(elem.geom.geom, this.material.materials.inside)
		);
		
	}.bind(this));
}

Tautology.ModelManager.prototype.select = function(name, scene) {

	for(var i = 0; i < scene.children.length; i++){
		if(scene.children[i].type == "Object3D"){
			scene.remove(scene.children[i]);
		}
	}

	this.models.forEach(function(e){
		if(e.name === name){
			scene.add(e.meshes);
		}
	})
}

Tautology.ModelManager.prototype.getParameters = function(name){
	
}