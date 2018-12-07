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
		incomeId: "",
		nickName:"",
		consumptionName:"",
		status:"",
		incomeDetails: {
		},
		payType: -1
	},
	filters: {
		floatVal: function(value) {
			if(this.consumptionName=="支出"){
				value = this.incomeDetails.actualPrice;
			}
			if(value == "") {
				value = "0.00";
			} else {
				value = Number(value).toFixed(2);
			}
			return isNaN(value)?'0.00':value;
		},
		showRate:function(shareRate,cardRate){
			if(shareRate==""){
				return cardRate;
			}else{
				return shareRate;
			}
		}
	},
	computed:{
		payName: function(){
			try{
			  this.payType = this.payType * 1
				if(~~this.payType==0) return '微信';
				if(~~this.payType==1) return '支付宝';
				if(~~this.payType==2) return '储值卡支付';
				if(~~this.payType==3) return '钱包余额支付';
			}catch(e){
				return "";
			}
			return "";
		}
	},
	methods: {

	}
});
mui.plusReady(function() {
	/**
	 * 获取记录Id
	 */
	vueCtl.incomeId = plus.webview.currentWebview().incomeId;
	vueCtl.status = plus.webview.currentWebview().status;
	vueCtl.title = plus.webview.currentWebview().headerTitle;
	vueCtl.consumptionName = plus.webview.currentWebview().consumptionName;
	/**
	 * 获取用户信息
	 */
	vueCtl.nickName = app.getState().userInfo.nickName;
	plus.nativeUI.showWaiting(app.loadingWords);
	/**
	 * 获取消费详情信息
	 */
	app.orderDetails(vueCtl.incomeId, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info==""){
				document.getElementById("muiContent").style.display="";
			}else{
				vueCtl.incomeDetails = data.info;
				vueCtl.payType = vueCtl.incomeDetails.payType;
				document.getElementById("muiContent").style.display="";
			}
			
		} else {
			document.getElementById("muiContent").style.display="";
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
});