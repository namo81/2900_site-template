// calendar
// 서남호(namo) - for m.s.p
// 2020-11-10 - ver1.0.0 - 1차 완성 (Chrome / IE10 이상)
// 2020-12-11 - update 관련 수정 (리스트에 새 요소 추가 시 배열 초기화 및 obj 변수 재설정)

// IE10 까지 정상작동 // IE9 는 classList.add, remove 가 지원 안됨.

function nDragnDrop(option){
	// 외부 설정 변수
	var wrap 		= document.querySelector(option.wrap),	
		objWrap 	= wrap.querySelector(option.objWrap),   	// 드래그 할 리스트 wrap
		obj 		= objWrap.querySelectorAll(option.obj),   	// 드래그 할 요소 전체
		objLen		= obj.length,								// obj legnth
		area		= wrap.querySelectorAll(option.area), 		// 드랍 될 영역 ()
		selector 	= option.selector, 							// 설정 없을 경우 : obj 자체 // css selector : obj 내 특정 요소
		func 		= option.func, 								// 드래그앤 드랍 기능 ( sequence : 리스트 순서변경 // dnd : 특정 위치 드롭 )
		active  	= option.active;							// 콜백함수

	// 공통 기본형 변수
	var dragDown = false, 	// mouse down 여부 확인용
		dragMove = false, 	// mouse move 여부 확인용
		dummy, 				// 드래그 될 요소 복사본 (실제 마우스 따라다니는 요소)
		targetItem,			// 드래그 될 요소
		targetIdx, 			// 드래그 될 요소 index 값
		gap = 10; 			// 최초 드래그 실행 전 gap (단순 클릭 일 경우 실행 방지용)
	
	// 마우스 및 dummy 위치 관련 변수
	var mouseX, mouseY, 			// 마우스 최초 클릭 위치 값
		mouseEX, mouseEY,			// 마우스 최종 위치 값
		objTouchX, objTouchY, 		// 최초 클릭 시 드래그 요소 내 마우스 위치값 (드래그 시 위치 조정용)
		docScrollT, docScrollL, 	// 최초 클릭 시 document 의 scroll 값 (  )
		wrapScrollT, wrapScrollL;	// 최초 클릭 시 wrap 의 scroll 값

	// sequence 용 배열 ( 각 리스트 요소 상하좌우 값 )
	var objArr = new Array();
		objArr.top = new Array();
		objArr.btm = new Array();
		objArr.left = new Array();
		objArr.right = new Array();
	
	// dnd 용 배열 및 변수 ( drop 영역 상하좌우 값 )
	var dropArea,
		dropArr = new Array();
		dropArr.top = new Array();
		dropArr.btm = new Array();
		dropArr.left = new Array();
		dropArr.right = new Array();


	// 리스트 obj 및 drop area 요소 관련 배열설정
	var arrResetSeq = function(){
		objArr = [];
		objArr.top = [];
		objArr.btm = [];
		objArr.left = [];
		objArr.right = [];
	},
	arrResetDnd = function(){
		dropArr = [];
		dropArr.top = [];
		dropArr.btm = [];
		dropArr.left = [];
		dropArr.right = [];
	},
	domUpdate = function(){
		
		if(func == 'sequence') {
			arrResetSeq();
			for(var o=0; o<objLen; o++){
				objArr.top.push(offset(obj[o]).top);
				objArr.btm.push(offset(obj[o]).top + obj[o].offsetHeight);
				objArr.left.push(offset(obj[o]).left);
				objArr.right.push(offset(obj[o]).left + obj[o].offsetWidth);
			}
		} else if(func == 'dnd') {
			arrResetDnd();
			for( var d = 0; d < area.length; d++) {
				dropArr.top.push(offset(area[d]).top);
				dropArr.btm.push(offset(area[d]).top + area[d].offsetHeight);
				dropArr.left.push(offset(area[d]).left);
				dropArr.right.push(offset(area[d]).left + area[d].offsetWidth);
			}
		}
	}

	// dummy 생성 함수
	var setDummy = function(obj){
		var objW = obj.offsetWidth,
			objH = obj.offsetHeight;
		dummy = obj.cloneNode(true);
		//dummy = cloneNode(obj); -- IE 구버전용 함수
		dummy.style.width = objW + 'px';
		dummy.style.height = objH + 'px';
		dummy.classList.add('dummy');
		objWrap.insertBefore(dummy, null);
	},
	// dummy 마지막 모션 및 삭제 관련
	removeDummy = function(){
		if(func == 'sequence' ) {
			var dleft = offset(targetItem).left + 1 - docScrollL - wrapScrollL,
				dTop  = offset(targetItem).top + 1 - docScrollT - wrapScrollT;
				mgT   = targetItem.style.marginTop,
				mgL   = targetItem.style.marginLeft,
				dW    = targetItem.offsetWidth,
				dH    = targetItem.offsetHeight,
				pd 	  = window.getComputedStyle(targetItem, null).getPropertyValue('padding'); 
			dummy.style.transition = '.2s';
			dummy.style.top = dTop + 'px';
			dummy.style.left = dleft + 'px';
			dummy.style.width = dW + 'px';
			dummy.style.height = dH + 'px';
			dummy.style.marginTop = (-1) * mgT;
			dummy.style.marginLeft = (-1) * mgL;
			dummy.style.padding = pd;
			dummy.addEventListener('transitionend', function(){
				if (objWrap.querySelectorAll('.dummy').length > 0) {
					objWrap.removeChild(objWrap.lastChild);
				}
			});
		} else if(func == 'dnd') {
			if (objWrap.querySelectorAll('.dummy').length > 0) {
				objWrap.removeChild(objWrap.lastChild);
			}	
		}
	}

	// func : 'sequence' 용 기능 함수
	var checkSeq = function(){
		var dummyLeft   = dummy.offsetLeft + (dummy.offsetWidth / 2) + docScrollL + wrapScrollL,
			dummyTop    = dummy.offsetTop + (dummy.offsetHeight / 2) + docScrollT + wrapScrollT;

		for(var o=0; o<objLen; o++){
			if(dummyTop > objArr.top[o] && dummyTop < objArr.btm[o] && dummyLeft > objArr.left[o] && dummyLeft < objArr.right[o]) {
				if( o < targetIdx ) {
					objWrap.insertBefore(targetItem, obj[o]);
				} else {
					o + 1 < objLen ? objWrap.insertBefore(targetItem, obj[o + 1]) : objWrap.insertBefore(targetItem, dummy);
				}
			}
		}
	},
	// func : 'dnd' 용 서브함수 - drop 영역 전체 리셋함수 
	areaReset = function(){
		for(var d=0; d<area.length; d++){
			area[d].classList.remove('drop-over');
		}
	},
	// func : 'dnd' 용 실행문
	dropFunc = function(obj) {
		if(obj == null) {
			dropArea = null;
			areaReset();
			return;
		} else {
			if(dropArea == obj) return;
			dropArea = obj;
			areaReset();
			dropArea.classList.add('drop-over');
		}
	},
	// func : 'dnd' 용 기능 함수
	checkDrop = function(){
		var dummyLeft   = dummy.offsetLeft + (dummy.offsetWidth / 2) + docScrollL,
			dummyTop    = dummy.offsetTop + (dummy.offsetHeight / 2) + docScrollT;

		var num = 0; // dropArea 
		for(var d=0; d<area.length; d++){
			if(dummyTop > dropArr.top[d] && dummyTop < dropArr.btm[d] && dummyLeft > dropArr.left[d] && dummyLeft < dropArr.right[d]) {
				num ++;
				dropFunc(area[d]);
			}
		}
		if(num == 0) dropFunc(); // dropArea 외 영역에서 드래그할 경우
	}

	// drag 중 실행
	var drag = function(e){
		if(dragDown != true) return;
		e.stopPropagation();
		e.preventDefault();

		wrap.scrollTop = wrapScrollT; // wrap 에 scroll 이 있을 경우, 현재의 scroll 값 유지용
		wrap.scrollLeft = wrapScrollL; // wrap 에 scroll 이 있을 경우, 현재의 scroll 값 유지용

		mouseEX = e.pageX - docScrollL,
		mouseEY = e.pageY - docScrollT;

		if(dragMove == true) {
			targetItem.classList.add('ghost');
			dummy.style.left = (mouseEX - objTouchX) + 'px';
			dummy.style.top = (mouseEY - objTouchY) + 'px';
			if(func == 'sequence') checkSeq();
			else checkDrop();
		} else {
			if(Math.abs(mouseEX - mouseX) > gap || Math.abs(mouseEY - mouseY) > gap) {
				if (objWrap.querySelectorAll('.dummy').length < 1) {
					setDummy(targetItem);
					dummy.style.left = (mouseEX - objTouchX) + 'px';
					dummy.style.top = (mouseEY - objTouchY) + 'px';
				}
				dragMove = true;
			}
		}
	}, 
	// drag 끝날 때
	dragEnd = function(e){
		if(!dragMove) {
			dragMove = false;
			dragDown = false;
			return;
		} 
		removeDummy();
		dragMove = false;
		dragDown = false;
		targetItem.classList.remove('ghost');
		if(func == 'dnd') areaReset();
		obj = objWrap.querySelectorAll(option.obj); // obj 리스트 재 설정
		if( typeof active === 'function') {
			if(func == 'sequence') active(targetItem);
			else active(targetItem, dropArea);
		}
	}, 
	// drag 시작
	dragStart = function(e){
		e.preventDefault();		
		if(selector) {
			targetItem = e.target.closest(option.obj);
			objTouchX = e.offsetX + e.target.offsetLeft;
			objTouchY = e.offsetY + e.target.offsetTop;
		} else {
			targetItem = e.target == this ? e.target : this;
			if(e.target == this) {
				objTouchX = e.offsetX;
				objTouchY = e.offsetY;
			} else {
				objTouchX = e.offsetX + e.target.offsetLeft;
				objTouchY = e.offsetY + e.target.offsetTop;
			}
		}
		targetIdx = getIndex(targetItem);
		docScrollL = document.documentElement.scrollLeft;
		docScrollT = document.documentElement.scrollTop;
		wrapScrollL = wrap.scrollLeft;
		wrapScrollT = wrap.scrollTop;

		mouseX = e.pageX - docScrollL;
		mouseY = e.pageY - docScrollT;
		dragDown = true;
		dropArea = null;
	} 

	// 초기 실행 함수 (드래그 요소 기능 설정 및 배열 관련 함수 실행)
	var dragInit = function(){
		for(var o=0; o<objLen; o++){
			if(option.selector) obj[o].querySelector(option.selector).addEventListener('mousedown', dragStart);
			else obj[o].addEventListener('mousedown', dragStart);
		}
		domUpdate();
		document.addEventListener('mousemove', drag);
		document.addEventListener('mouseup', dragEnd);
		
		console.log(objArr);
	}
	dragInit();	

	// 기능 제거
	this.removeDrag = function(){
		for(var o=0; o<objLen; o++){
			if(option.selector) obj[o].querySelector(option.selector).removeEventListener('mousedown', dragStart);
			else obj[o].removeEventListener('mousedown', dragStart);
		}
		domUpdate();
		document.removeEventListener('mousemove', drag);
		document.removeEventListener('mouseup', dragEnd);
	}

	this.dragUpdate = function(){
		this.removeDrag();
		obj 		= objWrap.querySelectorAll(option.obj),
		objLen		= obj.length;
		dragInit();
	}

	this.reStart = function(){
		dragInit();
	}
}
