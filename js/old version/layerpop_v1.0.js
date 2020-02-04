// layer pop system
// 2018-08-30 copyright - namo (seo nam ho) for m.s.p
// vh 단위 지원하지 않는 구버전 브라우저에 사용.

var $layer = '.layer-pop', // 레이어 팝업 공통 클래스
	onClass = 'now-open', // 레이어 팝업 오픈 시킨 버튼에 지정될 임시 클래스
	$layercnt = '.layer-cnt', // 레이어 팝업 내 컨텐츠 영역 클래스
	$layertop = '.layer-top',
	$layermid = '.layer-mid',
	$closeBtn = '.close-layer';

var nlayer = {
	showBtn : function(e, pageSet, layerSet, topPer){
		var $tg = $('#'+e.attr('data-target')+'');
		e.addClass(onClass);
		showPop($tg, pageSet, layerSet, topPer, e);
	},
	showFunc : function(e, pageSet, layerSet, topPer){
		var $tg = e;
		showPop($tg, pageSet, layerSet, topPer);
	}
}

function showPop(e, pageSet, layerSet, topPer, btn){
	e.css({'display':'block','visibility':'hidden'}) // 팝업 컨텐츠 높이 추출용 설정
		.prepend('<div class="layer-bg"></div>');
	var $cnt = e.find(''+$layercnt+''),
		$top = $cnt.find(''+$layertop+''),
		$mid = $cnt.find(''+$layermid+''),
		wH = $(window).innerHeight(),
		dH = $(document).innerHeight(),
		$close = e.find(''+$closeBtn+''),
		midH;// 레이어팝업 컨텐츠가 window height 보다 클 경우 팝업 내 scroll 추가

	if($top != null) midH = wH - $top.outerHeight() - 20;
	else midH = wH - 20;
	$mid.css({'overflow-x':'hidden','overflow-y':'auto'});

	if(layerSet == 'top') $mid.css('max-height',''+(midH - $cnt.position().top)+'px');
	else $mid.css('max-height',''+midH+'px');
	
	var cntH = $cnt.height(); // layer-cnt 높이 측정 - midH 설정 전에 할 경우 실제 컨텐츠 전체 높이로 계산됨으로 layer 컨텐츠가 클 경우 위가 잘림

	if(layerSet == 'top') {
		$cnt.css({'top':''+topPer+'%', 'margin-top':'0'});
		basePageSet(pageSet);
	} else if(layerSet == 'btn'){
		e.css('position','absolute');
		var btnPos = btn.offset().top +  btn.outerHeight(),
			popH = btnPos + cntH,
			popPos = dH - cntH - 20;
			
		if(popH < dH-20) {
			$cnt.css({'top':''+(btnPos)+'px', 'margin-top':'0'});
		} else {
			$cnt.css({'top':''+(popPos)+'px', 'margin-top':'0'});
		}
		$(window).scrollTop(btn.offset().top);
		basePageSet(null); // 레이어 위치가 btn 일 경우 페이지 높이 설정 무시.
	} else {
		$cnt.css({'top':'50%','margin-top':'-'+ (cntH/2) +'px'});
		basePageSet(pageSet);
	}

	e.css('visibility','visible').focus(); // 최종 설정 후 보이기	
	hidePop($close, btn, pageSet);
}

function hidePop(closeBtn, openBtn, pageSet){
	closeBtn.unbind().click(function(){
		var $wrap = $(this).closest($layer);
		if($(this).hasClass('all')){
			$('body').find('.layer-bg').remove().end().find($layercnt).css({'top':'','margin-top':''}).end().find($layermid).css({'max-height':'','overflow':''});
			$('body').find($layer).css({'display':'','visibility':'','position':''});
			if(openBtn != null) { $('body').find('.'+onClass+'').focus().removeClass(''+onClass+''); }
		} else {
			$wrap.find('.layer-bg').remove().end().find($layercnt).css({'top':'','margin-top':''}).end().find($layermid).css({'max-height':'','overflow':''}).end().css({'display':'','visibility':'','position':''});
			if(openBtn != null) { openBtn.focus().removeClass(''+onClass+''); }
		}		
		basePageSetOff(pageSet);
	});
}

function hideFunc(tg, pageSet){
	var $this = tg;
	$this.find('.layer-bg').remove()
		.end().find($layercnt).css({'top':'','margin-top':''})
		.end().find($layermid).css({'max-height':'','overflow':''})
		.end().css({'display':'','visibility':'','position':''}).removeClass('show');
	$('body').find('.'+onClass+'').focus().removeClass(onClass);
	basePageSetOff(pageSet);
}

// 기본 페이지 설정 함수 - tab 키 요소 제어 및 화면 높이 설정
function basePageSet(set) {
	$('body').find('a, button, input').each(function() { $(this).attr('tabindex','-1'); }); // 화면내 focus 요소 모두 focus 막기
	$(''+$layer+'').find('a, button, input').each(function() { $(this).removeAttr('tabindex'); }); // 레이어 팝업 내 focus 요소만 focus 풀기
	if(set == 'fixed') $('body').css({'position':'fixed','width':'100%'});
	else if (set == 'hidden'){
		var wh = $(window).innerHeight();
		$('body').css({'height':''+wh+'px', 'overflow':'hidden'});
	} else null;
}

function basePageSetOff(set){
	$('body').find('a, button, input').each(function() { $(this).removeAttr('tabindex'); });
	if(set == 'fixed') $('body').css({'position':'','width':''});
	else if (set == 'hidden') $('body').css({'height':'', 'overflow':''});
}

// 레이어 팝업 높이 재설정 함수
function layerHeightSet(){
	$($layercnt).each(function(){
		var layerH = $(this).height();
		$(this).css({'margin-top':'-'+ (layerH/2) +'px'});
	});
}

/*
변수 안내
e / pageSet / layerSet / topPer

showBtn

e : 레이어 팝업을 띄운 버튼 자신
pageSet : 페이지 설정 변수
			null : 본 페이지 설정없음
			fixed : 레이어 팝업이 뜬 상태일 때 모 페이지 전체 position:fixed 설정
			hidden : 레이어 팝업이 뜬 상태일 때 모 페이지 overflow:hidden 및 height 설정 

layerSet : 레이어 팝업 위치 설정 변수
			null : 부모요소 기준 화면 중앙
			top : 부모요소 기준 화면 상단에서 topPer 만큼 설정
			btn : 레이어 팝업을 띄운 버튼의 offset 값으로 설정

topPer : layerSet 가 top 일 경우 상단 여백 설정값.


showFunc

e : 띄울 레이어 팝업 id
pageSet, layerSet, topPer 은 위와 동일.


hideFunc // 팝업 닫기 함수형

tg - 닫을 팝업
pageSet - 해당 팝업 띄울 때 설정한 page set (fixed / hidden)

*/