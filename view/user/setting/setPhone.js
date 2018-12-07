mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '手机号',
		mobile: "",
		setType: "before",
		btnTitle: "更换手机号码",
		phoneInfo: {
			isUser: "0"
		},
		newPhone: {
			isUser: "0",
			mobile:""
		}
	},
	methods: {

	}
});

mui.plusReady(function() {
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("user/setting/setup")){
			plus.webview.getWebviewById("user/setting/setup").evalJS("initInfo()");
		}
	})
	
	//获取用户信息
	var userInfo = app.getState().userInfo;
	/**
	 * 设置用户手机信息
	 */
	vueCtl.mobile = userInfo.mobile;
	vueCtl.phoneInfo.mobile = userInfo.mobile;
	//点击“更换手机号码”
	document.getElementById("setPhoneBtn").addEventListener("tap", function() {
		if(vueCtl.setType == "before") {
			app.sendRand(vueCtl.phoneInfo, function(data) {
				if(data && data.status == app.STATUS_SUCCESS) {
					vueCtl.title = "验证手机";
					vueCtl.btnTitle = "下一步";
					vueCtl.setType = "verifyCode";
				} else {
					if(data=='error'){
						mui.toast("数据加载失败...")
						return;
					}
					mui.toast(data.info);
				}

			});
		} else if(vueCtl.setType == "verifyCode") {
			//获取验证码信息
			var verifyCode = document.getElementById("verifyCodeIpt").value;
			app.checkVerifyCode(verifyCode, vueCtl.phoneInfo.mobile, function(data) {
				if(data && data.status == app.STATUS_SUCCESS) {
					vueCtl.title = "更换手机号码";
					vueCtl.btnTitle = "更换手机号码";
					vueCtl.setType = "setPhone";
				} else {
					mui.toast("验证码错误，请重新输入");
				}
			});

		} else if(vueCtl.setType == "setPhone") {
			if(!validateForm()) return;
			app.changePhone(vueCtl.newPhone, function(data) {
				if(data && data.status == app.STATUS_SUCCESS) {
					//修改本地存储中的手机号码
					userInfo.mobile = vueCtl.newPhone.mobile;
					app.getState().userInfo = userInfo;
					app.setState(app.getState());
					
					if(plus.webview.getWebviewById("user/setting/setup")){
						plus.webview.getWebviewById("user/setting/setup").evalJS("initInfo()");
					}
					
					//关闭当前页面
					plus.webview.currentWebview().close();
				} else {
					if(data=='error'){
						mui.toast("数据加载失败...")
						return;
					}
					mui.toast(data.info);
				}
			});
		}
	});
	/**
	 * 获取验证码
	 */
	document.getElementById("randBtn").addEventListener("tap", function() {
		app.sendRand(vueCtl.newPhone, function(data) {
			if(data && data.status == app.STATUS_SUCCESS) {
				mui.toast("验证码发送成功");
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);
			}
		});
	});
	/**
	 * 获取验证码
	 */
	document.getElementById("randBtn2").addEventListener("tap", function() {
		app.sendRand(vueCtl.newPhone, function(data) {
			if(data && data.status == app.STATUS_SUCCESS) {
				mui.toast("验证码发送成功");
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);
			}
		},document.getElementById("randBtn2"));
	});
	/**
	 * 重写返回功能
	 */
	mui.back = function() {
		if(vueCtl.setType == "before") {
			if(plus.webview.getWebviewById("user/setting/setup")){
				plus.webview.getWebviewById("user/setting/setup").evalJS("initInfo()");
			}
			plus.webview.currentWebview().close();
		} else if(vueCtl.setType == "verifyCode") {
			vueCtl.title = "手机号";
			vueCtl.btnTitle = "更换手机号码";
			document.getElementById("verifyCodeIpt").value = "";
			vueCtl.setType = "before";
		} else if(vueCtl.setType == "setPhone") {
			vueCtl.title = "验证手机";
			vueCtl.btnTitle = "下一步";
			vueCtl.newPhone.mobile = "";
			vueCtl.newPhone.verifyCode = "";
			vueCtl.setType = "verifyCode";
		}
	}
});
function validateForm(){
	if(vueCtl.newPhone.mobile==null||trim(vueCtl.newPhone.mobile)==""){
		app.toast('手机号不能为空')
		return false;
	}
	if(vueCtl.errors!=null&&vueCtl.errors.any()){
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
	return true;
}