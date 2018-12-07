mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '',
		forgetPwd: {
			isUser: "0",
			mobile:"",
			password:"",
			verifyCode:""
		}
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
	
	vueCtl.title=plus.webview.currentWebview().title;
	/**
	 * 完成修改密码
	 */
	document.getElementById("forgetPwdBtn").addEventListener("tap",function(){
		if(!validateForm()) return;
		// 调用修改密码
		app.forgetPwd(vueCtl.forgetPwd, function(data) {
			// 修改成功没有结果返回
			if (data&&data.status == app.STATUS_SUCCESS) {
				// 清除正在登录的标志
				localStorage.removeItem('logining');
				// 关闭当前界面
				mui.toast("修改成功");
				plus.webview.currentWebview().close();
			}else{
				mui.toast(data.info);
			}
		});
	});
	/**
	 * 获取验证码
	 */
	document.getElementById("randBtn").addEventListener("tap",function(){
		if(vueCtl.forgetPwd.mobile==""){
			mui.toast("请输入手机号");
			return;
		}else if(vueCtl.forgetPwd.mobile.length!=11){
			mui.toast("手机号格式不正确，请重新输入");
			return;
		}else if(/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(vueCtl.forgetPwd.mobile)==false){
			mui.toast("手机号格式不正确，请重新输入");
			return;
		}
		app.sendRand(vueCtl.forgetPwd,function(result){
			if(result && result.status == app.STATUS_SUCCESS) {
				mui.toast("验证码发送成功");
			} else {
				mui.toast(result.info);
			}
		});
	});
});

function validateForm(){
	if(vueCtl.forgetPwd.mobile==null||trim(vueCtl.forgetPwd.mobile)==""){
		app.toast('手机号不能为空')
		return false;
	}
	if(vueCtl.forgetPwd.password==null||trim(vueCtl.forgetPwd.password)==""){
		app.toast('密码不能为空')
		return false;
	}
	if(vueCtl.forgetPwd.verifyCode==null||trim(vueCtl.forgetPwd.verifyCode)==""){
		app.toast('验证码不能为空')
		return false;
	}
	if(vueCtl.errors!=null&&vueCtl.errors.any()){
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
	return true;
}
