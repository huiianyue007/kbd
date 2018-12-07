// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		navType: "newCard",
		shopid:""

	},
	filters: {

	},
	methods: {

	}
});
mui.plusReady(function() {
//	plus.webview.getWebviewById("qrscan").close();
	/**
	 * 获取商家信息
	 */
	vueCtl.shopid = plus.webview.currentWebview().shopid;
	/**
	 * 打开购卡页面
	 */
	app.tapEvent("becomeCard", function(e) {
		var param = {
			shopid: vueCtl.shopid,
			status: "1"
		}
		app.signinOpen("merchant/merchantCard", "../merchant/merchantCard.html", null, param);
	});
});