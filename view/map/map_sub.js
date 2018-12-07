mui.init();
// 刷新用户位置
function userLocation(){
	plus.webview.getWebviewById("maps").evalJS("userLocation()");
}
// 打开二维码扫描页面
function qrscan(){
	plus.webview.getWebviewById("maps").evalJS('scanCodePay()');
}
// 打开我的页面
function meinfo(){
	mui.openWindow({
		id: 'login',
		url: '../user/login.html'
	});
}