mui.init();
var safearea = 0;
// 当前webview
var ws;
var navi_src, navi_dst, navi_address;
var setting;
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
		isAutoEvent: false,
		clickTimes: 0,
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
			app.signinOpen("merchant/merchantCard", "../merchant/merchantCard.html", null, param);
		}
	}
});

mui.plusReady(function() {
	// 获得当前窗口
	ws = plus.webview.currentWebview();
	// 获得当前应用设置
	setting = app.getSettings() || {};
	
	try{
		if('iphonex'==plus.device.model.toLowerCase()){
			safearea = 30;
		}
	}catch(e){
		safearea = 0;
	}

	// 监听事件
	// 添加send自定义事件监听
	window.addEventListener('setData', function(event) {
		//获得事件参数
		var dlength = event.detail.data.length;
		vueCtl.merchantCards = event.detail.data;

		 initslide()
	});

	mui.later(function() {
		// 如果该页面加载好后，还是出现没有数据的情况。则更新一次数据
		if(vueCtl.merchantCards.length < 1) {
			plus.webview.currentWebview().opener().evalJS("syncMapBusi()");
			
			initslide()
		}
	}, 500);
})
// 初始化slide
function initslide(){
	mui('.mui-slider').slider();
	var mslider = document.querySelector('.mui-slider');
	mslider.removeEventListener('slide', slideHandler);
	mslider.addEventListener('slide', slideHandler);
}
// 华东卡片时间
function slideHandler(event) {
	if(!vueCtl.isAutoEvent) {
		plus.webview.currentWebview().opener().evalJS("triggerMarker('" + getCardId(event.detail.slideNumber) + "')");
	}
	vueCtl.isAutoEvent = false;
}

// 获得卡片的商家id
function getCardId(index) {
	return vueCtl.merchantCards[index].id;
}
// 根据商家id跳转到对应卡片
function jumptoCard(id) {
	var settings = app.getSettings() || {};
	for(var i in vueCtl.merchantCards) {
		if(vueCtl.merchantCards[i].id === id) {
			if(vueCtl.clickTimes>0){
				vueCtl.isAutoEvent = true;
			}
			mui('.mui-slider').slider().gotoItem(i, 600);
		}
	}
	vueCtl.clickTimes++;
}
// 窗口展示
function setMapBusiInfoPanl(status) {
	// 获得系统设置状态
	var settings = app.getSettings() || {};
	if(status == 'open') {
		ws.setStyle({
			height: "140px"
		})
		plus.webview.getWebviewById("map_sub").setStyle({
			bottom: (safearea+130)+'px'
		})
		plus.webview.getWebviewById("map_center").hide();
		settings.MAP_BUSI = true;
	} else {
		ws.setStyle({
			height: "0px"
		})
		plus.webview.getWebviewById("map_sub").setStyle({
			bottom: (safearea+0)+'px'
		})
		plus.webview.getWebviewById("map_center").show()
		settings.MAP_BUSI = false;
		vueCtl.clickTimes = 0;
	}
	// 更新设置状态
	app.setSettings(settings);
}