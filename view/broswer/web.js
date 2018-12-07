mui.init();
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {}
	}
});
// 定义原始参数
var ws=null,embed=null;
// plus加载完成
mui.plusReady(function(){
	// 初始化内容
	vueCtl.selfWebView=plus.webview.currentWebview();
	ws = vueCtl.selfWebView;
	
	var topoffset = (immersed+46)+'px';

	embed=plus.webview.create(ws.href_target,"embed",{top:topoffset,bottom:"0px"});
	ws.append(embed);
	embed.addEventListener("loaded",onBrowserLoading,false);
	mui.back = function(){
		if(plus.webview.getWebviewById("msg/msg_activity")){
			plus.webview.getWebviewById("msg/msg_activity").evalJS("initInfo()");
		}
		if(plus.webview.getWebviewById("msg/msg_sys")){
			plus.webview.getWebviewById("msg/msg_sys").evalJS("initInfo()");
		}
		plus.webview.currentWebview().close();
	}
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("msg/msg_activity")){
			plus.webview.getWebviewById("msg/msg_activity").evalJS("initInfo()");
		}
		if(plus.webview.getWebviewById("msg/msg_sys")){
			plus.webview.getWebviewById("msg/msg_sys").evalJS("initInfo()");
		}
	})
});
// 打开网址
function openUrl(){
	var url=document.getElementById("url");
	embed.loadURL(url.value);
	url.blur();
}
// 关闭窗口
function closeWindow(){
	plus.webview.close(ws);
}
// 页面加载后自动打开
document.addEventListener("DOMContentLoaded",function(){
	if(embed){
		openUrl();
	}else{
		auto=true;
	}
},false);
// 页面跳转完成事件
function onBrowserLoading(){
	var title = '消息详情';
	if(embed.getTitle()!=null&&embed.getTitle()!='') title = embed.getTitle();
	// 修改title
	document.getElementById("broswer-title").innerHTML = title;
}