// 基本类
var shares = null;
var sweixin = null;

function share(srv, msg, button, fn) {
  if(!srv) {
    return;
  }
  button && (msg.extra = button.extra);
  // 发送分享
  if(srv.authenticated) {
    doShare(srv, msg, fn);
  } else {
    srv.authorize(function() {
      doShare(srv, msg, fn);
    });
  }
}

function doShare(srv, msg, fn) {
  srv.send(msg, function() {
    plus.nativeUI.toast('分享到"' + srv.description + '"成功！');
    fn && fn()
  }, function(e) {
    plus.nativeUI.toast('分享到"' + srv.description + '"失败: ' + JSON.stringify(e));
    fn && fn()
  });
}
var buttons = [{
    title: '我的好友',
    extra: {
      scene: 'WXSceneSession'
    }
  },
  {
    title: '朋友圈',
    extra: {
      scene: 'WXSceneTimeline'
    }
  },
  {
    title: '我的收藏',
    extra: {
      scene: 'WXSceneFavorite'
    }
  }
];
mui.plusReady(function() {
  var plusFlag
  if(!plusFlag) {
    plusFlag = true
    plus.key.addEventListener('backbutton', function() {
      var $state = localStorage.getItem('$state')
      if(!$state) {
        plus.webview.getWebviewById("user/home").evalJS("initInfo()")
        mui.openWindow({
          'id': 'user/home',
          'url': '../user/home.html'
        })
      }
    })
  }
  plus.share.getServices(function(s) {
    shares = {};
    for(var i in s) {
      var t = s[i];
      shares[t.id] = t;
    }
    sweixin = shares['weixin'];
  }, function(e) {
    console.log('获取分享服务列表失败：' + e.message);
  });
})
window.app = {
    appName: "KBD-CLIENT",
    server: "http://pro.kabuduo.cn/qk_site", // 接口地址
    STATUS_SUCCESS: 'ok',
    serverPhone: "010-57219911",
    STATUS_ERROR: 'erro',
    STATICPAGE_FAQ: 'http://pro.kabuduo.cn/qk_site',
    servicePhone: '',
    pull_downtext: "用力点~用力点~",
    pull_overtext: "松手我要起飞！",
    pull_refreshtext: "biu！biu！biu！",
    loadingtext: "努力加载中",
    loadingWords: "努力加载中"
  },
  // 控制器基础类
  function($, owner) {
    // 基础ajax方法
    owner.ajaxc = function(method, url, params, succ, error) {
      // 获得token
      var state = owner.getState();
      // 拼接固定参数
      //			params.csrfmiddlewaretoken = getCookie("csrftoken");
      $.ajax(app.server + url, {
        // headers: {
        // "Set-Cookie": plus.navigator.getCookie(app.server)
        // },
        data: params,
        headers: {
          'token': state.token
        },
        dataType: 'json', //服务器返回json格式数据
        type: method, //HTTP请求类型
        timeout: 10000, //超时时间设置为10秒；
        success: function(data) {
          var logining = localStorage.getItem('logining');
          if(data == null || data == '' || data.status === 'toperro') {
            plus.nativeUI.closeWaiting()
            if(data && data.status === 'toperro') {
              $.toast(data.info)
            } else {
              $.toast("请重新登录~");
            }
            // 设置当前界面状态
            localStorage.setItem('logining', "0");
            // 清除登录标识
            localStorage.removeItem("$state");
            // ios滑动关闭页面
            if(plus.webview.getWebviewById("user/home")) {
              plus.webview.getWebviewById("user/home").evalJS("initInfo()");
            }
            var currentWebview = plus.webview.currentWebview()
            currentWebview.hide()
            currentWebview.close()
            plus.webview.open('/view/user/login.html', 'login');
            return false;
          }
          if(typeof(succ) === "function") {
            succ(data);
          }
        },
        error: function(xhr, type, errorThrown) {
          if(type === 'abort') mui.toast('亲，断网了，检查一下连接吧！')
          //异常处理；
          if(typeof(error) === "function") {
            error(type);
          }
        }
      });
    };
    // 判断是否为空对象
    owner.isNotNullObj = function(obj) {
      for(var i in obj) {
        if(obj.hasOwnProperty(i)) {
          return true;
        }
      }
      return false;
    }
    // 验证码等待按钮
    owner.disableWait = function(t, obj, waitMessage) {
      var objTag = obj.tagName.toLowerCase();
      if(objTag !== "input" && objTag != "button") {
        return;
      }

      var v = objTag !== "input" ? obj.innerText : obj.value;
      var i = setInterval(function() {
        if(t > 0) {
          switch(objTag) {
            case "input":
              obj.value = (--t) + waitMessage;
              break;
            case "button":
              obj.innerText = (--t) + waitMessage;
              break;
            default:
              break;
          }
          obj.disabled = true;
        } else {
          window.clearInterval(i);
          switch(objTag) {
            case "input":
              obj.value = v;
              break;
            case "button":
              obj.innerText = v;
              break;
            default:
              break;
          }
          obj.disabled = false;
        }
      }, 1000);
    }
    // 短信验证码
    owner.sendRand = function(loginInfo, callback, targetRandBtn) {
      callback = callback || $.noop;
      loginInfo = loginInfo || {};
      loginInfo.mobile = loginInfo.mobile || '';
      loginInfo.isUser = loginInfo.isUser || '';
      loginInfo.status = loginInfo.status || null;

      if(targetRandBtn) randBtn = targetRandBtn;

      // 发送验证码的逻辑
      this.ajaxc("post", "/user/verify_code", {
        mobile: loginInfo.mobile,
        isUser: loginInfo.isUser,
        status: loginInfo.status
      }, function(data) {
        if(data.status == app.STATUS_SUCCESS) {
          // 倒计时状态等
          app.disableWait(60, randBtn, "秒后重发");
          return callback(data);
        } else if(data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    /**
     * 用户登录
     **/
    owner.login = function(loginInfo, type, callback) {
      callback = callback || $.noop;

      var loginUrl = "/login/login_in";
      if(type == "random") {
        loginUrl = "/login/login_simple";
      }
      // 发送验证码的逻辑
      this.ajaxc("post", loginUrl, {
        mobile: loginInfo.mobile,
        password: loginInfo.password,
        verifyCode: loginInfo.verifyCode,
        isUser: loginInfo.isUser,
        clientid: loginInfo.clientid,
        isIos: loginInfo.isIos
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return owner.createState(loginInfo.mobile, data.token, callback);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 用户注册
     **/
    owner.register = function(registerInfo, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/login/register", {
        mobile: registerInfo.mobile,
        password: registerInfo.password,
        verifyCode: registerInfo.verifyCode,
        isUser: registerInfo.isUser,
        clientid: registerInfo.clientid,
        isIos: registerInfo.isIos
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return owner.createState(registerInfo.mobile, data.token, callback);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 忘记密码
     **/
    owner.forgetPwd = function(forgetPwdInfo, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/pwd_reset", {
        mobile: forgetPwdInfo.mobile,
        password: forgetPwdInfo.password,
        verifyCode: forgetPwdInfo.verifyCode,
        isUser: forgetPwdInfo.isUser
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 获取个人中心中的统计信息
     **/
    owner.personalData = function(callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/user/center", {
        uid: app.getState().userInfo.id
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 验证手机验证码是否正确
     **/
    owner.checkVerifyCode = function(verifyCode, mobile, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/code_is", {
        verifyCode: verifyCode,
        mobile: mobile
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 更改手机号码
     **/
    owner.changePhone = function(newPhone, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/mobile", {
        uid: app.getState().userInfo.id,
        mobile: newPhone.mobile,
        isUser: "0",
        verifyCode: newPhone.verifyCode
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 完善个人信息
     **/
    owner.perfectUserinfo = function(user, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/perfect_userinfo", {
        id: user.id,
        nickName: user.nickname,
        sex: user.sex,
        age: user.age,
        headImgUrl: user.headImgUrl,
        headImgUrlPress: user.headImgUrlPress
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 修改年龄
     **/
    owner.updateAge = function(user, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/center_age", {
        uid: user.id,
        age: user.age
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 修改性别
     */
    owner.updateSex = function(user, callback) {
      callback = callback || $.noop;

      // 发送验证码的逻辑
      this.ajaxc("post", "/user/center_sex", {
        uid: user.id,
        sex: user.sex == "男" ? "1" : "0"
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {

          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 保存昵称
     */
    owner.saveNickName = function(user, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/center_nickname", {
        uid: user.id,
        nickName: user.nickName
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {

          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 保存意见
     */
    owner.saveQuestion = function(question, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/feedback", question, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 上传图片
     */
    owner.uploadImg = function(strImg, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/feedback", {
        strImg: strImg
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 头像上传
     */
    owner.uploadHeadImg = function(strImg, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/center_head_img", {
        uid: app.getState().userInfo.id,
        strImg: strImg
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询用户的储值卡列表（我的储值卡）
     */
    owner.userMemcards = function(callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/card/card_list_user", {
        uid: app.getState().userInfo.id
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询用户的储值卡详细信息
     */
    owner.userMemcard = function(cardParam, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/card/card_detail", {
        cardid: cardParam.cardid,
        status: cardParam.status
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询商家列表信息
     */
    owner.merchants = function(merchantParam, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/shop/shop_list_chead", {
        longitude: merchantParam.longitude,
        latitude: merchantParam.latitude
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询储值卡消费列表
     */
    owner.consumptions = function(cardParam, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/order/order_list_card", {
        cardid: cardParam.cardid,
        status: cardParam.status
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询我的钱包信息
     */
    owner.mywallet = function(user, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/money/wallet", {
        uid: user.id,
        isUser: user.isUser
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询银行卡信息
     */
    owner.bankInfo = function(callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("get", "/user/bank_info", {
        uid: app.getState().userInfo.id,
        isUser: "0"
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 查询银行卡信息
     */
    owner.saveBankInfo = function(bankInfo, callback) {
      callback = callback || $.noop;
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/bank_bind", {
        id: bankInfo.id,
        bankName: bankInfo.bankName,
        bankNum: bankInfo.bankNum,
        bankCode: bankInfo.bankCode,
        realName: bankInfo.realName,
        identityCard: bankInfo.identityCard
      }, function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          return callback(data);
        } else if(data && data.status == app.STATUS_ERROR) {
          return callback(data);
        }
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    };
    /**
     * 获得用户信息
     * @param {Object} callback
     */
    owner.getUserInfo = function(callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/user_info", {
        token: owner.getState().token
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 获得用户的提现记录信息
     */
    owner.getwithdrawcash = function(callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/money/money_list", {
        uid: app.getState().userInfo.id
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 获得用户的提现详细记录信息
     */
    owner.getwithdrawcashDetails = function(moneyid, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/money/money_detail", {
        moneyid: moneyid
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 身份认证
     */
    owner.update = function(data, callback) {
      this.ajaxc('post', '/login/version', data, function(data) {
        return callback(data)
      }, function(msg) {
        return callback(msg)
      })
    }
    owner.authentication = function(authentication, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/bank_identity_validate", {
        realName: authentication.realName,
        verifyCode: authentication.verifyCode,
        identityCard: authentication.identityCard
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 提现申请
     */
    owner.cashout = function(cashObj, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/money/money_out", {
        uid: cashObj.uid,
        amount: cashObj.cashMoney,
        verifyCode: cashObj.verifyCode,
        moneyPwd: cashObj.moneyPwd
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 保存提现密码
     */
    owner.moneypwd = function(moneyPwd, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/user/money_pwd", {
        uid: app.getState().userInfo.id,
        moneyPwd: moneyPwd
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 蹭卡消费(status:0[别人蹭我的卡]  1:[我蹭别人的卡])
     */
    owner.orderListShare = function(status, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/order/order_list_share", {
        uid: app.getState().userInfo.id,
        status: status
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 蹭卡消费详细信息
     */
    owner.orderDetails = function(orderid, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/order/order_detail", {
        orderid: orderid
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }

    /**
     * 共享折扣设定
     */
    owner.dscountSetting = function(discount, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/card/card_share_rate", {
        uid: discount.uid,
        cardid: discount.cardid,
        rate: discount.rate,
        status: discount.status
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 商家卡列表查询[分类查询]
     */
    owner.cardListShopChead = function(merchantParam, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/card/card_list_shop_chead", {
        shopid: merchantParam.shopid,
        sort: merchantParam.sort,
        sex: merchantParam.sex,
        status: merchantParam.status,
        uid: app.getState().userInfo.id
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 商家详情信息
     */
    owner.shopDetails = function(shopid, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/shop/shop_detail", {
        shopid: shopid
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 共享卡详情信息
     */
    owner.cardDetails = function(cardid, status, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/card/card_detail", {
        cardid: cardid,
        status: status
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    /**
     * 扫码支付页面
     */
    owner.cardDetailUserORShop = function(uid, shopid, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/card/card_detail_userofshop", {
        uid: uid,
        shopid: shopid
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });

    }
    // 创建售卡支付订单
    owner.createCardSellingOrder = function(orderParam, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/card/user_card_add", orderParam, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    // 创建蹭卡支付订单
    owner.createRubCardOrder = function(orderParam, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/card/usercen_card_consumer", orderParam, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    // 创建储值卡支付订单
    owner.createStoredCardOrder = function(orderParam, callback) {
      // 发送验证码的逻辑
      console.log(JSON.stringify(orderParam))
      this.ajaxc("post", "/card/userself_card_consumer", orderParam, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    // 创建充值订单
    owner.createrechargeCardOrder = function(orderParam, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/card/user_card_charge", orderParam, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    /**
     * 获取消息信息
     */
    owner.findMessage = function(isUser, noticeType, callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/notice/message", {
        isUser: isUser,
        type: noticeType,
        uid: app.getState().userInfo.id
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    /**
     * 获取未读消息数量
     */
    owner.findMessageNoCount = function(callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/notice/count", {
        uid: app.getState().userInfo.id,
        isUser: '0'
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    /**
     * 消息设置只读
     */
    owner.setNoticeRead = function(noticeid, noticeType, callback) {
      // 发送验证码的逻辑
      this.ajaxc("post", "/notice/read", {
        noticeid: noticeid,
        type: noticeType,
        uid: app.getState().userInfo.id,
        isUser: '0'
      }, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    /**
     * 广告消息
     */
    owner.findAd = function(callback) {
      // 发送验证码的逻辑
      this.ajaxc("get", "/notice/jump", {}, function(data) {
        return callback(data);
      }, function(msg) {
        //异常处理；
        return callback(msg);
      });
    }
    // 创建登录状态
    owner.createState = function(cellphone, token, callback) {
      var state = owner.getState();
      state.tk_cellphone = cellphone;
      state.token = token;
      owner.setState(state);
      return callback();
    };
    // 获取当前状态
    owner.getState = function() {
      var stateText = localStorage.getItem('$state') || "{}";
      return JSON.parse(stateText);
    };

    // 设置当前状态
    owner.setState = function(state) {
      state = state || {};
      localStorage.setItem('$state', JSON.stringify(state));
    };

    // 获取应用本地配置
    owner.setSettings = function(settings) {
      settings = settings || {};
      localStorage.setItem('$settings', JSON.stringify(settings));
    }

    // 设置应用本地配置
    owner.getSettings = function() {
      var settingsText = localStorage.getItem('$settings') || "{}";
      return JSON.parse(settingsText);
    }

    // 退出应用方法
    owner.BackQuitApp = function() {
      var backFirst = null;
      this.QuitApp = function() {
        //首次按键，提示‘再按一次退出应用’
        if(!backFirst) {
          backFirst = new Date().getTime();
          mui.toast('再按一次退出应用程序');
          setTimeout(function() {
            backFirst = null;
          }, 1000);
        } else {
          if((new Date()).getTime() - backFirst < 1000) {
            plus.runtime.quit();
          }
        }
      }
      return this;
    };
  }(mui, app),
  // 图片选择
  function($, owner, doc) {
    owner.getImage = function(callback) {
      var c = plus.camera.getCamera();
      c.captureImage(function(sourcepath) {
        owner.zipImg(sourcepath, function(entry) {
          owner.GetBase64Code(entry.toLocalURL(), function(imgbase64) {
            callback(imgbase64);
          });
        })
      }, function(s) {
        plus.nativeUI.closeWaiting();
        console.log("error" + s);
      }, {
        filename: "_doc/head.jpg"
      })
    }

    owner.galleryImg = function(callback) {
      plus.gallery.pick(function(sourcepath) {
        owner.zipImg(sourcepath, function(entry) {
          owner.GetBase64Code(entry.toLocalURL(), function(imgbase64) {
            callback(imgbase64);
          });
        })
      }, function(a) {
        plus.nativeUI.closeWaiting();
        console.log("error" + a);
      }, {
        filter: "image"
      })
    }

    owner.getImageWithCrop = function(callback) {
      var c = plus.camera.getCamera();
      c.captureImage(function(sourcepath) {
        owner.zipImg(sourcepath, function(entry) {
          callback(entry);
        })
      }, function(s) {
        plus.nativeUI.closeWaiting();
        console.log("error" + s);
      }, {
        filename: "_doc/head.jpg"
      })
    }

    owner.galleryImgWithCrop = function(callback) {
      plus.gallery.pick(function(sourcepath) {
        owner.zipImg(sourcepath, function(entry) {
          callback(entry);
        })
      }, function(a) {
        plus.nativeUI.closeWaiting();
        console.log("error" + a);
      }, {
        filter: "image"
      })
    }

    owner.zipImg = function(sourcepath, callback) {
      plus.zip.compressImage({
          src: sourcepath,
          dst: "_doc/temp" + new Date().getTime() + ".jpg",
          width: "500px",
          overwrite: true,
        }, function(i) {
          var path = i.target;
          plus.io.resolveLocalFileSystemURL(path, function(entry) {
            callback(entry);
          }, function(e) {
            plus.nativeUI.closeWaiting();
            console.log("读取拍照文件错误：" + e.message);
          });
        },
        function(e) {
          outLine("压缩图片失败: " + JSON.stringify(e));
        });
    }

    owner.GetBase64Code = function(path, callback) {
      var bitmap = new plus.nativeObj.Bitmap("kbdimg"); //test标识谁便取
      // 从本地加载Bitmap图片
      bitmap.load(path, function() {
        var base4 = bitmap.toBase64Data();
        callback(base4);
      }, function(e) {
        plus.nativeUI.closeWaiting();
        console.log('加载图片失败：' + JSON.stringify(e));
        callback(null);
      });
    }
  }(mui, app, document),
  // 接口消息翻译
  function($, owner, doc) {
    owner.getErrorMsg = function(errorCode) {
      // 获得用户信息
      var ERRORCODE = {
        '400100': '缺少必要参数',
        '400101': '账号（手机号）已存在，请尝试其他',
        '400102': '昵称重复',
        '400103': '账号或密码不正确',
        '400104': '验证码不正确',
        '400105': '帐号已被禁用，请联系管理员',
        '400106': '帐号类型不符合',
        '400200': '找不到该记录',
        '400300': '状态异常',
        '400400': '余额不足',
        '999999': '网络异常，请检查'
      }
      return ERRORCODE[errorCode] || errorCode
    };
    owner.shareWeb = function(opt, fn) {
      var msg = {};
      if(!opt.value) {
        plus.nativeUI.alert('请输入分享网页的链接地址!')
        return;
      }
      if(!opt.thumbs) {
        plus.nativeUI.alert('请输入分享网页的缩略图')
        return;
      }
      msg.href = opt.value;
      if(!opt.value) {
        plus.nativeUI.alert('请输入分享网页的标题!');
        return;
      }
      msg.title = opt.title;
      if(!opt.content) {
        plus.nativeUI.alert('请输入分享网页的描述!');
        return;
      }
      msg.content = opt.content;
      sweixin ? plus.nativeUI.actionSheet({
        title: '分享网页到微信',
        cancel: '取消',
        buttons: buttons
      }, function(e) {
        if(e.index === 1) {
          msg.type = 'miniProgram'
          msg.thumbs = opt.thumbs
          msg.miniProgram = {
            id: 'gh_be2dfc011105',
            webUrl: 'https://pay.kabuduo.cn/index.html'
          }
        } else {
          msg.miniProgram = undefined
          msg.type = 'web'
          msg.thumbs = ['../../../res/img/animate/icon.png']
        }
        (e.index > 0) && share(sweixin, msg, buttons[e.index - 1], fn);
      }) : plus.nativeUI.alert('当前环境不支持微信分享操作!');
    }
    owner.getOrderType = function(ordertype) {
      var ORDDERTYPE = {
        0: '充值',
        1: '结账',
        2: '提现',
        3: '系统补贴'
      }
      return ORDDERTYPE[ordertype]
    }
  }(mui, app, document),
  // 页面跳转事件
  function($, owner, doc) {
    owner.tapEvent = function(id, callback) {
      document.getElementById(id).addEventListener("tap", callback);
    }

    // 普通打开
    owner.normalOpen = function(pageid, pageurl, direct, param) {
      $.openWindow({
        id: pageid,
        url: pageurl,
        extras: param,
        show: {
          aniShow: direct || 'auto'
        },
        waiting: {
          autoShow: false
        }
      });
    };
    // 需要登录打开
    owner.signinOpen = function(pageid, pageurl, direct, param) {
      var state = owner.getState();
      if(state.userInfo) {
        $.openWindow({
          id: pageid,
          url: pageurl,
          extras: param,
          show: {
            aniShow: direct || 'auto'
          },
          waiting: {
            autoShow: false
          }
        });
      } else {
        $.openWindow({
          id: 'login',
          url: '/view/user/login.html',
          show: {
            aniShow: direct || 'auto'
          },
          waiting: {
            autoShow: false
          }
        });
      }
    };

    owner.turnPage = function(pageid) {
      $.plusReady(function() {
        $.openWindow({
          id: pageid,
          show: {
            aniShow: 'pop-in'
          },
          waiting: {
            autoShow: false
          }
        });
      });
    };

  }(mui, app, document),
  // 组合事件
  function($, owner, doc) {
    owner.refreshUserInfo = function() {
      app.getUserInfo(function(data) {
        if(data && data.status == app.STATUS_SUCCESS) {
          // 将用户信息存放到本地
          var state = app.getState();
          state.userInfo = data.info;
          app.setState(state);
        }
      });
    }

  }(mui, app, document),
  // 页面跳转事件
  function($, owner, doc) {
    owner.tapEvent = function(id, callback) {
      document.getElementById(id).addEventListener("tap", callback);
    }

    // 普通打开
    owner.toast = function(msg, icon, custOptions) {
      var options = {
        icon: icon,
        duration: 'short',
        align: 'center',
        style: 'block',
        verticalAlign: 'center'
      }
      if(window.plus) {
        plus.nativeUI.toast(msg, options);
      } else {
        mui.toast(msg, options)
      }
    };

  }(mui, app, document);