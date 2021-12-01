// layer pop system
// 2018-08-30 copyright - namo (seo nam ho) for m.s.p
// 2021-10-19 - v.4.0.0 : IE11 이상만 지원 // style : display:flex 방식으로 CSS 변경됨.

// !! common.js 필수

var clsLayer		= '.layer', 	// 레이어 팝업 공통 클래스
	clsOn			= 'now-open', 	// 레이어 팝업 오픈 시킨 버튼에 지정될 임시 클래스
	clslayerCnt		= '.layer-cnt', // 레이어 팝업 내 컨텐츠 영역 클래스
	clsCloseBtn		= '.close-layer',
	clsShow			= 'showOn';

var nlayer = {
	// 모 페이지 설정 함수 - tab 키 요소 제어 및 화면 높이 설정
	pageSet : function(set) {
		var tabEle		= document.querySelectorAll('a, button, input'),
			tabEleLen	= tabEle.length,
			bodyStyle	= document.querySelector('body').style;

		Array.prototype.forEach.call(tabEleLen, function(ele){
			if(!ele.closest(clsLayer)) ele.setAttribute('tabindex','-1');
		});
		
		bodyStyle.overflow = 'hidden';
	},

	// 모 페이지 설정 해제
	pageUnset : function(){
		var tabEle		= document.querySelectorAll('a, button, input'),
			tabEleLen	= tabEle.length,
			bodyStyle	= document.querySelector('body').style;
		
		Array.prototype.forEach.call(tabEleLen, function(ele){
			if(!ele.closest(clsLayer)) ele.removeAttribute('tabindex');
		});

		bodyStyle.overflow = '';	
	},
	layerHide : function(tg){
		var tg_layer	= typeof tg === 'string' ? document.getElementById(tg) : tg,
			on_layer 	= document.querySelectorAll(clsLayer + '.' + clsShow);

		tg_layer.classList.remove(clsShow);
		if(on_layer.length < 2) nlayer.pageUnset();

		if(tg_layer.showBtn == null) return;
		tg_layer.showBtn.classList.remove(clsOn);
		tg_layer.showBtn.focus();
	},
	layerHideAll : function(){
		var tg_layers 	= document.querySelectorAll(clsLayer),
			openBtns = document.querySelectorAll('.' + clsOn);

		Array.prototype.forEach.call(tg_layers, function(tg){ nlayer.layerHide(tg); });
		Array.prototype.forEach.call(openBtns, function(obtn){ obtn.classList.remove(clsOn); });
	},	
	layerShow : function(tg, opBtn){
		var tg_layer 	= typeof tg === 'string' ? document.getElementById(tg) : tg;
		
		opBtn ? tg_layer.showBtn = opBtn : tg_layer.showBtn = null;
		tg_layer.classList.add(clsShow);

		nlayer.pageSet();
		tg_layer.focus();
	},

	closeBtnSet : function(tg, onceChk){
		var tg_layer 	= typeof tg === 'string' ? document.getElementById(tg) : tg,
			btnCloses 	= tg_layer.querySelectorAll(clsCloseBtn);

		Array.prototype.forEach.call(btnCloses, function(cbtn){
			if(cbtn.classList.contains('all')) {
				cbtn.addEventListener('click', nlayer.layerHideAll, { once: onceChk });
				return;
			}
			cbtn.addEventListener('click', function(){
				nlayer.layerHide(tg_layer);
			}, { once: onceChk });
		});
	},
	showBtn : function(e){
		var btns = document.querySelectorAll(e);
		Array.prototype.forEach.call(btns, function(btn){
			var tg 		= document.getElementById(btn.getAttribute('data-target'));

			btn.addEventListener('click', function(){
				nlayer.layerShow(tg, btn);
				btn.classList.add(clsOn);
			});
			nlayer.closeBtnSet(tg, false);
		});
	},
	showFunc : function(e){
		nlayer.layerShow(e);
		nlayer.closeBtnSet(e, true);
	}
}


/* 알럿 기능 =========================================================================================================
nlayerAlert('내용', '타이틀', 확인 후 실행할 함수, '버튼 텍스트');
- 내용은 필수
*/
function nlayerAlert(ment, title, active, btn) {
	var body = document.querySelector('body');

	var btnTx = btn == null ? '확인' : btn;
	var layerCnt = '<div class="layer alert" id="nAlert">';
		layerCnt += '<div class="inbox">';
		layerCnt += '<div class="layer-cnt">';
		if(title != undefined && title.length > 0) layerCnt += '<div class="layer-top">'+ title +'</div>';
		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="ment">'+ment+'</p>';
		layerCnt += '<div class="btn-group">';
		layerCnt += '<button type="button" class="btn close-layer"><span>'+btnTx+'</span></button>';
		layerCnt += '</div></div></div></div></div>';

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

/* 컨펌 기능 =========================================================================================================
nlayerAlert('내용', 확인 시 실행할 함수, '타이틀', '취소버튼 텍스트', '확인버튼 텍스트');
- 내용은 필수
*/
function nlayerConfirm(ment, active, title, btn1, btn2) {
	var body = document.querySelector('body');

	var btnCancel = btn1 == null ? '취소' : btn1,
		btnOk = btn2 == null ? '확인' : btn2;

	var layerCnt = '<div class="layer confirm" id="nConfirm">';
		layerCnt += '<div class="inbox">';
		layerCnt += '<div class="layer-cnt">';
		if(title != undefined && title.length > 0) layerCnt += '<div class="layer-top">'+ title +'</div>';
		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="ment">'+ment+'</p>';
		layerCnt += '<div class="btn-group">';
		layerCnt += '<button type="button" class="btn close-layer"><span>'+ btnCancel +'</span></button>';
		layerCnt += '<button type="button" class="btn close-layer btn-ok"><span>'+ btnOk +'</span></button>';
		layerCnt += '</div></div></div></div></div>';

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


/* Toast 기능 =========================================================================================================
nToast('내용', '추가 클래스')
*/
function nToast(ment, addCls) {
	var body = document.querySelector('body');
	var toastCnt = '';
		addCls ? toastCnt = '<div class="toast '+addCls+'">' : toastCnt = '<div class="toast">';
		toastCnt += '<div class="toast-cnt">';
		toastCnt += '<p class="ment">'+ment+'</p>';
		toastCnt += '</div></div>';

	body.insertAdjacentHTML('beforeend', toastCnt);
	var toast		= document.querySelector('.toast'),
		toastCnt	= toast.querySelector('.toast-cnt');

	toast.classList.add('show');
	toastCnt.addEventListener('animationend', function(){
		toast.parentNode.removeChild(toast);
	}, { once : true });
}