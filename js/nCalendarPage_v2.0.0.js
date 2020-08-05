// calendar
// 서남호(namo) - for m.s.p
// 2020-02-24 - fn / extend 만 jquery 활용한 버전 제작 - 추후 패턴 공부 후 fn/extend 모두 제거 예정

$.fn.nCalendarPage = function(option){

	this.each(function(){
		var opts = $.extend({
			inp             : this,
			calArea 		: null,
			btnNext			: null,
			btnPrev			: null,
			yearTx			: null,
			monthTx			: null,
			dayType			: 'kr',				// kr : 한글, en : 영문 (월~일 표기)
			yearRange       : '2019:2040',		// 연도 제한
			todayLimit      : false,			// 오늘 기준 선택 제한
			limitType       : null,				// null : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
			showClass		: 'showOn',
			callback		: null
		}, option);
			
		//초기 날짜 관련 세팅 및 변수	
		var now         = new Date(),
			thisYear    = now.getFullYear(), 	// 오늘 날짜 포함된 연도 - today 설정용
			thisMonth   = now.getMonth(),		// 오늘 날짜 포함된 월
			today       = now.getDate(),		// 오늘 날짜
			activeYear, activeMonth, activeDay, // 선택된 날짜용 변수
			year, month, day;					// 달력 생성용 변수
			//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
		

		//연도 range 관련
		var minYear, maxYear;

		if(opts.yearRange != null){
			minYear = Number(opts.yearRange.split(':')[0]),
			maxYear = Number(opts.yearRange.split(':')[1]);
			if(opts.todayLimit == true) {
				if(opts.limitType == 'after') maxYear = thisYear;
				else minYear = thisYear;
			}
		}

		/* 기본요소 그리기 (wrap/버튼 등) ------------------------------------------------------------------------ */
		var inp	= opts.inp,		 	// input
		cals,						// 페이지 내 달력 전체
		wrap,              			// 달력 영역 전체
		cal,                		// 달력 테이블 영역
		control,					// 달력 상단 제어영역
		yearObj,					// 연도선택 select
		monthObj;					// 월 선택 select
		
		var calWrap = document.querySelector(opts.calArea);		// 달력이 그려질 영역

		// 달력 영역 변수 설정
		calWrap.insertAdjacentHTML('beforeend', '<div class="cal-wrap in-page"><div class="cal-top"></div><div class="cal-area"></div></div>');
		cals = document.querySelectorAll('.cal-wrap');
		wrap = cals[cals.length - 1];
		cal = wrap.querySelector('.cal-area');
		control = wrap.querySelector('.cal-top');

		/* common functions --------------------------------------- */
		// 달력 생성 위치 설정 함수
		function calPosition(){
			var top		= offset(inp).top,
				left	= offset(inp).left;

			var par = inp.parents();
			for(var p=0; p<par.length; p++){
				if(par[p].style.position == 'fixed') wrap.style.position = 'fixed';
			}

			wrap.style.top = top + inp.offsetHeight + 20 + 'px';
			//wrap.style.left = left + 'px';

		}

		/* yyyy-mm-dd 형식을 date 값으로 변환 - common 으로
		function changeToDate(e){
			var thisY = e.split('-')[0],
			thisM = e.split('-')[1] - 1,
			thisD = e.split('-')[2],
			nowDate = new Date(thisY, thisM, thisD);
			return nowDate;
		} */

		// date 값을 yyyy-mm-dd 형식으로 변환
		function changeToYMD(e){
			var thisY = e.getFullYear(),
			thisM = e.getMonth() + 1,
			thisD = e.getDate(),
			nowDate;
			if(thisM < 10) thisM = '0'+thisM;
			if(thisD < 10) thisD = '0'+thisD;
			nowDate = opts.calType == 'month' ? ''+thisY+'-'+thisM+'' : ''+thisY+'-'+thisM+'-'+thisD+'';
			return nowDate;
		}

		// close ---------------------------------
		function calClose(){
			wrap.style.top = '';
			wrap.style.left = '';
			//wrap.style.display = 'none';
			funcRemoveClass(wrap, opts.showClass);
			inp.focus();
			//calBg.style.display = 'none';
			funcRemoveClass(calBg, opts.showClass);
		}

		function calCloseAll(){
			var wrapAll = document.querySelectorAll('.cal-wrap');
			for(a=0; a<wrapAll.length; a++){
				wrapAll[a].style.top = '';
				wrapAll[a].style.left = '';
				//wrapAll[a].style.display = 'none';
				funcRemoveClass(wrapAll[a], opts.showClass);
			}
		}
	
	/* 일간 달력 ==================================================================================================================================================================================== */
		var calSetDay = function(){
			// 각 월의 요일 수
			var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
			// 요일 표기
			var weekTx;
			opts.dayType == 'kr' ? weekTx = new Array("일", "월", "화", "수", "목", "금", "토") : weekTx = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
			//2월은 윤년 체크
			var nalsu29 = function(){
				year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? nalsu[1] = 29 : nalsu[1] = 28;
			}
			
			var nextM, prevM, selectBtn, closeBtn;
			var selDate; // 선택한 날짜 변수
			
			// 상단 - 연도 타이틀 생성
			if(opts.yearTx == null){
				var cntstr = "";
				cntstr += '<span class="cal-title year"><i></i>년</span>';
				control.insertAdjacentHTML('beforeend', cntstr);
				yearObj = wrap.querySelector('.cal-title.year');
			} else {
				yearObj = document.querySelector(opts.yearTx);
			}

			// 상단 - 월 타이틀 생성
			if(opts.monthTx == null){
				var cntstr = "";
				cntstr += '<span class="cal-title month"><i></i>월</span>';
				control.insertAdjacentHTML('beforeend', cntstr);
				monthObj = wrap.querySelector('.cal-title.month');
			} else {
				monthObj = document.querySelector(opts.monthTx);
			}

			// 이전달 / 다음달 버튼 생성
			if(opts.btnNext != null && opts.btnPrev != null){
				prevM = document.querySelector(opts.btnPrev),
				nextM = document.querySelector(opts.btnNext);
				prevM.addEventListener('click', prevMonth);
				nextM.addEventListener('click', nextMonth);
			}

			/* year, month, day 설정 ------------------------------------------------------------------------ */
			var firstDay,		// 해당 월의 첫째 날 
				firstYoil;		// 해당 월 첫째날의 요일 값
				
			var chkFirstYoil = function(){
				firstDay	= new Date(year, month, 1);
				firstYoil	= firstDay.getDay();
				nalsu29();
			}, resetDate = function(){
				year	= thisYear,
				month	= thisMonth,
				day		= today;
			}, dateSetToInp = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
				var dateTx = tg.value;
				year = Number(dateTx.split('-')[0]),
				month = Number(dateTx.split('-')[1]) -1,
				day = Number(dateTx.split('-')[2]);
				// 선택된 날짜용 변수 설정
				activeYear = year;
				activeMonth = month;
				activeDay = day;
			}

			/* draw ------------------------------------------------------------------------ */
			var calDraw = function(){
				yearSet();
				monthSet();
				chkFirstYoil();
				makeCalendar(firstYoil, nalsu[month], year, month + 1, day);
				if(opts.todayLimit == true) limitPNSet();
				if( typeof opts.callback === 'function') {
					opts.callback();
				}
			}, calShow = function(tg){
				calCloseAll();
				tg.value.length > 0 ? dateSetToInp(tg) : resetDate();
				calDraw();
			}

			/* click ------------------------------------------------------------------------ */

			// cal reDraw ------------------------------
			function prevMonth(){
				if(month > 0) month--;
				else {
					if( year > minYear ) year--;
					month = 11;
				}
				calDraw();
			}
			function nextMonth(){
				if(month < 11) month++;
				else { 
					if( year < maxYear ) year++;
					month = 0;
				}
				calDraw();
			}

			function yearChange(e){
				year = e.target.value;
				calDraw();
			}
			function monthChange(e){
				month = e.target.value - 1;
				calDraw();
			}

			var yearSet = function(){
				yearObj.querySelector('i').innerText = year;
			}, monthSet = function(){
				monthObj.querySelector('i').innerText = month + 1;
			}

			// input date write -----------------------
			
			function dateInput(){
				inp.value = selDate;
				calClose();
				var changeEvt = new Event('change');
				inp.dispatchEvent(changeEvt);
			}

			var dateSelect = function(e){
				var dateBtn = e.target.tagName == 'BUTTON' ? e.target : e.target.closest('BUTTON'),
					inpDate = new Date(dateBtn.getAttribute('data-year'), dateBtn.getAttribute('data-month') - 1, dateBtn.childNodes[0].innerText),
					chkBtn = cal.querySelectorAll('button');

				selDate = changeToYMD(inpDate);
				for(i=0; i<chkBtn.length; i++){
					funcRemoveClass(chkBtn[i], 'select-day');
				}
				funcAddClass(dateBtn, 'select-day');
			}, dateBtnSet = function(){
				var btnDate = wrap.querySelectorAll('td button');
				for(b=0; b<btnDate.length; b++){
					btnDate[b].addEventListener('click', dateSelect, false);
					if(opts.todayLimit == true) limitSet(btnDate[b]);
				}
			}

			/* 기타 기능 ------------------------------------------------------------------------ */
			function limitSet(e){ // 오늘 날짜 제한 기능 관련
				var tg = e,
					tgYear = tg.getAttribute('data-date').split('-')[0],
					tgMonth = tg.getAttribute('data-date').split('-')[1],
					tgDay = tg.getAttribute('data-date').split('-')[2];
				if(opts.limitType == 'after') {
					if(tgYear > thisYear || tgYear == thisYear && tgMonth > thisMonth + 1 || tgYear == thisYear && tgMonth == thisMonth + 1 && tgDay > today ) tg.disabled = true;
					// 1년전 까지만 선택 가능 - 임시 기능 (카드매출조회 용)
					if(tgYear < thisYear - 1 || tgYear == thisYear - 1 && tgMonth < thisMonth + 1 || tgYear == thisYear-1 && tgMonth == thisMonth + 1 && tgDay < today + 1) tg.disabled = true;
				} else {
					if(tgYear < thisYear || tgYear == thisYear && tgMonth < thisMonth + 1 || tgYear == thisYear && tgMonth == thisMonth + 1 && tgDay < today ) tg.disabled = true;
				}
			}

			// 오늘 날짜 제한 시 - 이전/다음 버튼 비활성화
			function limitPNSet(){
				if(opts.limitType == 'after') {
					year >= thisYear && month >= thisMonth ? nextM.disabled = true : nextM.disabled = false;
					year <= thisYear-1 && month <=thisMonth ? prevM.disabled = true : prevM.disabled = false; // 1년전까지만 선택가능 - 임시(카드매출조회용)
				} else {
					year <= thisYear && month <= thisMonth ? prevM.disabled = true : prevM.disabled = false;							
				}
			}

			// 오늘 및 선택된 날짜 표기
			var setDateMark = function(){
				var chkBtn = cal.querySelectorAll('button');
				for(i=0; i<chkBtn.length; i++){
					var chkDate = chkBtn[i].getAttribute('data-date'),
						chkYear = chkDate.split('-')[0],
						chkMon	= chkDate.split('-')[1],
						chkDay	= chkDate.split('-')[2];
					if( chkYear == thisYear && chkMon == thisMonth + 1 && chkDay == today ) funcAddClass(chkBtn[i], 'today');
					else if ( chkYear == activeYear && chkMon == activeMonth + 1 && chkDay == activeDay ) funcAddClass(chkBtn[i], 'select-day');
				}
			}, dateMark = function(){
				if( year == thisYear && month == thisMonth || year == activeYear && month == activeMonth) setDateMark();
			}

			// 달력 날짜 그리기 함수
			function makeCalendar(firstYoil, nalsu, year, month, day) {
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
				var ju = Math.ceil((nalsu + firstYoil) / 7);
				//alert("이번달은 " + ju + " 주 동안 계속됩니다");
				for(var r=0; r < ju; r++){
					str += "<tr style='text-align:center'>";
					for(var col=0; col < 7; col++){
						if(currentCell < firstYoil || no > nalsu){
							str += "<td>&nbsp;</td>";
							currentCell++;
						} else {
							str += "<td><button type='button' data-date='"+ year +"-"+ month +"-"+ no +"'><span class='num'>" + no + "</span><i class='rec'></i><i class='sales'></i></button></td>";
							no++;
						}
						
					}
					//str += "<td>&nbsp;</td>";
					
					str += "</tr>";
				}
				while (cal.firstChild) cal.removeChild(cal.firstChild); // 기존 달력 내용 지우기
				cal.insertAdjacentHTML('beforeend', str);
				dateBtnSet();
				dateMark();
			}
			calShow(inp);
		}
		calSetDay();
	});
	return this;
}