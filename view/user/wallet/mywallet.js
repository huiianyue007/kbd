// 初始化mui
mui.init({
  pullRefresh: {
    container: "#wallerInfo", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
    down: {
      style: 'circle', //必选，下拉刷新样式，目前支持原生5+ ‘circle’ 样式
      color: '#FFD006', //可选，默认“#2BD009” 下拉刷新控件颜色
      height: '50px', //可选,默认50px.下拉刷新控件的高度,
      range: '100px', //可选 默认100px,控件可下拉拖拽的范围
      offset: 44 + immersed + 'px', //可选 默认0px,下拉刷新控件的起始位置
      auto: false, //可选,默认false.首次加载自动上拉刷新一次
      callback: pulldownRefresh //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
    }
  }
});

// vue控制器，用于页面数据控制
var vueCtl = new Vue({
  el: '#app',
  data: {
    app: window.app,
    selfWebView: {},
    remindType: "0",
    user: {
      id: "",
      isUser: "0"
    },
    wallet: {
      wallet: "0.00",
      totalIncome: "0.00",
      yesterdayIncome: "0.00",
      totalMoney: "0.00",
      shareEarnRate: "0.00"
    }
  },
  methods: {

  }
});

mui.plusReady(function() {
  // 初始化
  initInfo();
  /**
   * 银行卡
   */
  app.tapEvent('bankInfo', function() {
    if(app.getState().userInfo.bankName == "") {
      vueCtl.remindType = "1";
    } else {
      app.signinOpen("user/wallet/bankcard", "bankcard.html", null, vueCtl.wallet);
    }
  });
  // 立即添加
  app.tapEvent('addCard', function() {
    app.signinOpen("user/wallet/bankInfo", "bankInfo.html", null, vueCtl.wallet);
  });
  // 取消
  app.tapEvent('cancel', function() {
    vueCtl.remindType = "0";
  });
  // 提现记录
  app.tapEvent('withdrawcash', function() {
    app.signinOpen("user/wallet/withdrawcash", "withdrawcash.html", null, null);
  });
  //进入提现页面
  app.tapEvent('cashoutBtn', function() {
    if(app.getState().userInfo.bankName == "") {
      vueCtl.remindType = "1";
    } else if(app.getState().userInfo.moneyPassword + '' == '0') { // 0是没有密码，1是有提现密码
      // 身份认证页面
      if(app.getState().userInfo.isEmail == '1') {
        app.signinOpen("user/wallet/cashpassword", "wallet/cashpassword.html", null, {
          newcard: "update"
        });
      } else {
        var param = {
          htmlId: "user/wallet/cashpassword",
          htmlURL: "wallet/cashpassword.html"
        }
        app.signinOpen("user/authentication", "../authentication.html", null, param);
      }

    } else {
      app.signinOpen("user/wallet/cashout", "cashout.html", null, vueCtl.wallet);
    }
  });
  //进入收入明细页面
  app.tapEvent('income', function() {
    vueCtl.wallet.status = "0";
    app.signinOpen("user/wallet/income", "income.html", null, vueCtl.wallet);
  });
  //进入提现说明页面
  app.tapEvent('cashInstru', function() {
    app.normalOpen("user/wallet/cashInstructions", "cashInstructions.html", null, null);
  });
});

function initInfo() {
  plus.nativeUI.showWaiting(app.loadingWords);
  vueCtl.user.id = app.getState().userInfo.id;
  /**
   * 获取钱包的信息
   */
  app.mywallet(vueCtl.user, function(data) {
    mui.later(function() {
      plus.nativeUI.closeWaiting();
    }, 250);
    if(data && data.status == app.STATUS_SUCCESS) {
      vueCtl.wallet = data.info;
      document.getElementById("wallerInfo").style.display = "";
    } else {
      if(data == 'error') {
        mui.toast("数据加载失败...")
        return;
      }
      mui.toast(data.info);
      document.getElementById("wallerInfo").style.display = "";
    }
  });
}

// 关闭未绑定银行卡提示框
function closeBankTips() {
  vueCtl.remindType = "0";
}

function pulldownRefresh() {
  initInfo();
  mui.later(function() {
    mui('#wallerInfo').pullRefresh().endPulldownToRefresh();
  }, 500);
}