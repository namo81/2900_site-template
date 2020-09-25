/*-- input design --*/
/*-- 서남호 --*/
/*-- 2018-01-11 - checkbox/radio/select/file 통합본 수정 --*/
/*-- 2018-01-17 - disabled 추가 --*/
/*-- 2019-09-05 - v1.1 변수 추가 및 사용방법 변경 // select 부모영역 설정 추가 (상황에 따라 리스트 위로 뜨도록) --*/
/*-- 2019-12-11 - v1.2 select - option 속성 관련 추가 --*/
/*-- 2020-01-15 - v2.0.0 - radio, checkbox 기능 제거(css로만 적용) 및 jquery 제거버전 진행  */

// !! common.js 필수


/* 적용 예시
nSelect('클래스명');	
nSelArr.selectUpdate();
** 화면 내 select 가 1개일 경우 nSelArr.selectUpdate();
   화면 내 select 가 다수일 경우 nSelArr[0].selectUpdate(); (업데이트가 필요한 select index 선택)
   만약 전체 업데이트 일 경우 반목문 적용
*/

// select 설정 ------------------------------------------------------------------------
var nSelArr;

// 적용을 위한 실행 함수
function nSelect(selector) {
	var nSelectEle = document.querySelectorAll(selector);
	
	if(nSelectEle.length > 1) {
		nSelArr = new Array();
		Array.prototype.forEach.call(nSelectEle, function(el, index, array){
			nSelArr[index] = new nSelectSet(el);
		});
	} 
	else if (nSelectEle.length == 1) nSelArr = new nSelectSet(nSelectEle[0]);
	else null;
}

// 실제 select 관련 기능 함수
function nSelectSet(Ele){
	var selWrap		= Ele,
		sel			= selWrap.querySelector('select'),
		opts		= sel.querySelectorAll('option'),
		selTitle	= sel.getAttribute('title'),
		firstOp		= '',
		selHtml		= '',
		selList		= null,
		selUl		= null,
		selBtn		= null,
		selBtnTx	= null,
		optHtml		= '';

	// select 대체 태그 생성 영역
	var optionCreate = function(){
		optHtml = '';
		for(i=0; i<opts.length; i++){
			if(opts[i].disabled == true) optHtml += '<li><button type="button" class="btn-sel" disabled>'+opts[i].text+'</button></li>'; 
			else {
				if(opts[i].hidden == true) optHtml += '<li class="hidden"></li>'; 
				else optHtml += '<li><button type="button" class="btn-sel">'+opts[i].text+'</button></li>';
			}

			if(opts[i].selected == true) firstOp = opts[i].text;
			else firstOp = opts[0].text;
		}
	}, selectCreate = function(){
		if(sel.disabled == true) {
			selHtml += '<button type="button" class="btn-select" title="'+selTitle+'" disabled><span></span></button>';
		} else {
			selHtml += '<button type="button" class="btn-select" title="'+selTitle+'"><span></span></button>',
			selHtml += '<div class="select-list"><ul></ul></div>';
		}
		selWrap.insertAdjacentHTML('beforeend', selHtml);

		selList		= selWrap.querySelector('.select-list'),
		selUl 		= selList.querySelector('ul'),
		selBtn		= selWrap.querySelector('.btn-select'),
		selBtnTx 	= selBtn.querySelector('span');
		optionCreate();
	}
	selectCreate();	

	selBtnTx.innerText = firstOp;
	selUl.insertAdjacentHTML('beforeend', optHtml);

	// 대체 태그 기능 설정 영역
	var selBtnClick = function(){
		funcAddClass(selWrap, 'on');
		selWrap.style.zIndex = 200;
	}, selLeave = function(){
		funcRemoveClass(selWrap, 'on');
		selWrap.style.zIndex = '';
	}, optBtnClick = function(event){
		var tg		= event.target;
			tgTx	= tg.innerText;
		
		selBtnTx.innerText = tgTx;
		selLeave();
		selBtn.focus();
		for(o=0; o<opts.length; o++){
			if(opts[o].innerText == tgTx) opts[o].selected = true;
		}
		
		// select - change 이벤트 트리거
		/* 크롭은 한줄로 가능
		var changeEvt = new Event('change');*/
		/* IE 등 타 브라우저 */
		var changeEvt = document.createEvent('Event');
		changeEvt.initEvent('change', true, false);

		sel.dispatchEvent(changeEvt); // 공통문구
	}

	selBtn.addEventListener('click', selBtnClick);
	selWrap.addEventListener('mouseleave',selLeave);
	selUl.addEventListener('click', optBtnClick);

	return {
		selectUpdate : function(){
			opts	= sel.querySelectorAll('option');
			while ( selUl.hasChildNodes() ) { selUl.removeChild( selUl.firstChild ); }
			
			optionCreate();
			selUl.insertAdjacentHTML('beforeend', optHtml);
		}
	}
	
}


// file 설정 ------------------------------------------------------------------------

// 적용을 위한 실행 함수
function nFile(selector) {
	var nFileEle = document.querySelectorAll(selector);

	if(nFileEle.length > 1) {
		Array.prototype.forEach.call(nFileEle, function(el, index, array){
			nFileSet(el);
		});
	} 
	else if (nFileEle.length == 1) nFileSet(nFileEle[0]);
	else null;
}

// 실제 file 관련 기능 함수
function nFileSet(Ele){
	var fileWrap	= Ele,
		fileInp		= fileWrap.querySelector('input[type=file]'),
		placeholder = fileInp.getAttribute('placeholder') == null ? '' : fileInp.getAttribute('placeholder'),
		btnClear	= fileWrap.querySelector('.btn-clear'),
		urlInp		= null,
		inpHtml		= '';	

	if(fileInp.disabled == true) {
		funcAddClass(fileWrap, 'disabled');
		inpHtml += '<input type="text" class="inp-file-url" title="파일 경로" placeholder="'+placeholder+'" readonly disabled>';
	} else inpHtml += '<input type="text" class="inp-file-url" title="파일 경로" placeholder="'+placeholder+'" readonly>';

	fileWrap.insertAdjacentHTML('beforeend', inpHtml);
	urlInp = fileWrap.querySelector('.inp-file-url');

	var valueSet = function(){
		urlInp.value = fileInp.value;
		btnClear.style.display = 'block';
	}, valueClear = function(){
		fileInp.value = '';
		urlInp.value = '';
		btnClear.style.display = 'none';
	}
	if(fileInp.value.length > 0) valueSet();
	fileInp.addEventListener('change', valueSet);

	if(btnClear != null) {
		btnClear.addEventListener('click',valueClear);
	}
}

/* 적용 예시
	nFile('클래스명');
 */

// file 설정 ------------------------------------------------------------------------

// 텍스트 입력형 input - 내용 삭제버튼 기능
function nText(selector){
	var nTextEle = document.querySelectorAll(selector);
	if(nTextEle.length > 1) {
		Array.prototype.forEach.call(nTextEle, function(el, index, array){
			nTextSet(el);
		});
	} 
	else if (nTextEle.length == 1) nTextSet(nTextEle[0]);
	else null;
}

function nTextSet(Ele){
	var textWrap	= Ele,
		inp 		= textWrap.querySelector('input'),
		btnClear	= textWrap.querySelector('.btn-clear');
	
	inp.addEventListener('focus', btnControl);
	inp.addEventListener('input', btnControl);
	inp.addEventListener('propertychange', btnControl);

	function btnControl(e){
		if(e.target.value.length > 0) btnClear.style.display = 'block';
		else btnClear.style.display = 'none';
	};

	btnClear.addEventListener('click', function(e){
		inp.value = '';
		e.target.style.display = 'none';
	});
}


// 실행문 예시 ---------------------------------------------------
window.onload = function(){

	nSelect('.inp-select');
	//nSelArr.selectUpdate();

	nFile('.inp-file');

	nText('.inp-label');
};