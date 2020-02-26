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

//tab-menu 설정
function tabmenu(){
	$('.tab-menu>ul>li>a').click(function(e){
		e.preventDefault();
		var tabCnt = $(this).attr('href');
		$(this).parents('.tab-wrap').find('.tab-cnt').each(function(){$(this).hide();});
		$(this).parents('.tab-wrap').find(''+tabCnt+'').show();
		$(this).parent().siblings('li').removeClass('on');
		$(this).parent().addClass('on');
	});
}


/*$(function(){
	
	// gnb 설정
	$('.gnb-wrap').baseGnb({
		gnbmenu : '.gnb-menu',
		d1 : '.depth1',
		d1list : ' > li',
		d1btn : ' > a',
		d2 : '.depth2',
		d2list : ' > li',
		d2btn : ' > a',
		//control : 'class',
		onclass : 'on'
	});

	// lnb 설정
	$('.side-wrap').baselnb({
		lnbmenu : '.depth1',
		d1list : ' > li',
		d1btn : ' > a',
		d2 : '.depth2',
		onclass : 'on'
	});

	// 전체메뉴 설정
	$('.gnb-wrap').find('.depth1').clone().prependTo('.same-gnb .inbox'); //gnb 메뉴 리스트를 전체메뉴로 복사

	$('.btn-all-menu').click(function(){
		$('.all-menu').toggle();
	});
	$('.btn-all-close').click(function(){
		$('.all-menu').hide();
		$('.btn-all-menu').focus();
	});

	// tabmenu 적용
	tabmenu();

	//toggle 컨텐츠
	$('.btn-tgl').click(function(){
		$(this).toggleClass('on');
	});

	// 말풍선 요소
	$('.btn-balloon').click(function(){
		var gapT = Number($(this).attr('data-top')),
		gapL = Number($(this).attr('data-left'));
		var btnH = $(this).innerHeight(),
		btnT = $(this).offset().top + btnH + gapT,
		btnL = $(this).offset().left + gapL;

		$(this).next('.cnt-balloon').css({'top':''+btnT+'px','left':''+btnL+'px'}).toggleClass('on');
	});
	$('.btn-balloon-close').click(function(){
		$(this).parent().toggleClass('on');
	});

});*/