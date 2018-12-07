mui.init();

var inputNum = 0;
var flag = "newPass";
var newPass = "";
var oldPayPass = "";
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '提现密码',
		tishi: '请设置提现密码，用于提现验证',
		type: "0",
		pwd: {
			uid: "",
			moneyPwd: "",
			moneyQRPwd: ""
		},
		newcard: "update"
	},
	computed: {
		successText: function(){
			if(this.newcard==="update"){
				return "提现密码设置成功";
			}else if(this.newcard==="newcard"){
				return "银行卡设置成功";
			}else{
				return "设置成功";
			}
		}
	},
	methods: {

	}
});
mui.plusReady(function() {
	var ws = plus.webview.currentWebview();
	vueCtl.newcard = ws.newcard;
	
	iosBackEvent(function(){
		// ios滑动关闭页面
        if(plus.webview.getWebviewById("user/wallet/mywallet")) {
			var mywalletView = plus.webview.getWebviewById("user/wallet/mywallet");
			mywalletView.evalJS("initInfo()");
			mywalletView.evalJS("closeBankTips()");
		}
	})
	
	/**
	 * 关闭银行页面
	 */
	if(plus.webview.getWebviewById("user/wallet/bankInfo")){
		setTimeout(function(){
			plus.webview.getWebviewById("user/wallet/bankInfo").hide()
			plus.webview.getWebviewById("user/wallet/bankInfo").close()
	
		},200);
	}
	/**
	 * 关闭修改提现密码页面
	 */
	if(plus.webview.getWebviewById("user/authentication")){
		plus.webview.getWebviewById("user/authentication").hide();
		plus.webview.getWebviewById("user/authentication").close();
	}
	/**
	 * 设置用户Id
	 */
	vueCtl.pwd.id = app.getState().userInfo.id;
	/**
	 * 得到输入密码对象
	 */
	var inputarr = document.getElementsByName("password");
	/**
	 * 数字键盘点击事件
	 */
	mui("#keywords").on("tap", ".mui-table-view-cell", function() {
		if(this.getAttribute("data") == "kong") {

		} else if(this.getAttribute("data") == "del") {
			delInputValue();
		} else {
			if(inputNum == 6) {
				findPayPassword();
			} else {
				inputarr[inputNum].value = this.getAttribute("data");
				inputNum = inputNum + 1;
				if(inputNum == 6) {
					findPayPassword();
				}
			}
		}

	});
	/**
	 * 获取密码
	 */
	function findPayPassword() {
		var result = "";
		mui(".inputs input").each(function() {
			result = result + this.value;
		});
		if(flag == "newPass") {
			newPass = result;
			vueCtl.pwd.moneyPwd = result;
			setingNewPayPassAgain();
		} else {
			if(newPass == result) {
				vueCtl.pwd.moneyQRPwd = result;
				app.moneypwd(vueCtl.pwd.moneyQRPwd, function(data) {
					if(data && data.status == app.STATUS_SUCCESS) {
						vueCtl.title = "添加成功";
						//隐藏提现设置
						document.getElementById("cashpasswordDiv").style.display = "none";
						document.getElementById("settingSuccess").style.display = "";
					} else {
						mui(".inputs input").each(function() {
							this.value = "";
						});
						inputNum = 0;
						flag = "newPass";
						vueCtl.title = "设置提现密码";
						vueCtl.tishi = "请设置提现密码，用于提现验证";
						if(data=='error'){
							mui.toast("数据加载失败...")
							return;
						}
						mui.toast(data.info);
					}
				});
			} else {
				mui.toast("两次密码输入的不一致~");
				newPass = "";
				vueCtl.pwd.moneyPwd = "";
				vueCtl.pwd.moneyQRPwd = "";
				setingNewPayPass();
			}
		}
	}
	/**
	 * 获取有值的密码输入框
	 */
	function findInputByValue() {
		var resultArr = new Array();
		mui(".inputs input").each(function() {
			if(this.value == "") {

			} else {
				resultArr.push(this);
			}
		});
		return resultArr;
	}
	/**
	 * 删除数据
	 */
	function delInputValue() {
		var inputValueArr = findInputByValue();
		var inputLength = inputValueArr.length - 1;
		inputNum = inputNum - 1;
		if(inputLength >= 0) {
			inputarr[inputLength].value = "";
		} else {
			inputNum = 0;
		}
	}
	/**
	 * 设置新支付密码
	 */
	function setingNewPayPass() {
		flag = "newPass";
		vueCtl.title = "设置提现密码";
		vueCtl.tishi = "请设置提现密码，用于提现验证";
		mui(".inputs input").each(function() {
			this.value = "";
		});
		inputNum = 0;
	}
	/**
	 * 设置新支付密码（第二次）
	 */
	function setingNewPayPassAgain() {
		flag = "newPassAgain";
		vueCtl.title = "再次输入密码";
		vueCtl.tishi = "请再次输入，以确定密码";
		mui(".inputs input").each(function() {
			this.value = "";
		});
		inputNum = 0;
	}
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
		if(plus.webview.getWebviewById("user/wallet/mywallet")){
			var mywalletView = plus.webview.getWebviewById("user/wallet/mywallet");
			mywalletView.evalJS("initInfo()");
			mywalletView.evalJS("closeBankTips()");
		}
	});
});