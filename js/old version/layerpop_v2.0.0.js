// layer pop system
// 2018-08-30 copyright - namo (seo nam ho) for m.s.p
// 2019-12-11 - v2.0 - css transform 사용을 통한 중앙정렬 > 스크립트 중앙정렬 제거 // 높이 단위 vh 사용으로 높이 계산 제거

var layer = '.layer-pop', // 레이어 팝업 공통 클래스
	onClass = 'now-open', // 레이어 팝업 오픈 시킨 버튼에 지정될 임시 클래스
	layerCnt = '.layer-cnt', // 레이어 팝업 내 컨텐츠 영역 클래스
	btnClose = '.close-layer';

var nlayer = {
	showBtn : function(e, pageSet){
		var tg = $('#'+e.attr('data-target')+'');
		e.addClass(onClass);
		showPop(tg, pageSet, e);
	},
	showFunc : function(e, pageSet){
		var tg = e;
		showPop(tg, pageSet);
	}
}

function showPop(e, pageSet, btn){
	e.css({'display':'block','visibility':'hidden'}) // 팝업 컨텐츠 높이 추출용 설정
	var $close = e.find(''+btnClose+'');
	
	basePageSet(pageSet);
	e.css('visibility','visible').focus(); // 최종 설정 후 보이기	
	hidePop($close, btn, pageSet);
}

function hidePop(closeBtn, openBtn, pageSet){
	closeBtn.unbind().click(function(){
		var $wrap = $(this).closest(layer);
		if($(this).hasClass('all')){
			$('body').find('.layer-bg').remove();
			$('body').find(layer).css({'display':'','visibility':'','position':''});
			if(openBtn != null) { $('body').find('.'+onClass+'').focus().removeClass(''+onClass+''); }
		} else {
			$wrap.find('.layer-bg').remove().end().css({'display':'','visibility':'','position':''});
			if(openBtn != null) { openBtn.focus().removeClass(''+onClass+''); }
		}		
		basePageSetOff(pageSet);
	});
}

function hideFunc(tg, pageSet){
	var $this = tg;
	$this.find('.layer-bg').remove()
		.end().css({'display':'','visibility':'','position':''}).removeClass('show');
	$('body').find('.'+onClass+'').focus().removeClass(onClass);
	basePageSetOff(pageSet);
}

// 기본 페이지 설정 함수 - tab 키 요소 제어 및 화면 높이 설정
function basePageSet(set) {
	$('body').find('a, button, input').each(function() { $(this).attr('tabindex','-1'); }); // 화면내 focus 요소 모두 focus 막기
	$(''+layer+'').find('a, button, input').each(function() { $(this).removeAttr('tabindex'); }); // 레이어 팝업 내 focus 요소만 focus 풀기
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
	$(layerCnt).each(function(){
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


showFunc

e : 띄울 레이어 팝업 id
pageSet, layerSet, topPer 은 위와 동일.


hideFunc // 팝업 닫기 함수형

tg - 닫을 팝업
pageSet - 해당 팝업 띄울 때 설정한 page set (fixed / hidden)

*/