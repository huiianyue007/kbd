// 初始化mui
mui.init();
var inputNum = 0;
var flag = "newPass";
var newPass = "";
var oldPayPass = "";
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    title: "余额提现",
    remind: "",
    isEmail: '',
    remindType: "3", // 默认状态是3.
    mobile: "",
    moneyPwdError: "0",
    user: {
      isUser: "0"
    },
    cash: {
      balance: "0",
      cashMoney: "",
      actualMoney: "",
      poundage: "",
      uid: "",
      verifyCode: "",
      moneyPwd: "",
      paymentDate: ""
    }
  },
  methods: {
    displayRemind: function(param) {
      if(vueCtl.moneyPwdError == "0") {
        vueCtl.remindType = "3";
      } else {
        vueCtl.remindType = "7";
        vueCtl.moneyPwdError = "0";
      }
    },
    cashSuccess: function(param) {
      if(vueCtl.isEmail === '1') {
        vueCtl.title = "提现密码";
        vueCtl.remindType = "7";
        document.getElementById("verifyCodeIpt").blur();
        document.getElementById("cashpasswordDiv").style.display = "";
      } else {
        vueCtl.title = "短信验证";
        vueCtl.remindType = "4";
      }

    },
    cashoutBtn: function(param) {
      document.getElementById("cashMoney").blur();
      if(Number(vueCtl.cash.cashMoney) < 10) {
        vueCtl.remind = "提现金额需大于10元";
        vueCtl.remindType = "1";
      } else if(Number(vueCtl.cash.cashMoney) > 5000) {
        vueCtl.remind = "提现金额最大为5000元";
        vueCtl.remindType = "1";
      } else if(Number(vueCtl.cash.cashMoney) > Number(vueCtl.cash.balance)) {
        vueCtl.remind = "钱包余额不足";
        vueCtl.remindType = "1";
      } else {
        if(vueCtl.cash.cashMoney < 1000) {
          vueCtl.cash.poundage = '1.00';
          vueCtl.cash.actualMoney = (Number(vueCtl.cash.cashMoney) - Number(vueCtl.cash.poundage)).toFixed(2);
        } else {
          vueCtl.cash.poundage = (Number(vueCtl.cash.cashMoney) * 0.001).toFixed(2);
          vueCtl.cash.actualMoney = (Number(vueCtl.cash.cashMoney) - Number(vueCtl.cash.poundage)).toFixed(2);
        }
        vueCtl.remindType = "2";
      }
    },
    allCash: function(param) {
      vueCtl.cash.cashMoney = vueCtl.cash.balance;
    },
    cashOutSuccess: function(param) {
      app.checkVerifyCode(vueCtl.cash.verifyCode, vueCtl.mobile, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          vueCtl.title = "提现密码";
          vueCtl.remindType = "7";
          document.getElementById("verifyCodeIpt").blur();
          document.getElementById("cashpasswordDiv").style.display = "";
        } else {
          if(data == 'error') {
            mui.toast("数据加载失败...")
            return;
          }
          mui.toast(data.info);
        }
      });
    },
    finshSuccess: function(param) {
      if(plus.webview.getWebviewById("user/wallet/mywallet")) {
        plus.webview.getWebviewById("user/wallet/mywallet").evalJS("initInfo()");
      }
      plus.webview.currentWebview().close();
    }
  },
  filters: {
    floatVal: function(value) {
      value = Number(value).toFixed(2);
      return value;
    }
  }
});

mui.plusReady(function() {

  // ios滑动关闭页面
  iosBackEvent(function() {
    if(plus.webview.getWebviewById("user/wallet/mywallet")) {
      var mywalletView = plus.webview.getWebviewById("user/wallet/mywallet");
      if(mywalletView) {
        mywalletView.evalJS("initInfo()");
        mywalletView.evalJS("closeBankTips()");
      }
    }
  });

  /**
   * 接收余额参数
   */
  vueCtl.cash.balance = plus.webview.currentWebview().wallet;
  /**
   * 接收手机号
   */
  vueCtl.isEmail = app.getState().userInfo.isEmail
  vueCtl.mobile = app.getState().userInfo.mobile;
  /**
   * 接收用户
   */
  vueCtl.user = app.getState().userInfo;
  /**
   * 用户Id赋值
   */
  vueCtl.cash.uid = app.getState().userInfo.id;

  /**
   * 重写返回方法
   */
  mui.back = function() {
    if(vueCtl.remindType == "4") {
      vueCtl.title = "余额提现";
      vueCtl.remindType = "3";
    } else if(vueCtl.remindType == "7" && vueCtl.isEmail == '0') {
      document.getElementById("cashpasswordDiv").style.display = "none";
      vueCtl.title = "短信验证";
      vueCtl.remindType = "4";
    } else {
      plus.webview.currentWebview().close();
    }
  }
  /**
   * 获取验证码
   */
  document.getElementById("randBtn").addEventListener("tap", function() {
    vueCtl.user.isUser = "0";
    app.sendRand(vueCtl.user, function(result) {
      if(result && result.status == app.STATUS_SUCCESS) {
        mui.toast("验证码发送成功");
      } else {
        mui.toast(result.info);
      }
    });
  });
  /**
   * 得到输入密码对象
   */
  var inputarr = document.getElementsByName("password");
  /**
   * 数字键盘点击事件
   */
  mui("#keywords").on("tap", ".mui-table-view-cell", function() {
    if(this.getAttribute("data") == "kong") {

    } else if(this.getAttribute("data") == "del") {
      delInputValue();
    } else {
      if(inputNum == 6) {
        findPayPassword();
      } else {
        inputarr[inputNum].value = this.getAttribute("data");
        inputNum = inputNum + 1;
        if(inputNum == 6) {
          findPayPassword();
        }
      }
    }

  });
  /**
   * 获取有值的密码输入框
   */
  function findInputByValue() {
    var resultArr = new Array();
    mui(".inputs input").each(function() {
      if(this.value == "") {

      } else {
        resultArr.push(this);
      }
    });
    return resultArr;
  }
  /**
   * 删除数据
   */
  function delInputValue() {
    var inputValueArr = findInputByValue();
    var inputLength = inputValueArr.length - 1;
    inputNum = inputNum - 1;
    if(inputLength >= 0) {
      inputarr[inputLength].value = "";
    } else {
      inputNum = 0;
    }
  }
  /**
   * 获取密码
   */
  function findPayPassword() {
    var result = "";
    mui(".inputs input").each(function() {
      result = result + this.value;
    });
    vueCtl.cash.moneyPwd = result;
    vueCtl.cash.status = vueCtl.isEmail
    /**
     * 提现申请
     */
    app.cashout(vueCtl.cash, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        vueCtl.remindType = "6";
        document.getElementById("cashpasswordDiv").style.display = "none";
        document.getElementById("backBtn").style.display = "none";
        vueCtl.title = "提现成功";
        mui.toast("提现成功");
      } else {
        result = "";
        inputNum = 0;
        vueCtl.cash.moneyPwd = "";
        mui(".inputs input").each(function() {
          this.value = "";
        });
        vueCtl.remind = data.info;
        vueCtl.moneyPwdError = "1";
        vueCtl.remindType = "7";
      }
    });
  }
});