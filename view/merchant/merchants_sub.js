// 初始化mui
mui.init({
	pullRefresh: {
		container: '#merchantCards',
		down: {
			height: 80, //可选,默认50.触发下拉刷新拖动距离,
			contentdown: app.pull_downtext,
			contentover: app.pull_overtext,
			contentrefresh: app.pull_refreshtext,
			callback: pulldownRefresh
		}
	}
});
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: "卡不多",
		merchantParam: {
			longitude: "",
			latitude: ""
		},
		merchantCards: [],
		loaded: false
	},
	filters: {
		intVal: function(value) {
			value = value + "";
			return value.split('.')[0] || 10;
		},
		floatVal: function(value) {
			value = value + "";
			return value.split('.')[1] || 0;
		}

	},
	methods: {
		openWindow: function(id) {
			var param = {
				shopid: id,
				status: "0"
			}
			app.signinOpen("merchant/merchantCard", "merchantCard.html", null, param);
		}
	}
});
mui.plusReady(function() {
	/**
	 * 判断当前手机是否是iphoneX，然后创建安全区域
	 */
	if(plus.device.model == "iPhoneX") {
		document.getElementById("securityArea").style.display = "";
	}
});

function translatePoint(callback) {
	plus.nativeUI.showWaiting(app.loadingWords);

	//获取商家列表
	app.merchants(vueCtl.merchantParam, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		callback();
		vueCtl.loaded = true;
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.merchantCards = data.info;
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
}

function setParam(param) {
	// 接收参数
	vueCtl.merchantParam = JSON.parse(param);
	// 查询
	translatePoint(function() {});
}

function pulldownRefresh() {
	translatePoint(function() {
		mui.later(function() {
			mui('#merchantCards').pullRefresh().endPulldownToRefresh();
		}, 500);
	})

}