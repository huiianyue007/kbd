mui.init();
var flag = true;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		type: "0",
		withdrawcashId:"",
		withdrawcash: {
			
		}
	},
	filters: {
		floatVal: function(value) {
			value = Number(value).toFixed(2);
			return value;
		},
		calaVal:function(cashMoney,actualMoney){
			var temp = Number(cashMoney)-Number(actualMoney);
			temp =temp.toFixed(2);
			return temp;
		}
	},
	methods: {
		
	}
});
mui.plusReady(function() {
	/**
	 * 获取提现记录Id
	 */
	vueCtl.withdrawcashId = plus.webview.currentWebview().moneyid;
	plus.nativeUI.showWaiting(app.loadingWords);
	/**
	 * 获取提现记录信息
	 */
	app.getwithdrawcashDetails(vueCtl.withdrawcashId,function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info == "") {
				document.getElementById("withdrawcash").style.display = "";
			} else {
				vueCtl.withdrawcash=data.info;
				document.getElementById("withdrawcash").style.display = "";
			}
			
		} else {
			document.getElementById("withdrawcash").style.display = "";
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
});