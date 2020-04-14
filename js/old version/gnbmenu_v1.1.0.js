/* -- date : 2017-01-24 -- */
/* -- snamo(Seo nam ho) for m.s.p -- */
/* -- GNB / LNB 설정 -- */

$.fn.baseGnb = function(option){

	//if(!option) { option = {}; }
	var set = $.extend({
		wrap : this,
		gnbmenu : null,
		d1 : null,
		d1list : null,
		d1btn : null,
		d2 : null,
		d2list : null,
		d2btn : null,
		control : 'script',  // 2depth show, hide 제어 방식 설정 - script : 스크립트로 show/hide 제어 / class : 클래스를 통해 CSS 에서 제어
		onclass : false
	}, option);

	// obj 변수설정
	var $wrap = $(set.wrap),
		$gnb = $wrap.find(set.gnbmenu),
		$d1 = $gnb.find(set.d1),
		$d1list = $d1.find(set.d1list),
		$d1btn = $d1list.find(set.d1btn),
		$d2 = $gnb.find(set.d2),
		$d2list = $d2.find(set.d2list),
		$d2btn = $d2list.find(set.d2btn),
		$control = set.control,
		$onclass = set.onclass;
	
	// 각 2dep 메뉴의 마지막 리스트에 last 클래스 추가
	$d2.each(function(){
		$(this).find(set.d2list).last().addClass('last');
	});

	// show - 키보드 / 마우스 동시적용
	$d1btn.on('focus mouseenter',function(){
		if($control == 'script') $(this).next($d2).show();
		else $	(this).next($d2).addClass($onclass);
	});

	// hide - 마우스
	$d1list.on('mouseleave',function(){
		if($control == 'script') $(this).find($d2).hide();
		else $(this).find($d2).removeClass($onclass);
	});

	// hide - 키보드
	$d1btn.on('keydown',function(e){
		var $key = e.keyCode || e.which;
		if($key == 9) { 
			if(e.shiftKey) {
				if($control == 'script') $(this).next($d2).hide();
				else $(this).next($d2).removeClass($onclass);
			} else { null; }
		}		
	});

	
	$d2btn.on('keydown',function(e){
		var $key = e.keyCode || e.which,
			$parent = $(this).parent().parent();
		if($(this).parent().hasClass('last')){
			if($key == 9) { 
				if(!e.shiftKey) {
					if($control == 'script'){
						$parent.hide(10); // hide 에 값이 0일 경우 ie 에서는 hide 이벤트가 너무 빨리 실행되어 focus 를 순간적으로 잃고, 기존 depth1 버튼으로 강제 이동됨.
					} else {
						$parent.removeClass($onclass);
					}
				} else { null; }
			}	
		}
	});

}


/*
$(document).ready(function(){

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

});
*/


$.fn.baselnb = function(option){

	//if(!option) { option = {}; }
	var set = $.extend({
		wrap : this,
		lnbmenu : null,
		d1list : null,
		d1btn : null,
		d2 : null,
		onclass : false
	}, option);

	var $wrap = $(set.wrap),
		$lnb = $wrap.find(set.lnbmenu),
		$d1list = $lnb.find(set.d1list),
		$d1btn = $d1list.find(set.d1btn),
		$d2 = $lnb.find(set.d2),
		$onclass = set.onclass;

	$d2.hide();

	$d1list.each(function(){
		if($(this).hasClass(''+set.onclass+'')){
			$(this).find($d2).slideDown(300);
		}	
	});

	$d1btn.on('click',function(){
		$d1list.each(function(){ $(this).removeClass($onclass); });
		$d2.each(function(){ $(this).slideUp(300) });
		$(this).next($d2).stop().slideDown(300).end().parent().addClass('on');
	});


};


/* 
$('.lnb-wrap').baselnb({
	lnbmenu : '.lnb',
	d1list : ' > li',
	d1btn : ' > a',
	d2 : '.depth2',
	onclass : 'on'
});
*/
	