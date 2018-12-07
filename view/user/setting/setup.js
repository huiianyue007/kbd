mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '设置',
		mobile: "",
		bankName: "",
		versionNum:"",
		register: {
			isUser: "0"
		}
	},
	methods: {

	}
});
mui.plusReady(function() {
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("user/home")) {
			plus.webview.getWebviewById("user/home").evalJS("initInfo()");
		}
	})
	
	vueCtl.versionNum=plus.runtime.version;
	initInfo();

	//点击“退出登录”
	document.getElementById("exitBtn").addEventListener("tap", function() {
		localStorage.removeItem("$state");
		//此处页面返回不对，应该返回到首页面并且是未登录状态
		//		app.normalOpen("login", "../login.html");

		plus.webview.getLaunchWebview().show();

		if(plus.webview.getWebviewById("user/home")) {
			plus.webview.getWebviewById("user/home").evalJS("initInfo()");
		}
	});
	//点击“手机号码”
	document.getElementById("setPhone").addEventListener("tap", function() {
		app.signinOpen("setPhone", "setPhone.html");
	});
	//点击“修改登录密码”
	document.getElementById("changeLoginpwd").addEventListener("tap", function() {
		var param = {
			title:"修改登录密码"
		}
		app.signinOpen("forgetpwd", "../forgetpwd.html",null,param);
	});
	//点击“修改提现密码”
	document.getElementById("changeMoneypwd").addEventListener("tap", function() {
		// 判断用户是否已绑定银行卡
		if(vueCtl.bankName==null||vueCtl.bankName==""){
			app.signinOpen("user/wallet/bankInfo", "../wallet/bankInfo.html");
		}else{
			// 身份认证页面
			var param = {
				htmlId:"user/wallet/cashpassword",
				htmlURL:"wallet/cashpassword.html"
			}
			app.signinOpen("user/authentication", "../authentication.html",null,param);
		}
		
//		app.signinOpen("user/wallet/cashpassword", "../wallet/cashpassword.html");
	});
	//完善个人信息
//		document.getElementById("updateUserInfo").addEventListener("tap", function() {
//			app.signinOpen("user/compinfo", "../compinfo.html");
//		});
});

function initInfo() {
	//获取用户信息
	app.getUserInfo(function(result) {
		if(result && result.status == app.STATUS_SUCCESS) {
			// 将用户信息存放到本地
			var state = app.getState();
			state.userInfo = result.info;
			/**
			 * 设置用户手机信息
			 */
			vueCtl.mobile = result.info.mobile;
			vueCtl.bankName = result.info.bankName;
			
			app.setState(state);
		}
	});

}