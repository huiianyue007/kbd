// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		shop: {"id":"","realName":"","nickName":"","mobile":"","userType":"","position":"","identityCard":"","sex":"","age":"","headImgUrl":"","headImgUrlPress":"","wallet":"","bankName":"","bankNum":"","bankCode":"","permissionType":"","clientid":"","unionid":"","shopid":"","isDel":"","isIos":"","isUser":"","isAudit":"","auditTime":"","createTime":"","shopMobile":"010-57658941","shopName":"测试03","shopQrCode":"","shopType":"","shopStartTime":"07:00","shopEndTime":"15:00","shopManager":"","shopProvince":"北京市","shopCity":"北京市","shopArea":"昌平区","circleid":"","shopAddr":"北京市昌平区永旺国际","shopLongitude":"","shopLatitude":"","shopLegalPerson":"","shopBusnessLicenseNum":"","isLock":"","isLoginApp":"","verifyCode":"","doorPic":"","doorPicPress":"","inPic":"","inPicPress":"","logoPic":"","logoPicPress":"../../res/img/common/shopDefout.png","busnessLicensePic":"","busnessLicensePicPress":"","sanitaryPermitPic":"","sanitaryPermitPicPress":"","identityCardPositivePic":"","identityCardPositivePicPress":"","identityCardNegativePic":"","identityCardNegativePicPress":""},
		loaded: true
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
	methods: {}
});
mui.plusReady(function() {
	var shopid = plus.webview.currentWebview().shopid;
	plus.nativeUI.showWaiting(app.loadingWords);
	//获取商家列表
	app.shopDetails(shopid, function(data) {
		mui.later(plus.nativeUI.closeWaiting, 250);
		vueCtl.loaded = true;
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info.logoPicPress == "") {
				data.info.logoPicPress = "../../res/img/common/shopDefout.png";
			}
			vueCtl.shop = data.info;
		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
	/**
	 * 拨打电话
	 */
	document.getElementById("telPhone").addEventListener("tap", function() {
		if(mui.os.plus) {
			plus.device.dial(vueCtl.shop.shopMobile, true);
		} else {
			location.href = 'tel:' + vueCtl.shop.shopMobile;
		}
	});
});