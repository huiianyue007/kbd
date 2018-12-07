mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '更换银行卡',
		bankInfo: {
			id: "",
			bankName: "",
			bankCode: "",
			bankNum: "",
			realName: "",
			identityCard: ""
		}
	},
	methods: {
		
	}
});
mui.plusReady(function() {
	// ios滑动关闭页面
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("user/wallet/bankcard")){
			plus.webview.getWebviewById("user/wallet/bankcard").evalJS("initInfo()");
		}
	})
    
	/**
	 * 关闭银行页面
	 */
	if(plus.webview.getWebviewById("user/authentication")){
		plus.webview.getWebviewById("user/authentication").hide();
		plus.webview.getWebviewById("user/authentication").close();
	}
	/**
	 * 设置用户信息
	 */
	vueCtl.bankInfo.id = app.getState().userInfo.id;
	vueCtl.bankInfo.realName = app.getState().userInfo.realName;
	vueCtl.bankInfo.identityCard = app.getState().userInfo.identityCard;
	
	/**
	 * 选择银行
	 */
	app.tapEvent("choiceBank", function(e) {
		vueCtl.title = "选择银行";
		document.getElementById("addBank").style.display = "none";
		document.getElementById("checkBank").style.display = "";
	});
	//银行卡输入验证
	document.getElementById("bankNum").addEventListener("input",function(){
		var temp = this.value;
		if(temp.length>19){
			temp = temp.substring(0,19);
			vueCtl.bankInfo.bankNum = temp;
			buttonUse();
		}else{
			vueCtl.bankInfo.bankNum = temp;
			buttonUse();
		}
	});
	/**
	 * 按钮使用
	 */
	function buttonUse(){
		if(vueCtl.bankInfo.bankName!=""&&vueCtl.bankInfo.bankCode!=""){
			document.getElementById("nextBtn").removeAttribute("disabled");
		}
	}
	/**
	 * 单击某个银行信息
	 */
	mui("#checkBank").on("tap", ".mui-table-view-cell", function(e) {
		vueCtl.title = "更换银行卡";
		var bankName = this.innerText;
		vueCtl.bankInfo.bankName = bankName;
		vueCtl.bankInfo.bankCode = bankmap.get(bankName);
		document.getElementById("addBank").style.display = "";
		document.getElementById("checkBank").style.display = "none";
		buttonUse();
	});
	/**
	 * 保存银行卡信息
	 */
	app.tapEvent("nextBtn", function(e) {
		if(!validateForm()) return;
		
		app.saveBankInfo(vueCtl.bankInfo, function(data) {
			if(data && data.status == app.STATUS_SUCCESS) {
				//跳转到设置提现密码页面
				vueCtl.title = "更换成功";
				document.getElementById("addBank").style.display="none";
				document.getElementById("backBtn").style.display="none";
				document.getElementById("settingSuccess").style.display="";
				// 更新我的信息
				app.refreshUserInfo();
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
	 * 关闭页面
	 */
	app.tapEvent("finishBtn", function() {
		/**
		 * 更新用户信息
		 */
		app.getUserInfo(function(result) {
			if(result && result.status == app.STATUS_SUCCESS) {
				// 将用户信息存放到本地
				var state = app.getState();
				state.userInfo = result.info;
				app.setState(state);
				plus.webview.currentWebview().close();
			}
		});
		
		if(plus.webview.getWebviewById("user/wallet/bankcard")){
			plus.webview.getWebviewById("user/wallet/bankcard").evalJS("initInfo()");
		}
	});
});

function validateForm() {
	if(vueCtl.bankInfo.bankNum == null || trim(vueCtl.bankInfo.bankNum) == "") {
		app.toast('银行卡账号不能为空')
		return false;
	}
	if(vueCtl.bankInfo.bankName == null || trim(vueCtl.bankInfo.bankName) == ""||vueCtl.bankInfo.bankName.length<2) {
		app.toast('请选择银行')
		return false;
	}
	if(vueCtl.errors != null && vueCtl.errors.any()) {
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
	return true;
}