// 初始化mui
mui.init();
// vue控制器，用于页面数据控制 v-show="loaded" style="display: none;"
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    navType: "newCard",
    merchantParam: {
      shopid: "",
      sort: "0",
      sex: "2",
      status: "0"
    },
    merchantCards: [],
    loaded: false

  },
  filters: {
    intVal: function(value) {
      value = value + "";
      return value.split('.')[0] || 10;
    },
    floatVal: function(value) {
      value = value + "";
      return value.split('.')[1] || 0;
    },
    calaVal: function(payMoney, cardRate) {
      var temp = Number(payMoney) / Number(cardRate * 0.1) - Number(payMoney);
      temp = temp.toFixed(2);
      return temp;
    },
    imgSrc: function(str) {
      if(!str) return false
      return 'http://payp.kabuduo.cn/img/s2/' + (str * 1).toFixed(1) + '.png'
    },
    imgBuySrc: function(str) {
      if(!str) return false
      return 'http://payp.kabuduo.cn/img/s2/' + (str * 1).toFixed(1) + '.png'
    }

  },
  methods: {
    openWindow: function(data) {
      var param = {
        shopid: vueCtl.merchantParam.shopid,
        ucid: data.cid
      }
      if(data.isScave === '1') {
        app.signinOpen("qrscan", "/view/scan/qrscan.html", 'pop-in');
      } else {
        app.signinOpen("pay/rubCardPay", "../pay/rubCardPay.html", null, param);
      }
    },
    openCardSelling: function(data) {
      var param = {
        shopid: vueCtl.merchantParam.shopid,
        ucid: data.id
      }
      app.signinOpen("merchant/cardSellingDetails", "cardSellingDetails.html", null, param);
    },
    becomeCardOwner: function() {
      buyCard();
    }
  }
});
mui.plusReady(function() {
  /**
   * 关闭支付成功页面
   */
  if(plus.webview.getWebviewById("pay/paystoredsuccess")) {
    plus.webview.getWebviewById("pay/paystoredsuccess").hide();
    plus.webview.getWebviewById("pay/paystoredsuccess").close();
  }
  /**
   * 设置状态栏的样式
   */
  var t = document.getElementById('navbar');
  if(mui.os.android) {
    if(Number(immersed) > 0) {
      if(screen.width == "412" || screen.width == "393") {
        t && (t.style.top = (0.835 + immersed / 100) + 'rem');
        t = document.getElementById('newCardType');
        t && (t.style.top = (1.35 + immersed / 100) + 'rem');
        t = document.getElementById('allType');
        t && (t.style.top = (1.5 + immersed / 100) + 'rem');
      } else {
        t && (t.style.top = (0.92 + immersed / 100) + 'rem');
        t = document.getElementById('newCardType');
        t && (t.style.top = (1.6 + immersed / 100) + 'rem');
        t = document.getElementById('allType');
        t && (t.style.top = (1.63 + immersed / 100) + 'rem');
      }

    }
  }
  if(mui.os.ios) {
    if(Number(immersed) > 0) {
      if(screen.width == "320") {
        t && (t.style.top = (1 + immersed / 100) + 'rem');
        t = document.getElementById('newCardType');
        t && (t.style.top = (1.7 + immersed / 100) + 'rem');
        t = document.getElementById('allType');
        t && (t.style.top = (1.7 + immersed / 100) + 'rem');
      } else if(screen.width == "414") {
        t && (t.style.top = (0.75 + immersed / 100) + 'rem');
        t = document.getElementById('newCardType');
        t && (t.style.top = (1.4 + immersed / 100) + 'rem');
        t = document.getElementById('allType');
        t && (t.style.top = (1.4 + immersed / 100) + 'rem');
      } else {
        t && (t.style.top = (0.85 + immersed / 100) + 'rem');
        t = document.getElementById('newCardType');
        t && (t.style.top = (1.5 + immersed / 100) + 'rem');
        t = document.getElementById('allType');
        t && (t.style.top = (1.5 + immersed / 100) + 'rem');
      }
    }
  }
  plus.nativeUI.showWaiting(app.loadingWords);
  /**
   * 获取商家信息
   */
  vueCtl.merchantParam.shopid = plus.webview.currentWebview().shopid;
  vueCtl.merchantParam.status = plus.webview.currentWebview().status;
  /**
   * 判断当前手机是否是iphoneX，然后创建安全区域
   */
  if(plus.device.model == "iPhoneX") {
    if(vueCtl.merchantParam.status == "0") {
      document.getElementById("securityArea").style.display = "";
      document.getElementById("securityAreaBuy").style.display = "none";
    } else {
      document.getElementById("securityAreaBuy").style.display = "";
      document.getElementById("securityArea").style.display = "none";
    }
  }
  if(vueCtl.merchantParam.status == "0") {
    document.getElementById("cengCard").style.display = "";
    document.getElementById("BuyCard").style.display = "none";
  } else {
    vueCtl.merchantParam.sex = "";
    vueCtl.merchantParam.sort = "";
    //改变li样式
    mui(".header li").each(function() {
      this.className = "headerLi";
    });
    document.getElementById("buyCardHeader").className = "headerLi headerLiActive";
    document.getElementById("cengCard").style.display = "none";
    document.getElementById("BuyCard").style.display = "";
  }
  /**
   * 购卡、蹭卡选择事件
   */
  mui(".header").on("tap", "li", function() {
    vueCtl.loaded = false;
    plus.nativeUI.showWaiting("数据加载中，请稍候……");
    //改变li样式
    mui(".header li").each(function() {
      this.className = "headerLi";
    });
    this.className = "headerLi headerLiActive";
    vueCtl.merchantParam.status = this.getAttribute("status");
    if(vueCtl.merchantParam.status == "0") {
      vueCtl.merchantParam.sex = "2";
      vueCtl.merchantParam.sort = "0";
      //改变li样式
      mui(".navbar li").each(function() {
        this.className = "";
      });
      //改变li样式
      mui(".navbarSecond li").each(function() {
        this.className = "";
      });
      document.getElementById("newCard").innerHTML = '新卡推荐<img src="../../res/img/common/cardType.png"/>';
      document.getElementById("all").innerHTML = '全部<img src="../../res/img/common/cardType.png"/>';
      document.getElementById("newCard").className = "navbarActive";
      document.getElementById("newCardTypeOne").className = "liActive";
      if(plus.device.model == "iPhoneX") {
        document.getElementById("securityArea").style.display = "";
        document.getElementById("securityAreaBuy").style.display = "none";
      }
      document.getElementById("cengCard").style.display = "";
      document.getElementById("BuyCard").style.display = "none";
    } else {
      vueCtl.merchantParam.sex = "";
      vueCtl.merchantParam.sort = "";
      vueCtl.merchantParam.status = "1";
      document.getElementById("cengCard").style.display = "none";
      document.getElementById("BuyCard").style.display = "";
      if(plus.device.model == "iPhoneX") {
        document.getElementById("securityAreaBuy").style.display = "";
        document.getElementById("securityArea").style.display = "none";
      }
    }
    loadMerchantCard();
  });
  /**
   * 分类选择事件
   */
  mui(".navbar").on("tap", "li", function() {
    document.getElementById("tanceng").style.display = "";
    //改变li样式
    mui(".navbar li").each(function() {
      this.className = "";
    });
    this.className = "navbarActive";
    //隐藏二级菜单
    mui(".navbarSecond").each(function() {
      this.style.display = "none";
    });
    vueCtl.navType = this.getAttribute("id");
    document.getElementById(this.getAttribute("id") + "Type").style.display = "";
  });
  /**
   * 二级菜单选择事件
   */
  mui(".navbarSecond").on("tap", "li", function() {
    //改变li样式
    mui(".navbarSecond li").each(function() {
      this.className = "";
    });
    this.className = "liActive";
    if(vueCtl.navType == "all") {
      vueCtl.merchantParam.sex = this.getAttribute("type");
    }
    if(vueCtl.navType == "newCard") {
      vueCtl.merchantParam.sort = this.getAttribute("type");
    }
    document.getElementById(vueCtl.navType).setAttribute("dataId", this.getAttribute("type"));
    document.getElementById(vueCtl.navType).innerHTML = this.innerText + '<img src="../../res/img/common/cardType.png"/>';
    //隐藏二级菜单
    mui(".navbarSecond").each(function() {
      this.style.display = "none";
    });
    document.getElementById("tanceng").style.display = "none";
    loadMerchantCard();
  });
  /**
   * 弹层点击事件
   */
  app.tapEvent("tanceng", function() {
    //隐藏二级菜单
    mui(".navbarSecond").each(function() {
      document.getElementById("tanceng").style.display = "none";
      this.style.display = "none";
    });
  });
  /**
   * 查询商家卡信息
   */
  function loadMerchantCard() {
    app.cardListShopChead(vueCtl.merchantParam, function(data) {
      mui.later(plus.nativeUI.closeWaiting, 250);
      if(data && data.status == app.STATUS_SUCCESS) {
        vueCtl.merchantCards = data.info;
        if(vueCtl.merchantParam.status == "0") {
          if(data.info.length > 0) {
            document.getElementById("emptyDataCengCard").style.display = "none";
            document.getElementById("cengCardContent").style.display = "";
          } else {
            document.getElementById("cengCardContent").style.display = "none";
            document.getElementById("emptyDataCengCard").style.display = "";
          }

        } else {
          if(data.info.length > 0) {
            document.getElementById("buCardContent").style.display = "";
          } else {
            document.getElementById("emptyDataBuyCard").style.display = "";
          }
        }
      } else {
        document.getElementById("emptyData").style.display = "";
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  }
  /**
   * 打开商家详情页面
   */
  app.tapEvent("shopDetails", function() {
    var param = {
      shopid: vueCtl.merchantParam.shopid
    }
    app.signinOpen("merchant/shopDetails", "shopDetails.html", null, param)
  });
  loadMerchantCard();
});

function buyCard() {
  plus.nativeUI.showWaiting(app.loadingWords);
  mui.later(plus.nativeUI.closeWaiting, 250);
  vueCtl.merchantParam.sex = "";
  vueCtl.merchantParam.sort = "";
  vueCtl.merchantParam.status = "1";
  //改变li样式
  mui(".header li").each(function() {
    this.className = "headerLi";
  });
  document.getElementById("buyCardHeader").className = "headerLi headerLiActive";
  document.getElementById("cengCard").style.display = "none";
  document.getElementById("BuyCard").style.display = "";
  app.cardListShopChead(vueCtl.merchantParam, function(data) {
    mui.later(plus.nativeUI.closeWaiting, 250);
    if(data && data.status == app.STATUS_SUCCESS) {
      vueCtl.merchantCards = data.info;
      if(data.info.length > 0) {
        document.getElementById("buCardContent").style.display = "";
      } else {
        document.getElementById("emptyDataBuyCard").style.display = "";
      }
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
}