mui.init();
var flag = true;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '提现记录',
		type: "0",
		withdrawcashs: []
	},
	filters: {
		floatVal: function(value) {
			value = Number(value).toFixed(2);
			return value;
		}
	},
	methods: {
		openWindow: function(moneyid) {
			var param = {
				moneyid:moneyid
			};
			app.signinOpen("user/wallet/withdrawcashDetails", "withdrawcashDetails.html",null,param);
		}
	}
});
mui.plusReady(function() {
	plus.nativeUI.showWaiting(app.loadingWords);
	if(plus.device.model=="iPhoneX"){
		document.getElementById("securityArea").style.display="";
	}
	/**
	 * 获取提现记录信息
	 */
	app.getwithdrawcash(function(data) {
		mui.later(function(){plus.nativeUI.closeWaiting();},250);
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info == "" || data.info.length == 0) {
				document.getElementById("emptyData").style.display = "";
			} else {
				vueCtl.withdrawcashs=data.info;
				document.getElementById("withdrawcashs").style.display = "";
			}
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
});