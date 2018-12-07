var ws = null,
  wo = null,
  str = '';
var scan = null,
  bCancel = false;

mui.init();
var GetQueryString = function(name) {
  var reg = new RegExp("(^|/?|&)" + name + "=([^&]*)(&|$)");
  var r = str.match(reg);
  if(r != null) return unescape(r[2]);
  return null;
}
// H5 plus事件处理
mui.plusReady(function() {

  // 获取窗口对象
  ws = plus.webview.currentWebview();
  wo = ws.opener();

  // 返回按钮
  var wsub = plus.webview.create('qrback.html', 'qrback', {
    top: 20 + immersed + 'px',
    left: '20px',
    height: '45px',
    width: '45px',
    position: 'absolute',
    scrollIndicator: 'none',
    background: 'transparent'
  });
  ws.append(wsub);

  // 开始扫描
  //	ws.addEventListener('show', function() {
  //		mui.later(function() {
  // 初始化二维码
  scan = new plus.barcode.Barcode('bcid', [plus.barcode.QR], {
    frameColor: '#FFD006',
    scanbarColor: '#FFD006'
  });
  scan.onmarked = onmarked;
  scan.start({
    conserve: true,
    filename: "_doc/barcode/"
  });
  //		}, 200);
  //	});

});
// 二维码扫描成功处理器
function onmarked(type, result, file) {
  switch(type) {
    case plus.barcode.QR:
      type = "QR";
      break;
    default:
      type = "其它" + type;
      break;
  }
  str = result
  console.log(result)
  var shopid = GetQueryString("shopid")
  var staffid = GetQueryString("staffid")
  if(result == null || result == "" || !shopid) {
    app.normalOpen("scan/qrerror", "qrerror.html", null, null);

    back();

    return;
  }
  // 跳转到金额确认界面
  //  app.pay_confirmPage(result);
  /**
   * 根据得到的Id获取卡的信息
   */
  var amount = GetQueryString("amount")
  if(amount) {
    app.cardDetailUserORShop(app.getState().userInfo.id, shopid, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        var param = {
          shopid: shopid,
          ucid: data.info.id,
          isCardCount: data.info.isCardCount,
          amount: amount,
          staffid: staffid
        }
        if(data.info.isShareCard == "0") {
          app.signinOpen("pay/storedCardPay", "../pay/storedCardPay.html", null, param);
          window.setTimeout(back, 500)
        } else if(data.info.isShareCard == "1") {
          app.signinOpen("pay/rubCardPay", "../pay/rubCardPay.html", null, param);
          window.setTimeout(back, 500)
        } else if(data.info.isShareCard == "2") {
          app.signinOpen("scan/noCard", "noCard.html", null, param);
          window.setTimeout(back, 500)
        }
      } else {
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  } else {
    app.cardDetailUserORShop(app.getState().userInfo.id, shopid, function(data) {
      if(data && data.status == app.STATUS_SUCCESS) {
        var param = {
          shopid: shopid,
          ucid: data.info.id,
          isCardCount: data.info.isCardCount,
          staffid: staffid
        }
        if(data.info.isShareCard == "0") {
          app.signinOpen("pay/storedCardPay", "../pay/storedCardPay.html", null, param);
        } else if(data.info.isShareCard == "1") {
          app.signinOpen("pay/rubCardPay", "../pay/rubCardPay.html", null, param)
        } else if(data.info.isShareCard == "2") {
          app.signinOpen("scan/noCard", "noCard.html", null, param);
        }
        window.setTimeout(back, 500)
      } else {
        if(data == 'error') {
          mui.toast("数据加载失败...")
          return;
        }
        mui.toast(data.info);
      }
    });
  }

}

function back(hide) {
  // 重置地图页面
  if (!wo) {
    wo = plus.webview.currentWebview()
  }
  wo.setStyle({
    left: '0px'
  });
  // 隐藏当前webview
  ws.close('auto');
};

mui.oldBack = mui.back;
mui.back = function() {
  // 关闭当前页面方法
  back();
}