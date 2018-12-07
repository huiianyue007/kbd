mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '账号密码登录',
		linkTitle: '验证码登录',
		loginType: 'pwd',
		login: {
			isUser: "0"
		},
		loaded: false
	},
	methods: {
		// 更换登录面板
		changeLoginPanel: function() {
			var temp = this.title;
			this.title = this.linkTitle;
			this.linkTitle = temp;
			// 登录状态
			this.loginType = this.loginType === 'pwd' ? 'random' : 'pwd';
		},
		verifyCode: function(param) {
			plus.nativeUI.showWaiting('发送中...')
			vueCtl.login.status = 0;
			app.sendRand(vueCtl.login, function(data) {
				mui.later(function(){plus.nativeUI.closeWaiting();},250);
				if(data && data.status == app.STATUS_SUCCESS) {
					app.toast("验证码发送成功");
				} else {
					app.toast(data.info);
				}
			});
		}
	}
});

mui.plusReady(function() {
	
	iosBackEvent(function(){
		// ios滑动关闭页面
        if(plus.webview.getWebviewById("user/home")) {
			plus.webview.getWebviewById("user/home").evalJS("initInfo()");
		}
	})
	
	resetMap();
	//登录
	document.getElementById("loginBtn").addEventListener("tap", function() {
		if(!validateForm()) return;
    if (!/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(vueCtl.login.mobile) && !(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/).test(vueCtl.login.mobile)) {
      mui.toast('请输入正确的手机号')
      return false
    }
		//客户端标识推送对象
		var settings = app.getSettings() || {};
		var clientInfo = settings.clientInfo || {}
		
		if(clientInfo.clientid==null||clientInfo.clientid==""||clientInfo.clientid.toLowerCase()=="null"){
			 clientInfo = plus.push.getClientInfo();
			 settings.clientInfo = clientInfo;
			 app.setSettings(settings)
		}
		vueCtl.login.clientid = clientInfo.clientid;
		vueCtl.login.isIos = mui.os.ios ? 1 : 0;

		// 调用登录接口
		app.login(vueCtl.login, vueCtl.loginType, function(result) {
			if(result=='error'){
				mui.toast("数据加载失败...")
				return;
			}		
			// 登录成功没有结果返回
			if(!result || result == undefined || result == null) {
				// 清除正在登录的标志
				localStorage.removeItem('logining');
				// 保存登录信息
				// 登录成功后获得用户信息
				app.getUserInfo(function(data) {
					if(data && data.status == app.STATUS_SUCCESS) {
						// 将用户信息存放到本地
						var state = app.getState();
						state.userInfo = data.info;
						app.setState(state);
						app.toast("登录成功~");

						setTimeout(function() {
							if(plus.webview.getWebviewById("user/home")) {
								plus.webview.getWebviewById("user/home").evalJS("initInfo()");
							}
							// 关闭当前界面
							plus.webview.getWebviewById('login').hide()
							plus.webview.getWebviewById('login').close();
						}, 200);
					}
				});
			} else {
				// 清除正在登录的标志
				localStorage.removeItem('logining');
				app.toast(result.info);
			}
		});
	});
	/**
	 * 获取验证码
	 */
	document.getElementById("randBtn").addEventListener("tap", function() {
	  
		if(vueCtl.login.mobile == "") {
			mui.toast("请输入手机号");
			return;
		} else if(!/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(vueCtl.login.mobile) && !(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/).test(vueCtl.login.mobile)) {
			mui.toast("请输入正确的手机格式");
			return;
		}
		vueCtl.login.status = "0";
		app.sendRand(vueCtl.login, function(result) {
			if(result && result.status == app.STATUS_SUCCESS) {
				app.toast("验证码发送成功");
			} else {
				app.toast(result.info);
			}
		});
	});
	//点击“立即注册”
	document.getElementById("register").addEventListener("tap", function() {
		app.normalOpen("user/register", "register.html");
	});
	//点击“忘记密码”
	document.getElementById("forgetPwd").addEventListener("tap", function() {
		var param = {
			title: "忘记密码"
		}
		app.normalOpen("user/forgetpwd", "forgetpwd.html", null, param);
	});
});

function validateForm() {
	if(vueCtl.login.mobile == null || trim(vueCtl.login.mobile) == "") {
		app.toast('手机号不能为空')
		return false;
	}
	if(vueCtl.loginType == 'random') {
		if(vueCtl.login.verifyCode == null || trim(vueCtl.login.verifyCode) == "") {
			app.toast('验证码不能为空')
			return false;
		}
	} else {
		if(vueCtl.login.password == null || trim(vueCtl.login.password) == "") {
			app.toast('密码不能为空')
			return false;
		}
	}
	if(vueCtl.errors != null && vueCtl.errors.any()) {
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
	return true;
}

function resetMap() {
	if(plus.webview.getWebviewById("maps")){
		plus.webview.getWebviewById("maps").setStyle({
			left: '0px'
		})
	}
}