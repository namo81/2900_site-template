/*
    2021-11-30 : v1.0.0 추가
*/

function nTimeSet(option){
    var wrap 		= typeof option.area === 'string' ? document.querySelector(option.area) : option.area,
        input 		= wrap.querySelector('input[type=text]'),
        set_hour 	= input.value.length > 0 ? input.value.split(':')[0] : '00',
        set_min 	= input.value.length > 0 ? input.value.split(':')[1] : '00';
    
    var hourMin 	= option.hourMin ? option.hourMin : 0,
        hourMax 	= option.hourMax ? option.hourMax : 24,
        minMin 		= option.minMin ? option.minMin : 0,
        minMax 		= option.minMax ? option.minMax : 60,
        minStep		= option.minStep ? option.minStep : 1;

    // 기본 구조 생성
    var time_wrap 	= document.createElement('div'),
        roll_wrap	= document.createElement('div'),
        resultTx	= document.createElement('div'),
        hour		= document.createElement('div'),
        min			= document.createElement('div')
        btns		= document.createElement('div');

    time_wrap.classList.add('time-wrap');
    roll_wrap.classList.add('roll-wrap');
    resultTx.classList.add('result-tx'),
    hour.classList.add('area-hour'),
    min.classList.add('area-min');
    btns.classList.add('btns');

    wrap.appendChild(time_wrap);
    time_wrap.appendChild(resultTx);
    time_wrap.appendChild(roll_wrap);
    time_wrap.appendChild(btns);
    roll_wrap.appendChild(hour);
    roll_wrap.appendChild(min);

    resultTx.innerText = set_hour + ':' + set_min;

    var tag_ul = '<ul></ul>',
        hour_ul, min_ul;
    hour.insertAdjacentHTML('beforeend', tag_ul);
    min.insertAdjacentHTML('beforeend', tag_ul);
    hour_ul = hour.querySelector('ul'),
    min_ul = min.querySelector('ul');

    var btnOk		= document.createElement('button'),
        btnNo		= document.createElement('button');
    btnOk.classList.add('btn', 'confirm');
    btnNo.classList.add('btn', 'cancel');
    btnOk.innerText = '확인';
    btnNo.innerText = '취소';
    btns.appendChild(btnOk);
    btns.appendChild(btnNo);

    // 버튼 추가
    for(var h = hourMin; h<hourMax; h++){
        var tag_tx = h == set_hour ? '<li><button type="button" class="on">'+ h +'</button></li>' : '<li><button type="button">'+ h +'</button></li>';
        hour_ul.insertAdjacentHTML('beforeend', tag_tx);
    }

    for(var m=minMin; m<minMax; m += minStep){
        var tag_tx = m == set_min ?  '<li><button type="button" class="on">'+ m +'</button></li>' : '<li><button type="button">'+ m +'</button></li>';
        min_ul.insertAdjacentHTML('beforeend', tag_tx);
    }

    var hourBtns	= hour.querySelectorAll('button'),
        minBtns 	= min.querySelectorAll('button'),
        btnAll 		= wrap.querySelectorAll('li > button');

    Array.prototype.forEach.call(btnAll, function(btn){
        var areaWrap = btn.parentNode.parentNode.parentNode;
        btn.addEventListener('click', function(){
            var scrollVal = btn.offsetTop - (areaWrap.offsetHeight / 2) + (btn.offsetHeight / 2);
            animateScroll(areaWrap, scrollVal, 200);
        });
        btn.addEventListener('keyup', function(e){
            var key = e.keyCode || e.which,
                par = e.target.parentNode.parentNode.parentNode;
            if(key == 13) {
                par == hour ? min.querySelector('button.on').focus() : btnOk.focus();
            }
        });
    });

    var hourTx = 0, minTx = 0,
        hourTimeout,
        minTimeout;

    var btnSet = function(area, num){
        var idx 	= Math.floor(num / 30),
            tgBtns	= area == hour ? hourBtns : minBtns;
        Array.prototype.forEach.call(tgBtns, function(btn, tgIdx){
            if(idx == tgIdx) {
                btn.classList.add('on');
                area == hour ? hourTx = btn.innerText : minTx = btn.innerText;
            } else btn.classList.remove('on');
        });
        resultTx.innerText = setZero(hourTx) + ':' + setZero(minTx);
    }, scSet = function(area, sc){
        var scN = sc % 30;
        if(scN != 0) {
            scN < 16 ? sc = sc - scN : sc = sc + (30 - scN);
            animateScroll(area, sc, 100);
        }
        btnSet(area, sc);
    }

    hour.addEventListener('scroll', function(){
        window.clearTimeout(hourTimeout);
        hourTimeout = window.setTimeout(function(){
            scSet(hour, hour.scrollTop);
        }, 100);
    });

    min.addEventListener('scroll', function(){
        window.clearTimeout(minTimeout);
        minTimeout = window.setTimeout(function(){
            scSet(min, min.scrollTop);
        }, 100);
    });

    // time set
    var scrollSet = function(){
        var onBtns = roll_wrap.querySelectorAll('button.on');
        Array.prototype.forEach.call(onBtns, function(btn){
            var areaWrap = btn.parentNode.parentNode.parentNode,
                scrollVal = btn.offsetTop - (areaWrap.offsetHeight / 2) + (btn.offsetHeight / 2);
            areaWrap.scrollTop = scrollVal;
        });
    }, btnOnSet = function(){
        Array.prototype.forEach.call(hourBtns, function(btn){
            Number(btn.innerText) == Number(set_hour) ? btn.classList.add('on') : btn.classList.remove('on');
        });
        Array.prototype.forEach.call(minBtns, function(btn){
            Number(btn.innerText) == Number(set_min) ? btn.classList.add('on') : btn.classList.remove('on');
        });
    }, timeSet = function(){
        set_hour = resultTx.innerText.split(':')[0],
        set_min  = resultTx.innerText.split(':')[1];
        btnOnSet();
    }, timeReSet = function(){
        set_hour 	= input.value.length > 0 ? input.value.split(':')[0] : '00',
        set_min 	= input.value.length > 0 ? input.value.split(':')[1] : '00';
        resultTx.innerText = set_hour + ':' + set_min;
        btnOnSet();
    }

    // time_wrap show / hide
    input.addEventListener('click', function(){
        timeReSet();
        time_wrap.classList.add('show');
        scrollSet();
        outSideClick('.' + time_wrap.classList[0], time_wrap, 'show');
    });

    btnOk.addEventListener('click', function(){
        timeSet();
        input.value = resultTx.innerText;
        time_wrap.classList.remove('show');
    });

    btnNo.addEventListener('click', function(){
        btnOnSet();
        time_wrap.classList.remove('show');
    });

    // 공통함수
    function setZero(num){
        return num < 10 ? '0' + num : num;
    }
}