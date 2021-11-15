// layer pop system
// 2018-08-30 copyright - namo (seo nam ho) for m.s.p
// 2019-12-11 - v2.0 - css transform 사용을 통한 중앙정렬 > 스크립트 중앙정렬 제거 // 높이 단위 vh 사용으로 높이 계산 제거
// 2020-01-13 - v3.0.0 - jquery 제거 버전
// 2020-04-13 - 모 페이지에서 호출 시 scroll 값 저장 -> 닫을 때 해당 scroll 이동 (버튼형일 경우만)
// 2020-06-04 - cnt 높이가 홀수일 경우 짝수로 - 브라우저에서 흐리게 보이는 현상 방지
// 2020-12-11 - v3.1.0 - 추가 기능 : 알럿 및 컨펌

// !! common.js 필수

var layer		= '.layer-pop', // 레이어 팝업 공통 클래스
	onClass		= 'now-open', // 레이어 팝업 오픈 시킨 버튼에 지정될 임시 클래스
	layerCnt	= '.layer-cnt', // 레이어 팝업 내 컨텐츠 영역 클래스
	btnClose	= '.close-layer',
	showClass	= 'showOn',
	scrollT;


// 기본 페이지 설정 함수 - tab 키 요소 제어 및 화면 높이 설정
var nLayerPageSet = function(set) {
	var tabEle		= document.querySelectorAll('a, button, input'),
		tabEleLen	= tabEle.length,
		bodySet		= set,
		bodyStyle	= document.querySelector('body').style;

	for(i=0;i<tabEleLen;i++){
		if(!tabEle[i].closest(layer)) tabEle[i].setAttribute('tabindex','-1');
	};
	
	if(bodySet == 'fixed') {
		bodyStyle.position = 'fixed';
		bodyStyle.width = '100%';
	} else if (bodySet == 'hidden') bodyStyle.overflow = 'hidden';
}

// 기본 페이지 설정 해제
var nLayerPageSetOff = function(){
	var tabEle		= document.querySelectorAll('a, button, input'),
		tabEleLen	= tabEle.length,
		bodyStyle	= document.querySelector('body').style;
	
	for(i=0;i<tabEleLen;i++){
		if(!tabEle[i].closest(layer)) tabEle[i].removeAttribute('tabindex');
	};

	bodyStyle.position = '';
	bodyStyle.width = '';
	bodyStyle.overflow = '';	
}

// 레이어팝업 닫기
var nLayerHide = function(closeBtn, openBtn){
	var wrap		= closeBtn.closest(layer),
		hasClassChk = funcHasClass(closeBtn, 'all');

	if(!hasClassChk) {		
		wrap.style.display = "none";
		funcRemoveClass(wrap, showClass);
		if(openBtn != null) {
			openBtn.focus();
			funcRemoveClass(openBtn, onClass);
		}
	} else {
		var layers		= document.querySelectorAll(layer),
			firstOpen	= document.querySelector('.'+onClass),
			layerLen	= layers.length;
		for(i = 0; i<layerLen; i++){
			layers[i].style.display = 'none';
			funcRemoveClass(layers[i], showClass);
		}
		firstOpen.focus();
		funcRemoveClass(firstOpen, onClass);
	}
	nLayerPageSetOff();
	window.scrollTo(0,scrollT); // 페이지 scroll 위치 설정
}


// 레이어 팝업 닫기 - 함수형
var nLayerHideFunc = function(tg){
	var target_layer = document.getElementById(tg);
		target_layer.style.display = 'none';
	
	var firstOpen = document.querySelector('.'+onClass);

	if(firstOpen) {
		firstOpen.focus();
		funcRemoveClass(firstOpen, onClass);
	}
	nLayerPageSetOff();
}

// 레이어 팝업 전체 닫기 - 함수형 
var nLayerAllHideFunc = function(){
	var layers		= document.querySelectorAll(layer),
		layerLen	= layers.length;
		
	for(i = 0; i<layerLen; i++){
		layers[i].style.display = 'none';
		funcRemoveClass(layers[i], showClass);
	}
	
	var firstOpen = document.querySelector('.'+onClass);

	if(firstOpen) {
		firstOpen.focus();
		funcRemoveClass(firstOpen, onClass);
	}
	nLayerPageSetOff();
}


// 레이어 팝업 열기
var nLayerShow = function(e, pageSet, btn){
	var target_layer	= document.getElementById(e),
		cnt				= target_layer.querySelector(layerCnt),
		btn_close		= target_layer.querySelectorAll(btnClose);

	target_layer.style.display = 'block';
	funcAddClass(target_layer, showClass);
	cnt.offsetHeight % 2 != 0 ? cnt.style.height = cnt.offsetHeight + 1 + 'px' : null; // cnt 높이가 홀수일 경우 짝수로.

	nLayerPageSet(pageSet);
	target_layer.focus();
	
	for(b=0; b<btn_close.length; b++) {
		btn_close[b].addEventListener('click', function(){
			nLayerHide(this, btn);
			this.removeEventListener('click', arguments.callee);
		});
	}

	/* btn_close.addEventListener('click', function(){
		nLayerHide(btn_close, btn, pageSet);
	}, {once:true}); */ // {once : true} - addeventlistener 한번만 실행되게. IE 미지원
}


// 레이어 실행용 함수
var nlayer = {
	showBtnRun : function(e, pageSet){
		tg = e.getAttribute('data-target');
		funcAddClass(e, onClass);
		if(!e.closest(layer)) scrollT = window.pageYOffset; // 페이지 내 버튼일 경우 현재 scroll 값 기억
		nLayerShow(tg, pageSet, e);
	},
	showBtn : function(e, pageSet){
		var btn = document.querySelectorAll(e),
		btnLen = btn.length;
	
		for(i=0; i<btnLen; i++){
			btn[i].addEventListener('click', function(){ nlayer.showBtnRun(this, pageSet)});
		}
	},
	showFunc : function(e, pageSet){
		nLayerShow(e, pageSet);
	}
}

/* 적용 예시
nlayer.showBtn('.버튼 클래스', 'fixed'); // 버튼형 호출 - body fixed 설정
nlayer.showBtn('.버튼 클래스', 'hidden'); // 버튼형 호출 - body overflow:hidden 설정
nlayer.showFunc('호출할 레이어 팝업 ID'); // 함수형 호출 - 대상 팝업 id 값 설정

변수 안내
e / pageSet

showBtn

e : 레이어 팝업을 띄운 버튼 자신
pageSet : 페이지 설정 변수
			null : 본 페이지 설정없음
			fixed : 레이어 팝업이 뜬 상태일 때 모 페이지 전체 position:fixed 설정
			hidden : 레이어 팝업이 뜬 상태일 때 모 페이지 overflow:hidden 및 height 설정 

showFunc

e : 띄울 레이어 팝업 id
pageSet은 위와 동일.

hideFunc // 팝업 닫기 함수형
*/

/* 알럿 기능 
nlayerAlert('내용', '타이틀', 확인 후 실행할 함수, '버튼 텍스트');
- 내용은 필수
*/
function nlayerAlert(ment, title, active, btn) {
	var body = document.querySelector('body');

	var btnTx = btn == null ? '확인' : btn;
	var layerCnt = '<div class="layer-pop alert" id="nAlert">';
		layerCnt += '<div class="layer-cnt">';
		if(title != undefined && title.length > 0) layerCnt += '<div class="layer-top">'+ title +'</div>';
		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="ment">'+ment+'</p>';
		layerCnt += '<div class="btn-group">';
		layerCnt += '<button type="button" class="btn close-layer"><span>'+btnTx+'</span></button>';
		layerCnt += '</div></div></div></div>';

	body.insertAdjacentHTML('beforeend', layerCnt);
	var alert = document.querySelector('#nAlert'),
		close = alert.querySelector('#nAlert .close-layer');

	nlayer.showFunc('nAlert');	

	close.addEventListener('click', function(){
		alert.parentNode.removeChild(alert);
		if(typeof active === 'function') {
			active();
		}
	});
}

/* 컨펌 기능 
nlayerAlert('내용', 확인 시 실행할 함수, '타이틀', '취소버튼 텍스트', '확인버튼 텍스트');
- 내용은 필수
*/
function nlayerConfirm(ment, active, title, btn1, btn2) {
	var body = document.querySelector('body');

	var btnCancel = btn1 == null ? '취소' : btn1,
		btnOk = btn2 == null ? '확인' : btn2;

	var layerCnt = '<div class="layer-pop confirm" id="nConfirm">';
		layerCnt += '<div class="layer-cnt">';
		if(title != undefined && title.length > 0) layerCnt += '<div class="layer-top">'+ title +'</div>';
		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="ment">'+ment+'</p>';
		layerCnt += '<div class="btn-group">';
		layerCnt += '<button type="button" class="btn close-layer"><span>'+ btnCancel +'</span></button>';
		layerCnt += '<button type="button" class="btn close-layer btn-ok"><span>'+ btnOk +'</span></button>';
		layerCnt += '</div></div></div></div>';

	body.insertAdjacentHTML('beforeend', layerCnt);
	var confirm	= document.querySelector('#nConfirm'),
		cancel	= confirm.querySelector('#nConfirm .close-layer'),
		ok		= confirm.querySelector('#nConfirm .btn-ok');

	nlayer.showFunc('nConfirm');

	cancel.addEventListener('click', function(){
		confirm.parentNode.removeChild(confirm);
	});
	ok.addEventListener('click', function(){
		confirm.parentNode.removeChild(confirm);
		if(typeof active === 'function') {
			active();
		}
	});
}