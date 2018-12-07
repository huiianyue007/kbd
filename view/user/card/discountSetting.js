// 初始化mui
mui.init();

// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    cardId: "",
    discount: 0,
    shopName: '',
    isCardShare: 0, //是否是共享卡
    cardParam: {
      cardid: "",
      status: "0"
    },
    card: {
      cardAmount: 0, //卡余额
      max_income: 0, //最多赚取
      expect_income: 0, //预计收益
      cardRate: 0,
      shareRate: 0 //共享折扣
    },
    discountParam: {
      uid: "",
      cardid: "",
      rate: ""
    },
    loaded: false
  },

  filters: {
    expect_income: function(cardAmount, discount) {
      var result = Number(cardAmount) / (Number(discount) * 0.1);
      return isNaN(result) ? '0.00' : result.toFixed(2);
    },
    max_income: function(cardAmount, discount) {
      //最大赚取：【余额/（9.5*0.1）-第三方抽成 】* 0.7
      //第三方抽成：余额/1000*6；
      var temp = (Number(cardAmount) / (9.5 * 0.1) - Number(cardAmount) / 1000 * 6) * 0.7;
      return isNaN(temp) ? '0.00' : temp.toFixed(2);
    },
    floatVal: function(temp) {
      temp = Number(temp).toFixed(2);
      return temp;
    }
  },
  computed: {
    expoectIncome: function() {
      var a = this.card.cardRate / 10.0;
      var b = this.discount / 10.0;
      var c = this.card.cardAmount;
      // 共享折扣大于原本折扣
      if(b > a) {
        return(c / a * b * 0.994 - (c / a * b * 0.994 - c / a * a) * 0.3).toFixed(2);
      } else if(b <= a) {
        return(c / a * b * 0.994).toFixed(2);
      }
    },
    maxIncome: function() {
      var a = this.card.cardRate / 10.0;
      var b = this.discount / 10.0;
      var c = this.card.cardAmount;
      // 共享折扣大于原本折扣
      if(a != 0.95) {
        return((c / a * 0.95 * 0.994 - c) * 0.7).toFixed(2);
      } else {
        return(0).toFixed(2);
      }
    },
    tipsMsg: function() {
      var n = Number(this.discount) - Number(this.card.cardRate);
      if(n >= 2) {
        return "朋友，别人用完你赚疯了。";
      } else if(n > 0) {
        return "边吃边赚钱的感觉爽歪歪。";
      } else if(n == 0) {
        return "WHAT?不赚不赔钱 该如何解释？";
      } else if(n < 0 && n > -2) {
        return "吃点小亏，还算OK。";
      } else {
        return "清仓甩卖，撤啦撤啦。";
      }
    },
    tipsImg: function() {
      var n = Number(this.discount) - Number(this.card.cardRate);
      if(n >= 2) {
        return "../../../res/img/discount/z2.png";
      } else if(n > 0) {
        return "../../../res/img/discount/z0.png";
      } else if(n == 0) {
        return "../../../res/img/discount/d0.png";
      } else if(n < 0 && n > -2) {
        return "../../../res/img/discount/f0.png";
      } else {
        return "../../../res/img/discount/f2.png";
      }
    }
  },
  methods: {
    algorithm: function(opt) {
      if(opt && this.card.Denomination > 0) {
        this.card.Denomination--
      } else if(!opt) {
        this.card.Denomination++
      }
    }
  }
});
mui.plusReady(function() {
  iosBackEvent(function() {
    // ios滑动关闭页面
    if(plus.webview.getWebviewById("user/card/memcardDetail")) {
      plus.webview.getWebviewById("user/card/memcardDetail").evalJS("initInfo()");
    }
  })
  plus.nativeUI.showWaiting(app.loadingWords);
  //获取当前页面视图
  var webview = plus.webview.currentWebview();
  /**
   * 获取用户ID
   */
  vueCtl.discountParam.uid = app.getState().userInfo.id;
  /**
   * 获取储值卡ID
   */
  vueCtl.cardParam.cardid = webview.cardid;
  vueCtl.discountParam.cardid = webview.cardid;
  /*
   * 获取储值卡详情
   */
  app.userMemcard(vueCtl.cardParam, function(data) {
    mui.later(function() {
      plus.nativeUI.closeWaiting();
    }, 250);
    if(data && data.status == app.STATUS_SUCCESS) {
      if(data.info.shareRate * 1 >= "9.5") {
        vueCtl.discount = 9.5;
      } else if(data.info.shareRate * 1 <= "5") {
        vueCtl.discount = 5;
      } else {
        vueCtl.discount = Number(data.info.shareRate);
      }
      vueCtl.shopName = data.info.shopName
      vueCtl.isCardShare = data.info.isCardShare;
      vueCtl.card.cardAmount = data.info.cardAmount;
      vueCtl.card.cardRate = data.info.cardRate;
      vueCtl.loaded = true;
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
  /**
   * 开启共享
   */
 app.tapEvent("settingShare", function() {

    vueCtl.discountParam.rate = vueCtl.discount;
    vueCtl.discountParam.status = '1';
    app.dscountSetting(vueCtl.discountParam, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        if(plus.webview.getWebviewById("user/card/memcardDetail")) {
          plus.webview.getWebviewById("user/card/memcardDetail").evalJS("initInfo()");
        }
        mui.toast("共享折扣设置成功");
        /*app.shareWeb({
          value: 'https://pay.kabuduo.cn/kabuduowx/index.html?token=' + app.getState().token + '&shopName=' + escape(vueCtl.shopName) + '&discount=' + vueCtl.discount + '&cardAmount=' + vueCtl.card.cardAmount,
          thumbs: ['../../../res/img/animate/icon.png'],
          title: '卡不多',
          content: app.getState().userInfo.nickName + ' 分享了 ' + vueCtl.shopName + ' 的 ' + vueCtl.discount + ' 折储值卡，快来用吧~'
        })*/
       /*app.shareMiniProgram({
         value: 'http://172.16.47.123:8020/kabuduowx/index.html?token=' + app.getState().token + '&shopName=' + escape(vueCtl.shopName) + '&discount=' + vueCtl.discount + '&cardAmount=' + vueCtl.card.cardAmount,
          thumbs: ['../../../res/img/animate/icon.png'],
          title: '卡不多',
          content: '卡不多描述'
       })*/
      } else {
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  });
//app.tapEvent("settingShare", function() {
//  vueCtl.discountParam.rate = vueCtl.discount;
//  app.dscountSetting(vueCtl.discountParam, function(data) {
//    if(data && data.status == app.STATUS_SUCCESS) {
//      if(plus.webview.getWebviewById("user/card/memcardDetail")) {
//        plus.webview.getWebviewById("user/card/memcardDetail").evalJS("initInfo()");
//      }
//      mui.toast("共享折扣设置成功");
//    } else {
//      if(data == 'error') {
//        mui.toast("数据加载失败...")
//        return;
//      }
//      mui.toast(data.info);
//    }
//  });
//});

  /**
   * 关闭共享
   */
  app.tapEvent("closeShare", function() {
    vueCtl.discountParam.rate = vueCtl.discount;
    vueCtl.discountParam.status = "0";
    app.dscountSetting(vueCtl.discountParam, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        plus.webview.getWebviewById("user/card/memcardDetail").evalJS("initInfo()");
        mui.toast("共享折扣关闭成功");
        webview.close();
      } else {
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  });
});