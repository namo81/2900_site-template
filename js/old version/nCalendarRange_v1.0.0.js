// calendar
// 서남호(namo) - for m.s.p
// 2019-09-05 - ver1.0.0 - 기간형 최초버전


$.fn.nCalendarRange = function(option){

	this.each(function(){
		var set = $.extend({
			wrap : this,
			showType : 'button',
			yearRange : '2019:2040',
			showBtnPanel : true,
			closeBtnTx : '닫기',
			applyBtnTx : '확인',
			nextTx : '>',
			prevTx : '<'
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
			var dateStartTx = tg.find('.start').val(),
				dateEndTx = tg.find('.end').val(),
				yearEnd, monthEnd, dayEnd;
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
			$inpStart = $wrap.find('.start'),
			$inpEnd = $wrap.find('.end'),
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
			$applyBtn; // 확인 버튼

		var startDate, endDate; // 입력용 값

		//body 에 달력 div 생성
		$('body').append('<div class="cal-wrap range"><div class="left"><div class="cal-area"></div></div><div class="right"><div class="cal-area"></div></div></div>');
		$calWrap = $('.cal-wrap.range'),
		$left = $calWrap.children('.left'),
		$right = $calWrap.children('.right'),
		$calLeft = $left.children('.cal-area'),
		$calRight = $right.children('.cal-area');

		// left 상단 설정
		$left.prepend('<div class="cal-top"></div>');
		$ctrlLeft = $left.find('.cal-top');	

		var cntLeft ="";
		cntLeft += '<button type="button" class="cal-btn prev">'+set.prevTx+'</button>';
		cntLeft += '<p class="tx-yearMon"></p>';		
	
		$ctrlLeft.append(cntLeft);
		
		$right.prepend('<div class="cal-top"></div>');
		$ctrlRight= $right.find('.cal-top');

		var cntRight ="";
		cntRight += '<button type="button" class="cal-btn next">'+set.nextTx+'</button>';
		cntRight += '<p class="tx-yearMon"></p>';		
	
		$ctrlRight.append(cntRight);

		$prevM = $calWrap.find('.cal-btn.prev'),
		$nextM = $calWrap.find('.cal-btn.next'),
		$leftTx = $left.find('.tx-yearMon'),
		$rightTx = $right.find('.tx-yearMon');

		// 하단 오늘/닫기 버튼 영역
		$calWrap.append('<div class="cal-btns"></div>');
		$btnArea = $calWrap.find('.cal-btns');
		$btnArea.append('<button type="button" class="btn-cal-apply">'+set.applyBtnTx+'</button>');
		$btnArea.append('<button type="button" class="btn-cal-close">'+set.closeBtnTx+'</button>');
		$applyBtn = $calWrap.find('.btn-cal-apply'),
		$closeBtn = $calWrap.find('.btn-cal-close');

		// 달력 설정
		var calendarOn = function(){ // 설정된 연,월,일로 달력 생성 및 기능 적용 (show X)
			chkYoil();
			makeCalendar(startYoil, nalsu[month],year,month + 1, $calLeft);
			makeCalendar(endYoil, nalsu[month],rightYear,rightMon + 1, $calRight);
			$leftTx.text(''+year+'년 '+(month +1)+'월');
			$rightTx.text(''+rightYear+'년 '+(rightMon +1)+'월');
			setToActiveDay();
		}, calPosition = function (tg){
			// 달력 위치 설정 - input 기준
			var Top = tg.offset().top + tg.outerHeight(),
				Left = tg.offset().left;
			if((Left + $calWrap.outerWidth()) > $(window).width()) Left = $(window).width() - $calWrap.outerWidth(); // 위치 상 화면 우측 넘어갈 경우 조정
			$calWrap.css({
				'top':''+Top+'px',
				'left':''+Left+'px'
			}).focus();
		}, calendarShow = function( tg ){ // 달력 show 함수 + input 값 체크로 연,월,일 설정함수 호출
			if(tg.find('.start').val().length > 0) { // input 에 설정된 날짜가 있을 경우 해당 날짜 연/월/일 세팅
				setYoil(tg);
				calendarOn(); 
			} else {// input 이 비어있을 경우 오늘 날짜 연/월/일 세팅
				resetYoil(); 
				calendarOn(); 
			}		
			$calWrap.addClass('on').attr('tabindex','0').focus();
			$applyBtn.prop('disabled',true).attr('disabled',true);
		}

		// show type 설정 : 버튼 / input focus / both
		$wrap.append('<button type="button" class="btn-cal">달력보기</button>');
		$btn = $wrap.find('.btn-cal');
		$inpStart.focusin(function(){ calShow($wrap); });
		$inpEnd.focusin(function(){ calShow($wrap); });
		$btn.click(function(){
			calShow($wrap);
		});

		function calShow(e){
			calendarShow(e);
			calPosition(e);
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
			$inpStart.val(dateAddZero(startDate));
			$inpEnd.val(dateAddZero(endDate));
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
				$(this).click(function(){
					if(endDate == null && startDate == null || endDate != null && startDate != null) {
						$calWrap.find('td').removeClass('start end in-range');
						startDate = $(this).parent().data('date');
						endDate = null;
						$(this).parent().addClass('start');
					} else if (endDate == null && startDate != null) {
						if( changeToDate($(this).parent().data('date')) > changeToDate(startDate)){
							endDate = $(this).parent().data('date');
							$applyBtn.prop('disabled',false).attr('disabled',false);
							$(this).parent().addClass('end');
						}
					} 
				});
				$(this).hover(function(){
					//var thisDate = changeToDate($(this).parent().data('date'));
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
			if($inpStart.val().length > 0){
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
		
		// 달력 닫기
		function calhide(){
			$calWrap.removeClass('on'); 
			$calLeft.empty();
			$calRight.empty();
			$btn.focus();
			startDate = null;
			endDate = null;
		}
			
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
			if(tgCal == $calRight) btnSet();
		}
	});
	return this;
}