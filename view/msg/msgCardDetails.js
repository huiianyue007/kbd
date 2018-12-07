mui.init();
var flag = true;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		type: "0",
		incomeId: "",
		nickName:"",
		incomeDetails: {
		},
		payType: -1
	},
	filters: {
		floatVal: function(value) {
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
				if(~~this.payType==0) return '微信';
				if(~~this.payType==1) return '支付宝';
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
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("msg/msg_card_sub")){
			plus.webview.getWebviewById("msg/msg_card_sub").evalJS("initInfo()");
		}
	})
	/**
	 * 获取记录Id
	 */
	vueCtl.incomeId = plus.webview.currentWebview().incomeId;
	/*
	 * 获取用户信息
	 */
	plus.nativeUI.showWaiting(app.loadingWords);
	/**
	 * 获取消费详情信息
	 */
	app.orderDetails(vueCtl.incomeId, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info==""){
				
			}else{
				vueCtl.incomeDetails = data.info;
				vueCtl.payType = vueCtl.incomeDetails.payType;
			}
			
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
	/**
	 * 重写返回
	 */
	mui.back = function(){
		if(plus.webview.getWebviewById("msg/msg_card_sub")){
			plus.webview.getWebviewById("msg/msg_card_sub").evalJS("initInfo()");
		}
		plus.webview.currentWebview().close();
	}
});