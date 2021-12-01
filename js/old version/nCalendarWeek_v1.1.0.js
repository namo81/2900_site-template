// calendar - 주간
// 서남호(namo) - for m.s.p
// 2019-01-16 - ver1.0 - 주간 달력 추가
// 2019-07-31 - ver1.1 - each 형식 추가 / 상단 연,월 제어 영역 수정
// 2019-09-05 - show 방식 변경 - 마우스/키보드 분리


$.fn.nCalendarWeek = function(option){

	this.each(function(){
		var set = $.extend({
			inp : this,
			showType : 'button',	
			changeMon : true,
			changeYear : true,
			yearRange : '1990:2040',
			showBtnPanel : true,
			closeBtnTx : '닫기',
			todayBtnTx : '오늘',
			controls : true,
			nextTx : '>',
			prevTx : '<',
			showWeekNum : false,
			inpWeekNum : false
		}, option);
			
		//초기 세팅	
		var now = new Date(),
		thisYear = now.getFullYear(), // 오늘 날짜 포함된 연도 - today 설정용
		thisMonth = now.getMonth(), // 오늘 날짜 포함된 월
		today = now.getDate(), // 오늘 날짜
		activeYear, activeMonth, activeDay, // 선택된 날짜용 변수
		year, month, week, day, // 달력 생성용 변수
		yearFirstThur;
		//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
		

		//연도 range 관련
		var minYear, maxYear;

		if(set.yearRange != null){
			minYear = Number(set.yearRange.split(':')[0]),
			maxYear = Number(set.yearRange.split(':')[1]);
			//console.log(minYear, maxYear);
		}

		var sDate,firstDay,yoil;

		var chkYoil = function(){ //월 시작일의 요일 확인
			sDate = new Date(year, month, 1);
			yoil = sDate.getDay();
			//alert(yoil); // 일:0, 월:1 ~ 토:6
		}, resetYoil = function(){ // 연/월/일 변수 - 오늘 날짜로 초기화
			now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth(),
			day = now.getDate();
		}, setYoil = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
			var dateTx = tg.val();
			if(set.inpWeekNum){
				year = Number(dateTx.split('년')[0]),
				yearFirstThur = new Date(year, 0, 1);
				if(yearFirstThur.getDay() !== 4) {
					yearFirstThur.setMonth(0, 1 + ((4 - yearFirstThur.getDay()) + 7) % 7);
					week = new Date(yearFirstThur.valueOf() + (Number(dateTx.split('년')[1].substr(1,2))) * 604800000);
				}
				week = new Date(yearFirstThur.valueOf() + (Number(dateTx.split('년')[1].substr(1,2))-1) * 604800000);
				month = week.getMonth(),
				day = week.getDate();
			} else {
				year = Number(dateTx.split('-')[0]),
				month = Number(dateTx.split('-')[1])-1,
				day = Number(dateTx.split('-')[2].substr(0,2)); // 선택된 주 첫째날 일자 추출
				// 선택된 날짜용 변수 설정
			}
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
		
		var $inp = set.inp, // 초기 모든 inp 에 버튼 추가를 위한 변수
			$inpFunc = $($inp),
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
			$showClass = 'now'; // show 방식에 따른 변수 - ie 에서 focus/both 일 경우 선택된 다음 자동으로 기존 input에 focus 될때 달력이 다시 생성됨.

		//body 에 달력 div 생성
		$('body').append('<div class="cal-wrap week"><div class="cal-area"></div></div>');
		$wrap = $('.cal-wrap.week').last(),
		$cal = $wrap.children('.cal-area');

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

		// 달력 설정
		var calendarOn = function(){ // 설정된 연,월,일로 달력 생성 및 기능 적용 (show X)
			monthSet();
			yearSet();
			chkYoil();
			makeCalendar(yoil, nalsu[month],year,month + 1, day);
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

		// 달력 상단 연,월 제어 버튼 영역 생성
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
		
		// 하단 버튼 영역 설정 
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
					var $activeDate = new Date($(this).parent().attr('data-date').split('-')[0], Number($(this).parent().attr('data-date').split('-')[1] - 1), $(this).parent().attr('data-date').split('-')[2]),
						$activeyoil = $activeDate.getDay();
						$startDate = new Date($activeDate.getFullYear(), $activeDate.getMonth(), $activeDate.getDate() - $activeyoil),
						$endDate = new Date($startDate.getFullYear(), $startDate.getMonth(), $startDate.getDate() + 6 ); // 2주일 경우 13, 3주일 경우 20, 4주일 경우 27

					var $startYear = $startDate.getFullYear(),
						$startMonth = $startDate.getMonth() + 1,
						$startDay = $startDate.getDate(),
						$endYear = $endDate.getFullYear(),
						$endMonth = $endDate.getMonth() + 1,
						$endDay = $endDate.getDate();

					if(set.showWeekNum){
						var weekNo = $(this).parent().siblings().eq(0).text();
						if(weekNo< 10) weekNo = '0'+weekNo;
					}

					//console.log($startDay);
					if($startMonth< 10) $startMonth = '0'+$startMonth;
					if($startDay < 10) $startDay = '0'+$startDay;
					
					if($endMonth< 10) $endMonth = '0'+$endMonth;
					if($endDay < 10) $endDay = '0'+$endDay;

					if(set.inpWeekNum) $inpFunc.val(''+$startYear+'년 '+weekNo+'주');
					else $inpFunc.val(''+$startYear+'-'+$startMonth+'-'+$startDay+' ~ '+$endYear+'-'+$endMonth+'-'+$endDay+'');
					
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
			$inpFunc.on('blur',function(){ 
				$(this).removeClass($showClass);
				$(this).unbind('blur'); 
			});
		}
		
		function calAllhide(e){ // 한 화면내 여러개 사용 시 - 달력 열린 상태에서 다른 달력 클릭할 경우 리셋.
			$wrap.siblings('.cal-wrap').removeClass('on').find('.cal-area').empty();
			$('.'+$showClass+'').not(e).each(function(){ $(this).removeClass($showClass); });
		}

		// 오늘 및 선택된 날짜 클래스 추가
		function setToActiveDay(){
			var $btnDay = $cal.find('button');

			/* 주간 선택 마우스오버 */
			$btnDay.hover(function(){
				$btnDay.each(function(){
					$(this).removeClass('btn-hover');
				});
				$(this).parent().parent().find('button').addClass('btn-hover');
			});
			/* // 주간 선택 마우스오버 */

			// today 설정
			if(year == thisYear && month == thisMonth){
				$btnDay.each(function(){
					if($(this).text() == today) $(this).addClass('today');
				});
			}
			// 선택 날짜 설정
			if($inpFunc.val().length > 0){
				$btnDay.each(function(){
					var $activeMonth = Number($(this).parent().attr('data-date').split('-')[1] - 1),
						$activeYear = $(this).parent().attr('data-date').split('-')[0];
					
					if($activeYear == activeYear && $activeMonth == activeMonth){
						if($(this).text() == activeDay) $(this).parents('tr').find('button').addClass('select-day');
					}
				});
			}
		} 

		/*주차 수 구하기 -- google 검색
		function week_no(vy,vm,vd) { 
			var targetDay = new Date(vy,vm,vd); 
			var dayn = (targetDay.getDay() + 6) % 7; 
			targetDay.setDate(targetDay.getDate() - dayn + 3);  // 입력된 날짜가 있는 주의 목요일 날짜 산출
			var firstThursday = targetDay.valueOf(); // 선택된 날짜주의 목요일 원시데이터값
			targetDay.setMonth(0, 1); // 선택된 날짜 년도의 1월 1일로 세팅
			//console.log(targetDay);
			if (targetDay.getDay() !== 4) { // 1월 1일이 목요일이 아닌 경우 1월 첫째주의 목요일 날짜 산출
				targetDay.setMonth(0, 1 + ((4 - targetDay.getDay()) + 7) % 7); 
			} 
			return 1 + Math.ceil((firstThursday - targetDay) / 604800000); 
		}*/

		if(set.showWeekNum) {  // 주차 수 표기일 경우 추가
		// 주차 수 구하기 -- 검색내용 참고 자체 작성
			function week_no(vy,vm,vd){
				var targetDay = new Date(vy,vm,vd),
					yearFirstDay = new Date(targetDay.getFullYear(), 0, 1);
				if(yearFirstDay.getDay() !== 4) {
					yearFirstDay.setMonth(0, 1 + ((4 - yearFirstDay.getDay()) + 7) % 7);
				}
				return 1 + Math.ceil((targetDay.valueOf() - yearFirstDay) / 604800000);
			}
		}
		

		// 달력 그리기
		var str= "";
		function makeCalendar(yoil, maxday, year, month) {
			str = "<table border ='0'>";
			//str += "<caption>달력</caption><thead>";
			str += "<caption>" + year + "년" + month + "월 달력</caption><thead>";
			str += "<tr>";
			if(set.showWeekNum) str += "<th class='week-num' scope='col'>주차</th>"; // 주차 수 표기일 경우 추가
			for(var i = 0; i < weekTx.length; i++){
				str += "<th scope='col'>" + weekTx[i] + "</th>";
			}
			str += "</tr>";
			str += "</thead><tbody>";
			
			//console.log(day);
			
			// 날 수 채우기
			var no = 1;
			var nextNo = 1;
			var currentCell = 0;
			var ju = Math.ceil((maxday + yoil) / 7);
			var pDate = new Date(year, month - 2),
				prevMonth = pDate.getMonth(),
				prevYear = pDate.getFullYear();
			var nDate = new Date(year, month),
				nextMonth = nDate.getMonth(),
				nextYear = nDate.getFullYear();

			//alert("이번달은 " + ju + " 주 동안 계속됩니다");
			for(var r=0; r < ju; r++){			
				str += "<tr>";			
				if(set.showWeekNum) str += "<td class='week-num'></td>";  // 주차 수 표기일 경우 추가
				for(var col=0; col < 7; col++){
					if(r == 0 && currentCell < yoil){					
						var prevNo = nalsu[prevMonth] - ((yoil -1)-currentCell);
						str += "<td data-date='"+ prevYear +"-"+ (prevMonth + 1) +"-"+ prevNo +"' class='prevMonth'><button type='button'>" + prevNo + "</button></td>";
						currentCell++;
					} else if( r == (ju -1) && no > maxday){
						str += "<td  data-date='"+ nextYear +"-"+ (nextMonth + 1) +"-"+ nextNo +"' class='nextMonth'><button type='button'>" + nextNo + "</button></td>";
						nextNo++;
					} else {
						str += "<td data-date='"+ year +"-"+ month +"-"+ no +"'><button type='button'>" + no + "</button></td>";
						no++;
					}
				} 
				str += "</tr>";
			}
			
			str += "</tbody></table>";
			$cal.html(str);
			if(set.showWeekNum) {  // 주차 수 표기일 경우 추가
				$cal.find('tbody tr').each(function(){
					var thu =  $(this).children('td').eq(5),
						tg = $(this).children('td').eq(0),
						thuYear = thu.attr('data-date').split('-')[0],
						thuMon = Number(thu.attr('data-date').split('-')[1] - 1),
						thuDay = thu.children('button').text();
					tg.text(week_no(thuYear, thuMon, thuDay));
				});
			}
				
			setToActiveDay();
			inpWrite();
		}
	});
	return this;
}