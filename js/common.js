// javascript 함수 =====================================================

var clickEvt, changeEvt;
try { // chrome / edge 용
	clickEvt = new Event('click', { bubbles: true, cancelable: true });
	changeEvt = new Event('change', { bubbles: true, cancelable: true });
} catch (error) { // IE 용
    clickEvt = document.createEvent('Event');
    clickEvt.initEvent('click', true, true);
    changeEvt = document.createEvent('Event');
    changeEvt.initEvent('change', true, true);
}

// closest 기능 함수 설정 // IE 용
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
// ex : object.closest(target)

// parents 기능 함수 - 부모요소 배열 반환
Element.prototype.parents = function(selector) {
	var elements = [];
	var elem = this;
	var ishaveselector = selector !== undefined;
 
	while ((elem = elem.parentElement) !== null) {
		if (elem.nodeType !== Node.ELEMENT_NODE) continue;  
		if (!ishaveselector || elem.matches(selector)) elements.push(elem);
	} 
	return elements;
};
// ex : object.parents(selector)

// 이벤트 리스트 관련 함수 - 이벤트 추가 시 listener 를 별도 배열로 보관 - 추후 삭제 가능하도록.
HTMLElement.prototype.onEvent = function (eventType, callBack, useCapture) {
	this.addEventListener(eventType, callBack, useCapture);
	if (!this.myListeners) {
		this.myListeners = [];
	};
	this.myListeners.push({ eType: eventType, callBack: callBack });
	return this;
};
// ex : object.onEvent('', function...)

HTMLElement.prototype.removeListeners = function () {
	if (this.myListeners) {
		for (var i = 0; i < this.myListeners.length; i++) {
			this.removeEventListener(this.myListeners[i].eType, this.myListeners[i].callBack);
		};
		delete this.myListeners;
	};
};
// ex : object.removeListeners()

// class 관련 (IE9 이하 대응)
// hasClass 대체 - obj 가 특정 class 를 가지고 있는지 확인 - boolean 값 리턴
function funcHasClass(obj, cls){
	var objCls = obj.className;
	return new RegExp('(^|\\s)'+cls+'(\\s|$)').test(objCls);
}
// ex : funcHasClass(object, class);

// addClass 대체 - obj 에 특정 class 추가 - funcHasClass 함수 필요
function funcAddClass(obj, cls){
	var hasChk = funcHasClass(obj, cls);
	if(!hasChk) {
		if(obj.className.length == 0) obj.className += cls;
		else obj.className += " "+cls;
	}
}
// ex : funcAddClass(object, class);

// removeClass 대체 - obj 에서 특정 class 제거 - funcHasClass 함수 필요
function funcRemoveClass(obj, cls){
	var hasChk = funcHasClass(obj, cls);
	if(hasChk) {
		obj.className = obj.className.replace(new RegExp('(^|\\s)'+cls+'(\\s|$)'), '');
		
	}
}
// ex : funcRemoveClass(object, class);

// toggleClass 대체 - obj 에서 특정 class 토글 - funcHasClass 필요 (IE 용)
function funcToggleClass(obj, cls){
	var hasChk = funcHasClass(obj, cls);
	if(!hasChk) {
		if(obj.className.length == 0) obj.className += cls;
		else obj.className += " "+cls;
	} else {
		obj.className = obj.className.replace(new RegExp('(^|\\s)'+cls+'(\\s|$)'), '');
	} 
}
// ex : funcToggleClass(object, class);

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
// ex : offset(object).top / offset(object).left

// index 반환 함수
function getIndex( elm ){ 
    var c = elm.parentNode.children, i = 0;
    for(; i < c.length; i++ )
        if( c[i] == elm ) return i;
}
// ex : getIndex(object)

// html node 복사 - IE 대응용
function cloneNode(node) {
    var clone = node.nodeType == 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
 
    // Recurse     
    var child = node.firstChild;
    while(child) {
        clone.appendChild(cloneNode(child));
        child = child.nextSibling;
	}
    return clone;
}
// 크롬일 경우 기본 javascript 함수인 object.cloneNode(boolean);
// IE일 구버전(9 이하?) 경우 ex : cloneNode(object);

//콤마 넣기
function comma(str) {
	str = String(str);
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

//콤마 풀기
function uncomma(str) {
	str = String(str);
	return str.replace(/[^\d]+/g, '');
}

// replace all 기능
function replaceAll(str, searchStr, replaceStr) {
	return str.split(searchStr).join(replaceStr);
}
// ex : replaceAll(변경할 문구, 지워질 글자, 대체할 글자);

// 숫자가 10 이하일 경우 앞에 '0' 붙이기
function setZero(num){
	return num < 10 ? '0' + num : num;
}

// yyyy-mm-dd 형식을 date 값으로 변환
function convertToDate(e, sType){
	var thisY = e.split(sType)[0],
	thisM = e.split(sType)[1] - 1,
	thisD = e.split(sType)[2],
	nowDate = new Date(thisY, thisM, thisD);
	return nowDate;
}
// date 값을 yyyy-mm-dd 형식으로 변환
function convertToYMD(e, sType){
	var thisY = e.getFullYear(),
	thisM = e.getMonth() + 1,
	thisD = e.getDate(),
	nowDate;
	if(thisM < 10) thisM = '0'+thisM;
	if(thisD < 10) thisD = '0'+thisD;
	nowDate = ''+thisY + sType + thisM + sType + thisD+'';
	return nowDate;
}

// 공통 함수 : 특정 영역 외 클릭 감지
function outSideClick(area, target, cls){
	var body = document.querySelector('body');
	body.addEventListener('mousedown', function(e){
		var tg = e.target;
		if( !tg.closest(area)) {
			target.classList ? target.classList.remove(cls) : funcRemoveClass(target, cls);
			this.removeEventListener('mousedown', arguments.callee);
		}
	});
}
// area : 부모요소 검색용 css selector
// target : 제어될 html dom 요소
// 삭제할 class
// ex : var wrapArea = document.querySelector('.chk-area');
// ex : outSideClick('.chk-area', wrapArea, 'show');

//tab menu 기능 - 페이지 전체 동일 기능 적용(탭 안의 탭 등 depth 구조일 경우 사용불가)
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

// tab 메뉴 개별 설정형
/* 
	var 변수명 = new nTabMenu({
       wrap         : '.tab-wrap', - 탭 메뉴 및 컨텐츠를 포함하는 영역 선택자
       menuWrap     : '.tab-menu', - 탭 메뉴 선택자
       tabCnt       : '.tab-cnt'   - 탭 컨텐츠 선택자
    });
*/
function nTabMenu(option){
	var tabWrap	= document.querySelector(option.wrap),
		tabLi	= tabWrap.querySelectorAll(option.menuWrap + ' li'),
		tabBtn	= tabWrap.querySelectorAll(option.menuWrap + ' a'),
		tabCnt	= tabWrap.querySelectorAll(option.tabCnt),
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


// 말풍선 요소 = 구버전 - 사용X / 참고용 -- 말풍선 1개 / 버튼 다수일 경우 case 개발 참고
/*
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
		wrapTop		= Number(ballWrap.offsetTop + btn.offsetHeight),
		wrapLeft	= Number(ballWrap.offsetLeft),
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
}*/


// 말풍선 요소 - 단일 사용
function nBalloonTgl(area) {
	var wrap 	= typeof area === 'string' ? document.querySelector(area) : area,
		btn 	= wrap.querySelector('.btn-bln'),
		clsBtn 	= wrap.querySelector('.btn-bln-close');
		
		btn.addEventListener('click', function(){ wrap.classList.toggle('on'); });
		if(!clsBtn) return;
		clsBtn.addEventListener('click', function(){ wrap.classList.remove('on'); });
}

// 말풍선 요소 - 다수 적용
function nBalloonTgls(selector) {
	var nBallEle = document.querySelectorAll(selector);

	if(nBallEle.length > 1) {
		Array.prototype.forEach.call(nBallEle, function(el, index, array){
			nBalloonTgl(el);
		});
	} 
	else if (nBallEle.length == 1) nBalloonTgl(nBallEle[0]);
	else null;
}
// ex 단독 : nBalloonTgl('css 선택자' or element);
// ex 다수 : nBalloonTgls('css 선택자');

/* scroll animation */
function animateScroll(scrollObj, targetVal, duration, direction, gap){
	var scrollEle 	= typeof scrollObj === 'string' ? document.querySelector(scrollObj) : scrollObj,
		gapPos 		= gap ? gap : 0,
		dur			= duration ? duration : 500;
	
	var currentPos = direction == 'x' ? scrollEle.scrollLeft : scrollEle.scrollTop,
		targetPos  = targetVal - gapPos;
	
	animateScrollTo();

	function animateScrollTo() {
		var startTime = new Date().getTime();
		var endTime = new Date().getTime() + dur;

		var scrollTo = function() {
			var now = new Date().getTime(),
				passed = now - startTime,
				ease = easeOutQuad(passed / dur);
			if (now <= endTime) {
				if(direction == 'x') scrollEle.scrollLeft = currentPos + (targetPos - currentPos) * ease;
				else scrollEle.scrollTop = currentPos + (targetPos - currentPos) * ease;
				requestAnimationFrame(scrollTo);
			}
		};
		requestAnimationFrame(scrollTo);
	};
}
// ex : animateScroll(스크롤될 영역, 목표 스크롤값, 애니메이션 시간, 방향, 목표 스크롤값에 적용된 gap);

/* ease func */
function easeInSine(x) {
	return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
	return Math.sin((x * Math.PI) / 2);
}
function easeInOutSine(x) {
	return -(Math.cos(Math.PI * x) - 1) / 2;
}

function easeInQuad(x) {
	return x * x;
}
function easeOutQuad(x) {
	return 1 - (1 - x) * (1 - x);
}
function easeInOutQuad(x){
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeInCubic(x) {
	return x * x * x;
}
function easeOutCubic(x) {
	return 1 - Math.pow(1 - x, 3);
}
function easeInOutCubic(x) {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInQuart(x) {
	return x * x * x * x;
}
function easeOutQuart(x) {
	return 1 - Math.pow(1 - x, 4);
}
function easeInOutQuart(x) {
	return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

function easeInQuint(x) {
	return x * x * x * x * x;
}
function easeOutQuint(x) {
	return 1 - Math.pow(1 - x, 5);
}
function easeInOutQuint(x) {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function easeInExpo(x) {
	return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function easeOutExpo(x) {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeInOutExpo(x) {
	return x === 0
		? 0
		: x === 1
		? 1
		: x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
		: (2 - Math.pow(2, -20 * x + 10)) / 2;
}

function easeInCirc(x) {
	return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
function easeOutCirc(x) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function easeInOutCirc(x) {
	return x < 0.5
	  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
	  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}