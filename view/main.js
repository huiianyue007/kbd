// 广告弹层
var screenAD;

(function($, doc) {
  // 当前窗口，父窗口,遮罩层
  var ws, wo;
  // 获得top
  var topoffset = '-60px';

  var mapPage = "map";
  if(mui.os.ios) mapPage = "mapweb"

  // 初始化mui
  $.init({
    // 初始加载地图
    subpages: [{
      url: 'map/' + mapPage + '.html',
      id: 'maps',
      styles: {
        top: topoffset, //mui标题栏默认高度为45px;
        bottom: '0px', //默认为0px，可不定义;
        render: 'always'
      }
    }]
  });
  // h5+代码
  $.plusReady(function() {
    ws = plus.webview.currentWebview();
    // 设置当前页面仅支持竖屏显示
    plus.screen.lockOrientation("portrait-primary");
    // 判断是否进入引导页面
    if(!localStorage.getItem("bootPage")) {
      app.normalOpen("user/bootPage", "user/bootPage.html", null, null);
    }

    // 兼容immersed状态栏模式
    if(plus.navigator.isImmersedStatusbar()) {
      //			topoffset = (Math.round(plus.navigator.getStatusbarHeight()) + 45) + 'px';
    }

    // 添加监听从系统消息中心点击某条消息启动应用事件
    plus.push.addEventListener("receive", function(msg) {
      //			var settings = app.getSettings() || {};
      // 分析msg.payload处理业务逻辑
      try {
        // 收到通知
        //				var content = msg.content;
        // 有蹭卡通知查询消息
        if(plus.webview.getWebviewById("map_header")) {
          plus.webview.getWebviewById("map_header").evalJS("loadMsgCount()");
        }
      } catch(error) {
        console.log("im error")
      }
    }, false);

    // 避免争夺用户资源
    mui.later(function() {
      // 检查用户端cid
      checkPushCid();
    }, 200);

  });

  // 退出应用方法
  $.oldBack = $.back;
  var bqa = app.BackQuitApp();

}(mui, document));

// 关闭splash
function clsSplash() {
  plus.navigator.closeSplashscreen();
  plus.navigator.setFullscreen(false);
}

var checkPushCidCount = 0;
// 重新查询pushcid
function regetPushCid() {
  checkPushCidCount = 0;
  checkPushCid();
}
// 检查cid是否存在
function checkPushCid() {
  var settings = app.getSettings() || {};

  // 本地没有存储信息
  if(!(!!settings.clientInfo)) {
    checkPushCidCount++;
    var clientInfo = plus.push.getClientInfo();
    // 如果没拿到数据，三秒做一次轮询
    if(!(!!clientInfo.clientid) || clientInfo.clientid == 'null') {
      if(checkPushCidCount <= 5) {
        setTimeout(function() {
          checkPushCid();
        }, 3000);
      }
    } else {
      settings.clientInfo = clientInfo;
      app.setSettings(settings);
    }
  }
}