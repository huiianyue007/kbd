// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		showImg:"1",
		orderDetails: {

		}
	}
});
mui.plusReady(function() {
	/**
	 * 计算滚动条的高度
	 */
	document.getElementById("scroll_div").height=(screen.height-250)+"px";
	/**
	 * 关闭购卡支付页面
	 */
	if(plus.webview.getWebviewById("pay/cardSelling")) {
		plus.webview.getWebviewById("pay/cardSelling").hide();
		plus.webview.getWebviewById("pay/cardSelling").close();
	}
	/**
	 * 关闭充值卡支付页面
	 */
	if(plus.webview.getWebviewById("pay/storedCardPay")) {
		plus.webview.getWebviewById("pay/storedCardPay").hide();
		plus.webview.getWebviewById("pay/storedCardPay").close();
	}
	/**
	 * 关闭充值支付页面
	 */
	if(plus.webview.getWebviewById("pay/rechargePay")) {
		plus.webview.getWebviewById("pay/rechargePay").hide();
		plus.webview.getWebviewById("pay/rechargePay").close();
	}
	/**
	 * 关闭购卡详情页面
	 */
	if(plus.webview.getWebviewById("merchant/cardSellingDetails")) {
		plus.webview.getWebviewById("merchant/cardSellingDetails").hide();
		plus.webview.getWebviewById("merchant/cardSellingDetails").close();
	}
	/**
	 * 关闭储值卡详情页面
	 */
	if(plus.webview.getWebviewById("user/card/memcardDetail")) {
		plus.webview.getWebviewById("user/card/memcardDetail").hide();
		plus.webview.getWebviewById("user/card/memcardDetail").close();
	}
	/**
	 * 关闭蹭卡、购卡页面
	 */
	if(plus.webview.getWebviewById("merchant/merchantCard")) {
		plus.webview.getWebviewById("merchant/merchantCard").hide();
		plus.webview.getWebviewById("merchant/merchantCard").close();
	}
	/**
	 * 关闭商家列表页面
	 */
	if(plus.webview.getWebviewById("merchant/merchant")) {
		plus.webview.getWebviewById("merchant/merchant").hide();
		plus.webview.getWebviewById("merchant/merchant").close();
	}
	var orderid = plus.webview.currentWebview().orderid;
	var payType = plus.webview.currentWebview().payType;
	var isCardShare = plus.webview.currentWebview().isCardShare;
	if(payType=="购卡"){
		vueCtl.showImg="1";
	}
	if(isCardShare=="0"){
		vueCtl.showImg="1";
	}
	var cardid = plus.webview.currentWebview().caid;
	app.orderDetails(orderid, function(data) {
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.orderDetails = data.info;
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
	//完成
	app.tapEvent("finishBtn", function() {
		var param = {
			cardId: cardid,
			type:"openWindow"
		};
		app.signinOpen("user/card/memcardDetail", "../user/card/memcardDetail.html", null, param);
	});
	mui.back = function() {
		var param = {
			cardId: cardid,
			type:"openWindow"
		};
		app.signinOpen("user/card/memcardDetail", "../user/card/memcardDetail.html", null, param);
	}
	//点击图片，开启共享
	app.tapEvent("payImg", function() {
		var param = {
			cardId: cardid,
			type:"openWindow"
		};
		app.signinOpen("user/card/memcardDetail", "../user/card/memcardDetail.html", null, param);
	});
});