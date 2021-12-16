function getIndex( elm ){ 
    var c = elm.parentNode.children, i = 0;
    for(; i < c.length; i++ )
        if( c[i] == elm ) return i;
}

function elemsAddClass(elem, cls){
	Array.prototype.forEach.call(elem, function(ele){
		ele.classList.add(cls);
	});
}
function elemsRemoveClass(elem, cls){
	Array.prototype.forEach.call(elem, function(ele){
		ele.classList.remove(cls);
	});
}

window.onload = function(){
	var body 		= document.querySelector('body'),
		tbl 		= document.querySelector('.list table');

	if(tbl) {
		var trs 		= tbl.querySelectorAll('tbody tr'),
			previewChk 	= document.querySelector('#view-chk'),
			frameWrap	= document.querySelector('.iframe'),
			frame		= frameWrap.querySelector('iframe'),
			frameClose  = frameWrap.querySelector('.btn-frame-close'),
			tblTotal;

		var td_no 		= tbl.querySelectorAll('.no'),
			td_dep1 	= tbl.querySelectorAll('.depth1');

		// 페이지 수 넘버링 추가
		Array.prototype.forEach.call(td_no, function(td){
			var num = getIndex(td.parentNode);
			td.innerText = num + 1;
			tblTotal = num;
			td.parentNode.idx = num;
		});

		//depth1 에 텍스트 있을 경우 구분선 생성 및 토글버튼 추가
		var tglBtnTx = '<button type="button" class="btn-tr-tgl" title="ctrl 누른 채 클릭 시 전체 제어">Toggle</button>',
			ctrl = false;
		Array.prototype.forEach.call(td_dep1, function(td){
			if(td.innerText.length > 0){
				td.parentNode.classList.add('div');
				if(trs.length > 30) td.insertAdjacentHTML('beforeend', tglBtnTx);
			} else td.style.borderTop = 'none';
		});

		// 섹션별 토글기능
		var divArr = new Array(),
			trDivs = document.querySelectorAll('tr.div'),
			tglBtns = document.querySelectorAll('.btn-tr-tgl');

		Array.prototype.forEach.call(trDivs, function(div){
			divArr.push(div);
		});

		window.addEventListener('keydown', function(e){
			e.ctrlKey ? ctrl = true : ctrl = false;
		});
		window.addEventListener('keyup', function(e){
			ctrl = false;
		});

		if(trs.length > 30){
			Array.prototype.forEach.call(tglBtns, function(btn){
				btn.addEventListener('click', function(){
					var parTr 		= btn.parentNode.parentNode,
						parTrIdx 	= parTr.idx,
						parArrIdx 	= divArr.indexOf(parTr);
					if(ctrl){
						if(btn.classList.contains('open')) {
							Array.prototype.forEach.call(trs, function(tr){
								if(!tr.classList.contains('div')) tr.classList.remove('hide');
							});
							elemsRemoveClass(tglBtns, 'open');
						} else {
							Array.prototype.forEach.call(trs, function(tr){
								if(!tr.classList.contains('div')) tr.classList.add('hide');
							});
							elemsAddClass(tglBtns, 'open');
						}
					} else {
						Array.prototype.forEach.call(trs, function(tr){
							if(parArrIdx < divArr.length - 1) {
								if(tr.idx > parTrIdx && tr.idx < divArr[parArrIdx + 1].idx) {
									tr.classList.contains('hide') ? tr.classList.remove('hide') : tr.classList.add('hide');
								}
							} else {
								if(tr.idx > parTrIdx && tr.idx) {
									tr.classList.contains('hide') ? tr.classList.remove('hide') : tr.classList.add('hide');
								}
							}
						});
						btn.classList.contains('open') ? btn.classList.remove('open') : btn.classList.add('open');
					}
				});
			});
		}


		// 링크값 유무 + 종료일 유무에 따른 표기 / 미리보기 기능 설정
		Array.prototype.forEach.call(trs, function(tr){
			var btn 		= tr.querySelector('.link > a');
			if(!btn) return;

			var td_state 	= tr.querySelector('.state'),
				td_end 		= tr.querySelector('.end-date');
		
			if(btn.getAttribute('href').length > 0) td_state.classList.add('ing');
			else {
				btn.classList.add('ready');
				btn.addEventListener('click', function(e){ e.preventDefault(); });
			}
				
			if(td_end.innerText.length > 0){
				if(td_state.classList.contains('ing')) {
					td_state.classList.remove('ing');
					td_state.classList.add('end');
				}
			}

			btn.addEventListener('mouseover', function(){
				if(previewChk.checked == false) return;
				var url = btn.getAttribute('href');
				frame.setAttribute('src', url);
				frameWrap.style.display = 'block';
			});
			
		});
		frameClose.addEventListener('click', function(){
			frame.setAttribute('src', '');
			frameWrap.style.display = 'none';
			previewChk.checked = false;
		});


		// 전체 페이지 수 및 완료 페이지 표기
		var pageTotal   = document.querySelector('.total-page'),
			pageEnd 	= document.querySelector('.end-page'),
			pagePer 	= document.querySelector('.per'),
			endCount  	= tbl.querySelectorAll('.end').length,
			endPer 		= (endCount / (tblTotal + 1)) * 100;

			if(pageTotal) {
				pageTotal.innerText = tblTotal + 1;
				pageEnd.innerText = endCount;
				pagePer.innerText = Math.round(endPer);
			}

		
		// text 검색
		var findBtn 	= document.querySelector('.btn-find-tx'),
			findInp 	= document.querySelector('#find-tx'),
			hiddenInp 	= document.querySelector('.temp');
		
		findBtn.addEventListener('click', function(){
			var srchTx = findInp.value;
			
			Array.prototype.forEach.call(trs, function(tr){
				var btn  = tr.querySelector('.link a');
				if(!btn) return;
				var link = btn.getAttribute('href');
				btn.classList.remove('classUse');

				var xhr = new XMLHttpRequest();
				xhr.onload = function(){
					if (xhr.status === 200) {
						hiddenInp.value = xhr.responseText;
						var valTx = hiddenInp.value;
						valTx.match(srchTx) ? btn.classList.add('classUse') : null;
						hiddenInp.value = '';
					}
				}
				xhr.open("GET", link, true);
				xhr.send(null);
			});
		});
	}
	
	// 조직도 관련
	var fldTree = document.querySelector('.folder-tree');
	if(fldTree) {
		var btnTrees = fldTree.querySelectorAll('button');
		Array.prototype.forEach.call(btnTrees, function(btn){
			if(btn.classList.contains('btn-tree')){
				btn.addEventListener('click', function(){
					btn.parentNode.classList.contains('on') ? btn.parentNode.classList.remove('on') : btn.parentNode.classList.add('on');
				});
			} else {
				if(!btn.nextSibling) btn.classList.add('tree-last');
			}
		});
	}

	// top 버튼 추가
	var topBtn = document.createElement('a');
	body.appendChild(topBtn);
	topBtn.classList.add('btn-guide-top');
	topBtn.setAttribute('href', '#work-list');

};