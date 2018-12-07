// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title:"",
		contentType:"",
		serverPhone: ""
	},
	methods: {

	}
});

mui.plusReady(function() {
	vueCtl.title=plus.webview.currentWebview().title;
	vueCtl.contentType = plus.webview.currentWebview().type;
});