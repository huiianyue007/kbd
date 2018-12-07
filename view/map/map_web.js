// H5 plus事件处理
function plusReady() {
	// 初始化地图
//	var map = new AMap.Map('map', {
//      resizeEnable: true,
//      zoom:11,
//      center: [116.397428, 39.90923]
// 	});

//	var map = new qq.maps.Map(document.getElementById("map"), {
//      // 地图的中心地理坐标。
//      center: new qq.maps.LatLng(39.916527,116.397128)
//  });
    
    var map = new BMap.Map("map");

	// 创建子窗口（页面小工具）
	createSubview();
	// 获得用户信息
	userLocation(function() {});

	// 地图加载完成后，调用关闭窗口
	plus.webview.currentWebview().parent().evalJS("clsSplash()");
}
// 加载plus事件。
if(window.plus) {
	plusReady();
} else {
	document.addEventListener("plusready", plusReady, false);
}
// DOMContentloaded事件处理
document.addEventListener("DOMContentLoaded", function() {
	em = document.getElementById("map");
	window.plus && plusReady();
}, false);

function userLocation(callback) {
	map.getUserLocation(function(state, pos) {
		if(0 == state) {
			// 获得屏幕中心点
			ct_lat = pos.latitude;
			ct_lng = pos.longitude;
			
			map.setZoom(15); // 恢复缩放
			map.setCenter(pos);
			
			// 获得自己位置以后，刷新一次
			drawBusiness(ct_lng, ct_lat);
			if(callback && typeof(callback) === "function") callback();

		}
	});
}
/**
 * 绘制地图的图标信息
 */
function drawmarker(data) {
	var marker = new plus.maps.Marker(new plus.maps.Point(data.shopLongitude, data.shopLatitude));
	var tempRate = data.shopMinRate;
	tempRate = (tempRate * 1).toFixed(1);
	marker.setIcon("../../res/img/map/discount/" + tempRate + "@3x.png");
//	marker.setLabel(data.shopName);
//	var bubble = new plus.maps.Bubble(data.shopName);
	marker.onclick = function(){
		// 点击地图，并在busi板中展示信息
		plus.webview.getWebviewById("map_busi").evalJS("setMapBusiInfoPanl('open')");
		// 绘制路线信息
		drawRoute(new plus.maps.Point(search_lng,search_lat),marker.getPoint());
	}
//	marker.setBubble(bubble);
//marker.bringToTop()
	map.addOverlay(marker);
}
/**
 * 加载地图商家坐标信息
 * @param {Object} ct_lng
 * @param {Object} ct_lat
 */
function drawBusiness(ct_lng, ct_lat) {
	// 查询动画
	plus.webview.getWebviewById("map_center").evalJS("jumpball(0)");
	var merchantParam = {
		longitude: ct_lng,
		latitude: ct_lat
	};
	plus.webview.getWebviewById("map_header").evalJS("setParam('"+JSON.stringify(merchantParam)+"')");
	/**
	 * 清除地图中的图标之后，在进行绘制
	 */
	map.clearOverlays();
	markers = [];
	// 查询最近商户
	app.merchants(merchantParam, function(data) {
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info == "") {
				mui.toast("附近没有商家");
			} else {
				for(var i = 0; i < data.info.length; i++) {
					drawmarker(data.info[i]);
				}
				// 发送数据给信息窗口。
				mui.fire(plus.webview.getWebviewById("map_busi"),'setData',{
		            data: data.info
		        })
			}
			// 缓存
			search_lng = ct_lng;
			search_lat = ct_lat;
		} else {
			mui.toast(data.info);
		}
	});
}
// 初始化执行子页面
function createSubview() {
	// 如果实现存在，则将其清空
	if(plus.webview.getWebviewById("map_header") != null) plus.webview.getWebviewById("map_header").close();
	if(plus.webview.getWebviewById("map_sub") != null) plus.webview.getWebviewById("map_sub").close();
	if(plus.webview.getWebviewById("map_center") != null) plus.webview.getWebviewById("map_center").close();
	if(plus.webview.getWebviewById("map_busi") != null) plus.webview.getWebviewById("map_busi").close();
	// 商家展示功能
	var wsub = plus.webview.create('map_header.html', 'map_header', {
		top: '0px',
		height: '150px',
		position: 'absolute',
		scrollIndicator: 'none',
		background: 'transparent'
	});
	ws.append(wsub);
	// 底部按钮
	var wsub = plus.webview.create('map_sub.html', 'map_sub', {
		bottom: "0px",  // 140px
		height: '70px',
		position: 'absolute',
		scrollIndicator: 'none',
		background: 'transparent'
	});
	ws.append(wsub);
	// 中间坐标点
	var wsub = plus.webview.create('map_center.html', 'map_center', {
		height: '120px',
		width: '22px',
		margin: "auto",
		position: 'absolute',
		scrollIndicator: 'none',
		background: 'transparent'
	});
	ws.append(wsub);
	// 商家展示功能
	var wsub = plus.webview.create('map_busi.html', 'map_busi', {
		bottom: '1px',
		height: '0px',
		position: 'absolute',
		scrollIndicator: 'none',
		background: 'transparent'
	});
	ws.append(wsub);
}

// 扫码支付
function scanCodePay() {
	app.signinOpen("qrscan", "/view/scan/qrscan.html");
}
// 搜索目的地坐标
function searchNear(longitude, latitude) {
	var pointSearch = new plus.maps.Point(longitude, latitude);
	map.setCenter(pointSearch);
	drawBusiness(longitude, latitude);
}
// 绘制路线
function drawRoute(src, dst) {
	searchObj.walkingSearch(src, '', dst, '');
}
// 刷新地图状态
function refresh() {
	// 恢复地图缩放级别
	map.setZoom(15);
	// 清除所有点
	map.clearOverlays();
}
function mapRefresh(){
	// 点击地图，并在busi板中展示信息
	plus.webview.getWebviewById("map_busi").evalJS("setMapBusiInfoPanl('close')");
	// 刷新效果
	map.getCurrentCenter((function(state, point) {
		if(0 == state) {
			// 获得屏幕中心点
			ct_lat = point.latitude;
			ct_lng = point.longitude;
			// 判断是否需要查询商户
			// 如果是首次，则查询。如果是距离上次查询点小于2公里，则不查询。
			if(!search_lng || !search_lat) {
				drawBusiness(ct_lng, ct_lat);
			} else {
				var point_cache = new plus.maps.Point(search_lng, search_lat);
				var point_now = new plus.maps.Point(ct_lng, ct_lat)
				plus.maps.Map.calculateDistance(point_cache, point_now, function(event) {
					var distance = event.distance; // 转换后的距离值
					if(distance > 20) {
						drawBusiness(ct_lng, ct_lat);
					} else {
						console.log("距离太小（" + distance + "米），不触发查询")
					}
				}, function(e) {

				});
			}
		}
	}));
}
