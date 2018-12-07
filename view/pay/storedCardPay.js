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
		isUser: "0",
		money: "",
		isCardShare:"",
		showBtn:"1",
		remindType: "0",
		payType: "0",
		cardDetails: {},
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
		calaVal: function(cardAmount,cardRate) {
			var temp = Number(cardAmount)*Number(cardRate)/100;
			return temp|0;
		},
		imgSrc: function(str) {
		  if (!str) return false
      return 'http://payp.kabuduo.cn/img/s2/'+ (str * 1).toFixed(1) +'.png'
		}

	},
	watch: {
	    money: function (newMoney,oldMoney) {
		    	if(this.money>this.cardDetails.consummerAmount){
		    		this.remindType="1";
		    		this.money = oldMoney;
		    		document.getElementById("moneyIpt").blur();
		    	}
	    }
	},
	computed:{
		payTypeId:function(){
			return ~~this.payType == 1?'alipay':'wxpay'
		},
		payMoney: function(){
			return (Number(this.money)*Number(this.cardDetails.cardRate)/10).toFixed(2);
		},
		discountMoney: function(){
			return (this.money-this.payMoney).toFixed(2);
		}
	},
	methods: {
		openWindow: function(id) {
			app.normalOpen("user/card/memcardDetail", "memcardDetail.html")
		},
		focusIpt: function(){
			this.money = '';
		}
	}
});
mui.plusReady(function() {
	if(plus.device.model=="iPhoneX"){
		document.getElementById("payButton").style.bottom="0.66rem";
	}
	/**
	 * 获取商家信息
	 */
	vueCtl.shopid = plus.webview.currentWebview().shopid;
	vueCtl.ucid = plus.webview.currentWebview().ucid;
	if(plus.webview.currentWebview().amount){
		vueCtl.money=plus.webview.currentWebview().amount;
	}
	if (plus.webview.currentWebview().staffid) {
	  vueCtl.staffid = plus.webview.currentWebview().staffid
	}
	/**
	 * 根据虚拟键盘的弹出来显示或隐藏按钮
	 */
	var wHeight = window.innerHeight; //获取初始可视窗口高度
	window.onresize = function(){
		var hh = window.innerHeight; //当前可视窗口高度
		var viewTop = window.scrollTop; //可视窗口高度顶部距离网页顶部的距离
		if(wHeight > hh) { //可以作为虚拟键盘弹出事件
			vueCtl.showBtn="0";
		} else { //可以作为虚拟键盘关闭事件
			vueCtl.showBtn="1";
		}
	};
	/**
	 * 充值
	 */
	app.tapEvent("recharge", function() {
		var param = {
			shopid: vueCtl.shopid,
			ucid: vueCtl.ucid
		}
		app.signinOpen("pay/rechargePay", "rechargePay.html", null, param);
	});
	/**
	 * 获取共享卡的详情信息
	 */
	app.cardDetails(vueCtl.ucid, vueCtl.isUser, function(data) {
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.cardDetails = data.info;
			vueCtl.isCardShare = data.info.isCardShare;
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
		vueCtl.loaded = true;
	});
	/**
	 * 点击重新输入
	 */
	app.tapEvent("cancel", function() {
		vueCtl.remindType = "0";
		// 清空文本
		vueCtl.money=0;
		
		document.getElementById('moneyIpt').blur();
	});
	/**
	 * 点击购卡
	 */
	app.tapEvent("success", function() {
		vueCtl.remindType = "0";
//		var param = {
//			shopid: vueCtl.shopid,
//			status: "1"
//		}
//		app.signinOpen("merchant/merchantCard", "../merchant/merchantCard.html", null, param);
	});
	/**
	 * 点击支付
	 */
	app.tapEvent("pay", function() {
		var temp = document.getElementById("moneyIpt").value;
		if(temp==""||Number(temp)==0||Number(temp)<0){
			mui.toast("请输入消费金额");
			return;
		}
		var orderParam = {
			amount: temp,
			cardid: vueCtl.ucid,
			staffid: vueCtl.staffid
		}
		app.createStoredCardOrder(orderParam, function(data) {
			if(data && data.status == app.STATUS_SUCCESS) {
				var orderid = data.info;
				// 跳转到支付成功页面
				var param = {
					orderid:orderid,
					payType:"储值卡支付",
					caid:vueCtl.ucid,
					isCardShare:vueCtl.isCardShare
				}
				//paystoredsuccess
				app.normalOpen("pay/paycardsuccess", "paycardsuccess.html", null, param);
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);
			}
		})
	});
});