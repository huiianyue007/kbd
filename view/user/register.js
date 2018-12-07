mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '注册',
		register: {
			isUser: "0"
		},
		randomBtnVal: "点击获取"
	},
	methods: {
		// 更换登录面板
		changeLoginPanel:function(){
			var temp = this.title;
			this.title = this.linkTitle;
			this.linkTitle = temp;
			// 登录状态
			this.loginType = this.loginType === 'pwd'?'random':'pwd';
		}
	}
});

mui.plusReady(function(){
	//注册
	document.getElementById("registerBtn").addEventListener("tap",function(){
		if(!validateForm()) return;
		if (!/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(vueCtl.register.mobile)) {
      mui.toast('请输入正确的手机号')
      return false
    }
		//客户端标识推送对象
		var settings = app.getSettings()||{};
		var clientInfo = settings.clientInfo||{}
		if(clientInfo.clientid==null||clientInfo.clientid==""||clientInfo.clientid.toLowerCase()=="null"){
			 clientInfo = plus.push.getClientInfo();
			 settings.clientInfo = clientInfo;
			 app.setSettings(settings)
		}
		vueCtl.register.clientid  = clientInfo.clientid;
		vueCtl.register.isIos = mui.os.ios?1:0;
		
		// 调用注册接口
		app.register(vueCtl.register, function(result) {
			// 注册成功没有结果返回
			if (!result||result == undefined||result == null) {
				// 清除正在登录的标志
				localStorage.removeItem('logining');
				// 保存注册
				// 注册成功后获得用户信息
				app.getUserInfo(function(data) {
					if (data&&data.status == app.STATUS_SUCCESS) {
						// 将用户信息存放到本地
						var state = app.getState();
						state.userInfo = data.info;
						app.setState(state);
						mui.toast("注册成功~");
						app.signinOpen("user/compinfo", "compinfo.html");
					}
				});
			}else{
				// 清除正在登录的标志
				localStorage.removeItem('logining');
				mui.toast(result.info);
			}
		});
	});
	/**
	 * 获取验证码
	 */
	document.getElementById("randBtn").addEventListener("tap",function(){
		if(vueCtl.register.mobile==""){
			mui.toast("请输入手机号");
			return;
		}else if(!/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(vueCtl.register.mobile)){
			mui.toast("请输入正确的手机格式");
			return;
		}
		app.sendRand(vueCtl.register,function(result){
			if(result && result.status == app.STATUS_SUCCESS) {
				mui.toast("验证码发送成功");
			} else {
				mui.toast(result.info);
			}
		});
	});
	/**
	 * 用户协议
	 */
	app.tapEvent("userRules",function(){
		app.normalOpen("user/userRules","userRules.html",null,null);
	});
});

function validateForm(){
	if(vueCtl.register.mobile==null||trim(vueCtl.register.mobile)==""){
		app.toast('手机号不能为空')
		return false;
	}
	if(vueCtl.register.password==null||trim(vueCtl.register.password)==""){
		app.toast('密码不能为空')
		return false;
	}
	if(vueCtl.register.verifyCode==null||trim(vueCtl.register.verifyCode)==""){
		app.toast('验证码不能为空')
		return false;
	}
	if(vueCtl.errors.any()){
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
		
	return true;
}