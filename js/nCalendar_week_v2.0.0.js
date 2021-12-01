// calendar
// 서남호(namo) - for m.s.p
// 2021-12-01 - Week 달력 추가 (adt_ai 프로젝트 사용분 활용 및 정리)


function nCalendarWeek(option){

	var calInp          = document.querySelector(option.calInp),
		showType        = option.showType ? option.showType : 'button',				// both / button / input
		splitType 		= option.splitType ? option.splitType : '-',				// 날짜 구분선
		mobileDevice	= option.mobileDevice ? true : false,						// true : 모바일일 경우 left 값 0 고정 / false : input 위치값 적용
		gapTop			= option.gapTop ? option.gapTop : 0,						// 달력 top 위치 gap
		gapLeft			= option.gapLeft ? option.gapLeft : 0,						// 달력 left 위치 gap
		dayType			= option.dayType ? option.dayType : 'kr',					// kr : 한글, en : 영문 (월~일 표기)
		changeMon       = option.changeMon != null ? option.changeMon : true,		// 월 선택 select 활성 여부
		changeYear      = option.changeYear != null ? option.changeYear : true,		// 연도 선택 select 활성 여부
		yearRange       = option.yearRange ? option.yearRange : '2019:2040',		// 연도 제한
		showBtnPanel    = option.showBtnPanel != null ? option.showBtnPanel : true,	// 하단 버튼 영역 show/hide 선택 - 오늘/닫기 버튼
		closeBtnTx      = option.closeBtnTx ? option.closeBtnTx : '닫기',			// 닫기 버튼 텍스트
		todayBtnTx      = option.todayBtnTx ? option.todayBtnTx : '오늘',			// 오늘 버튼 텍스트
		controls        = option.controls != null ? option.controls : true,			// 이전달/다음달 버튼 show/hide 선택
		nextTx          = option.nextTx ? option.nextTx : '>',						// 다음달 버튼 텍스트
		prevTx          = option.prevTx ? option.prevTx : '<',						// 이전달 버튼 텍스트
		todayLimit      = option.todayLimit ? option.todayLimit : false,			// 오늘 기준 선택 제한
		todayGap 		= option.todayGap ? option.todayGap : '0W', 				// 오늘 기준일의 gap 설정 (ex. 내일부터 제한, 5일전까지 제한 등)
		limitType       = option.limitType ? option.limitType : 'before',			// 제한 방향 설정 - before : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
		limitGap 		= option.limitGap ? option.limitGap : null 					// 제한 기간 설정 - null : 기한 없음 / nY : n년 / nM : n개월 / nD : n일
	
	//초기 날짜 관련 세팅 및 변수	
	var now         = new Date(),
		thisYear    = now.getFullYear(), 				// 오늘 날짜 포함된 연도 - today 설정용
		thisMonth   = now.getMonth(),					// 오늘 날짜 포함된 월
		today       = now.getDate(),					// 오늘 날짜
		activeYear, activeMonth, activeDay, 			// 선택된 날짜용 변수
		activeEndYear, activeEndMonth, activeEndDay, 	// 선택된 날짜용 변수
		year, month, day;								// 달력 생성용 변수
		//alert(year + "." + month + 1 + "." + day); 	// month는 0부터 시작하기 때문에 +1을 해야됨
	
	// 날짜 제한 관련 (v2.1.0) ----------------------------------------------------------------------------
	var limitDay, // 오늘 or todayGap 적용된 날짜
		limitY, limitM, limitD, 
		limitGapDay, // 최종 제한일 (ex : 오늘이전 1년까지 제한일 경우 1년전 오늘)
		limitGapY, limitGapM, limitGapD;

	// limit 관련 최종 제한일 계산 함수
	var calcGapDay = function(dayVal, gapVal) {
		var val, 
			gapY = 0,
			gapM = 0,
			gapD = 0,
			gapW,
			gapTx;
		if(gapVal != null) {
			if(typeof(gapVal) === 'string') {
				gapTx  = gapVal.substr(-1,1);
				if(gapTx == 'Y') gapY = Number(gapVal.replace('Y',''));
				else if(gapTx == 'M') gapM = Number(gapVal.replace('M',''));
				else if(gapTx == 'W') gapW = Number(gapVal.replace('W',''));
				else gapD = Number(gapVal.replace('D',''));
			} else gapD = gapVal;
		}
		if(gapTx == 'W') {
			var monGap 	= dayVal.getDay() == 0 ? 7 : dayVal.getDay() - 0,
				weekGap = 7 * gapW;
				limitType == 'before' ? val = new Date(dayVal.getFullYear(), dayVal.getMonth(), dayVal.getDate() - (monGap - weekGap)) :  val = new Date(dayVal.getFullYear(), dayVal.getMonth(), dayVal.getDate() - (monGap + weekGap));
		} else {
			limitType == 'before' ? val = new Date(dayVal.getFullYear() + gapY,  dayVal.getMonth() + gapM,  dayVal.getDate() + gapD) : val = new Date(dayVal.getFullYear() - gapY,  dayVal.getMonth() - gapM,  dayVal.getDate() - gapD);
		}
		return val;
	}

	if(todayLimit == true) {
		limitDay = calcGapDay(now, todayGap);
		limitY = limitDay.getFullYear();
		limitM = limitDay.getMonth();
		limitD = limitDay.getDate();

		if(limitGap != null) {
			limitGapDay = calcGapDay(limitDay, limitGap);
			limitGapY = limitGapDay.getFullYear();
			limitGapM = limitGapDay.getMonth();
			limitGapD = limitGapDay.getDate();
		}
	}

	//연도 range 관련
	var minYear, maxYear;

	if(yearRange != null){
		minYear = Number(yearRange.split(':')[0]),
		maxYear = Number(yearRange.split(':')[1]);
		if(todayLimit == true) {
			if(limitType == 'after') {
				maxYear = limitY; 
				if(limitGap != null) minYear = limitGapY;
			} else {
				minYear = limitY;
				if(limitGap != null) maxYear = limitGapY;
			}
		}
	}
	
	/* 기본요소 그리기 (wrap/버튼 등) ------------------------------------------------------------------------ */
	var inp	= calInp, 	// input
		cals,				// 페이지 내 달력 전체
		wrap,               // 달력 영역 전체
		cal,                // 달력 테이블 영역
		control,			// 달력 상단 제어영역
		yearObj,			// 연도선택 select
		monthObj,			// 월 선택 select
		btn;				// shiwType 가 both 나 button 일 경우 버튼

	// 달력 영역 변수 설정
	document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="cal-wrap" tabindex="0"><div class="cal-top"></div><div class="cal-area"></div></div>');
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

		wrap.style.top = top + inp.offsetHeight + gapTop + 'px';
		mobileDevice == false ? wrap.style.left = left + gapLeft + 'px' : wrap.style.left = '0';
	}

	// yyyy-mm-dd 형식을 date 값으로 변환
	function changeToDate(e){
		var thisY = e.split(splitType)[0],
		thisM = e.split(splitType)[1] - 1,
		thisD = e.split(splitType)[2],
		nowDate = new Date(thisY, thisM, thisD);
		return nowDate;
	}
	// date 값을 yyyy-mm-dd 형식으로 변환
	function changeToYMD(e){
		var thisY = e.getFullYear(),
		thisM = e.getMonth() + 1,
		thisD = e.getDate(),
		nowDate;
		if(thisM < 10) thisM = '0'+thisM;
		if(thisD < 10) thisD = '0'+thisD;
		nowDate = ''+thisY + splitType + thisM + splitType + thisD+'';
		return nowDate;
	}

	// close ---------------------------------
	var calClose = function(){
		wrap.style.top = '';
		wrap.style.left = '';
		wrap.style.display = 'none';
		if(device == false) inp.focus();
	},
	calCloseAll = function(){
		var wrapAll = document.querySelectorAll('.cal-wrap');
		for(a=0; a<wrapAll.length; a++){
			wrapAll[a].style.top = '';
			wrapAll[a].style.left = '';
			wrapAll[a].style.display = 'none';
		}
	},
	// 달력 외 영역 클릭 시 달력 hide
	outSideClick = function(){
		var body = document.querySelector('body');
		body.addEventListener('mousedown', function(e){
			var tg = e.target;
			if( !tg.closest('.cal-wrap') ) {
				calClose();
				this.removeEventListener('mousedown', arguments.callee);
			}
		});
	}

/* 일간 달력 ==================================================================================================================================================================================== */
	var calSetWeek = function(){
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
		// 요일 표기
		var weekTx;
		dayType == 'kr' ? weekTx = new Array("일", "월", "화", "수", "목", "금", "토") : weekTx = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
		//2월은 윤년 체크
		var nalsu29 = function(){
			year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? nalsu[1] = 29 : nalsu[1] = 28;
		}
		
		var nextM, prevM;
		
		// 상단 - 연도 타이틀 생성
		if(changeYear == true){
			var cntstr = "";
			cntstr += '<select title="연도 선택" class="sel-year">';
			for(var i = minYear; i < maxYear + 1; i++){
				cntstr += '<option value="'+i+'">'+i+'년</option>';
			}
			cntstr +='</select>';	
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.sel-year');
			yearObj.addEventListener('change',yearChange);
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title year"><i></i>년</span>';
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.cal-title.year');
		}

		// 상단 - 월 타이틀 생성
		if(changeMon == true){
			var cntstr = "";
			cntstr += '<select title="월 선택" class="sel-month">'
			for( var m = 1; m < 13; m++){
				cntstr += '<option value="'+m+'">'+m+'월</option>';
			}
			cntstr +='</select>';
			control.insertAdjacentHTML('beforeend', cntstr);
			monthObj = wrap.querySelector('.sel-month');
			monthObj.addEventListener('change',monthChange);
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title month"><i></i>월</span>';
			control.insertAdjacentHTML('beforeend', cntstr);
			monthObj = wrap.querySelector('.cal-title.month');
		}

		// 이전달 / 다음달 버튼 생성
		if(controls == true) {
			control.insertAdjacentHTML('afterbegin', '<button type="button" class="cal-btn prev">'+prevTx+'</button>');
			control.insertAdjacentHTML('beforeend', '<button type="button" class="cal-btn next">'+nextTx+'</button>');
			prevM = wrap.querySelector('.cal-btn.prev'),
			nextM = wrap.querySelector('.cal-btn.next');
			prevM.addEventListener('click', prevMonth);
			nextM.addEventListener('click', nextMonth);
		}

		// 하단 오늘/닫기 버튼 영역
		if(showBtnPanel == true) {
			wrap.insertAdjacentHTML('beforeend', '<div class="cal-btns"></div>');
			btnArea = wrap.querySelector('.cal-btns');
			btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-close">'+closeBtnTx+'</button>');
			closeBtn = wrap.querySelector('.btn-cal-close');
			closeBtn.addEventListener('click',calClose);
		}

		control.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-today">'+todayBtnTx+'</button>');
		todayBtn = wrap.querySelector('.btn-cal-today');
		todayBtn.addEventListener('click',sellastDay);


		/* year, month, day 설정 ------------------------------------------------------------------------ */
		var firstDay,		// 해당 월의 첫째 날 
			firstYoil,		// 해당 월 첫째날의 요일 값
			weekMonDay,		// 선택 주의 월요일 날짜
			weekSunDay;		// 선택 주의 일요일 날짜
		var chkFirstYoil = function(){
			firstDay	= new Date(year, month, 1);
			firstYoil	= firstDay.getDay();			
			nalsu29();
		}, resetDate = function(){
			year	= thisYear,
			month	= thisMonth,
			day		= today;
		}, dateSetToInp = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
			var dateTx 		= tg.value.split('~')[0],
				dateTxEnd	= tg.value.split('~')[1];
			year = Number(dateTx.split(splitType)[0]),
			month = Number(dateTx.split(splitType)[1]) -1,
			day = Number(dateTx.split(splitType)[2]);
			// 선택된 날짜용 변수 설정
			activeYear = year;
			activeMonth = month;
			activeDay = day;
			activeEndYear = Number(dateTxEnd.split(splitType)[0]),
			activeEndMonth = Number(dateTxEnd.split(splitType)[1]) -1,
			activeEndDay = Number(dateTxEnd.split(splitType)[2]);

			weekMonDay = changeToDate(dateTx),
			weekSunDay = changeToDate(dateTxEnd);
		}

		/* draw ------------------------------------------------------------------------ */
		var calDraw = function(){
			yearSet();
			monthSet();
			chkFirstYoil();
			makeCalendar(firstYoil, nalsu[month], year, month + 1, day);
			if(todayLimit == true) limitPNSet();
		}, calShowCheck = function(event){
			var tg;
			event.target.tagName == 'INPUT' ? tg = event.target : tg = event.target.previousSibling;
			calShow(tg);
		}, calShow = function(tg){
			calCloseAll();
			tg.value.length > 0 ? dateSetToInp(tg) : resetDate();
			calPosition();
			calDraw();
			wrap.style.display = 'block';
			wrap.focus();
			
			outSideClick(); // 달력 외 영역 클릭 시 달력 hide
		}

		/* click ------------------------------------------------------------------------ */
		// cal showType ------------------------------

		if(showType == 'input'){
			inp.addEventListener('click', calShowCheck);
			inp.addEventListener('keyup', function(e){
				var key = e.keyCode || e.which;
				if(key == 9) calShow(inp);
			});
		} else if (showType == 'button'){
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력선택</button>');
			btn = inp.nextSibling;
			btn.addEventListener('click', calShowCheck);
		} else {
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력선택</button>');
			btn = inp.nextSibling;
			btn.addEventListener('click', calShowCheck);
			inp.addEventListener('click', calShowCheck);
			inp.addEventListener('keyup', function(e){
				var key = e.keyCode || e.which;
				if(key == 9) calShow(inp);
			});
		}

		if(inp.disabled == true) btn.disabled = true;

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
			if(todayLimit == true) {
				if(limitType == 'after') {
					if(year == limitY) month > limitM ? month = limitM : null;
					if(limitGap != null && year == limitGapY) month < limitGapM ? month = limitGapM : null;
				} else {
					if(year == limitY) month < limitM ? month = limitM : null;
					if(limitGap != null && year == limitGapY) month > limitGapM ? month = limitGapM : null;
				}
				calDraw();
			} else calDraw();
		}
		function monthChange(e){
			month = e.target.value - 1;
			calDraw();
		}

		var yearSet = function(){
			if(changeYear == true){
				var yearOpts = yearObj.querySelectorAll('option');
				for(o=0; o< yearOpts.length; o++){
					if(yearOpts[o].value == year) yearOpts[o].selected = true;
				}
			} else {
				yearObj.querySelector('i').innerText = year;
			}
		}, monthSet = function(){
			if(changeMon == true){
				
				var monOpts = monthObj.querySelectorAll('option');
				for(o=0; o< monOpts.length; o++){
					if(monOpts[o].value == month + 1) monOpts[o].selected = true;
					if(todayLimit == true) {
						monOpts[o].style.display = 'block';
						if(limitType == 'after') {
							if(limitGap == null) {
								if(year == limitY) monOpts[o].value > limitM + 1 ? monOpts[o].style.display = 'none' : null;
							} else {
								if(limitY ==  limitGapY) {
									if(year == limitY) monOpts[o].value > limitM + 1 || monOpts[o].value < limitGapM + 1 ? monOpts[o].style.display = 'none' : null;
								} else {
									if(year == limitY) monOpts[o].value > limitM + 1 ? monOpts[o].style.display = 'none' : null;
									else if(year == limitGapY) monOpts[o].value < limitGapM + 1 ? monOpts[o].style.display = 'none' : null;
								}
							}
						} else {
							if(limitGap == null) {
								if(year == limitY) monOpts[o].value < limitM + 1 ? monOpts[o].style.display = 'none' : null;
							} else {
								if(limitY ==  limitGapY) {
									if(year == limitY) monOpts[o].value < limitM + 1 || monOpts[o].value > limitGapM + 1 ? monOpts[o].style.display = 'none' : null;
								} else {
									if(year == limitY) monOpts[o].value < limitM + 1 ? monOpts[o].style.display = 'none' : null;
									else if(year == limitGapY) monOpts[o].value > limitGapM + 1 ? monOpts[o].style.display = 'none' : null;
								}
							}
						}
					}
				}
			} else {
				monthObj.querySelector('i').innerText = month + 1;
			}
		}

		// 오늘일자 달력화면 이동 -- adt-ai 에선 미사용
		function goToday(){
			resetDate();
			calDraw();
		}

		function sellastDay(){
			var lastMon = new Date(limitDay.getFullYear(), limitDay.getMonth(), limitDay.getDate() - 6);
			inp.value = changeToYMD(lastMon) + '~' + changeToYMD(limitDay);
			calClose();
			inp.dispatchEvent(changeEvt);
		}

		function calcWeekMonDay(date){
			var monGap 	= date.getDay() == 0 ? 6 : date.getDay() - 1;
			return new Date(date.getFullYear(), date.getMonth(), date.getDate() - monGap);
		}
		// 2021-11-29 : 일요일 계산 수정 -- 오늘이 포함된 주일 경우 오늘까지 설정
		function calcWeekSunDay(date){
			var monGap 	= date.getDay() == 0 ? 6 : date.getDay() - 1,
				yester  = new Date(thisYear, thisMonth, today - 1),
				calcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - monGap + 6);

			if(calcDate.valueOf() > yester.valueOf()) return yester;
			else return calcDate;
		}

		// input date write -----------------------
		var dateSelect = function(e){
			var dateBtn 	= e.target.tagName == 'BUTTON' ? e.target : e.target.closest('BUTTON'),
				curDate 	= changeToDate(dateBtn.getAttribute('data-date')),
				inpDate 	= calcWeekMonDay(curDate),
				inpEndDate  = calcWeekSunDay(curDate);

			inp.value = changeToYMD(inpDate) + '~' + changeToYMD(inpEndDate);
			calClose();
			inp.dispatchEvent(changeEvt);
		}, dateBtnSet = function(){
			var btnDate = wrap.querySelectorAll('td button');
			for(b=0; b<btnDate.length; b++){
				btnDate[b].addEventListener('click', dateSelect);
				if(todayLimit == true) limitSet(btnDate[b]);
			}
		}

		/* 기타 기능 ------------------------------------------------------------------------ */
		function limitSet(e){ // 오늘 날짜 제한 기능 관련
			var tg = e,
			tgDate = tg.getAttribute('data-date');
			if(limitType == 'after') {
				if(changeToDate(tgDate) > limitDay) tg.disabled = true;
				if(limitGap != null) if(changeToDate(tgDate) < limitGapDay) tg.disabled = true;
			} else {
				if(changeToDate(tgDate) < limitDay) tg.disabled = true;
				if(limitGap != null) if(changeToDate(tgDate) > limitGapDay) tg.disabled = true;
			}
		}

		// 오늘 날짜 제한 시 - 이전/다음 버튼 비활성화
		function limitPNSet(){
			if(limitType == 'after') {
				year >= limitY && month >= limitM ? nextM.disabled = true : nextM.disabled = false;
				if(limitGap != null) year <= limitGapY && month <= limitGapM ? prevM.disabled = true : prevM.disabled = false;
			} else {
				year <= limitY && month <= limitM ? prevM.disabled = true : prevM.disabled = false;
				if(limitGap != null) year >= limitGapY && month >= limitGapM ? nextM.disabled = true : nextM.disabled = false;
			}
		}

		// 오늘 및 선택된 날짜 표기
		var setDateMark = function(){
			if(weekMonDay == null) return;
			var chkTds = cal.querySelectorAll('td');
			for(i=0; i<chkTds.length; i++){
				var btn = chkTds[i].querySelector('button');
				if(btn != null) {
					var btnDate = changeToDate(btn.getAttribute('data-date')).valueOf();
					if(weekSunDay == null) {
						if(btnDate == weekMonDay.valueOf()) funcAddClass(chkTds[i], 'start');
					} else {
						if(btnDate == weekMonDay.valueOf()) funcAddClass(chkTds[i], 'start');
						if(btnDate == weekSunDay.valueOf()) funcAddClass(chkTds[i], 'end');
						if(btnDate > weekMonDay.valueOf() && btnDate < weekSunDay.valueOf()) funcAddClass(chkTds[i],'in-range');
					} 
				}
			}
		}, dateMark = function(){
			if( year == thisYear && month == thisMonth || year == activeYear && month == activeMonth || year == activeEndYear && month == activeEndMonth ) setDateMark();
		}

		// 달력 날짜 그리기 함수
		function makeCalendar(firstYoil, nalsu, year, month, day) {
			if(month < 10) month = '0' + month;
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
						var dayNum = no < 10 ? '0'+ no : no;
						str += "<td><button type='button' data-date='"+ year + splitType + month + splitType + dayNum +"'>" + no + "</button></td>";
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
	}

	calSetWeek();

}