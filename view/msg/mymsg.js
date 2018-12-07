// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		listData: [{
				title: '系统通知',
				id: 'msg/msg_sys',
				url: 'msg_sys.html',
				count:"0",
				img: '../../res/img/common/xitongtongzhi.png'
			},
			{
				title: '精选活动',
				id: 'msg/msg_activity',
				url: 'msg_activity.html',
				count:"0",
				img: '../../res/img/common/jingxuanhuodong.png'
			},
			{
				title: '蹭卡通知',
				id: 'msg/msg_card',
				url: 'msg_card.html',
				count:"0",
				img: '../../res/img/common/cengCard.png'
			}
		]
	},
	methods: {
		openWindow:function(id,url){
			console.log(id+","+url);
			mui.openWindow(url,id);
		}
	}
});

mui.plusReady(function(){
	try{
		plus.runtime.setBadgeNumber(0);
		console.log("清除角标")
	}catch(e){
		console.log("清除角标异常")
	}
	//系统通知
	document.getElementById("msg/msg_sys").addEventListener("tap",function(){
		app.normalOpen("msg/msg_sys","msg_sys.html",null,null);
	});
	//蹭卡通知
	document.getElementById("msg/msg_card").addEventListener("tap",function(){
		app.normalOpen("msg/msg_card","msg_card.html",null,null);
	});
	//精彩活动
	document.getElementById("msg/msg_activity").addEventListener("tap",function(){
		app.normalOpen("msg/msg_activity","msg_activity.html",null,null);
	});
	/**
	 * 加载数据
	 */
	initInfo();
	/**
	 * 重写返回
	 */
	mui.back = function (){
		if(plus.webview.getWebviewById("map_header")){
			plus.webview.getWebviewById("map_header").evalJS("loadMsgCount()");
		}
		plus.webview.currentWebview().close();
	}
	iosBackEvent(function(){
		if(plus.webview.getWebviewById("map_header")){
			plus.webview.getWebviewById("map_header").evalJS("loadMsgCount()");
		}
	})
});
function initInfo(){
	app.findMessageNoCount(function(data){
		if(data && data.status == app.STATUS_SUCCESS) {
			vueCtl.listData[0].count=data.info.sysCount;
			vueCtl.listData[1].count=data.info.activCount;
			vueCtl.listData[2].count=data.info.cenCount;
		}else{
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);	
		}
	});
}
