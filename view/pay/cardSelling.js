// 初始化mui
mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    shopid: "",
    ucid: "",
    isUser: "1",
    discountMoney: "0.00",
    provinceMoney: "0.00",
    payType: "0",
    cardDetails: {},
    show: false,
    show: false,
    orderid: '',
    carid: '',
    shopname: ''
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
      return temp | 0;
    },
    imgSrc: function(str) {
      if(!str) return false
      return 'http://payp.kabuduo.cn/img/s2/'+ (str * 1).toFixed(1) +'.png'
    }
  },
  computed: {
    payTypeId: function() {
      if(this.payType == 1) {
        return 'alipay'
      } else if(this.payType == 0) {
        return 'wxpay'
      }
    }
  },
  methods: {
    openWindow: function(id) {
      app.normalOpen("user/card/memcardDetail", "memcardDetail.html")
    },
    cancel: function() {
      this.show = false
    },
    confirm: function() {
      var self = this
      console.log(JSON.stringify({
        uid: app.getState().userInfo.id,
        shopid: this.shopid,
        caid: this.ucid,
        payType: this.payType
      }))
      app.createCardSellingOrder({
        uid: app.getState().userInfo.id,
        shopid: this.shopid,
        caid: this.ucid,
        payType: this.payType
      }, function(data) {
        if(data && (data.status == app.STATUS_SUCCESS || data.status == 'okay')) {
          
          var param = {
            orderid: data.info.orderid,
            payType: "购卡",
            caid: data.info.cid
          }
          app.normalOpen("pay/paycardsuccess", "paycardsuccess.html", null, param);
        } else {
          if(data == 'error') {
            mui.toast("数据加载失败...")
            return;
          }
          mui.toast(data.info);
        }
      })
    }
  }
});
mui.plusReady(function() {
  if(plus.device.model == "iPhoneX") {
    document.getElementById("payButton").style.bottom = "0.66rem";
  }
  /**
   * 获取商家信息
   */
  vueCtl.shopid = plus.webview.currentWebview().shopid;
  vueCtl.ucid = plus.webview.currentWebview().ucid;
  vueCtl.shopname = plus.webview.currentWebview().shopname;
  /**
   * 获取共享卡的详情信息
   */
  app.cardDetails(vueCtl.ucid, vueCtl.isUser, function(data) {
    if(data && data.status == app.STATUS_SUCCESS) {
      vueCtl.cardDetails = data.info;
      console.log(JSON.stringify(vueCtl.cardDetails))
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
    }
  });
  /**
   * 支付方式的选择
   */
  mui(".payType").on("tap", "li", function() {
    /**
     * 改变样式
     */
    mui(".payType .payTypeImg").each(function() {
      this.setAttribute('src', '../../res/img/common/check.png');
    });
    this.getElementsByClassName('payTypeImg')[0].setAttribute('src', '../../res/img/common/checked.png')
    //		document.getElementsByClassName("payTypeImg")[this.getAttribute("payType")].setAttribute('src', '../../res/img/common/checked.png');
    vueCtl.payType = this.getAttribute("payType");
  });
  /**
   * 点击支付
   */
  app.tapEvent("pay", function() {
    var orderParam = {
      uid: app.getState().userInfo.id,
      shopid: vueCtl.shopid,
      caid: vueCtl.ucid,
      payType: vueCtl.payType
    }
    if(vueCtl.payType == 3) {
      vueCtl.show = true
      return false
    }
    app.createCardSellingOrder(orderParam, function(data) {
      if(data && (data.status == app.STATUS_SUCCESS || data.status == 'okay')) {
        vueCtl.orderid = data.info.orderid
        vueCtl.cardid = data.info.cid
        pay(vueCtl.payTypeId, vueCtl.orderid, function(target) {
          if(target) {
            var param = {
              orderid: vueCtl.orderid,
              payType: "购卡",
              caid: vueCtl.cardid
            }
            app.normalOpen("pay/paycardsuccess", "paycardsuccess.html", null, param);
          } else {
            // 支付失败回调
            payError();
          }
        });
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

function payError() {
  mui.toast('支付未成功');
}