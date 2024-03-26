
let canvas = document.getElementById("canvas");

let selectedPanel = null;

let options = {
	"width": document.getElementById("option-size-width"),
	"height": document.getElementById("option-size-height"),

	"padding": document.getElementById("option-format-padding"),
	"spacing": document.getElementById("option-format-spacing"),
	"rows": document.getElementById("option-format-rows"),
	"thickness": document.getElementById("option-format-thickness"),

	"relativeWidth": document.getElementById("option-cur-width")
};

// initialize options object
let optionValues = Object.entries(options);
for(let i = 0; i<optionValues.length; i++){
	let cur = optionValues[i];

	cur[1].addEventListener("change", function(){
		updateOptions();
	});

	Object.defineProperty(options, cur[0], {
		get: function(){
			return cur[1].value;
		},
		set: function(val){
			cur[1].value = val;
		}
	});
}

function setAttributes(element, attributes){
	for(let key in attributes){
		element.setAttribute(key, attributes[key]);
	}
}

function createPanel(x, y, w, h, p){
	let panel = document.createElementNS(canvas.namespaceURI, "rect");

	setAttributes(panel, {
		"x": x,
		"y": y,

		"width": w,
		"height": h,

		"fill": "white",
		"stroke": "black",
		"stroke-width": options.thickness
	});

	panel.addEventListener("mouseenter", function(){
		if(panel.className.baseVal != "selected")
			panel.setAttribute("fill", "#EEE");
	});
	panel.addEventListener("mouseleave", function(){
		if(panel.className.baseVal != "selected")
			panel.setAttribute("fill", "white");
	});

	panel.addEventListener("click", function(){
		panel.setAttribute("fill", "#3E9");

		select(panel, p);

		options.relativeWidth = selectedPanel.width;
	});

	return panel;
}
class Panel {
	constructor(width){
		this.x = 0;
		this.y = 0;
		this.width = width;
		this.height = 1;
		
		this.element = createPanel(this.x, this.y, width, this.height, this);
		canvas.appendChild(this.element);
	}

	get ex(){
		return parseFloat(this.element.getAttribute("x"));
	}
	set ex(value){
		this.element.setAttribute("x", value);
	}

	get ey(){
		return parseFloat(this.element.getAttribute("y"));
	}
	set ey(value){
		this.element.setAttribute("y", value);
	}
	
	get ewidth(){
		return parseFloat(this.element.getAttribute("width"));
	}
	set ewidth(value){
		this.element.setAttribute("width", value);
	}
	
	get eheight(){
		return parseFloat(this.element.getAttribute("height"));
	}
	set eheight(value){
		this.element.setAttribute("height", value);
	}
}

class Row {
	constructor(panels){
		this.panels = panels;

		this.fit();
	}

	removeElements(){
		for(let i = 0; i<this.panels.length; i++){
			this.panels[i].element.remove();
		}
	}

	get width(){
		return parseFloat(options.width) - (parseFloat(options.padding) * 2);
	}

	get height(){
		return this.panels[0].height;
	}
	set height(value){
		for(let i = 0; i<this.panels.length; i++){
			this.panels[i].height = value;
		}
	}

	get ey(){
		return this.panels[0].ey;
	}
	set ey(value){
		for(let i = 0; i<this.panels.length; i++){
			this.panels[i].ey = value;
		}
	}

	get eheight(){
		return this.panels[0].eheight;
	}
	set eheight(value){
		for(let i = 0; i<this.panels.length; i++){
			this.panels[i].eheight = value;
		}
	}

	fit(){
		let totalWidth = 0;
		for(let r = 0; r<this.panels.length; r++){
			let cur = this.panels[r];

			totalWidth += cur.width;
		}

		let scale = (this.width - (parseFloat(options.spacing) * (this.panels.length-1))) / totalWidth;
		
		let xOff = 0;
		for(let r = 0; r<this.panels.length; r++){
			let cur = this.panels[r];

			cur.ewidth = cur.width * scale;

			cur.ex = parseFloat(options.padding) + xOff;
			xOff += cur.ewidth + parseFloat(options.spacing);

			cur.ey = parseFloat(options.padding);
		}
	}

	/*
	fit(){
		let totalWidth = 0;
		for(let r = 0; r<this.panels.length; r++){
			let cur = this.panels[r];

			totalWidth += cur.width + (
				r == 0 ? 0 : parseFloat(options.spacing)
			);
		}

		let scale = this.width / totalWidth;

		let xOff = 0;
		for(let r = 0; r<this.panels.length; r++){
			let cur = this.panels[r];

			cur.ewidth = cur.width * scale;

			cur.ex = parseFloat(options.padding) + xOff;
			xOff += cur.ewidth + parseFloat(options.spacing) * scale;
			
			cur.ey = parseFloat(options.padding);
		}
	}
	*/
}

let panels = [
	// row
	new Row([new Panel(2), new Panel(1), new Panel(1), new Panel(1)]),
	new Row([new Panel(2), new Panel(1), new Panel(1), new Panel(1)])
];

function initExport(){
	selectedPanel = null;
	
	for(let r = 0; r<panels.length; r++){
		for(let p = 0; p<panels[r].panels.length; p++){
			let c = panels[r].panels[p].element;

			c.className.baseVal = "";
			c.setAttribute("fill", "white");
		}
	}
}

let svgButton = document.getElementById("option-export-svg");
svgButton.addEventListener("click", function(){
	initExport();

	// https://stackoverflow.com/questions/57798877/button-for-downloading-svg-in-javascript-html
	const svg = canvas.outerHTML;
	const blob = new Blob([svg.toString()]);
	const element = document.createElement("a");
	element.download = "comic.svg";
	element.href = window.URL.createObjectURL(blob);
	element.click();
	element.remove();
});

// I don't know where this is from but it isn't mine
function triggerDownload (imgURI) {
	var evt = new MouseEvent('click', {
		view: window,
		bubbles: false,
		cancelable: true
	});

	var a = document.createElement('a');
	a.setAttribute('download', 'comic.png');
	a.setAttribute('href', imgURI);
	a.setAttribute('target', '_blank');

	a.dispatchEvent(evt);
}
let pngButton = document.getElementById("option-export-png");
pngButton.addEventListener('click', function () {
	initExport();
	let svg = canvas;
	
	if(!svg) return;

	var pcanvas = document.createElement('canvas');
	var ctx = pcanvas.getContext('2d');
	var data = (new XMLSerializer()).serializeToString(svg);
	var DOMURL = window.URL || window.webkitURL || window;

	var box = svg.getBoundingClientRect();

	pcanvas.width = box.width;
	pcanvas.height = box.height;

	var img = new Image();
	var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
	var url = DOMURL.createObjectURL(svgBlob);

	img.onload = function () {
		ctx.drawImage(img, 0, 0);
		DOMURL.revokeObjectURL(url);

		var imgURI = pcanvas
				.toDataURL('image/png')
				.replace('image/png', 'image/octet-stream');

		triggerDownload(imgURI);

		ctx.clearRect(0, 0, box.width, box.height);
	};

	img.src = url;
});

function select(panel, p){
	for(let r = 0; r<panels.length; r++){
		for(let p = 0; p<panels[r].panels.length; p++){
			let c = panels[r].panels[p].element;
			if(c == panel) continue;
			
			c.className.baseVal = "";
			c.setAttribute("fill", "white");
		}
	}

	panel.className.baseVal = "selected";

	selectedPanel = p;
}

document.getElementById("option-cur-delete").addEventListener("click", function(){
	if(selectedPanel == null) return;

	for(let r = 0; r<panels.length; r++){
		for(let p = 0; p<panels[r].panels.length; p++){
			let c = panels[r].panels[p].element;
			if(c == selectedPanel.element){
				panels[r].panels.splice(p, 1);

				c.remove();

				updateOptions();

				return;
			}
		}
	}
});

document.getElementById("option-cur-ar").addEventListener("click", function(){
	if(selectedPanel == null) return;

	for(let r = 0; r<panels.length; r++){
		for(let p = 0; p<panels[r].panels.length; p++){
			let c = panels[r].panels[p].element;
			if(c == selectedPanel.element){
				let np = new Panel(1);
				panels[r].panels.splice(p + 1, 0, np);

				updateOptions();

				return;
			}
		}
	}
});

function setSize(width, height){
	canvas.setAttribute("viewBox", `0 0 ${width} ${height}`);

	options.width = width;
	options.height = height;
}
function updateOptions(){
	setSize(options.width, options.height);

	selectedPanel == null ? 0 : selectedPanel.width = parseFloat(options.relativeWidth);
	selectedPanel == null ? 0 : options.relativeWidth = selectedPanel.width;

	let rows = parseFloat(options.rows);
	if(rows >= 1){
		if(rows > panels.length){
			while(rows > panels.length){
				panels.push(new Row([new Panel(1), new Panel(1), new Panel(1)]))
			}
		} else if(rows < panels.length) {
			for(let i = panels.length-1; i>rows-1; i--){
				panels[i].removeElements();

				panels.pop();
			}
		}
	} else {
		options.rows = 1;
	}
	
	panels.forEach(function(row){
		row.fit();
	});

	let totalHeight = 0;
	for(let r = 0; r<panels.length; r++){
		let cur = panels[r];

		totalHeight += cur.height;
	}

	let height = parseFloat(options.height) - parseFloat(options.padding) * 2;
	let scale = (height - (parseFloat(options.spacing) * (panels.length-1))) / totalHeight;

	let yOff = 0;
	for(let r = 0; r<panels.length; r++){
		let cur = panels[r];

		cur.eheight = cur.height * scale;

		cur.ey = parseFloat(options.padding) + yOff;
		yOff += cur.eheight + parseFloat(options.spacing);

		//cur.ey = parseFloat(options.padding);
	}

	for(let r = 0; r<panels.length; r++){
		for(let p = 0; p<panels[r].panels.length; p++){
			let c = panels[r].panels[p].element;

			c.setAttribute("stroke-width", options.thickness);
		}
	}
}

document.getElementById("option-size-swap").addEventListener("click", function(){
	let temp = options.width;
	options.width = options.height;
	options.height = temp;

	updateOptions();
});

window.addEventListener("load", function(){
	updateOptions();
});
