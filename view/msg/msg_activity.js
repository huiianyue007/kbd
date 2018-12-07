// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		listData: []
	},
	methods: {
		
	},
	filters: {
		cavDate: function(value) {
			value = value + "";
			value = value.split(" ");
			return value[0];
		}
	}
});
mui.plusReady(function(){
	plus.nativeUI.showWaiting(app.loadingWords);
	if(plus.device.model=="iPhoneX"){
		document.getElementById("securityArea").style.display="";
	}
	initInfo();
	mui(".activity").on("tap",".activity_card",function(){
		var jump = this.getAttribute("jumpURL");
		var dataId = this.getAttribute("dataid");
		var param = {
			href_target:jump
		};
		app.setNoticeRead(dataId,"0",function(data){
			if(data && data.status == app.STATUS_SUCCESS) {
				app.normalOpen('webbroswer','../broswer/web.html',null,param);
			}else{
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);	
			}
		});
	});
	/**
	 * 重写返回
	 */
	mui.back = function(){
		if(plus.webview.getWebviewById("msg/mymsg")){
			plus.webview.getWebviewById("msg/mymsg").evalJS("initInfo()");
		}
		plus.webview.currentWebview().close();
	}
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("msg/mymsg")){
			plus.webview.getWebviewById("msg/mymsg").evalJS("initInfo()");
		}
	})
});
function initInfo(){
	app.findMessage("0","0",function(data){
		mui.later(plus.nativeUI.closeWaiting, 250);
		if(data && data.status == app.STATUS_SUCCESS && data.info.length>0) {
			vueCtl.listData = data.info;
			document.getElementById("activity").style.display="";
		}else{
			document.getElementById("emptyData").style.display="";
		}
	});
}
