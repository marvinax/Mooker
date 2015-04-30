/**
 * Canvas integrates the styling and some interactive operation on the 2D drawing area 
 * @param {} divElementID
 */
UI.Two = function(elementName, width, height){
	this.patterns = {};

	this.mapRange = new fabric.Rect

	if(width) {	
		this.canvas = new fabric.Canvas(elementName , {
			'width' : width,
			'height': height
		});
		this.resize(width, height);
	} else {
		var width = $('#'+elementName).width(),
			height = $('#'+elementName).height();
			
		this.canvas = new fabric.Canvas(elementName , {
			'width' : width,
			'height': height
		});
		this.resize(width, height);		
	}	

	this.canvas.add();

};

UI.Two.prototype.constructor = UI.Two;

UI.Two.prototype.setBackgroundColor = function(){

}

/**
 * resize the canvas according to the resizing of geometric model 
 * @param	{Number} width
 * @param	{Number} height
 */
UI.Two.prototype.resize = function(width, height){
	this.canvas.setWidth(width);
	this.canvas.setHeight(height);

	// var c = this.canvas.getElement();
	// c.setAttribute('width', width*window.devicePixelRatio);
	// c.setAttribute('height', height*window.devicePixelRatio);
	// c.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);

	this.canvas.backgroundColor = 'rgba(255,255,255, 1)';

	this.canvas.renderAll();

};

/**
 * add image to canvas
 * @param {String} url
 */
UI.Two.prototype.addImage = function(url, color, trans, repeat){
	fabric.Image.fromURL(url, function(img) {
		img._element.crossOrigin = "Anonymous";

		if(trans==="true"){
			console.log('trying to remove');
			img.filters.push(new fabric.Image.filters.RemoveWhite({
				threshold: 200,
				distance: 180
			}));
		}

		if(color){
			img.filters.push(new fabric.Image.filters.Tint({
				color: color
			}));
		}

		if(repeat==="true"){
			console.log('repeated');
			var patternSourceCanvas = new fabric.StaticCanvas();
		    img.scaleToWidth(120);
		    img.applyFilters();
			patternSourceCanvas.add(img);

			var pattern = new fabric.Pattern({
				source: function() {
					patternSourceCanvas.setDimensions({
						width: img.getWidth() * 1.3,
						height: img.getHeight() * 1.3
					});
					return patternSourceCanvas.getElement();
				},
				repeat: 'repeat'
			});

			this.canvas.add(new fabric.Rect({
				left: 0,
				top : 0,
				width : this.canvas.getWidth(),
				height : this.canvas.getHeight(),
				fill : pattern
			}));
		} else {
			this.canvas.add(img);
			img.applyFilters(this.canvas.renderAll().bind(this.canvas));
		}
		

	}.bind(this)); 
};

/**
 * Add text to canvas
 * @param {String} text to be input
 * @param {Array} style a list of styles regarding text
 */
UI.Two.prototype.addText = function(text, style, size, kerning){
	var style_str = style.split(' ');
	if (text.length != 0){
		var textArray = text.split('').map(function(c){
			return new fabric.Text(c, {
				left: 0,
				top: 100,
				fontFamily : style_str[0],
				fontWeight : style_str[1],
				fontSize : size
			});
		})

		for(i = 1; i < text.length; i++){
			textArray[i].left += textArray[i-1].left + textArray[i-1].getWidth() + kerning;
		}
		
		this.canvas.add(new fabric.Group(textArray, {left:100}));
		this.canvas.renderAll();
	}
};

/**
 * create patterns on the canvas and further mapped on the 3D model
 * @return {[type]}
 */
UI.Two.prototype.makePatterns = function(){
	var dotList = [];
		
	for(var i = 0; i < Math.floor($('#viewContainer').width()/50); i++){
		for(var j = 0; j < Math.floor($('#viewContainer').height()/50); j++){
			dotList.push(new fabric.Circle({
				radius: 10,
				fill: '#000',
				left : i * 50,
				top : j * 50
			}));

			dotList.push(new fabric.Circle({
				radius: 10,
				fill: '#000',
				left : i * 50 + 25,
				top : j * 50 + 25
			}));

		}
	}
	this.patterns['dots'] = new fabric.Group(dotList, {
		left:0,
		top: 0,
		label:'pattern', 
		selectable: false
	});

	var stripesList = [];
	for(var i = 0; i < Math.floor($('#viewContainer').width()/40) + 50; i++){
		stripesList.push(new fabric.Rect({
			fill: '#000',
			width: 32,
			height : 1000,
			left : i * 80 - 400,
			top : 0,
			angle : 45
		}));
	}
	this.patterns['stripes'] = new fabric.Group(stripesList, {
		left:-540,
		top: -140,
		label:'pattern',
		selectable: false
	});
};

/**
 * update pattern
 * @param	{Number} pattern pattern index
 */
UI.Two.prototype.updatePattern = function(pattern){
	this.canvas.add(this.patterns[pattern]);
};

/**
 * remove selected object from the canvas
 */
UI.Two.prototype.removeSelectedObject = function(){
	if(this.canvas.getActiveObject() == null){
		this.canvas.getActiveGroup().forEachObject(function(o){ this.canvas.remove(o) });
		this.canvas.discardActiveGroup().renderAll();
	} else if(this.canvas.getActiveObject() != null){
		this.canvas.remove(this.canvas.getActiveObject());
		this.canvas.discardActiveObject().renderAll();
	}
};

/**
 * remove everything
 */
UI.Two.prototype.removeAll = function(){
	this.canvas.clear();
};
