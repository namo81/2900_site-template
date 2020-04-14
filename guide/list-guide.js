$(function(){
	var $tbl = $('.list table'),
		$tblTotal,
		tr = $tbl.find('tbody tr');
	
	//페이지 자동 넘버링
	$tbl.find('.no').each(function(){
		var $num = $(this).parent().index();
		$(this).text($num + 1);
		$tblTotal = $num;
	});

	//depth1 에 텍스트 있을 경우 구분선 생성
	$tbl.find('.depth1').each(function(){
		if($(this).text().length > 0){
			$(this).parent('tr').addClass('div');
			if(tr.length > 30) $(this).append('<button type="button" class="btn-tr-tgl" title="ctrl 누른 채 클릭 시 전체 제어">Toggle</button>');
		} else {
			$(this).css('border-top','none');
		}
	});

	// 토글기능
	var $tgl = $('.btn-tr-tgl');
	
	var ctrl = false;

	$(document).on('keydown',function(e){
		if(e.ctrlKey) ctrl = true;
		else ctrl = false;
	});
	$(document).on('keyup', function(e){
		ctrl = false;
	});

	if(tr.length > 30) {
		$tgl.click(function(){
			var parTr = $(this).closest('tr').index();
			if(ctrl) {
				if($(this).hasClass('open')) {
					tr.each(function(){ if(!$(this).hasClass('div')) $(this).removeClass('hide');});
					$tgl.removeClass('open');
				} else {
					tr.each(function(){ if(!$(this).hasClass('div')) $(this).addClass('hide');});
					$tgl.addClass('open');
				}
			} else {
				tr.each(function(){
					if($(this).index() > parTr) {
						if(!$(this).hasClass('div')){
							$(this).toggleClass('hide');
						} else return false;
					}
				});
				$(this).toggleClass('open');
			}
		});
	}

	//링크에 url 있을 경우 진행중 표기
	$tbl.find('.link > a').each(function(){
		if($(this).attr('href').length > 0){
			$(this).parent().siblings('.state').addClass('ing');
		} else {
			$(this).addClass('ready');
			$(this).click(function(e){
				e.preventDefault();
			});
		}
	});

	//완료일자 입력 시 완료표기
	$tbl.find('.end-date').each(function(){
		if($(this).text().length > 0){
			if($(this).siblings('.state').hasClass('ing')){
				$(this).siblings('.state').removeClass('ing').addClass('end');
			}
		}
	});

	// 미리보기 기능
	$tbl.find('.link > a').on('mouseover',function(){
		if($('#view-chk').is(":checked")){
			var $url = $(this).attr('href');
			$('.iframe iframe').attr('src',''+$url+'');
			$('.iframe').show();
		}
	});
	$('.btn-frame-close').click(function(){
		$('.iframe iframe').attr('src','');
		$('.iframe').hide();
		$('#view-chk').attr('checked',false);
	});

	// 진행율 표시
	var $endTotal = $tbl.find('.end').size(),
		$per = ($endTotal / ($tblTotal + 1)) * 100;
	$('.ing-per .total-page').text($tblTotal + 1);
	$('.ing-per .end-page').text($endTotal);
	$('.ing-per .per').text(Math.round($per));


	// class 검색

	// temp 라는 div 에 값을 넣는 방식 - 기본적으로 head/body 태그는 중복되면 안되므로 jquery 가 삭제함. 때문에 특정 영역 검색 시 특정 영역의 id 값이 필요.
	// id 없으면 스크립트를 다 불러오므로 오류 발생. 
	/*
	$('.btn-find-tx').click(function(){
		var $tx = $('#find-tx').val(),
			$area = $('#find-tx-id').val();
		
		if($area.length == 0) $area = 'body';
		else null;

		$('.tbl-wrap tr').each(function(){
			var $link = $(this).find('a').attr('href'),
				$btn = $(this).find('a');

				$btn.removeClass('classUse');
			$('.temp').load(''+$link+' #'+$area+'', function(){
				if($('.temp').find('.'+$tx+'').length > 0) $btn.addClass('classUse');
				else null;
				$('.temp').empty();
			});
			
		});
	});
	*/

	// hidden input 에 val 형식으로 값을 넣고 문자열 검색하는 방식.
	$('.btn-find-tx').click(function(){
		var $tx = $('#find-tx').val();

		$('.tbl-wrap tr').each(function(){
			var $link = $(this).find('a').attr('href'),
				$btn = $(this).find('a');

				$btn.removeClass('classUse');
			
			$.ajax({
				url : ''+$link+'',
				success : function(data){
					$('.temp').val(data);
					$cnt = $('.temp').val();
					/*if($cnt.match('class="'+$tx+'"')) $btn.addClass('classUse'); -- class 를 같이 검색할 경우 다중 클래스에서 검색이 안됨 */
					if($cnt.match(''+$tx+'')) $btn.addClass('classUse'); 
					else null;
					$('.temp').val('');
				}
			});			
		});
	});

});