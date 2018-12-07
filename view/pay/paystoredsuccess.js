// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		shopid:"",
		orderDetails: {

		}
	},
	filters: {
		calaVal:function(originalPrice,actualPrice){
			try{
				var temp = Number(originalPrice)-Number(actualPrice);
				temp = temp.toFixed(2);
				if(isNaN(temp)) temp=0;
				return temp||0;
			}catch(e){
				return 0;
			}
		}
	}
});
mui.plusReady(function() {
	
	/**
	 * 获取商家id
	 */
	vueCtl.shopid = plus.webview.currentWebview().shopid;
	/**
	 * 关闭蹭卡支付页面
	 */
	if(plus.webview.getWebviewById("pay/rubCardPay")) {
		plus.webview.getWebviewById("pay/rubCardPay").hide();
		plus.webview.getWebviewById("pay/rubCardPay").close();
	}
	
	/**
	 * 关闭充值支付页面
	 */
	if(plus.webview.getWebviewById("pay/rechargePay")) {
		plus.webview.getWebviewById("pay/rechargePay").hide();
		plus.webview.getWebviewById("pay/rechargePay").close();
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
	app.tapEvent("finishBtn",function(){
		plus.webview.currentWebview().close();
	});
	//点击图片，进入到购买卡的页面
	app.tapEvent("payImg",function(){
		var param = {
			shopid: vueCtl.shopid,
			status: "1"
		}
		app.signinOpen("merchant/merchantCard", "../merchant/merchantCard.html", null, param);
	});
});