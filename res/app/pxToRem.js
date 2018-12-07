(function() {
	function resizeBaseFontSize() {
		var rootHtml = document.documentElement,
			deviceWidth = rootHtml.clientWidth;
		rootHtml.style.fontSize = deviceWidth / 48 + "px";
	}
	resizeBaseFontSize();
	window.addEventListener("resize", resizeBaseFontSize, false);
	window.addEventListener("orientationchange", resizeBaseFontSize, false);
})();