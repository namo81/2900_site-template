// calendar
// 서남호(namo) - for m.s.p
// 2020-11-10 - ver1.0.0 - 1차 완성 (Chrome / IE10 이상)

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
		gap = 5; 			// 최초 드래그 실행 전 gap (단순 클릭 일 경우 실행 방지용)
	
	// 마우스 및 dummy 위치 관련 변수
	var mouseX, mouseY, 		// 마우스 최초 클릭 위치 값
		mouseEX, mouseEY,		// 마우스 최종 위치 값
		objTouchX, objTouchY; 	// 최초 클릭 시 드래그 요소 내 마우스 위치값 (드래그 시 위치 조정용)

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
	}

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

	// func : 'sequence' 용 기능 함수
	var checkSeq = function(){
		var dummyLeft   = dummy.offsetLeft + (dummy.offsetWidth / 2) + document.documentElement.scrollLeft,
			dummyTop    = dummy.offsetTop + (dummy.offsetHeight / 2) + document.documentElement.scrollTop;

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
	// func : 'dnd' 용 기능 함수
	checkDrop = function(){
		var dummyLeft   = dummy.offsetLeft + (dummy.offsetWidth / 2) + document.documentElement.scrollLeft,
			dummyTop    = dummy.offsetTop + (dummy.offsetHeight / 2) + document.documentElement.scrollTop;

		for(var d=0; d<area.length; d++){
			if(dummyTop > dropArr.top[d] && dummyTop < dropArr.btm[d] && dummyLeft > dropArr.left[d] && dummyLeft < dropArr.right[d]) {
				dropArea = area[d];
			}
		}
	}

	// drag 중 실행
	var drag = function(e){
		if(dragDown != true) return;
		e.stopPropagation();
		mouseEX = e.pageX - document.documentElement.scrollLeft,
		mouseEY = e.pageY - document.documentElement.scrollTop;

		if(dragMove == true) {
			targetItem.classList.add('ghost');
			dummy.style.left = (mouseEX - objTouchX) + 'px';
			dummy.style.top = (mouseEY - objTouchY) + 'px';
			if(func == 'sequence') checkSeq();
			else checkDrop();
		} 
		if (Math.abs(mouseEX - mouseX) > gap || Math.abs(mouseEY - mouseY) > gap) {
			if (objWrap.querySelectorAll('.dummy').length < 1) {
				setDummy(targetItem);
				dummy.style.left = (mouseEX - objTouchX) + 'px';
				dummy.style.top = (mouseEY - objTouchY) + 'px';
			}
			dragMove = true;
		}

	}, 
	// drag 끝날 때
	dragEnd = function(e){
		if(dragDown != true) return;
		dragMove = false;
		if (objWrap.querySelectorAll('.dummy').length > 0) {
			objWrap.removeChild(objWrap.lastChild);
			objWrap.removeEventListener('mousemove', drag);
		}
		dragDown = false;
		targetItem.classList.remove('ghost');
		obj = objWrap.querySelectorAll(option.obj); // obj 리스트 재 설정
		if( typeof active === 'function') {
			if(func == 'sequence') active(targetItem);
			else active(targetItem, dropArea);
		}

	}, 
	// drag 시작
	dragStart = function(e){
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
		mouseX = e.pageX - document.documentElement.scrollLeft;
		mouseY = e.pageY - document.documentElement.scrollTop;
		dragDown = true;
	} 

	// drag 함수 적용 및 배열 설정
	for(var o=0; o<objLen; o++){
		if(option.selector) obj[o].querySelector(option.selector).addEventListener('mousedown', dragStart);
		else obj[o].addEventListener('mousedown', dragStart);
		if(func == 'sequence') {
			objArr.top.push(offset(obj[o]).top);
			objArr.btm.push(offset(obj[o]).top + obj[o].offsetHeight);
			objArr.left.push(offset(obj[o]).left);
			objArr.right.push(offset(obj[o]).left + obj[o].offsetWidth);
		} 
	}
	if(func == 'dnd') {
		for( var d = 0; d < area.length; d++) {
			dropArr.top.push(offset(area[d]).top);
			dropArr.btm.push(offset(area[d]).top + area[d].offsetHeight);
			dropArr.left.push(offset(area[d]).left);
			dropArr.right.push(offset(area[d]).left + area[d].offsetWidth);
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