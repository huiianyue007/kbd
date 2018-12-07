mui.init();
var flag = true;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		type: "0",
		bankcard: {
			uid: "",
			bankName: "",
			bankNum: "",
			bankImg:""
		}
	},
	filters: {
		changeVal: function(value) {
			value = value+"";
			var tempStart = value.substring(0,4);
			var tempEnd = value.substring(value.length-4);
			var temp=tempStart+"**********"+tempEnd;
			return temp;
		}
	},
	methods: {}
});
mui.plusReady(function() {
	if(plus.webview.getWebviewById("user/authentication")){
		plus.webview.getWebviewById("user/authentication").hide();
		plus.webview.getWebviewById("user/authentication").close();
	}
	initInfo();
	
	/**
	 * 进入身份证验证
	 */
	app.tapEvent("changeBank",function(){
		// 身份认证页面
		var param = {
			htmlId:"user/wallet/bankInfoUpdate",
			htmlURL:"wallet/bankInfoUpdate.html"
		}
		app.signinOpen("user/authentication", "../authentication.html",null,param);
	});
});

function initInfo(){
	plus.nativeUI.showWaiting(app.loadingWords);
	/**
	 * 获取银行卡信息
	 */
	app.bankInfo(function(data) {
		mui.later(function(){plus.nativeUI.closeWaiting();},250);
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.bankcard = data.info;
			vueCtl.bankcard.bankImg=app.getState().userInfo.headImgUrlPress;
			document.getElementById("muiContent").style.display="";
		} else {
			document.getElementById("muiContent").style.display="";
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
}
