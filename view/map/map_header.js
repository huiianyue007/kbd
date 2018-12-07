mui.init();

// 当前webview
var ws;
var navi_src,navi_dst,navi_address;
var setting;
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: "卡不多",
		param: {
			longitude: "",
			latitude: ""
		}
	}
});
mui.plusReady(function(){
	loadMsgCount();
	// 获得当前窗口
	ws = plus.webview.currentWebview();
	// 获得当前应用设置
	setting = app.getSettings()||{};
	
	// 点击查看个人信息
	document.getElementById('meinfoBtn').addEventListener('tap', function() {
		app.normalOpen('user/home','../user/home.html')
	});
	// 点击查看商家列表模式
	document.getElementById("merchantBtn").addEventListener("tap", function() {
		app.normalOpen('merchant/merchant', '../merchant/merchants.html' , null, vueCtl.param);
	});
	// 点击查看我得消息页面
	document.getElementById("msgBtn").addEventListener("tap", function() {
		app.signinOpen('msg/mymsg', '../msg/mymsg.html',null,null);
	});
	
	if(mui.os.android){
//		document.getElementById('muiBar').classList.add("lineBg");
	}
	
	// 初始化完成以后需要拉取新数据
	mui.later(function(){
		plus.webview.currentWebview().opener().evalJS("sysncMapHeader()");
	},100);
})

function setParam(param){
	vueCtl.param = JSON.parse(param);
}
function loadMsgCount(){
	if(!app.getState().userInfo){
		return;
	}
	app.findMessageNoCount(function(data){
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info.sysCount>0||data.info.activCount>0||data.info.cenCount>0){
				document.getElementById("unreadmarkup").style.display="";
			}
			if(data.info.sysCount==0&&data.info.activCount==0&&data.info.cenCount==0){
				document.getElementById("unreadmarkup").style.display="none";
			}
		}else{
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);	
		}
	});
}
