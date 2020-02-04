/*-- input design --*/
/*-- 서남호 --*/
/*-- 2018-01-11 - checkbox/radio/select/file 통합본 수정 --*/
/*-- 2018-01-17 - disabled 추가 --*/
/*-- 2019-09-05 - v1.1 변수 추가 및 사용방법 변경 // select 부모영역 설정 추가 (상황에 따라 리스트 위로 뜨도록) --*/
/*-- 2019-12-11 - v1.2 select - option 속성 관련 추가 --*/

//checkbox 설정 -- IE 구버전용 - jquery 필수
function chkSet(e){
	var $wrap = e;
	$wrap.find('.inp-check.old input[type=checkbox]').each(function(){
		if($(this).is(':checked')) $(this).next('label').addClass('on');
		if($(this).is(":disabled")) $(this).next('label').addClass('disabled');
	});
	$wrap.find('.inp-check.old input[type=checkbox]').click(function(){
		if($(this).is(":checked")) $(this).next('label').addClass('on');
		else $(this).next('label').removeClass('on');
	});
}

//radio 설정 -- IE 구버전용 - jquery 필수
function radSet(e){
	var $wrap = e;
	$wrap.find('.inp-radio.old input[type=radio]').each(function(){
		if($(this).is(':checked')) $(this).next('label').addClass('on');
		if($(this).is(':disabled')) $(this).next('label').addClass('disabled');
	});
	$wrap.find('.inp-radio.old input[type=radio]').click(function(){
		var inpName = $(this).attr('name');
		$wrap.find('.inp-radio.old input[type=radio]').each(function(){
			if($(this).attr('name') == inpName){
				if($(this).is(":checked")) $(this).next('label').addClass('on');
				else $(this).next('label').removeClass('on');
			} else null;
		});		
	});
}


// select 설정
function selectSet(obj, par){
	var $wrap = obj,
	$sel = $wrap.children('select'),
	selTitle = '',
	$option = $sel.children('option'),
	opTotal = $option.length,
	firstOp = null;

	if($sel.children('option:selected').length > 0) firstOp = $sel.children('option:selected').text();
	else firstOp = $option.first().text();

	if($sel.attr('title')) selTitle = $sel.attr('title');	
	
	if($sel.is(':disabled')){
		$sel.parent().append('<button type="button" class="btn-select" title="'+selTitle+'" disabled><span>'+firstOp+'</span></button>');
	} else {
		$sel.parent().prepend('<div class="select-list"><ul></ul></div>');
		$sel.parent().prepend('<button type="button" class="btn-select" title="'+selTitle+'"><span>'+firstOp+'</span></button>');
	}		

	for( i=0; i<opTotal; i++){
		if($option.eq(i).attr('hidden')) $sel.siblings('.select-list').find('ul').append('<li class="hidden"></li>');
		else if ($option.eq(i).attr('disabled')) $sel.siblings('.select-list').find('ul').append('<li><button type="button" class="btn-sel" disabled>'+$option.eq(i).text()+'</button></li>');
		else $sel.siblings('.select-list').find('ul').append('<li><button type="button" class="btn-sel">'+$option.eq(i).text()+'</button></li>');
	}

	$wrap.on('mouseleave',function(){
		$(this).children('.select-list').hide();
		$wrap.removeClass('on');
		$wrap.css('z-index','100');
	});
	$wrap.find('.btn-select').click(function(){
		if(par != null){
			$pos = $wrap.parent().position().top;
			if(par.height() < $pos + 180)  $wrap.find('.select-list').css({'top':'auto','bottom':'0px'});
			else $wrap.find('.select-list').css({ 'top':'', 'bottom':'' });
		}
		$wrap.addClass('on');
		$(this).next('.select-list').toggle();
		$wrap.css('z-index','200');
	});

	$wrap.find('.select-list li .btn-sel').click(function(e){
		e.preventDefault();
		var tx = $(this).text(),
			num = $(this).parent().index();
		$wrap.find('.select-list').toggle();
		$wrap.find('.btn-select span').empty().text(tx).parent().focus();		
		$wrap.removeClass('on');
		$wrap.css('z-index','100');
		$wrap.children('select').find('option:eq('+num+')').prop('selected', true);
		$wrap.children('select').change();
	});
}

function fileSet(obj){
	var $wrap = obj,
		$file = $wrap.find('input[type=file]'),
		fileTx = '';

	if($file.is(':disabled')) $wrap.addClass('disabled').prepend('<input type="text" class="inp-file-url" title="파일 경로" readonly disabled>');
	else $wrap.prepend('<input type="text" class="inp-file-url" title="파일 경로" readonly>');

	var $inp = $wrap.find('.inp-file-url');

	if($file.attr('value')) {
		fileTx = $file.attr('value');
		$inp.val(fileTx);
	}
	$file.change(function(){
		var tx = $(this).val();
		$inp.val(tx);
	});
}

// 텍스트 입력형 input - 내용 삭제버튼 기능
function textEmpty(obj){
	var $wrap = obj,
	$inp = $wrap.find('input'),
	$del = $wrap.find('.btn-input-empty');

	$inp.on('focus input propertychange',function(){
		if($(this).val().length > 0) $del.show();
		else $del.hide();					
	});

	$del.click(function(){
		$inp.val('');
		$(this).hide();
	});
}

$(document).ready(function(){
	radSet($('body'));
	chkSet($('body'));

	$('.inp-select').each(function(){
		selectSet($(this));
	});

	$('.inp-file').each(function(){
		fileSet($(this));
	});

	$('.inp-label').each(function(){
		textEmpty($(this));
	});
});

/*

라디오버튼
radSet(라디오 포함하는 영역);

체크박스
chkSet(체크박스 포함하는 영역);

select
selectSet(셀렉트, 부모창);
** 부모창 설정할 경우, select 리스트 표출 시 하단 영역이 모자라면 위로 뜸

파일
fileSet(파일적용할 obj);


*/