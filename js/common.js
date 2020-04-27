// javascript 함수 =====================================================

// closest 기능 함수 설정
if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) {};
        } while ((i < 0) && (el = el.parentElement));
        return el;
    };
}

// parents 기능 함수 - 부모요소 배열 반환
Element.prototype.parents = function(selector) {
	var elements = [];
	var elem = this;
	var ishaveselector = selector !== undefined;
 
	while ((elem = elem.parentElement) !== null) {
		if (elem.nodeType !== Node.ELEMENT_NODE) {
			continue;
		}
 
		if (!ishaveselector || elem.matches(selector)) {
			elements.push(elem);
		}
	}
 
	return elements;
};

// hasClass 대체 - obj 가 특정 class 를 가지고 있는지 확인 - boolean 값 리턴
function funcHasClass(obj, cls){
	var objCls = obj.className;
	return new RegExp('(^|\\s)'+cls+'(\\s|$)').test(objCls);
}

// addClass 대체 - obj 에 특정 class 추가 - funcHasClass 함수 필요
function funcAddClass(obj, cls){
	var hasChk = funcHasClass(obj, cls);
	if(!hasChk) {
		if(obj.className.length == 0) obj.className += cls;
		else obj.className += " "+cls;
	}
}

// removeClass 대체 - obj 에서 특정 class 제거 - funcHasClass 함수 필요
function funcRemoveClass(obj, cls){
	var hasChk = funcHasClass(obj, cls);
	if(hasChk) {
		obj.className = obj.className.replace(new RegExp('(^|\\s)'+cls+'(\\s|$)'), '');
		
	}
}

// offset 함수.
function offset(elem) {
    if(!elem) elem = this;

    var x = elem.offsetLeft;
    var y = elem.offsetTop;

    while (elem = elem.offsetParent) {
        x += elem.offsetLeft;
        y += elem.offsetTop;
    }

    return { left: x, top: y };
}

// 이벤트 리스트 관련 함수 - 이벤트 추가 시 listener 를 별도 배열로 보관 - 추후 삭제 가능하도록.
HTMLElement.prototype.onEvent = function (eventType, callBack, useCapture) {
	this.addEventListener(eventType, callBack, useCapture);
	if (!this.myListeners) {
		this.myListeners = [];
	};
	this.myListeners.push({ eType: eventType, callBack: callBack });
	return this;
};

HTMLElement.prototype.removeListeners = function () {
	if (this.myListeners) {
		for (var i = 0; i < this.myListeners.length; i++) {
			this.removeEventListener(this.myListeners[i].eType, this.myListeners[i].callBack);
		};
		delete this.myListeners;
	};
};

//tab menu 기능
function nTab(selector){
	var nTabEle = document.querySelectorAll(selector);
	if(nTabEle.length > 1) {
		Array.prototype.forEach.call(nTabEle, function(el, index, array){
			nTabSet(el);
		});
	} 
	else if (nTabEle.length == 1) nTabSet(nTabEle[0]);
	else null;
}

function nTabSet(Ele){
	var tabWrap	= Ele,
		tabBtn	= tabWrap.querySelectorAll('.tab-menu a'),
		tabLi	= tabWrap.querySelectorAll('.tab-menu li'),
		tabCnt	= tabWrap.querySelectorAll('.tab-cnt'),
		tgCnt	= '',
		showNum	= 0;

	var tabCntHide = function(){
		for(i=0; i<tabCnt.length; i++){
			tabCnt[i].style.display = 'none';
		}
	}

	// 화면 로드 시 활성화된 버튼에 맞는 컨텐츠 show
	for(i=0; i<tabLi.length; i++){
		if(funcHasClass(tabLi[i], 'on')) showNum = i;
	}
	tabCntHide();
	tabCnt[showNum].style.display = 'block';

	// tab menu 클릭 기능
	var tabClick = function(event){
		var btn;
		event.target.tagName != 'A' ? btn = event.target.parentElement : btn = event.target;
		// 클릭 시 a 태그 내부에 있는 태그 클릭 시 btn 을 a 태그로 설정

		tgCnt = btn.getAttribute('href');
		for(i=0; i<tabLi.length; i++){
			funcRemoveClass(tabLi[i], 'on');
		}
		funcAddClass(btn.parentElement, 'on');
		tabCntHide();
		tabWrap.querySelector(tgCnt).style.display = 'block';
	}

	for(i=0; i<tabBtn.length; i++){
		tabBtn[i].addEventListener('click', tabClick);
	}	
}


// 말풍선 요소
function nBalloon(selector) {
	var nBallEle = document.querySelectorAll(selector);

	if(nBallEle.length > 1) {
		Array.prototype.forEach.call(nBallEle, function(el, index, array){
			nBalloonSet(el);
		});
	} 
	else if (nBallEle.length == 1) nBalloonSet(nBallEle[0]);
	else null;
}

// 실제 말풍선 관련 기능 함수
function nBalloonSet(Ele){
	var ballWrap	= Ele,
		btn			= ballWrap.querySelector('.btn-balloon'),
		cnt			= ballWrap.querySelector('.cnt-balloon'),
		btnClose	= ballWrap.querySelector('.btn-ball-close'),
		wrapTop		= Number(offset(ballWrap).top + btn.height),
		wrapLeft	= Number(offset(ballWrap).left),
		setTop		= Number(btn.getAttribute('data-top')),
		setLeft		= Number(btn.getAttribute('data-left'));

	var cntShow = function() {
		cnt.style.top = wrapTop + setTop +'px';
		cnt.style.left = wrapLeft + setLeft +'px';
		funcAddClass(cnt, 'on');
	}, cntHide = function(){
		cnt.style.top = '';
		cnt.style.left = '';
		funcRemoveClass(cnt, 'on');
	}, cntCtrl = function() {
		funcHasClass(cnt, 'on') ? cntHide() : cntShow();
	}
	
	if(funcHasClass(ballWrap, 'hover')){
		btn.addEventListener('mouseover', cntShow);
		btn.addEventListener('mouseleave', cntHide);
	} else {
		btn.addEventListener('click', cntCtrl);
	}

	if(btnClose != null) btnClose.addEventListener('click', cntHide);
}
