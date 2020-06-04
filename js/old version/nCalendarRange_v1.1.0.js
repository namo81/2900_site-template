// calendar
// 서남호(namo) - for m.s.p
// 2019-09-05 - ver1.0.0 - 기간형 최초버전
// 2020-03-11 - ver1.1.0 - 달력 2개 / 1개형 선택 기능 추가 // 선택 중 상태표기 수정
// 2020-04-17 - rangeLimit 관련 수정 // input 이 1개 일 경우 추가(inpSingle)
// 2020-06-04 - 오늘 제한 여유일 / 전체 기간 제한 추가

$.fn.nCalendarRange = function(option){

	this.each(function(){
		var set = $.extend({
			wrap : this,
			showType : 'button',
			inpSingle : false,
			dualCal : true,
			yearRange : '2019:2040',
			showBtnPanel : true,
			closeBtnTx : '닫기',
			applyBtnTx : '확인',
			nextTx : '>',
			prevTx : '<',
			rangeLimit : null, // 선택 기간 제한
			todayLimit : false, // 오늘 기준 선택 제한
			limitType : null, // null : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
			todayGap : 0, // 오늘 기준 제한 - 여유일 관련 옵션 추가 (오늘 *일 전부터 제한, *일 후부터 제한 등등 여유일 추가 시)
			rangeGap : 0 // 선택일 제한 - 오늘부터 1년 전, 6개월 이후 등등 선택 가능 기간 설정
		}, option);
			
		//초기 세팅	
		var now = new Date(),
			thisYear = now.getFullYear(), // 오늘 날짜 포함된 연도 - today 설정용
			thisMonth = now.getMonth(), // 오늘 날짜 포함된 월
			today = now.getDate(), // 오늘 날짜
			activeYear, activeMonth, activeDay, // 선택된 시작날짜용 변수
			activeEndYear, activeEndMonth, activeEndDay, // 선택된 종료날짜용 변수
			year, month, day, rightYear, rightMon; // 달력 생성용 변수
			//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
		

		//연도 range 관련
		var minYear, maxYear;

		if(set.yearRange != null){
			minYear = Number(set.yearRange.split(':')[0]),
			maxYear = Number(set.yearRange.split(':')[1]);
		}

		var startMonDay,startYoil,endMonDay,endYoil;

		var chkYoil = function(){ //월 시작일의 요일 확인
			startMonDay = new Date(year, month, 1);
			startYoil = startMonDay.getDay();
			endMonDay = new Date(year, month + 1, 1),
			rightYear = endMonDay.getFullYear(),
			rightMon = endMonDay.getMonth(),
			endYoil = endMonDay.getDay();
			//alert(yoil); // 일:0, 월:1 ~ 토:6
		}, resetYoil = function(){ // 연/월/일 변수 - 오늘 날짜로 초기화
			now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth(),
			day = now.getDate();
		}, setYoil = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
			var dateStartTx, dateEndTx, yearEnd, monthEnd, dayEnd;					
			if(set.inpSingle == true){
				var fullDate 	= tg.find('input').val(),
					dateStartTx = fullDate.split(' ~ ')[0],
					dateEndTx	= fullDate.split(' ~ ')[1];
			} else {
				var dateStartTx = tg.find('.start').val(),
					dateEndTx 	= tg.find('.end').val();
			}
				year = Number(dateStartTx.split('-')[0]),
				month = Number(dateStartTx.split('-')[1]) -1,
				day = Number(dateStartTx.split('-')[2]),
				yearEnd = Number(dateEndTx.split('-')[0]),
				monthEnd = Number(dateEndTx.split('-')[1]) -1,
				dayEnd = Number(dateEndTx.split('-')[2]);
			// 선택된 날짜용 변수 설정
			activeYear = year,
			activeMonth = month,
			activeDay = day,
			activeEndYear = yearEnd,
			activeEndMonth = monthEnd,
			activeEndDay = dayEnd;
		}
		
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
		// 요일 표기
		var weekTx = new Array("일", "월", "화", "수", "목", "금", "토");
		//2월은 윤년 체크
		if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ){
			nalsu[1] = 29;
		}

		var $wrap = $(set.wrap),
			$inp, // input 가 1개일 경우 input
			$inpStart, // input 가 2개일 경우 시작일 input
			$inpEnd, // input 가 2개일 경우 종료일 input
			$calWrap, // 달력 전체 wrap
			$left, // left
			$right, // right
			$calLeft, // 달력 테이블 영역 - left
			$calRight, // 달력 테이블 영역 - right
			$btn, // 달력 띄우는 버튼
			$ctrlLeft, // left - 상단
			$ctrlRight, // right - 상단
			$prevM, // 이전달 버튼
			$nextM, // 다음달 버튼
			$leftTx, // Left 연/월 표기
			$rightTx, // Right 연/월 표기
			$btnArea, // 오늘/닫기 버튼 영역
			$closeBtn, // 닫기 버튼
			$applyBtn, // 확인 버튼
			setState = false; // 시작일 선택 상태 boolean

		var startDate, endDate; // 입력용 값

		if(set.inpSingle == true) {
			$inp = $wrap.find('input');
		} else {
			$inpStart = $wrap.find('.start'),
			$inpEnd = $wrap.find('.end');
		}

		// 달력 기본 영역 생성 ===========================================
		//body 에 달력 div 생성		
		$('body').append('<div class="cal-wrap range" tabindex="0"><div class="left"><div class="cal-area"></div></div></div>');
		$calWrap = $('.cal-wrap').last(),
		$left = $calWrap.children('.left'),
		$calLeft = $left.children('.cal-area');

		// left 상단 설정
		$left.prepend('<div class="cal-top"></div>');
		$ctrlLeft = $left.find('.cal-top');	

		var cntLeft ="";
		cntLeft += '<button type="button" class="cal-btn prev">'+set.prevTx+'</button>';
		cntLeft += '<p class="tx-yearMon"></p>';
		cntLeft += '<button type="button" class="cal-btn next">'+set.nextTx+'</button>';
	
		$ctrlLeft.append(cntLeft);
		
		$prevM = $calWrap.find('.cal-btn.prev'),
		$nextM = $calWrap.find('.cal-btn.next'),
		$leftTx = $left.find('.tx-yearMon');
		
		if(set.dualCal == true) {
			$calWrap.addClass('dual');
			$nextM.remove();
			$calWrap.append('<div class="right"><div class="cal-area"></div></div>');
			$right = $calWrap.children('.right'),
			$calRight = $right.children('.cal-area');

			$right.prepend('<div class="cal-top"></div>');
			$ctrlRight= $right.find('.cal-top');

			var cntRight ="";
			cntRight += '<button type="button" class="cal-btn next">'+set.nextTx+'</button>';
			cntRight += '<p class="tx-yearMon"></p>';		
		
			$ctrlRight.append(cntRight);			
			
			$nextM = $calWrap.find('.cal-btn.next');
			$rightTx = $right.find('.tx-yearMon');
		}

		// 하단 확인/닫기 버튼 영역
		$calWrap.append('<div class="cal-btns"></div>');
		$btnArea = $calWrap.find('.cal-btns');
		$btnArea.append('<button type="button" class="btn-cal-apply">'+set.applyBtnTx+'</button>');
		$btnArea.append('<button type="button" class="btn-cal-close">'+set.closeBtnTx+'</button>');
		$applyBtn = $calWrap.find('.btn-cal-apply'),
		$closeBtn = $calWrap.find('.btn-cal-close');

		// 달력 그리기 및 호출 ==================================================
		var calendarOn = function(){ // 설정된 연,월,일로 달력 생성 및 기능 적용 (show X)
			chkYoil();
			makeCalendar(startYoil, nalsu[month],year,month + 1, $calLeft);
			$leftTx.text(''+year+'년 '+(month +1)+'월');
			if(set.dualCal == true) {
				makeCalendar(endYoil, nalsu[month],rightYear,rightMon + 1, $calRight);
				$rightTx.text(''+rightYear+'년 '+(rightMon +1)+'월');
			}
			setState == false ? setToActiveDay() : setToSelectDay();
			if(set.todayLimit == true )limitNextPrevSet();
		}, calPosition = function (tg){
			// 달력 위치 설정 - input 기준
			var Top = tg.offset().top + tg.outerHeight(),
				Left = tg.offset().left;
			if((Left + $calWrap.outerWidth()) > $(window).width()) Left = $(window).width() - $calWrap.outerWidth(); // 위치 상 화면 우측 넘어갈 경우 조정
			$calWrap.css({
				'top':''+Top+'px',
				'left':''+Left+'px'
			});
		}, calendarShow = function( tg ){ // 달력 show 함수 + input 값 체크로 연,월,일 설정함수 호출
			var inpDate;
			set.inpSingle == true ? inpDate = tg.find('input').val().length : inpDate = tg.find('.start').val().length;
			if(inpDate > 0) { // input 에 설정된 날짜가 있을 경우 해당 날짜 연/월/일 세팅
				setYoil(tg);
				calendarOn(); 
			} else {// input 이 비어있을 경우 오늘 날짜 연/월/일 세팅
				resetYoil(); 
				calendarOn(); 
			}		
			$calWrap.css('display','block');
			$calWrap.focus();
			$applyBtn.prop('disabled',true).attr('disabled',true);
		}

		// show type 설정 : 버튼 / input focus / both
		if(set.showType == 'both' || set.showType == 'button') {
			$wrap.append('<button type="button" class="btn-cal">달력보기</button>');
			$btn = $wrap.find('.btn-cal');

			$btn.click(function(){
				calShow($wrap);
			});
		}
		if(set.showType == 'both' || set.showType == 'input') {
			if(set.inpSingle == true) {
				$inp.click(function(){ calShow($wrap); });
				$inp.on('keyup', function(e){
					var key = e.keyCode || e.which;
					if(key == 9) calShow($wrap);
				});
			} else {
				$inpStart.click(function(){ calShow($wrap); });
				$inpEnd.click(function(){ calShow($wrap); });
				$inpStart.on('keyup', function(e){
					var key = e.keyCode || e.which;
					if(key == 9) calShow($wrap);
				});
			}
		}

		function calShow(e){
			calPosition(e);
			calendarShow(e);
		}

		//	상단 연/월 설정 영역  ==========================================================================

		// 달력 상단 연,월 제어 버튼 영역 생성

		$prevM.click(function(){
			if(month > 0) month--;
			else {
				year--;
				month = 11;
			}
			calendarOn();
		});
		$nextM.click(function(){
			if(month < 11) month++;
			else { 
				year++;
				month = 0;
			}
			calendarOn();
		});

		// 하단 버튼 영역 기능 설정 ==========================================================================

		$applyBtn.click(function(){
			if(set.inpSingle == true) {
				var val = dateAddZero(startDate) + ' ~ ' + dateAddZero(endDate);
				$inp.val(val);
			} else {
				$inpStart.val(dateAddZero(startDate));
				$inpEnd.val(dateAddZero(endDate));
			}
			calhide();
		});

		$closeBtn.click(function(){
			calhide();
		});
		

		// 달력 추가 항목 셋팅 및 닫기 ===================================================================
		// 날짜 클릭 시 output 설정
		function btnSet(){ 
			var $btnTd = $calWrap.find('td').children('button');

			$btnTd.each(function(){
				var tdDate = changeToDate($(this).parent().data('date'));
				if(set.todayLimit == true ) limitSet($(this));
				$(this).click(function(){
					if(endDate == null && startDate == null || endDate != null && startDate != null) {
						$calWrap.find('td').removeClass('start end in-range');
						startDate = $(this).parent().data('date');
						endDate = null;
						setState = true;
						$(this).parent().addClass('start');						
						if(set.rangeLimit != null) setDisabled();
						$applyBtn.prop('disabled',true).attr('disabled',true);
					} else if (endDate == null && startDate != null) {
						if(set.rangeLimit == null) {
							if( tdDate > changeToDate(startDate)){
								endDate = $(this).parent().data('date');
								$applyBtn.prop('disabled',false).attr('disabled',false);
								$(this).parent().addClass('end');
							}
						} else {
							if( tdDate > changeToDate(startDate) && tdDate < changeToDate(startDate).valueOf() + (60 * 60 * 24 * 1000 * set.rangeLimit)){
								endDate = $(this).parent().data('date');
								$applyBtn.prop('disabled',false).attr('disabled',false);
								$(this).parent().addClass('end');
								// rangeSet($(this).parent().data('date'));  end 클릭 시 중간 날짜 bg 추가 - 모바일일 경우 추가
								if(set.rangeLimit != null) setEnabled();
							} else {
								alert('기간 선택은 시작일 이후 '+set.rangeLimit+'일 이내여야 합니다.');
							}
						}
					} 
				});
				// 마우스 오버 시 시작일 - 마우스 오버일 사이 bg 설정 - 모바일에선 삭제
				$(this).hover(function(){
					if(startDate != null && endDate == null){				
						rangeSet($(this).parent().data('date'));
					}
				});
			});		
		}

		// 날짜 - Date 변환 함수 - 2019-2-1 같은 날짜데이터를 date 값으로 변환
		function changeToDate(e){
			var thisY = e.split('-')[0],
			thisM = e.split('-')[1] - 1,
			thisD = e.split('-')[2],
			nowDate = new Date(thisY, thisM, thisD);
			return nowDate;
		}

		// 날짜 형식 변환 함수
		function dateAddZero(e){
			var thisY = e.split('-')[0],
			thisM = Number(e.split('-')[1]),
			thisD = Number(e.split('-')[2]);
			if(thisM < 10) thisM = '0'+thisM;
			if(thisD < 10) thisD = '0'+thisD;
			var result = ''+thisY+'-'+thisM+'-'+thisD+'';
			return result;
		}

		// 달력 기간내 날짜 bg 컬러 변경
		function rangeSet(e){
			var $td = $calWrap.find('td');
			var sDate = changeToDate(startDate),
				eDate = changeToDate(e);
			$td.each(function(){
				if($(this).attr('data-date')){
					var thisDate = changeToDate($(this).data('date'));
					if(thisDate > sDate && thisDate < eDate) $(this).addClass('in-range');
					else  $(this).removeClass('in-range');
				}
			});
		}

		// 오늘 및 선택된 날짜 클래스 추가
		function setToActiveDay(){
			var $td = $calWrap.find('td'),
				sDate = new Date(activeYear, activeMonth, activeDay),
				eDate = new Date(activeEndYear, activeEndMonth, activeEndDay);

			var inpDate;
			set.inpSingle == true ? inpDate = $inp.val().length : inpDate = $inpStart.val().length;

			if(inpDate > 0){
				$td.each(function(){
					if($(this).data('date') != null){
						var date = changeToDate($(this).data('date'));
						if( date.valueOf() == sDate.valueOf() ) $(this).addClass('start');
						else if( date.valueOf() == eDate.valueOf() ) $(this).addClass('end');
						else if ( date > sDate && date < eDate ) $(this).addClass('in-range');
					}
				});
			}
		}

		// 확인 누르기 전 선택 중일 경우 설정
		function setToSelectDay(){
			var $td = $calWrap.find('td'),
				sDate, eDate;
			
			if(endDate == null) {
				sDate = changeToDate(startDate);				
				if(set.rangeLimit != null) setDisabled();
				$td.each(function(){
					if($(this).data('date') != null){
						var date = changeToDate($(this).data('date'));
						if( date.valueOf() == sDate.valueOf() ) $(this).addClass('start');
					}
				});
			} else {
				sDate = changeToDate(startDate);
				eDate = changeToDate(endDate);
				if(set.rangeLimit != null) setEnabled();
				$td.each(function(){
					if($(this).data('date') != null){
						var date = changeToDate($(this).data('date'));
						if( date.valueOf() == sDate.valueOf() ) $(this).addClass('start');
						else if( date.valueOf() == eDate.valueOf() ) $(this).addClass('end');
						else if ( date > sDate && date < eDate ) $(this).addClass('in-range');
					}
				});
			}
		}

		// 시작일 선택 후 rangeLimit 이외 기간 버튼 비활성화
		function setDisabled(){
			var $btnTd = $calWrap.find('td').children('button');
			
			$btnTd.each(function(){
				var date = changeToDate($(this).parent().data('date'));
				if( date < changeToDate(startDate) || date > changeToDate(startDate).valueOf() + (60 * 60 * 24 * 1000 * set.rangeLimit - 1)) $(this).attr('disabled', true);
			});
		}

		// 종료일 선택 후 rangeLimit 이외 기간 버튼 활성화
		function setEnabled(){
			
			var $btnTd = $calWrap.find('td').children('button');
			$btnTd.each(function(){
				$(this).attr('disabled', false);
				if(set.todayLimit == true ) limitSet($(this));
			});
		}

		// 기타 기능 ==========================================================================
		function limitSet(e){ // 오늘 날짜 제한 기능 관련
			var tg = e,
				tgDate = changeToDate(tg.parent().data('date'));
			if(set.limitType == 'after') {
				// 오늘(+- gap) 이후 날짜 disabled
				if(tgDate > new Date(thisYear, thisMonth, today + set.todayGap)) tg.attr('disabled', true);
				if(set.rangeGap > 0) if(tgDate < new Date(thisYear, thisMonth, today - set.rangeGap)) tg.attr('disabled', true);
				
				// 일단위가 아니라, 1달, 1년 등등 단위로 설정할 경우 아래 기능 적용
				//if(tgYear > thisYear || tgYear == thisYear && tgMonth > thisMonth || tgYear == thisYear && tgMonth == thisMonth && tgDay > today + set.limitGap ) tg.attr('disabled', true);
				/* 1년전 까지만 선택 가능 - 임시 기능 (카드매출조회 용)
				if(tgYear < thisYear - 1 || tgYear == thisYear - 1 && tgMonth < thisMonth || tgYear == thisYear-1 && tgMonth == thisMonth && tgDay < today) tg.attr('disabled', true);*/
			} else {
				// 오늘(+- gap) 이전 날짜 disabled
				if(tgDate < new Date(thisYear, thisMonth, today - set.todayGap)) tg.attr('disabled', true);
				if(set.rangeGap > 0) if(tgDate > new Date(thisYear, thisMonth, today + set.rangeGap)) tg.attr('disabled', true);
				
				// 일단위가 아니라, 1달, 1년 등등 단위로 설정할 경우 아래 기능 적용
				//if(tgYear < thisYear || tgYear == thisYear && tgMonth < thisMonth || tgYear == thisYear && tgMonth == thisMonth && tgDay < today + set.limitGap ) tg.attr('disabled', true);
			}
		}

		function limitNextPrevSet(){  // 2020-05-26 : 오늘 이후 제한 시 여유분 관련 추가 수정 (여유분 날짜의 월이 다를 경우)
			var lastDay = new Date(thisYear, thisMonth, today + set.limitNum),
				lastMon = lastDay.getMonth();
			if(set.limitType == 'after') {
				year > thisYear || year == thisYear && month > lastMon -1 ? $nextM.attr('disabled',true) : $nextM.attr('disabled', false);
				year <= thisYear-1 && month <=thisMonth ? $prevM.attr('disabled',true) : $prevM.attr('disabled', false); // 1년전까지만 선택가능 - 임시(카드매출조회용)
			} else {
				year < thisYear || year == thisYear && month < lastMon +1 ? $prevM.attr('disabled',true) : $prevM.attr('disabled', false);
			}
		}

		// 달력 닫기
		function calhide(){
			$calWrap.css('display','none');
			$calLeft.empty();
			if(set.dualCal == true) $calRight.empty();
			if(set.showType == 'button') $btn.focus();
			else {
				set.inpSingle == true ? $inp.focus() : $inpStart.focus();
			}
			startDate = null;
			endDate = null;
			setState = false;
		}
			
		// 달력 그리기 ==========================================================================
		function makeCalendar(yoil, nalsu, year, month, tgCal) {		
			var str= "";
			str = "<table border ='0'>";
			//str += "<caption>달력</caption><thead>";
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
			//alert("이번달은 " + ju + " 주 동안 계속됩니다");
			for(var r=0; r < ju; r++){
				str += "<tr style='text-align:center'>";
				for(var col=0; col < 7; col++){
					if(currentCell < yoil || no > nalsu){
						str += "<td>&nbsp;</td>";
						currentCell++;
					}else{
						str += "<td data-date='"+year+"-"+month+"-"+no+"'><button type='button'>" + no + "</button></td>";
						no++;
					}
					
				}
				//str += "<td>&nbsp;</td>";
				
				str += "</tr>";
			}
			
			str += "</tbody></table>";
			tgCal.html(str);
			if(set.dualCal == true) {
				if(tgCal == $calRight) btnSet();
			} else {
				btnSet();
			}
		}
	});
	return this;
}