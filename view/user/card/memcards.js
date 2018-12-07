// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    isOpenWindow: "",
    memCards: [],
    loaded: false
  },
  computed: {
    toatalBalance: function() {
      var totalBalance = 0;
      for(i in this.memCards) {
        totalBalance += Number(this.memCards[i].cardAmount);
      }
      totalBalance = totalBalance.toFixed(2);
      return totalBalance;
    }

  },
  filters: {
    intVal: function(str) {
      if(str) {
        str = str + '';
        return str.split('.')[0];
      }
      return '0';
    },
    floatVal: function(str) {
      if(str) {
        str = str + '';
        return str.split('.')[1];
      }
      return '0';
    },
    imgSrc: function(str) {
      if(!str) return false
      return 'http://payp.kabuduo.cn/img/s2/' + (str * 1).toFixed(1) + '.png'
    }

  },
  methods: {
    openWindow: function(data) {
      var param = {
        cardId: data.id
      };
      app.signinOpen("user/card/memcardDetail", "memcardDetail.html", null, param);
    }
  }
});

mui.plusReady(function() {
  if(plus.device.model == "iPhoneX") {
    document.getElementById("securityArea").style.display = "";
  }
  iosBackEvent(function() {
    // ios滑动关闭页面
    if(plus.webview.getWebviewById("user/home")) {
      plus.webview.getWebviewById("user/home").evalJS("initInfo()");
    }
  })

  //获取支付成功传过来的参数
  if(plus.webview.currentWebview().type) {
    vueCtl.isOpenWindow = plus.webview.currentWebview().type;
  }
  /**
   * 储值卡详情
   */
  if(plus.webview.getWebviewById("user/card/memcardDetail")) {
    plus.webview.getWebviewById("user/card/memcardDetail").hide();
    plus.webview.getWebviewById("user/card/memcardDetail").close();
  }
  initInfo();
  mui.back = function() {
    if(vueCtl.isOpenWindow == "openWindow") {
      if(plus.webview.getWebviewById("user/home")) {
        plus.webview.getWebviewById("user/home").evalJS("initInfo()");
        plus.webview.currentWebview().close();
      } else {
        var param = {
          type: "openWindow"
        }
        app.signinOpen("user/home", "../home.html", null, param);
      }

    } else {
      plus.webview.getWebviewById("user/home").evalJS("initInfo()");
      plus.webview.currentWebview().close();
    }
  }
});

function initInfo() {
  plus.nativeUI.showWaiting(app.loadingWords);
  /**
   * 获取用户的储值卡
   */
  app.userMemcards(function(data) {
    mui.later(plus.nativeUI.closeWaiting, 250);
    vueCtl.loaded = true;
    if(data && data.status == app.STATUS_SUCCESS) {
      vueCtl.memCards = data.info;
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
}