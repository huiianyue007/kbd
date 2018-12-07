mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    htmlId: "",
    htmlURL: "",
    authentication: {
      realName: '',
      verifyCode: '',
      identityCard: '',
      status: '0'
    },
    register: {
      mobile: "",
      isUser: "0"
    }
  },
  computed: {
    verifyType: function() {
      if(this.htmlId != null && this.htmlId != "" && this.htmlId.indexOf("bankInfoUpdate") >= 0) {
        return "bank"
      } else {
        return "cashpwd";
      }
    },
    giveupText: function() {
      if(this.verifyType === "bank")
        return "是否放弃更换银行卡？";
      else if(this.verifyType === "cashpwd")
        return "是否放弃修改提现密码？";
      else
        return "是否放弃用户认证？";
    }
  },
  methods: {}
});

mui.plusReady(function() {
  /**
   * 获取手机信息
   */
  vueCtl.register.mobile = app.getState().userInfo.mobile;
  /**
   * 获取跳转页面的Id以及地址
   */
  vueCtl.htmlId = plus.webview.currentWebview().htmlId;
  vueCtl.htmlURL = plus.webview.currentWebview().htmlURL;
  vueCtl.authentication.status = app.getState().userInfo.isEmail
  /**
   * 获取验证码
   */
  var randBtn = document.getElementById('randBtn')
  if(randBtn) {
    app.tapEvent("randBtn", function() {
      app.sendRand(vueCtl.register, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          mui.toast("验证码发送成功");
        } else {
          if(data == 'error') {
            mui.toast("数据加载失败...")
            return;
          }
          mui.toast(data.info);
        }
      });
    });
  }

  /**
   * 进行身份认证
   */
  app.tapEvent("authenticationBtn", function() {
    if(!validateForm()) return;

    app.authentication(vueCtl.authentication, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        mui.toast("身份验证成功");
        console.log(vueCtl.htmlId + "********" + vueCtl.htmlURL);
        app.signinOpen(vueCtl.htmlId, vueCtl.htmlURL, null, {
          newcard: "update"
        });
      } else {
        document.getElementById("tanceng").style.display = "";
        document.getElementById("tckok").style.display = "";
        mui.toast(data.info);
      }
    });
  });
  /**
   * 点击确定
   */
  app.tapEvent("sure", function() {
    document.getElementById("tanceng").style.display = "none";
    document.getElementById("tckok").style.display = "none";
  });
  /**
   * 点击取消
   */
  app.tapEvent("cancel", function() {
    plus.webview.currentWebview().close();
  });
  /**
   * 点击继续填写
   */
  app.tapEvent("writting", function() {
    document.getElementById("tanceng").style.display = "none";
    document.getElementById("remindTrue").style.display = "none";
  });
  /**
   * 重写返回
   */
  mui.back = function() {
    document.getElementById("tanceng").style.display = "";
    document.getElementById("remindTrue").style.display = "";
  }
});

function validateForm() {
  if(vueCtl.authentication.realName == null || trim(vueCtl.authentication.realName) == "") {
    app.toast('真实姓名不能为空')
    return false;
  }
  if(vueCtl.authentication.identityCard == null || trim(vueCtl.authentication.identityCard) == "") {
    app.toast('身份证不能为空')
    return false;
  }
  if(vueCtl.authentication.verifyCode == null || trim(vueCtl.authentication.verifyCode) == "") {
    app.toast('验证码不能为空')
    return false;
  }
  if(vueCtl.errors != null && vueCtl.errors.any()) {
    app.toast(vueCtl.errors.all()[0])
    return false;
  }
  return true;
}