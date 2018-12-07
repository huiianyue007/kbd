mui.init({
});
// 当前webview
var ws;
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		ad:{
			url:"",
			imgsrc:""
		}
	},
	filters: {
	},
	methods: {
	}
});

mui.plusReady(function(){
	vueCtl.selfWebView = plus.webview.currentWebview();
	document.getElementById("jumpUrl").addEventListener("tap",function(e){
		var param = {
			href_target:vueCtl.ad.url
		};
		app.normalOpen('webbroswer','../broswer/web.html',null,param);
	});
	document.getElementById("closeBtn").addEventListener("tap",function(e){
		// 关闭窗口
		vueCtl.selfWebView.opener().evalJS("hideScreenAD()");
		// 阻止事件冒泡
		e.stopPropagation();
	});
	
	refreshAD();
});

function refreshAD(){
	// 刷新广告
	app.findAd(function(data){
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info){
				if(data.info.noticeUrl&&data.info.noticeJumpPic){
					vueCtl.ad.url = data.info.noticeUrl;
					vueCtl.ad.imgsrc = data.info.noticeJumpPic;
					// 获得广告后打开窗口
					vueCtl.selfWebView.opener().evalJS("openScreenAD()");
				}else{
					vueCtl.selfWebView.opener().evalJS("hideScreenAD()");
				}
			}else{
				vueCtl.selfWebView.opener().evalJS("hideScreenAD()");
			}
		}else{
			vueCtl.selfWebView.opener().evalJS("hideScreenAD()");
		}
	});
	
}
