// calendar
// 서남호(namo) - for m.s.p
// 2020-02-24 - fn / extend 만 jquery 활용한 버전 제작 - 추후 패턴 공부 후 fn/extend 모두 제거 예정

$.fn.nCalendar = function(option){

	this.each(function(){
		var opts = $.extend({
			inp             : this,
            showType        : 'button',	// both / button / input
			calType         : null, // null: 일반 기본형 ,  week : 주간달력, month : 월간달력
			dayType			: 'kr', // kr : 한글, en : 영문 (월~일 표기)
			changeMon       : true,
			changeYear      : true,
			yearRange       : '2019:2040',
			showBtnPanel    : true,
			closeBtnTx      : '닫기',
			todayBtnTx      : '오늘',
			controls        : true,
			nextTx          : '>',
			prevTx          : '<',
			todayLimit      : false, // 오늘 기준 선택 제한
			limitType       : null // null : 오늘 이전 날짜 선택 제한 / after : 오늘 이후 날짜 선택 제한
		}, option);
			
		//초기 날짜 관련 세팅 및 변수	
		var now         = new Date(),
			thisYear    = now.getFullYear(), // 오늘 날짜 포함된 연도 - today 설정용
			thisMonth   = now.getMonth(), // 오늘 날짜 포함된 월
			today       = now.getDate(), // 오늘 날짜
			activeYear, activeMonth, activeDay, // 선택된 날짜용 변수
			year, month, day; // 달력 생성용 변수
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
		
		// 각 월의 요일 수
		var nalsu = new Array(31,28,31,30,31,30,31,31,30,31,30,31);	
		// 요일 표기
		var weekTx;
		opts.dayType == 'kr' ? weekTx = new Array("일", "월", "화", "수", "목", "금", "토") : weekTx = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
		//2월은 윤년 체크
		if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ){
			nalsu[1] = 29;
		}

        
	/* 기본요소 그리기 (wrap/버튼 등) ==================================================================================== */	
		var inp	= opts.inp, // input
		cals,				// 페이지 내 달력 전체
		wrap,               // 달력 영역 전체
		cal,                // 달력 테이블 영역
		control,			// 달력 상단 제어영역
		yearObj,
		monthObj;            

		// 달력 영역 변수 설정
        document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="cal-wrap" tabindex="0"><div class="cal-top"></div><div class="cal-area"></div></div>');
        cals = document.querySelectorAll('.cal-wrap');
		wrap = cals[cals.length - 1];
		cal = wrap.querySelector('.cal-area');
        control = wrap.querySelector('.cal-top');

        // 상단 - 연도 타이틀 생성
		if(opts.changeYear == true){
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
		if(opts.changeMon == true && opts.calType != 'month'){
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
        if(opts.controls == true) {
            control.insertAdjacentHTML('afterbegin', '<button type="button" class="cal-btn prev">'+opts.prevTx+'</button>');
            control.insertAdjacentHTML('beforeend', '<button type="button" class="cal-btn next">'+opts.nextTx+'</button>');
            prevM = wrap.querySelector('.cal-btn.prev'),
			nextM = wrap.querySelector('.cal-btn.next');
			prevM.addEventListener('click', prevMonth);
			nextM.addEventListener('click', nextMonth);
		}

		// 하단 오늘/닫기 버튼 영역
		if(opts.showBtnPanel == true) {
			wrap.insertAdjacentHTML('beforeend', '<div class="cal-btns"></div>');
			btnArea = wrap.querySelector('.cal-btns');
			if(opts.todayBtnTx != null){
				btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-today">'+opts.todayBtnTx+'</button>');
				todayBtn = wrap.querySelector('.btn-cal-today');
			}
			if(opts.closeBtnTx != null){
				btnArea.insertAdjacentHTML('beforeend', '<button type="button" class="btn-cal-close">'+opts.closeBtnTx+'</button>');
				closeBtn = wrap.querySelector('.btn-cal-close');
			}

			closeBtn.addEventListener('click',calClose);
		}


	/* year, month, day 설정 ==================================================================================== */
		var firstDay, 
			firstYoil;

		var chkFirstYoil = function(){
			firstDay	= new Date(year, month, 1);
			firstYoil	= firstDay.getDay();
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

	/* draw ==================================================================================== */
		var calDraw = function(){
			yearSet();
			monthSet();
			chkFirstYoil();
			makeCalendar(firstYoil, nalsu[month], year, month + 1, day);
		}, calShowCheck = function(event){
			var tg;
			event.target.tagName == 'INPUT' ? tg = event.target : tg = event.target.previousSibling;				
			calShow(tg);
		}, calShow = function(tg){
			calCloseAll();
			tg.value != null ? dateSetToInp(tg) : resetDate();
			calPosition();
			calDraw();
			wrap.style.display = 'block';
			wrap.focus();
		}

		var calPosition = function(){
			var top		= offset(inp).top,
				left	= offset(inp).left;

			var par = inp.parents();
			for(var p=0; p<par.length; p++){
				if(par[p].style.position == 'fixed') wrap.style.position = 'fixed';
			}

			wrap.style.top = top + inp.offsetHeight + 'px';
			wrap.style.left = left + 'px';
		}

	/* click ==================================================================================== */
		// cal showType ------------------------------
		var btn;

		if(opts.showType == 'input'){
			inp.addEventListener('click', calShowCheck);			
			inp.addEventListener('keyup', function(e){
				var key = e.keyCode || e.which;
				if(key == 9) calShow(inp);
			});
		} else if (opts.showType == 'button'){
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
			calDraw();
		}
		function monthChange(e){
			month = e.target.value - 1;
			calDraw();
		}

		var yearSet = function(){
			if(opts.changeYear == true){
				var yearOpts = yearObj.querySelectorAll('option');
				for(o=0; o< yearOpts.length; o++){
					if(yearOpts[o].value == year) yearOpts[o].selected = true;
				}
			} else {
				yearObj.querySelector('i').innerText = year;
			}
		}, monthSet = function(){
			if(opts.changeMon == true){
				var monOpts = monthObj.querySelectorAll('option');
				for(o=0; o< monOpts.length; o++){
					if(monOpts[o].value == month + 1) monOpts[o].selected = true;
				}
			} else {
				monthObj.querySelector('i').innerText = month + 1;
			}
		}

		// input date write -----------------------
		var dateSelect = function(e){
			var dateBtn = e.target,
				inpDate = new Date(dateBtn.getAttribute('data-year'), dateBtn.getAttribute('data-month') - 1, dateBtn.innerText);

				inp.value = changeToYMD(inpDate);
			calClose();			
		}, dateBtnSet = function(){
			var btnDate = wrap.querySelectorAll('td button');
			for(b=0; b<btnDate.length; b++){
				btnDate[b].addEventListener('click', dateSelect);
			}
		}
		
		// close ---------------------------------
		function calClose(){
			wrap.style.top = '';
			wrap.style.left = '';
			wrap.style.display = 'none';
			inp.focus();
		}

		function calCloseAll(){
			var wrapAll = document.querySelectorAll('.cal-wrap');
			for(a=0; a<wrapAll.length; a++){
				wrapAll[a].style.top = '';
				wrapAll[a].style.left = '';
				wrapAll[a].style.display = 'none';
			}
		}

	/* common functions ==================================================================================== */
		// yyyy-mm-dd 형식을 date 값으로 변환
		function changeToDate(e){
			var thisY = e.split('-')[0],
			thisM = e.split('-')[1] - 1,
			thisD = e.split('-')[2],
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
			nowDate = ''+thisY+'-'+thisM+'-'+thisD+'';
			return nowDate;
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
                    }else{
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
		}
	});
	return this;
}