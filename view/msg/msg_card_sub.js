// 初始化mui
mui.init({
	pullRefresh: {
		container: '#msgCardContent',
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
		status: "0",
		listData: []
	},
	methods: {
		openWindow: function(id, url) {
			console.log(id + "," + url);
			mui.openWindow(url, id);
		}
	},
	filters: {
		cavDate: function(value) {
			var arr1 = value.split(" ");
			var sdate = arr1[0].split('-');
			var stime = arr1[1].split(':');
			var strDate = new Date(sdate[0], sdate[1] - 1, sdate[2], stime[0], stime[1], stime[2]);
			strDate = strDate.Format("MM月dd日 hh:mm")
			return strDate;
		}
	}
});
mui.plusReady(function() {
	plus.nativeUI.showWaiting(app.loadingWords);
	if(plus.device.model=="iPhoneX"){
		document.getElementById("securityArea").style.display="";
	}
	/**
	 * 获取提现记录信息
	 */
	initInfo();
	/**
	 * 点击查看详情
	 */
	mui(".mui-content").on("tap", ".listCard", function() {
		var dataid = this.getAttribute("dataid");
		var param = {
			incomeId: dataid
		}
		app.setNoticeRead(dataid, "1", function(data) {
			if(data && data.status == app.STATUS_SUCCESS) {
				app.signinOpen("msg/msgCardDetails", "msgCardDetails.html", null, param);
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);
			}
		});
	});
	mui.back = function(){
		if(plus.webview.getWebviewById("msg/mymsg")){
			plus.webview.getWebviewById("msg/mymsg").evalJS("initInfo()");
		}
		plus.webview.currentWebview().opener().close();
	}
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("msg/mymsg")){
			plus.webview.getWebviewById("msg/mymsg").evalJS("initInfo()");
		}
	})
});

function initInfo() {
	app.orderListShare(vueCtl.status, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		if(data && data.status == app.STATUS_SUCCESS && data.info.length > 0) {
			vueCtl.listData = data.info;
			document.getElementById("listCard").style.display = "";
		} else {
			document.getElementById("emptyData").style.display = "";
		}
	});
}

function pulldownRefresh() {
	initInfo();
	mui.later(function() {
		mui('#msgCardContent').pullRefresh().endPulldownToRefresh();
	}, 500);
}