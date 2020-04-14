/* -- date : 2020-03-19 -- */
/* -- snamo(Seo nam ho) for m.s.p -- */
/* -- GNB / LNB 설정 -- */


// GNB 관련 --------------------------------
function nGnb(selector){
	var nGnbEle = document.querySelectorAll(selector);
	if (nGnbEle.length == 1) nGnbSet(nGnbEle[0]);
	else null;
}

function nGnbSet(Ele){
	var gnbWrap		= Ele,
		dep1		= gnbWrap.querySelectorAll('.dep1 > li > a'),
		dep1Li		= gnbWrap.querySelectorAll('.dep1 > li'),
		dep2		= gnbWrap.querySelectorAll('.dep2 > li > a');

	// 2dep 마지막 li 에 last 클래스 추가
	for(i=0; i<dep1Li.length; i++){
		var dep2Li		= dep1Li[i].querySelectorAll('.dep2 > li'),
			dep2Len		= dep2Li.length;
		if(dep2Len > 0)	funcAddClass(dep2Li[dep2Len - 1], 'last');
	}

	var dep1Focus = function(event){
		var btn = event.target,
			dep2	= btn.nextSibling,
			key = event.keyCode || event.which;
		
		if(dep2 != null) {
			if(event.type == 'focus') funcAddClass(btn.parentElement, 'show');
			if(event.type == 'mouseleave') funcRemoveClass(btn.parentElement, 'show');
			if(key == 9 && event.shiftKey) funcRemoveClass(btn.parentElement, 'show');
		} else {
			if(key == 9 && !event.shiftKey) funcRemoveClass(btn.parentElement, 'show');
		}
	}, dep2Focus = function(event){
		var btn2 	= event.target,
			parent 	= btn2.parentNode,
			gParent = parent.parentNode.parentNode,
			key		= event.keyCode || event.whick;
		if(key == 9 && !event.shiftKey){
			if(funcHasClass(parent, 'last')) funcRemoveClass(gParent, 'show');
		}
	}

	for(i=0; i<dep1.length; i++){
		dep1[i].addEventListener('focus',dep1Focus);
		dep1[i].addEventListener('mouseleave',dep1Focus);
		dep1[i].addEventListener('keydown',dep1Focus);
	}

	for(i=0; i<dep2.length; i++){
		dep2[i].addEventListener('keydown',dep2Focus);
	}
}
