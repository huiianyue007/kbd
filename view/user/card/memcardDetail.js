// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    toatalBalance: '0.00',
    isOpenWindow: "",
    cardParam: {
      cardid: "",
      status: "0"
    },
    memCard: {},
    discountParam: {
      uid: "",
      cardid: "",
      rate: ""
    }

  },
  filters: {
    intVal: function(value) {
      value = String(value || 0);
      return value.split('.')[0] || 10;
    },
    floatVal: function(value) {
      value = String(value || 0);
      return value.split('.')[1] || 0;
    },
    imgSrc: function(str) {
      if(!str) return false
      return 'http://payp.kabuduo.cn/img/s2/' + (str * 1).toFixed(1) + '.png'
    }

  },
  methods: {
    openConsumptions: function(id) {
      var param = {
        cardId: id
      };
      app.signinOpen("user/card/consumptions", "consumptions.html", null, param);
    },
    openCardInstructions: function() {
      app.normalOpen("user/card/cardInstructions", "cardInstructions.html", null, null);
    },
    openDiscountSetting: function() {
      app.normalOpen("user/card/discountSetting", "discountSetting.html", null, vueCtl.cardParam);
    }
  }
});
mui.plusReady(function() {
  if(plus.device.model == "iPhoneX") {
    document.getElementById("btn").style.bottom = "0.66rem";
  }
  iosBackEvent(function() {
    // ios滑动关闭页面
    if(plus.webview.getWebviewById("user/card/memcards")) {
      plus.webview.getWebviewById("user/card/memcards").evalJS("initInfo()");
    }
  })
  /**
   * 支付成功
   */
  if(plus.webview.getWebviewById("pay/paycardsuccess")) {
    plus.webview.getWebviewById("pay/paycardsuccess").hide();
    plus.webview.getWebviewById("pay/paycardsuccess").close();
  }
  //获取当前页面视图
  var webview = plus.webview.currentWebview();
  vueCtl.discountParam.uid = app.getState().userInfo.id;

  //获取支付成功传过来的参数
  if(plus.webview.currentWebview().type) {
    vueCtl.isOpenWindow = plus.webview.currentWebview().type;
  }
  //获取储值卡Id
  vueCtl.cardParam.cardid = webview.cardId;
  initInfo();
  mui.back = function() {
    if(vueCtl.isOpenWindow == "openWindow") {
      if(plus.webview.getWebviewById("user/card/memcards")) {
        plus.webview.getWebviewById("user/card/memcards").evalJS("initInfo()");
        plus.webview.currentWebview().close();
      } else {
        var param = {
          type: "openWindow"
        }
        app.signinOpen("user/card/memcards", "memcards.html", null, param);
      }
    } else {
      if(plus.webview.getWebviewById("user/card/memcards")) {
        plus.webview.getWebviewById("user/card/memcards").evalJS("initInfo()");
        plus.webview.currentWebview().close();
      }
    }
  }
});

function initInfo() {
  plus.nativeUI.showWaiting(app.loadingWords);
  /**
   * 获取用户的储值卡详细信息
   */
  app.userMemcard(vueCtl.cardParam, function(data) {
    mui.later(function() {
      plus.nativeUI.closeWaiting();
    }, 250);
    if(data && data.status == app.STATUS_SUCCESS) {
      if(data.info == "") {} else {
        vueCtl.memCard = data.info;
        document.getElementById("memCard").style.display = "";
        vueCtl.discountParam.cardid = vueCtl.memCard.id;
        vueCtl.discountParam.rate = vueCtl.memCard.shareRate;
      }
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
  /**
   * 充值
   */
  app.tapEvent("chongzhi", function() {
    var param = {
      shopid: vueCtl.memCard.shopid,
      ucid: vueCtl.memCard.id,
      shopname: vueCtl.memCard.shopName
    }
    app.normalOpen("pay/rechargePay", "../../pay/rechargePay.html", null, param);
  });
  app.tapEvent("select", function() {
    vueCtl.discountParam.status = (vueCtl.memCard.isCardShare === '1' ? '0' : '1');
    app.dscountSetting(vueCtl.discountParam, function(data) {
      console.log(JSON.stringify(data))
      if(data && data.status == app.STATUS_SUCCESS) {
        initInfo()
      } else {
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  })

  /**
   * 买单
   */
  app.tapEvent("maidan", function() {
    var param = {
      shopid: vueCtl.memCard.shopid,
      ucid: vueCtl.memCard.id
    }
    if(vueCtl.memCard.isScave === '1') {
      app.signinOpen("qrscan", "/view/scan/qrscan.html", 'pop-in');
    } else {
      app.normalOpen("pay/storedCardPay", "../../pay/storedCardPay.html", null, param);
    }
  });
}