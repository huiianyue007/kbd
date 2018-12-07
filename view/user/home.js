// 初始化mui
mui.init();

// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		user: {
			cardCount: "0.00",
			balance: "0.00",
			earnings: "0.00",
			userImg:"../../res/img/common/noLogin.png",
			userName:"登录/注册",
			sex:"0",
			age:"0"
		},
		loaded: false
	},
	methods: {

	}
});

mui.plusReady(function() {
	initInfo();
	/**
	 * 关闭储值卡列表页面
	 */
	if(plus.webview.getWebviewById("user/card/memcards")) {
		plus.webview.getWebviewById("user/card/memcards").hide();
		plus.webview.getWebviewById("user/card/memcards").close();
	}
	// 我的储值卡
	app.tapEvent('myCard', function() {
		app.signinOpen("user/card/memcards", "card/memcards.html");
	});
	// 帮助与反馈
	app.tapEvent('helpAndfeedback', function() {
		app.normalOpen("user/help/helpFaq", "help/helpFaq.html");
	});
	//进入设置页面
	app.tapEvent('setupBtn', function() {
		mui.preload({
			url:'setting/setup.html',
			id:'user/setting/setup'
		})
		app.signinOpen("user/setting/setup", "setting/setup.html");
	});
	//进入我的钱包页面
	app.tapEvent('mywallet', function() {
		app.signinOpen("user/wallet/mywallet", "wallet/mywallet.html");
	});
	//进入个人信息页面
	app.tapEvent('personalInfo', function() {
		app.signinOpen("user/personalInfo", "personalInfo.html");
	});
	//进入蹭卡页面
	app.tapEvent('income', function() {
		vueCtl.user.status="1";
		app.signinOpen("user/wallet/income", "wallet/income.html", null, vueCtl.user);
	});
	//关闭页面
	app.tapEvent('closeBtn', function() {
		plus.webview.currentWebview().close();
	});
});

function initInfo(){
	plus.nativeUI.showWaiting(app.loadingWords);
	vueCtl.loaded = true;
	if(app.getState().userInfo){
		vueCtl.user.userImg = app.getState().userInfo.headImgUrlPress||"../../res/img/common/noLogin.png";
		vueCtl.user.userName = app.getState().userInfo.nickName||"";
		vueCtl.user.sex = app.getState().userInfo.sex||"0";
		vueCtl.user.age = app.getState().userInfo.age||"0";
		/**
		 * 获取个人信息中的金额信息
		 */
		app.personalData(function(data) {
			mui.later(function(){plus.nativeUI.closeWaiting();},250);
			if (data&&data.status == app.STATUS_SUCCESS) {
				vueCtl.user.cardCount=data.info.totalCardCount;
				vueCtl.user.balance=data.info.totalCardAmount;
				vueCtl.user.earnings=data.info.totalShareAmountIn;
			} else {
				mui.toast("个人信息加载异常...");
			}
		});
	}else{
		vueCtl.user.userImg = "../../res/img/common/noLogin.png";
		vueCtl.user.userName = "登录/注册";
		vueCtl.user.cardCount=0;
		vueCtl.user.balance=0;
		vueCtl.user.earnings=0;
		mui.later(function(){plus.nativeUI.closeWaiting();},250);
	}
}

mui.back = function(){
	plus.webview.currentWebview().hide()
}
