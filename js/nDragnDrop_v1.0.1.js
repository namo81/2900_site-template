// calendar
// 서남호(namo) - for m.s.p
// 2020-11-05 - ver1.0.0 - 최초 작업 중

function nDragnDrop(option){

	let wrap 		= document.querySelector(option.wrap),
		obj 		= wrap.querySelectorAll(option.obj),   // 드래그 할 요소
		area		= wrap.querySelector(option.area),  // 드랍 될 영역 ()
		selector 	= option.selector, // this : obj 자체 // css selector : obj 내 특정 요소
		func 		= option.func, // 드래그앤 드랍 기능 ( sequence : 리스트 순서변경 // dnd : 특정 위치 드롭 )
		active  	= option.active;

	let dragDown = false,
		dragMove = false,
		dummy,
		targetItem,
		gap = 5;
	
	let mouseX, mouseY,
		mouseEX, mouseEY,
		objTouchX, objTouchY;

	let setDummy = function(obj){
		let objW = obj.offsetWidth,
			objH = obj.offsetHeight;
		dummy = obj.cloneNode(true);
		dummy.style.width = objW + 'px';
		dummy.style.height = objH + 'px';
		dummy.classList.add('dummy');
		wrap.insertBefore(dummy, null);
	}

	// sequence 용 배열
	let objArr = new Array();
		objArr.top = new Array();
		objArr.btm = new Array();
		objArr.left = new Array();
		objArr.right = new Array();

	let checkSeq = function(mX, mY){
		let dummyLeft   = dummy.offsetLeft + (dummy.offsetWidth / 2),
			dummyTop    = dummy.offsetTop + (dummy.offsetHeight / 2);

		for(let o=0; o<obj.length; o++){
			if(dummyTop > objArr.top[o] && dummyTop < objArr.btm[o] || dummyLeft > objArr.left[o] && dummyLeft < objArr.right[o]) {
				// ????? 비교 기준점 재 확인
			}
		}

	}, checkDrop = function(){

	}

	let drag = function(e){
		if(dragDown != true) return;
		e.stopPropagation();
		mouseEX = e.pageX,
		mouseEY = e.pageY;
		
		if(dragMove == true) {			
			targetItem.classList.add('ghost');
			dummy.style.left = (mouseEX - objTouchX) + 'px';
			dummy.style.top = (mouseEY - objTouchY) + 'px';			
			if(func == 'sequence') checkSeq();
			else checkDrop();
		} else if (Math.abs(mouseEX - mouseX) > gap || Math.abs(mouseEY - mouseY) > gap) {
			if (wrap.querySelectorAll('.dummy').length < 1) {
				setDummy(targetItem);
				dummy.style.left = (mouseEX - objTouchX) + 'px';
				dummy.style.top = (mouseEY - objTouchY) + 'px';
			}
			dragMove = true;
		}

	}, dragEnd = function(e){
		if(dragDown != true) return;
		dragMove = false;
		if (wrap.querySelectorAll('.dummy').length > 0) {
			wrap.removeChild(wrap.lastChild);
			wrap.removeEventListener('mousemove', drag);
		}
		dragDown = false;
		targetItem.classList.remove('ghost');

	}, dragStart = function(e){
		e.stopPropagation();
		if(selector) {
			targetItem = this.closest(option.obj);
			objTouchX = e.offsetX + e.target.offsetLeft;
			objTouchY = e.offsetY + e.target.offsetTop;
		}  else {
			targetItem = this;
			objTouchX = e.offsetX;
			objTouchY = e.offsetY;
		}
		mouseX = e.pageX;
		mouseY = e.pageY;
		
		dragDown = true;
	} 

	for(let o=0; o<obj.length; o++){
		if(option.selector) obj[o].querySelector(option.selector).addEventListener('mousedown', dragStart);
		else obj[o].addEventListener('mousedown', dragStart);
		if(func == 'sequence') {
			objArr.top.push(obj[o].offsetTop);
			objArr.btm.push(obj[o].offsetTop + obj[o].offsetHeight);
			objArr.left.push(obj[o].offsetLeft);
			objArr.right.push(obj[o].offsetLeft + obj[o].offsetWidth);
		}
	}
	document.addEventListener('mousemove', drag);
	document.addEventListener('mouseup', dragEnd);
	
}

/* 타 플러그인 작동 기본
 mousedown - 기본 X / Y 참고값 설정
 mousemove
  - 드래그 값이 특정 gap 이하일 때 : dummy 생성 / dummy 최초 위치 설정 / dummy의 원본 설정 / 드래그 상태 설정
  - 드래그 값이 true : dummy 위치 조정 / 리스트 항목 순서 조정
mouseup
  - dummy 삭제 / 이벤트 제거 등

드래그 앤 드롭 기능
- 리스트 위치 변경
- 특정 영역에 드롭하기
*/