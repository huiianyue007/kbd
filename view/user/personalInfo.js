mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '个人信息',
		saveType: "0",
		user: {
			mobile: "13141108370",
			nickName: "丹丹测试",
			headImgUrlPress: '../../res/img/common/default.png',
			headImgUrl: '',
			isUser: "0",
			sex: "男",
			age: "90后"
		}
	},
	methods: {

	}
});
var task; // 文件上传任务
var ageList = new mui.PopPicker();
ageList.setData([{
	value: "00后",
	text: "00后"
}, {
	value: "90后",
	text: "90后"
}, {
	value: "80后",
	text: "80后"
}, {
	value: "70后",
	text: "70后"
}, {
	value: "60后",
	text: "60后"
}, {
	value: "50后",
	text: "50后"
}]);
var sexList = new mui.PopPicker();
sexList.setData([{
	value: "0",
	text: "男"
}, {
	value: "1",
	text: "女"
}]);
mui.plusReady(function() {
	iosBackEvent(function(){
		// ios滑动关闭页面
        if(plus.webview.getWebviewById("user/home")) {
			plus.webview.getWebviewById("user/home").evalJS("initInfo()");
		}
	})
    
	//获取用户信息
	var userInfo = app.getState().userInfo;
	/**
	 * 判断用户年龄
	 */
	if(userInfo.age == "") {
		userInfo.age = "未选择";
	}
	/**
	 * 判断用户性别
	 */
	if(userInfo.sex == "0" || userInfo.sex == "女") {
		userInfo.sex = "女";
	} else if(userInfo.sex == "1" || userInfo.sex == "男") {
		userInfo.sex = "男";
	} else {
		userInfo.sex = "未选择";
	}
	/**
	 * 设置用户信息
	 */
	vueCtl.user = userInfo;
	document.getElementById("user").style.display = "";
	/**
	 * 重写返回功能
	 */
	mui.back = function() {
		if(vueCtl.saveType == "1") {
			vueCtl.title = "个人信息";
			
			document.body.style.backgroundColor = "#FFFFFF";
			document.getElementById("user").style.backgroundColor = "#FFFFFF";
			document.getElementById("nickname").value = "";
			vueCtl.saveType = "0";
		} else {
			if(plus.webview.getWebviewById("user/home")) {
				plus.webview.getWebviewById("user/home").evalJS("initInfo()");
			}
			plus.webview.currentWebview().close();
		}
	}
	/**
	 * 年龄选择事件
	 */
	app.tapEvent("choiceAge", function(data) {
		ageList.show(function(SelectedItem) {
			var tempAge = vueCtl.user.age;
			vueCtl.user.age = SelectedItem[0].text;
			plus.nativeUI.showWaiting("数据处理中，请稍候……");
			app.updateAge(vueCtl.user, function(data) {
				if(data && data.status == app.STATUS_SUCCESS) {
					mui.later(function(){plus.nativeUI.closeWaiting();},250);
					app.getUserInfo(function(result) {
						if(result && result.status == app.STATUS_SUCCESS) {
							// 将用户信息存放到本地
							var state = app.getState();
							state.userInfo = result.info;
							if(result.info.sex == "") {
								result.info.sex = "未选择";
							} else if(result.info.sex == "0") {
								result.info.sex = "女";
							} else {
								result.info.sex = "男";
							}
							if(result.info.age == "") {
								result.info.age = "未选择";
							}
							vueCtl.user = result.info;
							app.setState(state);
						}
					});
					mui.toast("年龄修改成功");
				} else {
					vueCtl.user.age = tempAge;
				}
			});
		});
	});
	/**
	 * 性别选择事件
	 */
	app.tapEvent("choiceSex", function(data) {
		sexList.show(function(SelectedItem) {
			var tempSex = vueCtl.user.sex;
			vueCtl.user.sex = SelectedItem[0].text;
			plus.nativeUI.showWaiting("数据处理中，请稍候……");
			app.updateSex(vueCtl.user, function(data) {
				mui.later(function(){plus.nativeUI.closeWaiting();},250);
				if(data && data.status == app.STATUS_SUCCESS) {
					app.getUserInfo(function(result) {
						if(result && result.status == app.STATUS_SUCCESS) {
							// 将用户信息存放到本地
							var state = app.getState();
							state.userInfo = result.info;
							if(result.info.sex == "") {
								result.info.sex = "未选择";
							} else if(result.info.sex == "0") {
								result.info.sex = "女";
							} else {
								result.info.sex = "男";
							}
							if(result.info.age == "") {
								result.info.age = "未选择";
							}
							vueCtl.user = result.info;
							app.setState(state);
						}
					});
					mui.toast("性别修改成功");
				} else {
					vueCtl.user.sex = tempSex;
				}
			});
		});
	});
	/**
	 * 昵称修改事件
	 */
	app.tapEvent("updateNickName", function(element) {
		vueCtl.title = "昵称";
		vueCtl.saveType = "1";
		document.getElementById("nickname").value = vueCtl.user.nickName;
		
		document.body.style.backgroundColor = "#FDFAFA";
		document.getElementById("user").style.backgroundColor = "#FDFAFA";
		app.tapEvent("saveNickName", function(data) {
			var tempName = vueCtl.user.nickName;
			vueCtl.user.nickName = document.getElementById("nickname").value;
			if(document.getElementById("nickname").value == "" || document.getElementById("nickname").value.length > 10) {
				mui.toast("请输入正确的昵称,昵称长度为10个字符");
				return;
			}
			plus.nativeUI.showWaiting("数据处理中，请稍候……");
			app.saveNickName(vueCtl.user, function(resultNickname) {
				mui.later(function(){plus.nativeUI.closeWaiting();},250);
				if(resultNickname && resultNickname.status == app.STATUS_SUCCESS) {
					app.getUserInfo(function(result) {
						if(result && result.status == app.STATUS_SUCCESS) {
							// 将用户信息存放到本地
							var state = app.getState();
							state.userInfo = result.info;
							if(result.info.sex == "") {
								result.info.sex = "未选择";
							} else if(result.info.sex == "0") {
								result.info.sex = "女";
							} else {
								result.info.sex = "男";
							}
							if(result.info.age == "") {
								result.info.age = "未选择";
							}
							vueCtl.user = result.info;
							app.setState(state);
							vueCtl.title = "个人信息";
							
							document.body.style.backgroundColor = "#FFFFFF";
							document.getElementById("user").style.backgroundColor = "#FFFFFF";
							document.getElementById("nickname").value = "";
							vueCtl.saveType = "0";
						}
					});
					mui.toast("昵称修改成功");
				} else {
					vueCtl.user.nickName = tempName;
				}
			});
		});
	});
	/**
	 * 头像选择
	 */
	app.tapEvent('user_head', function() {
		if(mui.os.plus) {
			var a = [{
				title: "拍照"
			}, {
				title: "从相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "修改头像",
				cancel: "取消",
				buttons: a
			}, function(b) {
				// 显示上传等待
				var wt = plus.nativeUI.showWaiting("数据处理中，请稍候……");

				switch(b.index) {
					case 0:
						wt.close();
						break;
					case 1:
						app.getImageWithCrop(function(entry) {
							plus.nativeUI.closeWaiting();
							var s = entry.toLocalURL() + "?version=" + new Date().getTime();
							mui.openWindow({
								url: 'headimg.html',
								id: 'headimg',
								extras: {
									imgSrc: s
								}
							})
						});
						break;
					case 2:
						app.galleryImgWithCrop(function(entry) {
							plus.nativeUI.closeWaiting();
							var s = entry.toLocalURL() + "?version=" + new Date().getTime();
							mui.openWindow({
								url: 'headimg.html',
								id: 'headimg',
								extras: {
									imgSrc: s
								}
							})
						});
						break;
					default:
						plus.nativeUI.closeWaiting();
						break
				}
			})
		}
	});

	
});

window.addEventListener("uploadImg", function(event) {

	var imgUrl = 'file://' + event.detail.imgsrc;
	
	// 创建上传任务
	task = plus.uploader.createUpload(app.server + "/user/center_head_img", {
		method: "POST"
	}, function(t, status) {
		if(status == 200) {
			app.getUserInfo(function(result) {
				mui.later(function(){plus.nativeUI.closeWaiting();},250);
				if(result && result.status == app.STATUS_SUCCESS) {
					// 将用户信息存放到本地
					var state = app.getState();
					state.userInfo = result.info;
					if(result.info.sex == "") {
						result.info.sex = "未选择";
					} else if(result.info.sex == "0") {
						result.info.sex = "女";
					} else {
						result.info.sex = "男";
					}
					if(result.info.age == "") {
						result.info.age = "未选择";
					}
					vueCtl.user = result.info;
					app.setState(state);
					mui.toast("头像修改成功");
				}
			});
		} else {
			plus.nativeUI.closeWaiting();
		}
	});

	app.GetBase64Code(imgUrl, function(imgbase64) {
		var wt = plus.nativeUI.showWaiting("头像上传，请稍候……");
		// base64的头像
		task.addData("strImg", imgbase64);
		task.addData("uid", app.getState().userInfo.id);
		// 设置自定义数据头
		task.setRequestHeader('token', app.getState().token);
		task.start();
	});

});