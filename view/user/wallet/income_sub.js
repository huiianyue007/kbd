mui.init();
var flag = true;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '',
		type: "0",
		status: "",
		emptyTitle: "",
		tipTitle:"",
		headerTitle:"",
		consumptionName:"",
		dataLength: "",
		income: [],
		loaded: false
	},
	filters: {
		floatVal: function(value) {
			value = Number(value).toFixed(2);
			return value;
		}
	},
	methods: {
		openWindow: function(incomeId) {
			var param = {
				incomeId: incomeId,
				status:this.status,
				headerTitle:this.headerTitle,
				consumptionName:this.consumptionName
			};
			app.signinOpen("user/wallet/incomeDetails", "incomeDetails.html", null, param);
		}
	}
});
mui.plusReady(function() {
	if(plus.device.model=="iPhoneX"){
		document.getElementById("securityArea").style.display="";
	}
	/**
	 * 获取状态信息
	 */
	vueCtl.status = plus.webview.currentWebview().status;
	if(vueCtl.status == "1") {
		vueCtl.emptyTitle = "目前暂无蹭卡记录";
		vueCtl.title = "蹭卡记录";
		vueCtl.tipTitle="蹭卡消费";
		vueCtl.headerTitle="蹭卡订单";
		vueCtl.consumptionName="支出";
	}else{
		vueCtl.emptyTitle = "目前暂无收入记录";
		vueCtl.title = "收入明细";
		vueCtl.tipTitle="收入明细";
		vueCtl.headerTitle="收入详情";
		vueCtl.consumptionName="收入";
	}
	plus.nativeUI.showWaiting(app.loadingWords);
	/**
	 * 获取提现记录信息
	 */
	app.orderListShare(vueCtl.status, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		vueCtl.loaded = true;
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info == "" || data.info.length == 0) {
			} else {
				vueCtl.dataLength = data.info.length;
				vueCtl.income = data.info;
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