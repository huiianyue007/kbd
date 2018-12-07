// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		param:{
			type: ""
		}
	},
	methods: {}
});

mui.plusReady(function() {
	app.tapEvent("howCeng", function() {
		vueCtl.param.type="howCeng";
		vueCtl.param.title="如何进行蹭卡？";
		app.normalOpen("user/help/helpContent", "helpContent.html", null, vueCtl.param);
	});
	app.tapEvent("howMy", function() {
		vueCtl.param.type="howMy";
		vueCtl.param.title="如何购买商家储值卡？";
		app.normalOpen("user/help/helpContent", "helpContent.html", null, vueCtl.param);
	});
	app.tapEvent("howUse", function() {
		vueCtl.param.type="howUse";
		vueCtl.param.title="消费后如何使用自己的储值卡进行结账？";
		app.normalOpen("user/help/helpContent", "helpContent.html", null, vueCtl.param);
	});
	app.tapEvent("howOpen", function() {
		vueCtl.param.type="howOpen";
		vueCtl.param.title="如何开启储值卡的共享功能？";
		app.normalOpen("user/help/helpContent", "helpContent.html", null, vueCtl.param);
	});
	app.tapEvent("howCash", function() {
		vueCtl.param.type="howCash";
		vueCtl.param.title="如何进行提现？";
		app.normalOpen("user/help/helpContent", "helpContent.html", null, vueCtl.param);
	});
});