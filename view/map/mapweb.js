mui.init();
var safearea = 0;
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    map: {}, // 地图对象
    nativeMap: {},
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
    iconSize: 3, // 地图默认的icon大小
    cacheBusiId: '', // 当前选中的mark的id
    isIPhoneX: false
  },
  methods: {

  }
});

mui.plusReady(function() {
  var t = document.body;
  t && (t.style.paddingTop = '0px');

  try {
    if('iphonex' == plus.device.model.toLowerCase()) {
      safearea = 30;
    }
  } catch(e) {
    safearea = 0;
  }

  // 获得当前窗口对象
  vueCtl.selfWebView = plus.webview.currentWebview();

  // 优先初始化本地地图
  vueCtl.nativeMap = new plus.maps.Map("nativeMap");

  // 创建子窗口（页面小工具）

  // 避免资源争夺闪退
  mui.later(function() {
    createSubview();
    initMap()
    // 地图加载完成后，调用关闭窗口
    plus.webview.currentWebview().parent().evalJS("clsSplash()");

    // 广告
    var curTimestamp = new Date().getTime();
    // 首先判断今天是否查询过广告。
    var state = app.getState();
    var adStatus = state.adStatus || {};
    var version = plus.runtime.version
    app.update({
      isUser: '0',
      isIos: '1',
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
    // 应用显示栈顶的Webview窗口
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

  vueCtl.map = new BMap.Map("map")
  vueCtl.map.setZoom(vueCtl.defaultZoom);
  // 初始化搜索对象
  vueCtl.searchObj = new BMap.WalkingRoute(vueCtl.map, {
    renderOptions: {
      map: vueCtl.map,
      autoViewport: true
    }
  });
  // 设置显示用户位置
  //	vueCtl.map.showUserLocation(true);
  // 定位到用户位置
  initUserLocation();

  // --- event 事件开始，比如地图状态改变时间，点击时间。
  // 地图状态修改
  vueCtl.map.addEventListener("dragend", function(event) {
    // 信息窗口如果没有打开，则可以进行刷新
    if(!vueCtl.infoShow) {
      mapRefresh();
    }
  });
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
  vueCtl.searchObj.setSearchCompleteCallback(function() {
    if(!vueCtl.searchObj.getResults()) {
      alert("没有检索到结果");
    }

    var result = vueCtl.searchObj.getResults();
    vueCtl.routeLine = result.getPlan(0).getRoute(0);
    var pts = vueCtl.routeLine.getPath(); //通过实例，获得一系列点的数组
    vueCtl.searchObj.clearResults();

    reDrawMarker();

    // 更新起点
    vueCtl.map.removeOverlay(vueCtl.startPoint);
    vueCtl.startPoint = new BMap.Marker(result.getStart().point, {
      icon: new BMap.Icon("http://imadiaos.com/static/kabuduo/img/map/ding@3x.png", new BMap.Size(50, 50), {
        imageSize: new BMap.Size(50, 50)
      })
    });
    vueCtl.map.addOverlay(vueCtl.startPoint);

    // 更新线路
    vueCtl.map.removeOverlay(vueCtl.pline);
    // 增加线路
    vueCtl.pline = new BMap.Polyline(pts, {
      strokeColor: "#FDD804",
      strokeWeight: 5,
      strokeOpacity: 0.8
    });
    vueCtl.map.addOverlay(vueCtl.pline);

    setTimeout(function() {
      vueCtl.map.setViewport([result.getStart().point, result.getEnd().point], {
        zoomFactor: -1,
        delay: 400
      }); //调整到最佳视野
    }, 10);

  });

}
// 初始化进入用户位置信息
function initUserLocation(callback) {
  if(vueCtl.userPoint.lng) {
    vueCtl.map.centerAndZoom(vueCtl.userPoint, vueCtl.defaultZoom);
  } else {
    vueCtl.nativeMap.getUserLocation(function(state, pos) {
      if(0 == state) {
        var point = new BMap.Point(pos.longitude, pos.latitude);

        vueCtl.userPoint = point;
        vueCtl.centerPoint = point;

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
  // 重新定位
  vueCtl.nativeMap.getUserLocation(function(state, pos) {
    if(0 == state) {
      var point = new BMap.Point(pos.longitude, pos.latitude);
      // 获得屏幕中心点
      vueCtl.userPoint = point;
      vueCtl.centerPoint = point;
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
  var tempRate = data.shopMinRate.toString().split('.');
  var shadow = '';
  var icon = null;
  if(vueCtl.cacheBusiId === data.id) {
    icon = new BMap.Icon("http://imadiaos.com/static/kabuduo/img/map/discount/shadow/sale_icon_" + tempRate[0] + (tempRate[1] || 0) + "@" + vueCtl.iconSize + "x.png", new BMap.Size(79, 56), {
      imageSize: new BMap.Size(79, 56)
    })
  } else {
    icon = new BMap.Icon("https://payp.kabuduo.cn/img/icon/sale_icon_s_" + tempRate[0] + (tempRate[1] || 0) + "@" + vueCtl.iconSize + "x.png", new BMap.Size(50, 35), {
      imageSize: new BMap.Size(50, 35)
    })
  }

  var marker = new BMap.Marker(new BMap.Point(data.shopLongitude, data.shopLatitude), {
    icon: icon
  });
  marker.addEventListener('click', function(e) {
    // 缓存坐标
    vueCtl.cacheBusiId = this.busiId;

    showMerCard(this);
    // 先跳转，再打开。顺序不能变。会影响marker和info的匹配
    plus.webview.getWebviewById("map_busi").evalJS("jumptoCard('" + data.id + "')");
    // 点击地图，并在busi板中展示信息
    plus.webview.getWebviewById("map_busi").evalJS("setMapBusiInfoPanl('open')");
    // 组织事件冒泡到地图对象
    e.domEvent.stopPropagation();
  });
  marker.busiId = data.id;
  marker.setZIndex(2)
  vueCtl.map.addOverlay(marker);
  vueCtl.markers.push(marker);
}
// 外部触发marker点击
function triggerMarker(id) {
  for(var i in vueCtl.markers) {
    if(vueCtl.markers[i].busiId == id) {
      vueCtl.cacheBusiId = id;
      showMerCard(vueCtl.markers[i]);
    }
  }

}

function showMerCard(marker) {
  // 通过marker的id，循环。找到相等的。对其进行点击。
  // 需要区分事件是手动触发的，还是轮播触发的
  // 绘制路线信息
  drawRoute(new BMap.Point(vueCtl.searchPoint.lng, vueCtl.searchPoint.lat), marker.getPosition());
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
  var merchantParam = {
    'longitude': vueCtl.centerPoint.lng,
    'latitude': vueCtl.centerPoint.lat
  };

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
        // 同步数据
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
  var point = {
    'longitude': vueCtl.centerPoint.lng,
    'latitude': vueCtl.centerPoint.lat
  }
  plus.webview.getWebviewById("map_header").evalJS("setParam('" + JSON.stringify(point) + "')");
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
  // 如果实现存在，则将其清空
  if(plus.webview.getWebviewById("map_header") != null) plus.webview.getWebviewById("map_header").close();
  if(plus.webview.getWebviewById("map_sub") != null) plus.webview.getWebviewById("map_sub").close();
  if(plus.webview.getWebviewById("map_center") != null) plus.webview.getWebviewById("map_center").close();
  if(plus.webview.getWebviewById("map_busi") != null) plus.webview.getWebviewById("map_busi").close();
  // 商家展示功能
  var wsub = plus.webview.create('map_header.html', 'map_header', {
    top: (immersed + 60) + 'px',
    height: '45px',
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  vueCtl.selfWebView.append(wsub);
  // 底部按钮
  var wsub = plus.webview.create('map_sub.html', 'map_sub', {
    bottom: (safearea + 0) + "px", // 140px
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
    bottom: (safearea + 1) + 'px',
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
  vueCtl.searchObj.search(src, dst);
}
// 地图刷新
function mapRefresh() {
  // 清除路线
  vueCtl.map.removeOverlay(vueCtl.pline);
  vueCtl.map.removeOverlay(vueCtl.startPoint);
  // 查询数据
  var point = vueCtl.map.getCenter();
  // 获得屏幕中心点
  vueCtl.centerPoint = point;
  // 判断是否需要查询商户
  // 如果是首次，则查询。如果是距离上次查询点小于2公里，则不查询。
  if(!vueCtl.searchPoint.lng || !vueCtl.searchPoint.lat) {
    drawBusiness();
  } else {
    var point_cache = new plus.maps.Point(vueCtl.searchPoint.lng, vueCtl.searchPoint.lat);
    var point_now = new plus.maps.Point(vueCtl.centerPoint.lng, vueCtl.centerPoint.lat);
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