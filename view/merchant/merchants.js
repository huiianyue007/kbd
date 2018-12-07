// 初始化mui
mui.init({
	subpages:[{
		id: 'merchant/merchants_sub',
		url:'merchants_sub.html',
		styles: {
			top: (immersed+44)+"px",
			bottom: "0px"
		}
	}]
});
mui.plusReady(function() {
	var ws = plus.webview.currentWebview();
	var longitude = ws.longitude;
	var latitude = ws.latitude;
//var longitude = '116.28926';
//var latitude = '40.09842';
	
	mui.later(function(){
		if(plus.webview.getWebviewById("merchant/merchants_sub")){
			plus.webview.getWebviewById("merchant/merchants_sub").evalJS("setParam('"+JSON.stringify({"longitude":longitude,"latitude":latitude})+"')");
		}		
	},100);
})
