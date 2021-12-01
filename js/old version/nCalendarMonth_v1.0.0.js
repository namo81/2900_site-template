// calendar
// 서남호(namo) - for m.s.p
// 2019-01-17 - ver1.0 - 월간 달력 추가
// 2019-04-22 - ver1.1 - 일/주/월 동시 사용 관련 버그 수정
// 2019-09-04 - focus / blur 관련 수정
// 2019-09-05 - show 방식 변경 - 마우스/키보드 분리


$.fn.nCalendarMonth = function(option){

	this.each(function(){
		var set = $.extend({
			inp : this,
			showType : 'button',	
			changeYear : true,
			yearRange : '1990:2040',
			closeBtnTx : '닫기',
			todayBtnTx : '오늘',
			nextTx : '>',
			prevTx : '<'
		}, option);
			
		//초기 세팅	
		var now = new Date(),
		thisYear = now.getFullYear(), // 오늘 날짜 포함된 연도 - today 설정용
		thisMonth = now.getMonth(), // 오늘 날짜 포함된 월
		selYear, selMonth, // 선택된 날짜용 변수
		year, month; // 달력 생성용 변수
		//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
		

		//연도 range 관련
		var minYear, maxYear;

		if(set.yearRange != null){
			minYear = Number(set.yearRange.split(':')[0]),
			maxYear = Number(set.yearRange.split(':')[1]);
			//console.log(minYear, maxYear);
		}

		var resetMon = function(){ // 연/월 변수 - 오늘 날짜로 초기화
			now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth();
		}, setMon = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월 설정
			var dateTx = tg.val();
			year = Number(dateTx.split('-')[0]),
			month = Number(dateTx.split('-')[1]) -1,
			selYear = year,
			selMonth = month;
		}
		
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
		
		//2월은 윤년 체크
		if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ){
			nalsu[1] = 29;
		}

		var $inp = set.inp, // 초기 모든 inp 에 버튼 추가를 위한 변수
			$inpFunc = $($inp),
			$wrap, // 달력 전체 wrap
			$cal, // 달력 테이블 영역
			$btn, // 달력 띄우는 버튼
			$control, // 연/월 제어 상단 영역
			$prevM, // 이전달 버튼
			$nextM, // 다음달 버튼
			$yearSelect, // 연 선택 select
			$tgInp, // 날짜 선택 시 값이 입력될 input 
			$showClass = 'cal-show-now'; // show 방식에 따른 변수 - ie 에서 focus/both 일 경우 선택된 다음 자동으로 기존 input에 focus 될때 달력이 다시 생성됨.

		//body 에 달력 div 생성

		$('body').append('<div class="cal-wrap month"><div class="cal-area"></div></div>');
		$wrap = $('.cal-wrap.month').last(),
		$cal = $wrap.children('.cal-area');

		if(set.changeYear == true){
			$wrap.prepend('<div class="cal-top"></div>');
			$control = $wrap.find('.cal-top');	

			var cntstr ="";
			cntstr += '<button type="button" class="cal-btn prev">'+set.prevTx+'</button>';

			cntstr += '<select title="연도 선택" class="sel-year">';
			for(var i = minYear; i < maxYear + 1; i++){
				cntstr += '<option value="'+i+'">'+i+'년</option>';
			}
			cntstr +='</select>';	

			cntstr += '<button type="button" class="cal-btn next">'+set.nextTx+'</button>';

			$control.append(cntstr);

			$prevM = $wrap.find('.cal-btn.prev'),
			$nextM = $wrap.find('.cal-btn.next'),
			$yearSelect = $wrap.find('.sel-year');
		}

		
		// 달력 설정
		var calendarOn = function(){ // 설정된 연,월,일로 달력 생성 및 기능 적용 (show X)
			if(set.changeYear == true) yearSet();
			makeCalendar(year,month + 1);
			$cal.html(str);	
			setNowMonth();
			inpWrite();
		}, calPosition = function (tg){
			// 달력 위치 설정 - input 기준
			var Top = tg.offset().top + tg.outerHeight(),
				Left = tg.offset().left;
			if((Left + $wrap.outerWidth()) > $(window).width()) Left = $(window).width() - $wrap.outerWidth(); // 위치 상 화면 우측 넘어갈 경우 조정
			$wrap.css({
				'top':''+Top+'px',
				'left':''+Left+'px'
			}).focus();
		}, calendarShow = function( tg ){ // 달력 show 함수 + input 값 체크로 연,월,일 설정함수 호출
			if(tg.val().length > 0) setMon(tg); // input 에 설정된 날짜가 있을 경우 해당 날짜 연/월 세팅
			else resetMon(); // input 이 비어있을 경우 오늘 날짜 연/월 세팅
			calendarOn(); 
			calBgSet();
			$wrap.addClass('on').attr('tabindex','0');
		}

		// show type 설정 : 버튼 / input focus / both
		if(set.showType == 'button'){
			$inpFunc.after('<button type="button" class="btn-cal">달력보기</button>');
			$btn = $inpFunc.next('.btn-cal');
			$btn.click(function(){ calShow($inpFunc); });
		} else if(set.showType == 'input'){
			$inpFunc.click(function(){ calShow($inpFunc); });
			$inpFunc.on('keydown',function(e){
				var $key = e.keyCode || e.which;
				if($key == 9) calShow($inpFunc);
			});
		} else if(set.showType == 'both'){
			$inpFunc.after('<button type="button" class="btn-cal">달력보기</button>');
			$btn = $inpFunc.next('.btn-cal');
			$inpFunc.click(function(){ calShow($inpFunc); });
			$inpFunc.on('keydown',function(e){
				var $key = e.keyCode || e.which;
				if($key == 9) calShow($inpFunc);
			});
			$btn.click(function(){ calShow($inpFunc); });
		} 

		function calShow(e){
			calAllhide(e);
			if(!e.hasClass($showClass)) calendarShow(e);
			e.addClass($showClass);
			calPosition(e);
		}

		//	상단 연/월 설정 영역  ==========================================================================
		// 달력 상단 연,월 제어 버튼 영역 생성
		if(set.changeYear == true){
			yearChange();
			$prevM.click(function(){
				if(year > minYear) year--;
				else year = maxYear;
				calendarOn();
			});
			$nextM.click(function(){
				if(year < maxYear) year++;
				else year = minYear;
				calendarOn();
			});
		} else {
			null;
		}

		// year select 기능 함수
		function yearChange(){
			$yearSelect.on('change',function(){
				year = $(this).val();
				calendarOn();
			});
		}
		// year select 현재연도 설정 함수
		function yearSet(){ 
			var opt = $yearSelect.children('option');
			opt.each(function(){
				$(this).prop('selected',false); 
				if($(this).val() == year) $(this).prop('selected',true);
			});
		}
			
		// input 값 입력 함수
		function inpWrite(){ 
			var $btnMon = $cal.find('button');
			$btnMon.each(function(){
				$(this).click(function(){
					var $month = Number($(this).children('span').text());
					if($month < 10) $month = '0'+$month;

					$inpFunc.val(''+year+'-'+$month+'');
					
					//input 에 change 이벤트 트리거
					var changeEvt = document.createEvent('Event');
					changeEvt.initEvent('change', true, false);
					$inp.dispatchEvent(changeEvt);
					
					calhide();
				});
			});
		}

		// 달력 닫기
		function calhide(){
			$wrap.removeClass('on'); 
			$cal.empty();
			$inpFunc.focus();
			$('.cal-bg').remove();
			$inpFunc.on('blur',function(){ 
				$(this).removeClass($showClass);
				$(this).unbind('blur'); 
			});
		}

		function calBgSet(){			
			$('body').append('<div class="cal-bg"></div>');
			$bgBtn = $('.cal-bg');
			$bgBtn.unbind().click(function(){ calhide() });
		}

		// 이번달 및 선택된 월 클래스 추가
		function setNowMonth(){
			var $btnMon = $cal.find('button');

			if(year == thisYear){
				$btnMon.each(function(){
					if(Number($(this).children('span').text()) - 1 == thisMonth) $(this).addClass('thisMonth');
				});
			}
			if(year == selYear){
				$btnMon.each(function(){
					if(Number($(this).children('span').text()) - 1 == selMonth) $(this).addClass('select-mon');
				});
			}
		}

		function calAllhide(e){ // 한 화면내 여러개 사용 시 - 달력 열린 상태에서 다른 달력 클릭할 경우 리셋.
			$wrap.siblings('.cal-wrap').removeClass('on').find('.cal-area').empty();
			$('.'+$showClass+'').not(e).each(function(){ $(this).removeClass($showClass); });
		}
			
		var str= "";
		function makeCalendar(year, month) {
			str = "<ul class='cal-month-list'>";		
					
			//alert("이번달은 " + ju + " 주 동안 계속됩니다");
			for(var r=1; r < 13; r++){
				str += "<li><td><button type='button'><span>" + r + "</span>월</button></td></li>";
			}
			
			str += "</ul>";
		}
	});
	return this;
}