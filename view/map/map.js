mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: null,
    map: {}, // 地图对象
    centerPoint: {}, // 屏幕中心点
    userPoint: {}, // 用户坐标点
    searchPoint: {}, //	查询缓存点
    routeLine: {}, // 线路缓存
    pline: {}, // 折线所有的坐标点
    startPoint: {}, // 起始坐标点
    searchObj: {}, // 地图搜索对象
    infoShow: false, // 当前是否显示信息卡片
    memList: [], // 商家卡片列表
    defaultZoom: 18, // 地图默认的缩放比例
    iconSize: 2, // 地图默认的icon大小
    cacheBusiId: '' // 当前选中的mark的id
  },
  methods: {

  }
});

mui.plusReady(function() {
  var t = document.body;
  t && (t.style.paddingTop = '0px');
  createSubview();
  // 获得当前窗口对象

  // 创建子窗口（页面小工具）

  // 避免资源争夺闪退
  mui.later(function() {
    // 初始化地图
    initMap();
    // 地图加载完成后，调用关闭窗口
    plus.webview.currentWebview().parent().evalJS("clsSplash()");

    var curTimestamp = new Date().getTime();
    // 首先判断今天是否查询过广告。
    var state = app.getState();
    var adStatus = state.adStatus || {};

    // 应用显示栈顶的Webview窗口
    //版本更新
    var version = plus.runtime.version
    app.update({
      isUser: '0',
      isIos: '0',
      clientid: plus.push.getClientInfo().clientid,
      version: version
    }, function(data) {
      if(data && data.info) {
        var screenVersion = plus.webview.create('../version/version.html', 'version', {
          width: '100%',
          height: '100%',
          position: 'absolute',
          scrollIndicator: 'none',
          background: 'transparent'
        });
        vueCtl.selfWebView.append(screenVersion);
        screenVersion.addEventListener('loaded', function() {
          var obj = JSON.stringify(data.info)
          screenVersion.evalJS('loadMedia(' + obj + ')');
        }, false);
      }
    })
    //		var h=plus.webview.getTopWebview();
    if(!adStatus.lastTime || adStatus.lastTime < (curTimestamp - (24 * 3600 * 1000))) {
      // 广告功能
      // 商家展示功能
      var screenAD = plus.webview.create('../ad/screenAD.html', 'screenAD', {
        width: '100%',
        height: '100%',
        position: 'absolute',
        scrollIndicator: 'none',
        background: 'transparent'
      });
      vueCtl.selfWebView.append(screenAD);
      // 隐藏
      screenAD.hide();

      adStatus.lastTime = curTimestamp;
      state.adStatus = adStatus;
      app.setState(state);
    }

  }, 100);
})

function initMap() {
  // 初始化地图
  vueCtl.map = new plus.maps.Map("map", {
    zoom: vueCtl.defaultZoom,
  });
  // 初始化搜索对象
  vueCtl.searchObj = new plus.maps.Search(vueCtl.map);
  // 设置查询结果数量。当前逻辑一条就够。
  vueCtl.searchObj.setPageCapacity(1);
  // 设置显示用户位置
  //	vueCtl.map.showUserLocation(true);
  // 定位到用户位置
  initUserLocation();
  // --- event 事件开始，比如地图状态改变时间，点击时间。
  // 地图状态修改
  vueCtl.map.onstatuschanged = function(event) {
    // 获得当前的缩放比例
    var zoom = event.zoom;
    // 根据缩放比例修改地图marker的尺寸
    resetIconSize(zoom);
    // 信息窗口如果没有打开，则可以进行刷新
    if(!vueCtl.infoShow) {
      mapRefresh();
    }
  }
  // 地图点击事件，判断如果信息窗口是打开的。则关闭信息窗口，清楚路线，设置标志位
  vueCtl.map.onclick = function(point) {
    // 如果页面开着，则关闭窗口等。并且更新地图
    if(vueCtl.infoShow) {
      // 点击地图，并在busi板中展示信息
      plus.webview.getWebviewById("map_busi").evalJS("setMapBusiInfoPanl('close')");
      // 点击的时候刷新地图。
      mapRefresh();

      vueCtl.infoShow = false;

      vueCtl.cacheBusiId = '';
    }
  }
  // 路线查询结束
  vueCtl.searchObj.onRouteSearchComplete = function(state, result) {
    if(state == 0) {

      if(mui.os.android) {

        if(result.routeNumber <= 0) {
          alert("没有检索到结果");
        }
        vueCtl.routeLine = result.getRoute(0);
        var lineArray = [];

        for(var m in vueCtl.routeLine.pointList) {
          for(var n in vueCtl.routeLine.pointList[m]) {
            lineArray.push(eval(vueCtl.routeLine.pointList[m][n]))
          }
        }

        // 更新图标大小
        resetIconSize(getZoomNum(vueCtl.routeLine));
        // 改变图标大小
        reDrawMarker();

        // 更新起点
        vueCtl.map.removeOverlay(vueCtl.startPoint);
        vueCtl.startPoint = new plus.maps.Marker(vueCtl.routeLine.startPoint);
        vueCtl.startPoint.setIcon("../../res/img/map/ding@3x.png");
        vueCtl.map.addOverlay(vueCtl.startPoint);

        // 更新线路
        vueCtl.map.removeOverlay(vueCtl.pline);
        // 计算中心点
        var middlePoint = getMiddlePoint(vueCtl.routeLine.startPoint, vueCtl.routeLine.endPoint);
        vueCtl.map.centerAndZoom(middlePoint, getZoomNum(vueCtl.routeLine));
        // 增加线路
        vueCtl.pline = new plus.maps.Polyline(lineArray);

        vueCtl.pline.setStrokeColor("#FDD804");
        vueCtl.pline.setLineWidth(15);
        vueCtl.pline.setStrokeOpacity(0.5);
        vueCtl.map.addOverlay(vueCtl.pline);
      } else {
        vueCtl.routeLine = result.getRoute(0);

        var lineArray = [];

        for(var m in vueCtl.routeLine.pointList) {
          lineArray.push(vueCtl.routeLine.pointList[m])
        }
        // 更新图标大小
        resetIconSize(getZoomNum(vueCtl.routeLine));
        // 改变图标大小
        reDrawMarker();

        // 更新起点
        vueCtl.map.removeOverlay(vueCtl.startPoint);
        vueCtl.startPoint = new plus.maps.Marker(vueCtl.routeLine.startPoint);
        vueCtl.startPoint.setIcon("../../res/img/map/ding@3x.png");
        vueCtl.map.addOverlay(vueCtl.startPoint);

        // 更新线路
        vueCtl.map.removeOverlay(vueCtl.pline);
        // 计算中心点
        var middlePoint = getMiddlePoint(vueCtl.routeLine.startPoint, vueCtl.routeLine.endPoint);
        vueCtl.map.centerAndZoom(middlePoint, getZoomNum(vueCtl.routeLine));

        // 增加线路
        vueCtl.pline = new plus.maps.Polyline(lineArray);
        //				vueCtl.pline.setStrokeColor("#FDD804");
        //				vueCtl.pline.setLineWidth(15);
        //				vueCtl.pline.setStrokeOpacity(0.5);
        //				vueCtl.map.addOverlay(vueCtl.pline);
        vueCtl.map.addOverlay(vueCtl.routeLine);
      }

    } else {
      mui.toast("未找到合适路线");
    }
  }
}

function getMiddlePoint(pointA, pointB) {
  var lng = (pointA.longitude + pointB.longitude) / 2
  var lat = (pointA.latitude + pointB.latitude) / 2
  return new plus.maps.Point(lng, lat);
}
// 根据路线距离获得地图应设置的比例。
function getZoomNum(line) {
  var distance = vueCtl.routeLine.distance;
  if(distance > 10000) {
    return 14;
  }
  if(distance > 6000) {
    return 15;
  }
  if(distance > 3500) {
    return 16;
  }
  if(distance > 1000) {
    return 17;
  }
  if(distance > 500) {
    return 18;
  }
  if(distance > 200) {
    return 19;
  }
  return 19;
}
// 初始化进入用户位置信息
function initUserLocation(callback) {
  if(vueCtl.userPoint.longitude) {
    vueCtl.map.centerAndZoom(vueCtl.userPoint, vueCtl.defaultZoom);
  } else {
    vueCtl.map.getUserLocation(function(state, pos) {
      if(0 == state) {
        // 获得屏幕中心点
        vueCtl.userPoint = pos;
        vueCtl.centerPoint = pos;
        // 视图resize
        vueCtl.map.centerAndZoom(vueCtl.userPoint, vueCtl.defaultZoom);
        // 获得自己位置以后，刷新一次
        drawBusiness();
        if(callback && typeof(callback) === "function") callback();

      }
    });
  }
}
// 获取用户位置信息
function userLocation(callback) {
  vueCtl.map.centerAndZoom(vueCtl.userPoint, vueCtl.defaultZoom);

  vueCtl.map.getUserLocation(function(state, pos) {
    if(0 == state) {
      // 获得屏幕中心点
      vueCtl.userPoint = pos;
      vueCtl.centerPoint = pos;
      // 视图resize
      vueCtl.map.centerAndZoom(vueCtl.userPoint, vueCtl.defaultZoom);
      // 获得自己位置以后，刷新一次
      drawBusiness();
      if(callback && typeof(callback) === "function") callback();
    }
  });
}
/**
 * 绘制地图的图标信息
 */
function drawmarker(data) {
  var marker = new plus.maps.Marker(new plus.maps.Point(data.shopLongitude, data.shopLatitude));
  var tempRate = data.shopMinRate.toString().split('.')
  if(vueCtl.cacheBusiId === data.id) {
    marker.setIcon("../../res/img/map/discount/shadow/sale_icon_" + tempRate[0] + (tempRate[1] || 0) + "@" + vueCtl.iconSize + "x.png");
  } else {

    marker.setIcon("../../res/img/map/discount/icon/sale_icon_s_" + tempRate[0] + (tempRate[1] || 0) + "@" + vueCtl.iconSize + "x.png");
  }
  marker.onclick = function() {
    // 缓存坐标
    vueCtl.cacheBusiId = this.busiId;

    showMerCard(this);
    // 先跳转，再打开。顺序不能变。会影响marker和info的匹配
    plus.webview.getWebviewById("map_busi").evalJS("jumptoCard('" + data.id + "')");
    // 点击地图，并在busi板中展示信息
    plus.webview.getWebviewById("map_busi").evalJS("setMapBusiInfoPanl('open')");
  }
  marker.busiId = data.id;
  vueCtl.map.addOverlay(marker);
  marker.bringToTop()
  vueCtl.markers.push(marker);
}
// 外部触发marker点击
function triggerMarker(id) {
  for(var i in vueCtl.markers) {
    if(vueCtl.markers[i].busiId == id) {
      vueCtl.cacheBusiId = id;
      vueCtl.markers[i].bringToTop()
      showMerCard(vueCtl.markers[i]);
    }
  }

}

function showMerCard(marker) {
  // 通过marker的id，循环。找到相等的。对其进行点击。
  // 需要区分事件是手动触发的，还是轮播触发的
  // 绘制路线信息
  drawRoute(new plus.maps.Point(vueCtl.searchPoint.longitude, vueCtl.searchPoint.latitude), marker.getPoint());
  // 页面状态
  vueCtl.infoShow = true;
}
/**
 * 加载地图商家坐标信息
 */
function drawBusiness() {
  // 查询动画
  plus.webview.getWebviewById("map_center").evalJS("jumpball(0)");
  // 缓存
  var merchantParam = vueCtl.centerPoint;

  /**
   * 清除地图中的图标之后，在进行绘制
   */
  vueCtl.map.clearOverlays();
  vueCtl.markers = [];
  // 查询最近商户
  app.merchants(merchantParam, function(data) {
    if(data && data.status == app.STATUS_SUCCESS) {
      if(data.info == "") {
        mui.toast("附近没有商家");
      } else {
        vueCtl.memList = data.info;
        for(var i = 0; i < vueCtl.memList.length; i++) {
          drawmarker(vueCtl.memList[i]);
        }
        // 发送数据给map_busi信息窗口。
        syncMapBusi();
      }

      sysncMapHeader();
      // 缓存
      vueCtl.searchPoint = vueCtl.centerPoint;
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
}
// 发送数据给顶部窗口。
function sysncMapHeader() {
  plus.webview.getWebviewById("map_header").evalJS("setParam('" + JSON.stringify(vueCtl.centerPoint) + "')");
}
// 发送数据给map_busi信息窗口。
function syncMapBusi() {
  // 发送数据给信息窗口。
  mui.fire(plus.webview.getWebviewById("map_busi"), 'setData', {
    data: vueCtl.memList
  })
}
// 初始化执行子页面
function createSubview() {
  console.log(123)
  // 如果实现存在，则将其清空
  if(!vueCtl.selfWebView) {
    vueCtl.selfWebView = plus.webview.currentWebview();
  }
  if(plus.webview.getWebviewById("map_header") != null) plus.webview.getWebviewById("map_header").close();
  if(plus.webview.getWebviewById("map_sub") != null) plus.webview.getWebviewById("map_sub").close();
  if(plus.webview.getWebviewById("map_center") != null) plus.webview.getWebviewById("map_center").close();
  if(plus.webview.getWebviewById("map_busi") != null) plus.webview.getWebviewById("map_busi").close();
  // 商家展示功能
  var wsuHeader = plus.webview.create('map_header.html', 'map_header', {
    top: (immersed + 60) + 'px',
    height: '45px',
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  vueCtl.selfWebView.append(wsuHeader);
  // 底部按钮
  var wsub = plus.webview.create('map_sub.html', 'map_sub', {
    bottom: "0px", // 140px
    height: '70px',
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  vueCtl.selfWebView.append(wsub);
  // 中间坐标点
  var wsub = plus.webview.create('map_center.html', 'map_center', {
    height: '120px',
    width: '50px',
    margin: "auto",
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  vueCtl.selfWebView.append(wsub);
  // 商家展示功能
  var wsub = plus.webview.create('map_busi.html', 'map_busi', {
    bottom: '1px',
    height: '0px',
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  vueCtl.selfWebView.append(wsub);

}

// 扫码支付
function scanCodePay() {
  //	document.getElementById("map").style.height="0px";
  if(!mui.os.ios) {
    vueCtl.selfWebView.setStyle({
      left: '-1000px'
    })
  }
  app.signinOpen("qrscan", "/view/scan/qrscan.html", 'pop-in');
}
// 绘制路线
function drawRoute(src, dst) {
  vueCtl.searchObj.walkingSearch(src, '', dst, '');
}
// 地图刷新
function mapRefresh() {
  // 清除路线
  vueCtl.map.removeOverlay(vueCtl.pline);
  vueCtl.map.removeOverlay(vueCtl.startPoint);
  // 查询数据
  vueCtl.map.getCurrentCenter((function(state, point) {
    if(0 == state) {
      // 获得屏幕中心点
      vueCtl.centerPoint = point;
      // 判断是否需要查询商户
      // 如果是首次，则查询。如果是距离上次查询点小于2公里，则不查询。
      if(!vueCtl.searchPoint.longitude || !vueCtl.searchPoint.latitude) {
        drawBusiness();
      } else {
        var point_cache = new plus.maps.Point(vueCtl.searchPoint.longitude, vueCtl.searchPoint.latitude);
        var point_now = new plus.maps.Point(vueCtl.centerPoint.longitude, vueCtl.centerPoint.latitude);
        plus.maps.Map.calculateDistance(point_cache, point_now, function(event) {
          var distance = event.distance; // 转换后的距离值
          if(distance > 0) {
            drawBusiness();
          } else {
            console.log("距离太小（" + distance + "米），不触发查询")
          }
        }, function(e) {
          reDrawMarker();
        });
      }
    }
  }));
}

function reDrawMarker() {
  // 未改变不查询数据，只刷新图标
  /**
   * 清除地图中的图标之后，在进行绘制
   */
  vueCtl.map.clearOverlays();
  vueCtl.markers = [];
  for(var i = 0; i < vueCtl.memList.length; i++) {
    drawmarker(vueCtl.memList[i]);
  }
}

function resetIconSize(zoom) {
  if(zoom > 18) {
    vueCtl.iconSize = 3;
  } else if(zoom > 14) {
    vueCtl.iconSize = 2;
  } else {
    vueCtl.iconSize = 1;
  }
}

function openScreenAD() {
  if(plus.webview.getWebviewById("screenAD")) {
    plus.webview.getWebviewById("screenAD").show();
  }
}

function hideScreenAD() {
  if(plus.webview.getWebviewById("screenAD")) {
    plus.webview.getWebviewById("screenAD").hide();
  }
}

function hideVersionAD() {
  if(plus.webview.getWebviewById("version")) {
    plus.webview.getWebviewById("version").hide();
  }
}