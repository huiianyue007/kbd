(function(w) {

	document.addEventListener('plusready', function() {
		plus.navigator.setStatusBarBackground("#FFFFFF")
	}, false);

	var immersed = 0;
	var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(ms && ms.length >= 3) {
		immersed = parseFloat(ms[2]);
	}
	w.immersed = immersed;

	if(!immersed) {
		return;
	}
	var t = document.body;
	t && (t.style.paddingTop = immersed + 'px');
	t = document.getElementsByTagName("header")[0];
	t && (t.style.height = (44 + immersed) + 'px');
	t && (t.style.paddingTop = immersed + 'px');
	t && (t.style.background = 'rgba(255,255,255,1)');
	t = document.getElementById('navbar');
	t && (t.style.top = (0.69 + immersed / 100) + 'rem');
//	t = document.getElementById('callPhone');
//	t && (t.style.top = (3.34 - immersed / 100) + 'rem');
	//t=document.getElementById('map');
	//t&&(t.style.marginTop=immersed+'px');

})(window);