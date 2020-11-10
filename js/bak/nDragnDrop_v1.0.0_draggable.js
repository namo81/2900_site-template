// calendar
// 서남호(namo) - for m.s.p
// 2020-11-05 - ver1.0.0 - 최초 작업 중
function clone(obj) {
	if (obj === null || typeof(obj) !== 'object')
	return obj;
  
	let copy = obj.constructor();
  
	for (let attr in obj) {
	  if (obj.hasOwnProperty(attr)) {
		copy[attr] = clone(obj[attr]);
	  }
	}  
	return copy;
  }

function nDragnDrop(option){

	let wrap 	= document.querySelector(option.wrap),
		obj 	= document.querySelectorAll(option.obj),   // 드래그 할 요소
		area	= document.querySelector(option.area);  // 드랍 될 영역

	let dragObj = null;

	let reSetClass = function(){
		for(let o=0; o<obj.length; o++) {
			obj[o].classList.remove('over');
		}
	}

	let dragstartFunc = function(e) {
		dragObj = this;
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData("text/html", this.innerHTML);
		dragObj.classList.add('ghost');
	}, dragFunc = function(e){
		e.preventDefault();
	},dragendFunc = function(e) {
		//e.preventDefault();
		// dropEffect를 move로 설정.
		dragObj.classList.remove('ghost');
		//console.log('dragend');
	}, dragenterFunc = function(e){
		e.preventDefault();
		e.stopPropagation();
		this.classList.add('over');
		if(getIndex(this) > getIndex(dragObj)) {
			wrap.insertBefore(dragObj, this.nextSibling);
		} else {
			wrap.insertBefore(dragObj, this);
		}

	}, dragleaveFunc = function(e){
		e.preventDefault();
		e.stopPropagation();
		this.classList.remove('over');
	}, dragoverFunc = function(e){
		e.preventDefault();
		//console.log('dragover');
	}, dropFunc = function(e){
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		reSetClass();
		if(dragObj != this) {
			dragObj.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData('text/html');
		}
	}
	
	for(let o=0; o<obj.length; o++) {
		obj[o].addEventListener('dragstart', dragstartFunc);
		obj[o].addEventListener('drag', dragFunc);
		obj[o].addEventListener('dragend', dragendFunc);
		obj[o].addEventListener('dragenter', dragenterFunc);
		obj[o].addEventListener('dragleave', dragleaveFunc);
		obj[o].addEventListener('dragover', dragoverFunc);
		obj[o].addEventListener('drop', dropFunc);
	}
}
