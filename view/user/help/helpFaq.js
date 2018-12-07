// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		serverPhone: ""
	},
	methods: {

	}
});

mui.plusReady(function() {
	/**
	 * 客服电话
	 */
	vueCtl.serverPhone = app.serverPhone;
	/**
	 * 常见问题
	 */
	document.getElementById("commonProblem").addEventListener("tap", function() {
		app.normalOpen("commonProblem", "commonProblem.html");
	});
	/**
	 * 意见反馈
	 */
	document.getElementById("question").addEventListener("tap", function() {
		app.signinOpen("question", "question.html",null,null);
	});
	/**
	 * 联系客服
	 */
	document.getElementById("contact").addEventListener("tap", function() {
		document.getElementById("tanceng").style.display = "";
		document.getElementById("remindTrue").style.display = "";
	});
	/**
	 * 拨打电话
	 */
	document.getElementById("telPhone").addEventListener("tap", function() {
		if(mui.os.plus) {
			plus.device.dial(vueCtl.serverPhone, true);
		} else {
			location.href = 'tel:' + vueCtl.serverPhone;
		}
	});
	/**
	 * 取消
	 */
	document.getElementById("cancel").addEventListener("tap", function() {
		document.getElementById("tanceng").style.display = "none";
		document.getElementById("remindTrue").style.display = "none";
	});
});