// calendar
// 서남호(namo) - for m.s.p
// 2018-08-08 - ver1.0 - 기본 단독형
// 2019-04-22 - ver1.1 - 일/주/월 동시 사용 관련 버그 수정
// 2019-07-11 - ver1.2 - 수정(td 에 날짜 입력)
// 2019-07-30 - ver1.3 - 수정(오늘 날짜 기준 제한 추가 / each 형식 추가 / 상단 선택영역 수정(false 경우))
// 2019-09-05 - ver1.3 - show 방식 변경 - 마우스/키보드 분리
// 2019-10-23 - 부모요소의 poisiton 체크 -- fixed 있을 경우 달력도 fixed 로 설정 // 닫을 때 position, top, left 값 초기화

$.fn.nCalendar = function(option){

	this.each(function(){
		var set = $.extend({
			inp : this,
			showType : 'button',	// both / button / input
			changeMon : true,
			changeYear : true,
			yearRange : '2019:2040',
			showBtnPanel : true,
			closeBtnTx : '닫기',
			todayBtnTx : '오늘',
			controls : true,
			nextTx : '>',
			prevTx : '<',
			todayLimit : false, // 오늘 기준 선택 제한
			limitType : null // null : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
		}, option);
			
		//초기 세팅	
		var now = new Date(),
			thisYear = now.getFullYear(), // 오늘 날짜 포함된 연도 - today 설정용
			thisMonth = now.getMonth(), // 오늘 날짜 포함된 월
			today = now.getDate(), // 오늘 날짜
			activeYear, activeMonth, activeDay, // 선택된 날짜용 변수
			year, month, day; // 달력 생성용 변수
			//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
		

		//연도 range 관련
		var minYear, maxYear;

		if(set.yearRange != null){
			minYear = Number(set.yearRange.split(':')[0]),
			maxYear = Number(set.yearRange.split(':')[1]);
			if(set.todayLimit == true) {
				if(set.limitType == 'after') maxYear = thisYear;
				else minYear = thisYear;
			}
		}

		var startDay,yoil;

		var chkYoil = function(){ //월 시작일의 요일 확인
			startDay = new Date(year, month, 1);
			yoil = startDay.getDay();		
			//alert(yoil); // 일:0, 월:1 ~ 토:6
		}, resetYoil = function(){ // 연/월/일 변수 - 오늘 날짜로 초기화
			now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth(),
			day = now.getDate();
		}, setYoil = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
			var dateTx = tg.val();
			year = Number(dateTx.split('-')[0]),
			month = Number(dateTx.split('-')[1]) -1,
			day = Number(dateTx.split('-')[2]);
			// 선택된 날짜용 변수 설정
			activeYear = year;
			activeMonth = month;
			activeDay = day;
		}
		
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
		// 요일 표기
		var weekTx = new Array("일", "월", "화", "수", "목", "금", "토");
		//2월은 윤년 체크
		if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ){
			nalsu[1] = 29;
		}

		var $inp = set.inp, // 초기 모든 input 에 버튼 추가를 위한 변수
			$inpFunc = $($inp), // 초기 input - jquery 용 객체로.
			$wrap, // 달력 전체 wrap
			$cal, // 달력 테이블 영역
			$btn, // 달력 띄우는 버튼
			$control, // 연/월 제어 상단 영역
			$prevM, // 이전달 버튼
			$nextM, // 다음달 버튼
			$monthObj, // 월 선택 select
			$yearObj, // 연 선택 select
			$btnArea, // 오늘/닫기 버튼 영역
			$closeBtn, // 닫기 버튼
			$todayBtn, // 오늘 버튼
			$tgInp, // 날짜 선택 시 값이 입력될 input 
			$showClass = 'cal-show-now'; // show 방식에 따른 변수 - ie 에서 focus/both 일 경우 선택된 다음 자동으로 기존 input에 focus 될때 달력이 다시 생성됨.

	// 생성 ============================================================================================================================
		//body 에 달력 div 생성
		$('body').append('<div class="cal-wrap"><div class="cal-area"></div></div>');
		$wrap = $('.cal-wrap').last(),
		$cal = $wrap.find('.cal-area');

		$wrap.prepend('<div class="cal-top"></div>');
		$control = $wrap.find('.cal-top');	

		// 상단 - 연도 타이틀 생성
		if(set.changeYear == true){
			var cntstr = "";
			cntstr += '<select title="연도 선택" class="sel-year">';
			for(var i = minYear; i < maxYear + 1; i++){
				cntstr += '<option value="'+i+'">'+i+'년</option>';
			}
			cntstr +='</select>';	
			$control.append(cntstr);
			$yearObj = $wrap.find('.sel-year');
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title year"><i></i>년</span>';
			$control.append(cntstr);
			$yearObj = $wrap.find('.cal-title.year');
		}

		// 상단 - 월 타이틀 생성
		if(set.changeMon == true){
			var cntstr = "";
			cntstr += '<select title="월 선택" class="sel-month">'
			for( var m = 1; m< 13; m++){
				cntstr += '<option value="'+m+'">'+m+'월</option>';
			}
			cntstr +='</select>';
			$control.append(cntstr);
			$monthObj = $wrap.find('.sel-month')
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title month"><i></i>월</span>';
			$control.append(cntstr);
			$monthObj = $wrap.find('.cal-title.month')
		}

		// 이전달 / 다음달 버튼 생성
		$control.prepend('<button type="button" class="cal-btn prev">'+set.prevTx+'</button>');
		$control.append('<button type="button" class="cal-btn next">'+set.nextTx+'</button>');
		$prevM = $wrap.find('.cal-btn.prev'),
		$nextM = $wrap.find('.cal-btn.next');

		if(set.controls == false) {
			$prevM.hide();
			$nextM.hide();
		}

		// 하단 오늘/닫기 버튼 영역
		if(set.showBtnPanel == true) {
			$wrap.append('<div class="cal-btns"></div>');
			$btnArea = $wrap.find('.cal-btns');
			if(set.todayBtnTx != null){
				$btnArea.append('<button type="button" class="btn-cal-today">'+set.todayBtnTx+'</button>');
				$todayBtn = $wrap.find('.btn-cal-today');
			}
			if(set.closeBtnTx != null){
				$btnArea.append('<button type="button" class="btn-cal-close">'+set.closeBtnTx+'</button>');
				$closeBtn = $wrap.find('.btn-cal-close');
			}
		}

	// 기능 설정 ============================================================================================================================
		// 달력 설정
		var calendarOn = function(){ // 설정된 연,월,일로 달력 생성 및 기능 적용 (show X)
			monthSet();
			yearSet();
			chkYoil();
			makeCalendar(yoil, nalsu[month],year,month + 1, day);
		}, calPosition = function (tg){
			// 달력 위치 설정 - input 기준
			var parPos = tg.parents();
			parPos.each(function(){
				$(this).css('position') === "fixed" ? $wrap.css('position','fixed') : null;
			});
		
			var Top = tg.offset().top + tg.outerHeight(),
				Left = tg.offset().left;
			if((Left + $wrap.outerWidth()) > $(window).width()) Left = $(window).width() - $wrap.outerWidth(); // 위치 상 화면 우측 넘어갈 경우 조정
			$wrap.css({
				'top':''+Top+'px',
				'left':''+Left+'px'
			}).focus();
		}, calendarShow = function( tg ){ // 달력 show 함수 + input 값 체크로 연,월,일 설정함수 호출
			if(tg.val().length > 0) setYoil(tg); // input 에 설정된 날짜가 있을 경우 해당 날짜 연/월/일 세팅
			else resetYoil(); // input 이 비어있을 경우 오늘 날짜 연/월/일 세팅
			calendarOn(); 
			$wrap.addClass('on').attr('tabindex','0');
		}

		// show type 설정 : 버튼 / input focus / both
		if(set.showType == 'button'){
			$inpFunc.after('<button type="button" class="btn-cal">달력보기</button>');
			$btn = $inpFunc.next('.btn-cal');
			if($inpFunc.is(':disabled')) $btn.attr('disabled',true).prop('disabled',true);			
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
			if($inpFunc.is(':disabled')) $btn.attr('disabled',true).prop('disabled',true);
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

		//	상단 연/월 설정 영역  
		var monthChange = function(){ // month select 기능 함수
			$monthObj.on('change',function(){
				month = Number($(this).val()) - 1;
				calendarOn();
			});
		}, monthSet = function(){  // month select 현재 월 설정 함수
			if(set.changeMon == true) {
				var opt = $monthObj.children('option');
				opt.each(function(){
					$(this).prop('selected',false); 
					if($(this).val() == month +1) $(this).prop('selected',true);
				});
			} else {
				$monthObj.children('i').empty().text(month + 1);
			}
		}
		
		var yearChange = function(){ // year select 기능 함수
			$yearObj.on('change',function(){
				year = $(this).val();
				calendarOn();
			});
		}, yearSet = function(){ // year select 현재연도 설정 함수
			if(set.changeYear == true) {
				var opt = $yearObj.children('option');
				opt.each(function(){
					$(this).prop('selected',false); 
					if($(this).val() == year) $(this).prop('selected',true);
				});
			} else {
				$yearObj.children('i').empty().text(year);
			}
		}

		// 달력 상단 연,월 제어 버튼 영역 기능 실행
		if(set.changeMon == true) monthChange();
		if(set.changeYear == true) yearChange();

		$prevM.click(function(){
			if(month > 0) month--;
			else {
				if( year > minYear ) year--;
				month = 11;
			}
			calendarOn();
		});
		$nextM.click(function(){
			if(month < 11) month++;
			else { 
				if( year < maxYear ) year++;
				month = 0;
			}
			calendarOn();
		});
		
		// 하단 버튼 영역 기능 설정 
		if(set.showBtnPanel == true){		
			$todayBtn.click(function(){
				resetYoil();
				calendarOn();
			});

			$closeBtn.click(function(){
				calhide();
			});
		}
		
	// 달력 추가 기능 ============================================================================================================================
		// 날짜 클릭 시 output 설정
		function inpWrite(){ 
			var $btnDay = $cal.find('button');
			$btnDay.each(function(){
				$(this).click(function(){
					var $month = Number(month+1),
						$day = Number($(this).text());
					if($month < 10) $month = '0'+$month;
					if($day < 10) $day = '0'+$day;

					$inpFunc.val(''+year+'-'+$month+'-'+$day+'');
					//input 에 change 이벤트 트리거
					var changeEvt = document.createEvent('Event');
					changeEvt.initEvent('change', true, false);
					$inp.dispatchEvent(changeEvt);

					calhide();
				});
			});
		}

		// 오늘 및 선택된 날짜 클래스 추가
		function setToActiveDay(){
			var $btnDay = $cal.find('button');
			// today 설정
			if(year == thisYear && month == thisMonth){
				$btnDay.each(function(){
					if($(this).text() == today) $(this).addClass('today');
				});
			}
			if($inpFunc.val().length > 0){
				if(year == activeYear && month == activeMonth){
					$btnDay.each(function(){
						if($(this).text() == activeDay) $(this).addClass('select-day');
					});
				}
			}
		}
		
		// 달력 닫기
		function calhide(){
			$wrap.removeClass('on'); 
			$wrap.css({
				'position':'',
				'top':'',
				'left':''
			});
			$cal.empty();
			$inpFunc.focus();
			$inpFunc.on('blur',function(){ 
				$(this).removeClass($showClass);
				$(this).unbind('blur'); 
			});
		}

		function calAllhide(e){ // 한 화면내 여러개 사용 시 - 달력 열린 상태에서 다른 달력 클릭할 경우 리셋.
			$wrap.siblings('.cal-wrap').removeClass('on').find('.cal-area').empty();
			$('.'+$showClass+'').not(e).each(function(){ $(this).removeClass($showClass); });
		}
			
		function makeCalendar(yoil, nalsu, year, month, day) {
			var str= "";
			str = "<table border ='0'>";
			str += "<caption>" + year + "년" + month + "월 달력</caption><thead>";
			str += "<tr>";
			for(var i = 0; i < weekTx.length; i++){
				str += "<th scope='col'>" + weekTx[i] + "</th>";
			}
			str += "</tr>";
			str += "</thead><tbody>";
			
			
			// 날 수 채우기
			var no = 1;
			var currentCell = 0;
			var ju = Math.ceil((nalsu + yoil) / 7);
			for(var r=0; r < ju; r++){
				str += "<tr style='text-align:center'>";
				for(var col=0; col < 7; col++){
					if(currentCell < yoil || no > nalsu){
						str += "<td>&nbsp;</td>";
						currentCell++;
					}else{
						if( set.todayLimit == true ) {
							if( set.limitType == 'after' ){
								if( year > thisYear || year == thisYear && month > thisMonth + 1 || year == thisYear && month == thisMonth +1 && no > today) str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button' disabled>" + no + "</button></td>";
								else str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button'>" + no + "</button></td>";
							} else {
								if( year < thisYear || year == thisYear && month < thisMonth + 1 || year == thisYear && month == thisMonth +1 && no < today ) str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button' disabled>" + no + "</button></td>";
								else str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button'>" + no + "</button></td>";
							}
						}  else {
							str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button'>" + no + "</button></td>";			
						}
						no++;
					}
					
				}
				//str += "<td>&nbsp;</td>";
				
				str += "</tr>";
			}
			
			str += "</tbody></table>";
			$cal.html(str);
			setToActiveDay();
			inpWrite();
		}
	});
	return this;
}