// 타임라인 전체 함수
function timelineFunc(option) {
    this.totalSec = option.totalSec, // 타임라인 1칸의 길이 설정 (5분, 1시간, 1일, 3일 등)
    this.nowTime  = option.nowTime,  // 현재 시간 값
    this.timeline = option.timeline, // 타임라인 그릴 영역 
    this.recData  = option.recData;  // 녹화영상 구간 관련 데이터

    let totalSec = Number(this.totalSec),
        nowTime  = this.nowTime;
    
    let nowSec,    // 재생중인 시간의 second 값 ( = pointer 위치용 )
        viewSec,   // 현재 보고 있는 타임라인 중앙 second 값
        startSec,  // 현재 타임라인의 시작 시간 second 값
        endSec;    // 현재 타임라인의 종료 시간 second 값
    
    // 함수 모음 -------------------------------------------------------------
    let zeroSet = function(num) { // 숫자가 1자리수 일 경우 앞에 0 붙이기
        return num < 10 ? '0' + num : num;
    },
    // 시간 데이터를 second 로 환산 및 현재시간 설정
    valToSec = function(val){
        return Number(new Date(val).valueOf() / 1000);
    }, 
    // second를 시간 데이터로 환산
    secToVal = function(s, type){
        var date = new Date(s * 1000),
            year = date.getFullYear(),
            mon  = zeroSet(date.getMonth() + 1),
            day  = zeroSet(date.getDate()),
            hour = zeroSet(date.getHours()),
            min  = zeroSet(date.getMinutes()),
            sec  = zeroSet(date.getSeconds());
        
        var result;
        if(type == null) {
            result = year + '-' + mon + '-' + day + 'T' + hour + ':' + min + ':' + sec;
        } else if(type == 'hh:mm') {
            result = hour + ':' + min;
        } else if(type == 'mm:dd') {
            result = mon + '월' + day + '일';
        }
        return result;
    },
    // 타임라인 시작 / 끝 시간 설정
    calcDur = function(total) {
        startSec = viewSec - (total/2),
        endSec   = viewSec + (total/2);
    }
    
    // 계산 단위 별 나눔값 설정
    let timeGapCase = function(val) {
        var result;
        switch ( val ) {
            case '10sec':
            result = 10;
            break;
            case '2min':
            result = 120;
            break;
            case '10min':
            result = 600;
            break;
            case '30min':
            result = 1800;
            break;
            case 'hour':
            result = 3600;
            break;
            case '3hour':
            result = 10800;
            break;
            case '6hour':
            result = 21600;
            break;
            default:
            result = 60;
        }
        return result;
    },
    // 타임라인에 표기될 시간의 위치 및 시간 텍스트 배열 반환 함수
    /*
    arr - 값을 넣을 배열
    type - 반환 값 종류 (시/분/초 등)
        - min     : 1분 (기본값)
        - 2min    : 2분
        - 10min   : 10분
        - 30min   : 30분
        - hour    : 1시간
        - 3hour   : 3시간
        - 6hour   : 6시간
    tx - 시간 텍스트 추가 여부 (기본 : false)
    */
    calcTime = function(arr, sv, ev, type, tx){
        let startVal  = sv,
            endVal    = ev;
        let forGap = type == '2min' || type == '10min' ? 1 : 10, // for 문 증값 값 설정 - 시간단위일 경우 10초 단위로 for 문 돌도록.
            timeGap = timeGapCase(type);
            
        let startNum, // for 문 시작 시간
            restNum;  // 시간초 값 비교할 나머지 값 (timeGap 이 6시간 일때 / 아닐때 구분)
        
        // for 문 시작시간 - 분단위 일 경우 for 문 증감을 1 / 이상일 경우 for문 증감을 10 으로 변경하여 부하 줄이기.
        if(type == '2min' || type == '10min') startNum = startVal;
        else { startNum = Math.floor(startVal/10)*10; }

        // 6시간일 때 or 아닐 때 나머지 값 설정. ( 6시간 일때 나머지 0 으로 비교할 경우 첫 배열이 00:00 부터 시작하지 않고 03:00 부터 시작함 )
        restNum = timeGap == 21600 ? 10800 : 0;

        if(tx == true) {
            arr[0] = new Array(); // tick 위치용 left 값용 배열
            arr[1] = new Array(); // tick 시간 표시용 배열
            arr[2] = new Array(); // tick 날짜 표시용 배열
            for(let n=startNum; n<endVal; n+=forGap){
                if((n%totalSec)%timeGap == restNum) {
                    let t = n - startVal,
                        tx = secToVal(n, 'hh:mm');
                    arr[0].push((t/totalSec)*100);
                    arr[1].push(tx);
                    tx == '00:00' ? arr[2].push(secToVal(n, 'mm:dd')) : arr[2].push(null); // 시간값이 00시 일 경우 날짜 추가
                }
            }
        } else {
            for(let n=startNum; n<endVal; n+=forGap){
                if((n%totalSec)%timeGap == 0) {
                    let t = n - startVal;
                    arr.push((t/totalSec)*100);
                }
            }
        }
    }

    // 타임라인 영역 관련 -------------------------------------------------------------
    let wrapClass = this.timeline,
        timeline  = document.querySelector(wrapClass),      // 타임라인 전체
        tickWrap = timeline.querySelector('.ticks'),        // 시/분/초 등 tick 표시 영역
        marksWrap = timeline.querySelector('.mark-bar'),    // 녹화영상 구간 표시 영역
        lineWidth = timeline.offsetWidth,
        recArr = new Array(),
        recData = this.recData.item.timelines[0];

    let tickBar, tickBarNext, tickBarPrev; // tick 표시 영역
    tickWrap.insertAdjacentHTML('afterbegin', '<div class="tick-bar prev"></div>');
    tickWrap.insertAdjacentHTML('afterbegin', '<div class="tick-bar center"></div>');
    tickWrap.insertAdjacentHTML('afterbegin', '<div class="tick-bar next"></div>');

    tickBar = tickWrap.querySelector('.tick-bar.center');
    tickBarNext = tickWrap.querySelector('.tick-bar.next');
    tickBarPrev = tickWrap.querySelector('.tick-bar.prev');
    
    let marks, marksNext, marksPrev; // 녹화영상 있는 구간 표기 영역
    marksWrap.insertAdjacentHTML('afterbegin', '<div class="marks prev"></div>');
    marksWrap.insertAdjacentHTML('afterbegin', '<div class="marks center"></div>');
    marksWrap.insertAdjacentHTML('afterbegin', '<div class="marks next"></div>');

    marks = marksWrap.querySelector('.marks.center');
    marksNext = marksWrap.querySelector('.marks.next');
    marksPrev = marksWrap.querySelector('.marks.prev');

    // 타임라인에 마크 생성 함수
    let markAdd = function(start, end) {
        let tag = '',
            sTime, eTime, gap;

        if(end < startSec) {
            sTime = 100 + (((start - startSec) / totalSec) * 100),
            eTime = 100 + (((end - startSec) / totalSec) * 100),
            gap   = eTime - sTime;
            tag += '<span class="marker" style="width:'+ gap +'%; left:'+sTime+'%;"></span>';
            marksPrev.insertAdjacentHTML('afterbegin', tag);
        } else if (start > endSec) {
            sTime = (((start - startSec) / totalSec) * 100) - 100,
            eTime = (((end - startSec) / totalSec) * 100) - 100,
            gap   = eTime - sTime;
            tag += '<span class="marker" style="width:'+ gap +'%; left:'+sTime+'%;"></span>';
            marksNext.insertAdjacentHTML('afterbegin', tag);
        } else {
            sTime = ((start - startSec) / totalSec) * 100,
            eTime = ((end - startSec) / totalSec) * 100,
            gap   = eTime - sTime;
            tag += '<span class="marker" style="width:'+ gap +'%; left:'+sTime+'%;"></span>';
            marks.insertAdjacentHTML('afterbegin', tag);
        }
    },
    // 녹화영상 표기 지우기
    resetMark = function(){
        while (marks.firstChild) marks.removeChild(marks.firstChild);
        while (marksNext.firstChild) marksNext.removeChild(marksNext.firstChild);
        while (marksPrev.firstChild) marksPrev.removeChild(marksPrev.firstChild);
    },
    // 녹화영상 표기 그리기
    recMarkDraw = function(arr, data) {
        resetMark();
        for(let i=0; i<data.length; i++){
            arr[i] = new Array();
            arr[i][0] = valToSec(data[i].fromDateTime.split('+')[0]);
            arr[i][1] = valToSec(data[i].toDateTime.split('+')[0]);
        }

        for(let r=0; r<arr.length; r++){ // 타임라인에 마크 그리기
            markAdd(arr[r][0], arr[r][1]);
        }
    },
    // 타임라인 tick 그리기
    drawBar = function(bar, sv, ev){
        let tickArr = new Array(),
            sTickArr = new Array();
        
        let tickSet1, tickSed2;
        switch ( totalSec ) {
            case 600:
            tickSet1 = '2min';
            tickSed2 = '10sec';
            break;
            case 86400:
            tickSet1 = '3hour';
            tickSed2 = '30min';
            break;
            case 259200:
            tickSet1 = '6hour';
            tickSed2 = 'hour';
            break;
            default:
            tickSet1 = '10min';
            tickSed2 = '2min';
        }

        calcTime(tickArr, sv, ev, tickSet1, true);
        calcTime(sTickArr, sv, ev, tickSed2);

        bar.insertAdjacentHTML('afterbegin', '<p class="tick-area"></p>');
        bar.insertAdjacentHTML('afterbegin', '<p class="sTick-area"></p>');

        let tickArea = bar.querySelector('.tick-area'),
            sTickArea = bar.querySelector('.sTick-area');

        for(let t = 0; t < tickArr[0].length; t++) {
            let tickHtml = '';
            if(tickArr[2][t] === null) {
                tickHtml = '<span class="tick" style="left:'+ tickArr[0][t] +'%"><i class="time">'+ tickArr[1][t] +'</i></span>';
            } else {
                tickHtml = '<span class="tick" style="left:'+ tickArr[0][t] +'%"><i class="time">'+ tickArr[1][t] +'</i><i class="date">'+ tickArr[2][t] +'</i></span>';
            }
            tickArea.insertAdjacentHTML('afterbegin', tickHtml);
        }
        for(let st = 0; st < sTickArr.length; st++) {
            let sTickHtml = '';
                sTickHtml = '<span class="sTick" style="left:'+ sTickArr[st] +'%"></span>';
            sTickArea.insertAdjacentHTML('afterbegin', sTickHtml);
        }
    },
    // 타임라인 지우기
    resetBar = function(){
        while (tickBar.firstChild) tickBar.removeChild(tickBar.firstChild);
        while (tickBarNext.firstChild) tickBarNext.removeChild(tickBarNext.firstChild);
        while (tickBarPrev.firstChild) tickBarPrev.removeChild(tickBarPrev.firstChild);
    },
    // 타임라인 전체 그리기
    makeBar = function(){
        let prevSv = startSec - totalSec,
            nextSv = startSec + totalSec,
            prevEv = endSec - totalSec,
            nextEv = endSec + totalSec;

        resetBar();
        drawBar(tickBar, startSec, endSec);
        drawBar(tickBarNext, nextSv, nextEv);
        drawBar(tickBarPrev, prevSv, prevEv);
    }

    // 포인터 위치 관련 -----------------------------------------------------------
    let pointer   = timeline.querySelector('.pointer'),     // 현재 시간 표기 pointer
        clickArea = timeline.querySelector('.click-area');  // 클릭 영역

    // 포인터 이동 함수
    let movePoint = function(pos){
        if(pos > startSec && pos < endSec) {
            let p = pos - startSec;
            pointer.style.display = 'block';
            pointer.style.left = ((p/totalSec)*100)+'%';
            nowSec = pos;
            nowTime = secToVal(nowSec);
        } else {
            pointer.style.display = 'none';
        }
    }

    // 타임라인 클릭 시 실행문
    clickArea.addEventListener('click', function(e){
        let pX = e.offsetX,
            tgPos = (pX / lineWidth) * 100;

        nowSec = startSec + Math.round((tgPos * totalSec) / 100);
        nowTime = secToVal(nowSec);

        pointer.style.display = 'block';
        pointer.style.left = tgPos + '%';

        if ( typeof option.active === 'function' ) {
            option.active( secToVal(nowSec) );
        }
    });

    // 외부 호출용 함수 **********************************************
    // 타임라인 그리기 - 기본
    let drawTime = function(){
        calcDur(totalSec);
        resetBar();
        makeBar();
        recMarkDraw(recArr, recData);
        movePoint(nowSec);
    }

    // 타임라인 시작시간 호출
    this.startDate = function(){
        return secToVal(startSec);
    }
    // 타임라인 종료시간 호출
    this.endDate = function(){
        return secToVal(endSec);
    }
    
    // 현재 재생시간 기준 타임라인 그리기 ( 타임라인 새로고침 )
    this.resetTimeLine = function(time){
        let now = !time ? nowTime : time;
        viewSec = valToSec(now);
        nowSec = viewSec;
        drawTime();
    }
    this.changeTotal = function(total){
        totalSec = total;
        this.resetTimeLine();
    }
    this.justMovePoint = function(pos){
        movePoint(valToSec(pos));
    }

    // 외부 버튼용 기능 ---------------------------------------------
    let moveBar = function(dir){
        if(dir == 'next') {
            startSec = startSec + totalSec;
            endSec = endSec + totalSec;
        } else {
            startSec = startSec - totalSec;
            endSec = endSec - totalSec;
        }
        makeBar();
        recMarkDraw(recArr, recData);
        movePoint(nowSec);
        timeline.style.transitionDuration = '0s';
        timeline.style.transform = 'translate3d(0,0,0)';
    }

    // 다음 타임라인 이동
    this.nextMoveTimeline = function(){
        timeline.style.transitionDuration = '.5s';
        timeline.style.transform = 'translate3d(-100%,0,0)';
        timeline.addEventListener('transitionend', function(e){
            moveBar('next');
            this.removeEventListener('transitionend', arguments.callee);
        });
    }

    // 이전 타임라인 이동
    this.prevMoveTimeline = function(){
        timeline.style.transitionDuration = '.5s';
        timeline.style.transform = 'translate3d(100%,0,0)';
        timeline.addEventListener('transitionend', function(e){
            moveBar('prev');
            this.removeEventListener('transitionend', arguments.callee);
        });
    }

    // 포인트 건너뛰기
    this.pointJump = function(sec){
        let tgSec = nowSec + sec;
        tgSec > startSec && tgSec < endSec ? movePoint(tgSec) : this.resetTimeLine(secToVal(tgSec));
    }

    // 초기 로드 시 실행영역 
    this.resetTimeLine();
}

/*
1. 타임라인 클릭 시
 - nowTime, nowSec 값을 클릭된 시간값으로 설정

2. 영상 재생 시 
 가) 현재 타임라인 내 - this.justMovePoint();
 - 주어진 시간으로 pointer 이동
 - 주어진 시간으로 nowTime, nowSec 설정
 나) 현재 타임라인 오버 및 다음 타임라인 - this.resetTimeLine();
 - 주어진 시간으로 타임라인 reDraw (pointer 중앙)

3. 썸네일 클릭 시 - this.resetTimeLine(); 
 - 해당 썸네일이 가진 시간값 기준으로 타임라인 다시 그리기.
   (pointer 중앙 및 nowTime 설정)

4. 타임라인 기준시간 변경 - this.changeTotal();
 - 설정된 값으로 타임라인 redraw.
 - nowTime 기준으로 pointer 가 중앙으로 오도록.

 */