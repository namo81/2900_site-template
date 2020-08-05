/*-- input design --*/
/*-- 서남호 --*/
/*-- 2018-01-11 - checkbox/radio/select/file 통합본 수정 --*/
/*-- 2018-01-17 - disabled 추가 --*/

//checkbox 설정
function chkSet(e){
	var $wrap = e;
	$wrap.find('.inp-check input[type=checkbox]').each(function(){
		if($(this).is(':checked')) $(this).next('label').addClass('on');
		if($(this).is(":disabled")) $(this).next('label').addClass('disabled');
	});
	$wrap.find('.inp-check input[type=checkbox]').click(function(){
		if($(this).is(":checked")) $(this).next('label').addClass('on');
		else $(this).next('label').removeClass('on');
	});
}


function radSet(e){
	var $wrap = e;
	$wrap.find('.inp-radio input[type=radio]').each(function(){
		if($(this).is(':checked')) $(this).next('label').addClass('on');
		if($(this).is(':disabled')) $(this).next('label').addClass('disabled');
	});
	$wrap.find('.inp-radio input[type=radio]').click(function(){
		var inpName = $(this).attr('name');
		$wrap.find('.inp-radio input[type=radio]').each(function(){
			if($(this).attr('name') == inpName){
				if($(this).is(":checked")) $(this).next('label').addClass('on');
				else $(this).next('label').removeClass('on');
			} else null;
		});		
	});
}


function selectSet(obj){
	var $wrap = obj,
	$sel = $wrap.children('select'),
	selTitle = '',
	opTotal = $sel.children('option').size(),
	firstOp = null;

	if($sel.children('option:selected').length > 0) firstOp = $sel.children('option:selected').text();
	else firstOp = $sel.children('option').first().text();

	if($sel.attr('title')) selTitle = $sel.attr('title');	
	
	if($sel.is(':disabled')){
		$sel.parent().append('<button type="button" class="btn-select" title="'+selTitle+'" disabled><span>'+firstOp+'</span></button>');
	} else {
		$sel.parent().prepend('<ul class="select-list"></ul>');
		$sel.parent().prepend('<button type="button" class="btn-select" title="'+selTitle+'"><span>'+firstOp+'</span></button>');
	}		

	for( i=0; i<opTotal; i++){
		$sel.siblings('.select-list').append('<li><button type="button" class="btn-sel">'+$sel.children('option').eq(i).text()+'</button></li>');
	}

	$wrap.on('mouseleave',function(){
		$(this).children('.select-list').hide();
		$wrap.css('z-index','100');
	});
	$wrap.find('.btn-select').click(function(){
		$(this).next('.select-list').toggle();
		$wrap.css('z-index','200');
	});

	$wrap.find('.select-list li .btn-sel').click(function(e){
		e.preventDefault();
		var tx = $(this).text(),
			num = $(this).parent().index();
		$wrap.find('.select-list').toggle();
		$wrap.find('.btn-select span').empty().text(tx).parent().focus();
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

$(document).ready(function(){
	radSet($('body'));
	chkSet($('body'));

	$('.inp-select').each(function(){
		selectSet($(this));
	});

	$('.inp-file').each(function(){
		fileSet($(this));
	});
});