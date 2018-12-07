// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		shopid: "",
		ucid: "",
		isUser: "1",
		discountMoney: "0.00",
		provinceMoney: "0.00",
		cardDetails: {"id":"","uid":"","shopid":"1067999003c3471ba3b7d3e5b7fd0b98","caid":"","shopName":"测试05081","cardName":"","cardCount":"20","cardFaceAmount":"","cardAmount":500,"cardRate":5,"shareRate":"","shareAmountIn":"","shareAmountOriginal":"","shareStartTime":"","shareEndTime":"","shareTime":"","shareEarnRate":"","isShelf":"0","isCardShare":"","payType":"","totalUserCardChargeCount":"","nickName":"","age":"","sex":"","headImgUrl":"","headImgUrlPress":"","isCardCount":"","isShareCard":""},
		loaded: false
	},
	filters: {
		intVal: function(value) {
			value = value + "";
			return value.split('.')[0] || 10;
		},
		floatVal: function(value) {
			value = value + "";
			return value.split('.')[1] || 0;
		},
		calaVal:function(payMoney,cardRate){
			var temp = Number(payMoney)/Number(cardRate*0.1)-Number(payMoney);
			temp = temp.toFixed(2);
			return temp;
		},
		imgSrc: function(str) {
		  if (!str) return false
      return 'http://payp.kabuduo.cn/img/s2/'+ (str * 1).toFixed(1) +'.png'
		}

	},
	methods: {
		openWindow: function(id) {
			console.log(id);
			app.normalOpen("user/card/memcardDetail", "memcardDetail.html")
		}
	}
});
mui.plusReady(function() {
	/**
	 * 关闭页面
	 */
	//	if(plus.webview.getWebviewById("merchant/merchantCard")){
	//		plus.webview.getWebviewById("merchant/merchantCard").close();
	//	}
	/**
	 * 获取商家信息
	 */
	vueCtl.shopid = plus.webview.currentWebview().shopid;
	vueCtl.ucid = plus.webview.currentWebview().ucid;
	if(plus.device.model=="iPhoneX"){
		document.getElementById("immediateCard").style.bottom="44px";
	}
//	/**
//	 * 获取共享卡的详情信息
//	 */
	app.cardDetails(vueCtl.ucid, vueCtl.isUser, function(data) {
		vueCtl.loaded = true;
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.cardDetails = data.info;
			console.log(JSON.stringify(vueCtl.cardDetails))
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
	/**
	 * 支付方式的选择
	 */
	mui(".payType").on("tap","li",function(){
		/**
		 * 改变样式
		 */
		mui(".payType .payTypeImg").each(function(){
			this.setAttribute('src','../../res/img/common/check.png');
		});
		this.setAttribute('src','../../res/img/common/checked.png');
	});
	/**
	 * 购买储值卡页面
	 */
	app.tapEvent("immediateCardBtn",function(){
		var param = {
				shopid: vueCtl.shopid,
				ucid: vueCtl.ucid,
				shopname: vueCtl.cardDetails.shopName
			}
			app.signinOpen("pay/cardSelling", "../pay/cardSelling.html", null, param);
	});
});