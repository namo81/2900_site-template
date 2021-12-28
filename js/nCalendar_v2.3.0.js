// calendar
// 서남호(namo) - for m.s.p
// 2020-02-24 - fn / extend 만 jquery 활용한 버전 제작 - 추후 패턴 공부 후 fn/extend 모두 제거 예정
// 2020-03-19 - 선택제한 기능추가에 따른 이전/다음 버튼 비활성화 기능 추가
// 2020-08-05 - 달력 외 영역 클릭 시 달력 hide 추가
// 2020-09-24 - v2.1.0 : 기간 제한 관련 기능 정리
// 2020-12-24 - v2.2.0 : jquery 제거
// 2021-12-27 - v2.3.0 : 페이지 고정형 옵션 추가

function nCalendar(option){

	var calInp          = document.querySelector(option.calInp),
		showType        = option.showType ? option.showType : 'button',				// both / button / input
		splitType 		= option.splitType ? option.splitType : '-',				// 날짜 구분선
		mobileDevice	= option.mobileDevice ? true : false,						// true : 모바일일 경우 left 값 0 고정 / false : input 위치값 적용
		gapTop			= option.gapTop ? option.gapTop : 0,						// 달력 top 위치 gap
		gapLeft			= option.gapLeft ? option.gapLeft : 0,						// 달력 left 위치 gap
		calType         = option.calType ? option.calType : null,					// null: 일반 기본형 ,  month : 월간달력
		langType		= option.langType ? option.langType : 'kr',					// kr : 한글, en : 영문 (월~일 표기)
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
		todayGap 		= option.todayGap ? option.todayGap : '0D', 				// 오늘 기준일의 gap 설정 (ex. 내일부터 제한, 5일전까지 제한 등)
		limitType       = option.limitType ? option.limitType : 'before',			// 제한 방향 설정 - before : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
		limitGap 		= option.limitGap ? option.limitGap : null, 				// 제한 기간 설정 - null : 기한 없음 / nY : n년 / nM : n개월 / nD : n일
		inPage			= option.inPage ? option.inPage : false,					// 페이지 내 표기 선택
		inTarget		= option.inTarget ? option.inTarget : null					// 페이지 표기 할 영역 선택
	
	//초기 날짜 관련 세팅 및 변수	
	var now         = new Date(),
		thisYear    = now.getFullYear(), 	// 오늘 날짜 포함된 연도 - today 설정용
		thisMonth   = now.getMonth(),		// 오늘 날짜 포함된 월
		today       = now.getDate(),		// 오늘 날짜
		activeYear, activeMonth, activeDay, // 선택된 날짜용 변수
		year, month, day;					// 달력 생성용 변수
		//alert(year + "." + month + 1 + "." + day); // month는 0부터 시작하기 때문에 +1을 해야됨
	
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
			gapD = 0;
		if(gapVal != null) {
			if(typeof(gapVal) === 'string') {
				var gapTx  = gapVal.substr(-1,1);
				if(gapTx == 'Y') gapY = Number(gapVal.replace('Y',''));
				else if(gapTx == 'M') gapM = Number(gapVal.replace('M',''));
				else gapD = Number(gapVal.replace('D',''));
			} else gapD = gapVal;
		}
		limitType == 'before' ? val = new Date(dayVal.getFullYear() + gapY,  dayVal.getMonth() + gapM,  dayVal.getDate() + gapD) : val = new Date(dayVal.getFullYear() - gapY,  dayVal.getMonth() - gapM,  dayVal.getDate() - gapD);
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
		wrap,               // 달력 영역 전체
		cal,                // 달력 테이블 영역
		control,			// 달력 상단 제어영역
		yearObj,			// 연도선택 select
		monthObj,			// 월 선택 select
		btn;				// shiwType 가 both 나 button 일 경우 버튼


	// 달력 영역 변수 설정
	var newCal = document.createElement('div');
	if(inPage == true) {
		newCal.classList.add('in-page');
		inTarget != null ? document.querySelector(inTarget).appendChild(newCal) : inp.parentNode.appendChild(newCal);
	} else document.querySelector('body').appendChild(newCal);	
	wrap = newCal;
	wrap.classList.add('cal-wrap');
	wrap.setAttribute('tabindex', '0');
	wrap.insertAdjacentHTML('beforeend', '<div class="cal-top"></div><div class="cal-area"></div>');
	cal = wrap.querySelector('.cal-area');
	control = wrap.querySelector('.cal-top');

	/* common functions --------------------------------------- */
	// 달력 생성 위치 설정 함수
	function calPosition(){
		if(inPage == true) return;
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
		nowDate = calType == 'month' ? ''+thisY+splitType+thisM+'' : ''+thisY+splitType+thisM+splitType+thisD+'';
		return nowDate;
	}

	// close ---------------------------------
	var calClose = function(){
		wrap.style.top = '';
		wrap.style.left = '';
		wrap.style.display = 'none';
		inp.focus();
	},
	calCloseAll = function(){
		var wrapAll = document.querySelectorAll('.cal-wrap');
		for(a=0; a<wrapAll.length; a++){
			if(wrapAll[a].classList.contains('in-page')) return;
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
	var calSetDay = function(){
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
		// 요일 표기
		var weekTx;
		langType == 'kr' ? weekTx = new Array("일", "월", "화", "수", "목", "금", "토") : weekTx = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
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
				cntstr += '<option value="'+i+'">'+i+'</option>';
			}
			cntstr +='</select>';	
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.sel-year');
			yearObj.addEventListener('change',yearChange);
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title year"><i></i></span>';
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.cal-title.year');
		}

		// 상단 - 월 타이틀 생성
		if(changeMon == true && calType != 'month'){
			var cntstr = "";
			cntstr += '<select title="월 선택" class="sel-month">'
			for( var m = 1; m < 13; m++){
				cntstr += '<option value="'+m+'">'+m+'</option>';
			}
			cntstr +='</select>';
			control.insertAdjacentHTML('beforeend', cntstr);
			monthObj = wrap.querySelector('.sel-month');
			monthObj.addEventListener('change',monthChange);
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title month"><i></i></span>';
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
			if(todayBtnTx != null){
				btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-today">'+todayBtnTx+'</button>');
				todayBtn = wrap.querySelector('.btn-cal-today');
			}
			if(closeBtnTx != null && inPage == false){
				btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-close">'+closeBtnTx+'</button>');
				closeBtn = wrap.querySelector('.btn-cal-close');
			}

			todayBtn.addEventListener('click',goToday);
			if(inPage == false) closeBtn.addEventListener('click',calClose);
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
			year = Number(dateTx.split(splitType)[0]),
			month = Number(dateTx.split(splitType)[1]) -1,
			day = Number(dateTx.split(splitType)[2]);
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
			
			if(inPage == false) outSideClick(); // 달력 외 영역 클릭 시 달력 hide
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
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력보기</button>');
			btn = inp.nextSibling;
			btn.addEventListener('click', calShowCheck);
		} else {
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력보기</button>');
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

		function goToday(){
			resetDate();
			calDraw();
		}

		// input date write -----------------------
		var dateSelect = function(e){
			var dateBtn = e.target.tagName == 'BUTTON' ? e.target : e.target.closest('BUTTON'),
				inpDate = new Date(dateBtn.getAttribute('data-year'), dateBtn.getAttribute('data-month') - 1, dateBtn.innerText);

			inp.value = changeToYMD(inpDate);
			if(inPage == false) calClose();
			else {
				dateSetToInp(inp);
				setMarkReset();
				setDateMark();
			}
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
				tgYear = tg.getAttribute('data-year'),
				tgMonth = tg.getAttribute('data-month'),
				tgDay = tg.innerText;
			if(limitType == 'after') {
				if(tgYear > limitY || tgYear == limitY && tgMonth > limitM + 1 || tgYear == limitY && tgMonth == limitM + 1 && tgDay > limitD ) tg.disabled = true;
				if(limitGap != null && tgYear < limitGapY || tgYear == limitGapY && tgMonth < limitGapM + 1 || tgYear == limitGapY && tgMonth == limitGapM + 1 && tgDay < limitGapD ) tg.disabled = true;
			} else {
				if(tgYear < limitY || tgYear == limitY && tgMonth < limitM + 1 || tgYear == limitY && tgMonth == limitM + 1 && tgDay < limitD ) tg.disabled = true;
				if(limitGap != null && tgYear > limitGapY || tgYear == limitGapY && tgMonth > limitGapM + 1 || tgYear == limitGapY && tgMonth == limitGapM + 1 && tgDay > limitGapD ) tg.disabled = true;
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
			var chkBtn = cal.querySelectorAll('button');
			for(i=0; i<chkBtn.length; i++){
				if( chkBtn[i].getAttribute('data-year') == thisYear && chkBtn[i].getAttribute('data-month') == thisMonth + 1 && chkBtn[i].innerText == today ) funcAddClass(chkBtn[i], 'today');
				else if ( chkBtn[i].getAttribute('data-year') == activeYear && chkBtn[i].getAttribute('data-month') == activeMonth + 1 && chkBtn[i].innerText == activeDay ) funcAddClass(chkBtn[i], 'select-day');
			}
		}, dateMark = function(){
			if( year == thisYear && month == thisMonth || year == activeYear && month == activeMonth) setDateMark();
		}, setMarkReset = function(){
			var chkBtn = cal.querySelectorAll('button');
			Array.prototype.forEach.call(chkBtn, function(btn){
				btn.classList.remove('select-day');
			});
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
						str += "<td><button type='button' data-year='"+ year +"' data-month='"+ month +"'>" + no + "</button></td>";
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
		
		if(inPage == true) calShow(inp);
	}

/* 월간 달력 ==================================================================================================================================================================================== */
	var calSetMonth = function(){

		var monTx;
		monTx = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

		var nextM, prevM;

		// 상단 - 연도 타이틀 생성
		if(changeYear == true){
			var cntstr = "";
			cntstr += '<select title="연도 선택" class="sel-year">';
			for(var i = minYear; i < maxYear + 1; i++){
				cntstr += '<option value="'+i+'">'+i+'</option>';
			}
			cntstr +='</select>';	
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.sel-year');
			yearObj.addEventListener('change',yearChange);
		} else {
			var cntstr = "";
			cntstr += '<span class="cal-title year"><i></i></span>';
			control.insertAdjacentHTML('beforeend', cntstr);
			yearObj = wrap.querySelector('.cal-title.year');
		}

		// 이전년도 / 다음년도 버튼 생성
		if(controls == true) {
			control.insertAdjacentHTML('afterbegin', '<button type="button" class="cal-btn prev">'+prevTx+'</button>');
			control.insertAdjacentHTML('beforeend', '<button type="button" class="cal-btn next">'+nextTx+'</button>');
			prevM = wrap.querySelector('.cal-btn.prev'),
			nextM = wrap.querySelector('.cal-btn.next');
			prevM.addEventListener('click', prevYear);
			nextM.addEventListener('click', nextYear);
		}

		// 하단 오늘/닫기 버튼 영역
		if(showBtnPanel == true) {
			wrap.insertAdjacentHTML('beforeend', '<div class="cal-btns"></div>');
			btnArea = wrap.querySelector('.cal-btns');
			if(closeBtnTx != null && inPage == false){
				btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-close">'+closeBtnTx+'</button>');
				closeBtn = wrap.querySelector('.btn-cal-close');
			}
			if(inPage == false) closeBtn.addEventListener('click',calClose);
		}


		/* year, month 설정 ------------------------------------------------------------------------ */
		var resetDate = function(){
			year	= thisYear,
			month	= thisMonth;
		}, dateSetToInp = function( tg ){ // input 에 값이 있을 경우 해당 값으로 연/월/일 설정
			var dateTx = tg.value;
			year = Number(dateTx.split(splitType)[0]),
			month = Number(dateTx.split(splitType)[1]) -1;
			// 선택된 날짜용 변수 설정
			activeYear = year;
			activeMonth = month;
		}

		/* draw ------------------------------------------------------------------------ */
		var calDraw = function(){
			yearSet();
			makeCalendar(year, month + 1);
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

			if(inPage == false) outSideClick(); // 달력 외 영역 클릭 시 달력 hide
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
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력보기</button>');
			btn = inp.nextSibling;
			btn.addEventListener('click', calShowCheck);
		} else {
			inp.insertAdjacentHTML('afterend', '<button type="button" class="btn-cal">달력보기</button>');
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
		function prevYear(){
			if(year > minYear) year--;
			calDraw();
		}
		function nextYear(){
			if(year < maxYear) year++;
			calDraw();
		}

		function yearChange(e){
			year = e.target.value;
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
		}

		// input date write -----------------------
		var dateSelect = function(e){
			var dateBtn = e.target.tagName == 'BUTTON' ? e.target : e.target.closest('BUTTON'),
				inpDate = new Date(dateBtn.getAttribute('data-year'), dateBtn.getAttribute('data-month') - 1, 1);

			inp.value = changeToYMD(inpDate);
			if(inPage == false) calClose();
			else {
				dateSetToInp(inp);
				setMarkReset();
				setDateMark();
			}
			inp.dispatchEvent(changeEvt);
		}, dateBtnSet = function(){
			var btnDate = wrap.querySelectorAll('li button');
			for(b=0; b<btnDate.length; b++){
				btnDate[b].addEventListener('click', dateSelect);
				if(todayLimit == true) limitSet(btnDate[b]);
			}
		}
				

		/* 기타 기능 ------------------------------------------------------------------------ */
		function limitSet(e){ // 오늘 날짜 제한 기능 관련
			var tg = e,
				tgYear = tg.getAttribute('data-year'),
				tgMonth = tg.getAttribute('data-month');
			if(limitType == 'after') {
				if(tgYear > limitY || tgYear == limitY && tgMonth > limitM + 1) tg.disabled = true;
				if(limitGap != null && tgYear < limitGapY || tgYear == limitGapY && tgMonth < limitGapM + 1) tg.disabled = true;
			} else {
				if(tgYear < limitY || tgYear == limitY && tgMonth < limitM + 1) tg.disabled = true;
				if(limitGap != null && tgYear > limitGapY || tgYear == limitGapY && tgMonth > limitGapM + 1) tg.disabled = true;
			}
		}

		// 오늘 날짜 제한 시 - 이전/다음 버튼 비활성화
		function limitPNSet(){
			if(limitType == 'after') {
				year >= limitY ? nextM.disabled = true : nextM.disabled = false;
				if(limitGap != null) year <= limitGapY ? prevM.disabled = true : prevM.disabled = false;
			} else {
				year <= limitY ? prevM.disabled = true : prevM.disabled = false;
				if(limitGap != null) year >= limitGapY ? nextM.disabled = true : nextM.disabled = false;							
			}
		}


		// 오늘 및 선택된 날짜 표기
		var setDateMark = function(){
			var chkBtn = cal.querySelectorAll('button');
			for(i=0; i<chkBtn.length; i++){
				if( chkBtn[i].getAttribute('data-year') == thisYear && chkBtn[i].getAttribute('data-month') == thisMonth + 1 ) funcAddClass(chkBtn[i], 'thisMonth');
				else if ( chkBtn[i].getAttribute('data-year') == activeYear && chkBtn[i].getAttribute('data-month') == activeMonth + 1 ) funcAddClass(chkBtn[i], 'select-mon');
			}
		}, dateMark = function(){
			if( year == thisYear || year == activeYear) setDateMark();
		}, setMarkReset = function(){
			var chkBtn = cal.querySelectorAll('button');
			Array.prototype.forEach.call(chkBtn, function(btn){
				btn.classList.remove('select-day');
			});
		}

		// 달력 날짜 그리기 함수
		function makeCalendar(year, month) {
			str = "<ul class='cal-month-list'>";		
					
			//alert("이번달은 " + ju + " 주 동안 계속됩니다");
			for(var r=1; r < 13; r++){
				if(langType == 'kr') str += "<li><button type='button' data-year='"+ year +"' data-month='"+ r +"'>" + r + "월</button></li>";
				else str += "<li><button type='button' data-year='"+ year +"' data-month='"+ r +"'>" + monTx[r - 1] + "</button></li>";
			}
			
			str += "</ul>";
			while (cal.firstChild) cal.removeChild(cal.firstChild); // 기존 달력 내용 지우기
			cal.insertAdjacentHTML('beforeend', str);
			dateBtnSet();
			dateMark();
		}

		if(inPage == true) calShow(inp);
	}
	

	// 일간 - 월간 달력 표출 구분
	if(calType == 'month') {
		calSetMonth();
	} else {
		calSetDay();
	}
	
}