mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '添加银行卡',
		remindType: "0",
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
	/**
	 * 设置用户Id
	 */
	vueCtl.bankInfo.id = app.getState().userInfo.id;
	/**
	 * 选择银行
	 */
	app.tapEvent("choiceBank", function(e) {
		vueCtl.title = "选择银行";
		document.getElementById("addBank").style.display = "none";
		document.getElementById("checkBank").style.display = "";
	});
	/**
	 * 单击某个银行信息
	 */
	mui("#checkBank").on("tap", ".mui-table-view-cell", function(e) {
		vueCtl.title = "添加银行卡";
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
				vueCtl.remindType = "2";
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
	//身份证输入验证
	document.getElementById("idCard").addEventListener("input",function(){
		var temp = this.value;
		if(temp.length>18){
			temp = temp.substring(0,18);
			vueCtl.bankInfo.identityCard = temp;
			buttonUse();
		}else{
			vueCtl.bankInfo.identityCard = temp;
			buttonUse();
		}
	});
	//真实姓名
	document.getElementById("realName").addEventListener("input",function(){
		var temp = this.value;
		if(temp.length>10){
			temp = temp.substring(0,10);
			vueCtl.bankInfo.realName = temp;
			buttonUse();
		}else{
			vueCtl.bankInfo.realName = temp;
			buttonUse();
		}
	});
	/**
	 * 重写mui的返回方式
	 */
	mui.back = function() {
		if(document.getElementById("checkBank").style.display == "") {
			document.getElementById("checkBank").style.display = "none";
			document.getElementById("addBank").style.display = "";
		} else {
			if(vueCtl.bankInfo.bankName == "" && vueCtl.bankInfo.bankCode == "" && vueCtl.bankInfo.realName == "" && vueCtl.bankInfo.identityCard == "") {
				if(plus.webview.getWebviewById("user/wallet/mywallet")){
					plus.webview.getWebviewById("user/wallet/mywallet").evalJS("closeBankTips()");
				}
				plus.webview.currentWebview().close();
			} else {
				vueCtl.remindType = "1";
			}
		}

	}
	/**
	 * 按钮使用
	 */
	function buttonUse(){
		if(vueCtl.bankInfo.bankName!=""&&vueCtl.bankInfo.bankCode!=""&&vueCtl.bankInfo.realName!=""&&vueCtl.bankInfo.identityCard!=""){
			document.getElementById("nextBtn").removeAttribute("disabled");
		}
	}
	/**
	 * 放弃
	 */
	app.tapEvent("cancel", function() {
		if(plus.webview.getWebviewById("user/wallet/mywallet")){
			plus.webview.getWebviewById("user/wallet/mywallet").evalJS("closeBankTips()");
		}
		plus.webview.currentWebview().close();
	});
	/**
	 * 继续填写
	 */
	app.tapEvent("writting", function() {
		vueCtl.remindType = "0";
	});
	/**
	 * 以后再说
	 */
	app.tapEvent("closeDiv", function() {
		mui.toast("银行卡设置成功");
		if(plus.webview.getWebviewById("user/wallet/mywallet")){
			plus.webview.getWebviewById("user/wallet/mywallet").evalJS("closeBankTips()");
		}
		plus.webview.currentWebview().close();
	});
	/**
	 * 继续设置
	 */
	app.tapEvent("setOn", function() {
		app.signinOpen("user/wallet/cashpassword", "cashpassword.html",null, {
			newcard: 'newcard'
		});
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
	if(vueCtl.bankInfo.realName == null || trim(vueCtl.bankInfo.realName) == "") {
		app.toast('持卡人姓名不能为空')
		return false;
	}
	if(vueCtl.bankInfo.identityCard == null || trim(vueCtl.bankInfo.identityCard) == "") {
		app.toast('身份证不能为空')
		return false;
	}
	if(vueCtl.errors != null && vueCtl.errors.any()) {
		app.toast(vueCtl.errors.all()[0])
		return false;
	}
	return true;
}