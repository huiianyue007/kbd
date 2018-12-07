mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: "完善您的个人资料",
		user: {
			id: "",
			nickname: '',
			age: '',
			headImgUrlPress: '../../res/img/common/default.png',
			headImgUrl: '',
			sex: '0'
		},
		changeHeadImg: false
	},
	methods: {}
});

var picker = new mui.PopPicker();
picker.setData([{
	value: "00",
	text: "00后"
}, {
	value: "90",
	text: "90后"
}, {
	value: "80",
	text: "80后"
}, {
	value: "70",
	text: "70后"
}, {
	value: "60",
	text: "60后"
}, {
	value: "50",
	text: "50后"
}])

mui.plusReady(function() {
	var ws = plus.webview.currentWebview();
	/**
	 * 初始化用户信息
	 */
	vueCtl.user.headImgUrl = app.getState().userInfo.headImgUrl;
	vueCtl.user.headImgUrlPress = app.getState().userInfo.headImgUrlPress;
	vueCtl.user.id = app.getState().userInfo.id;
	/**
	 * 关闭登录注册页面
	 */
	if(plus.webview.getWebviewById("user/register")) {
		plus.webview.getWebviewById("user/register").hide();
		plus.webview.getWebviewById("user/register").close();
	}
	if(plus.webview.getWebviewById("login")) {
		plus.webview.getWebviewById("login").hide();
		plus.webview.getWebviewById("login").close();
	}

	/**
	 * 年龄的选择
	 */
	app.tapEvent("userAge_select", function() {
		picker.show(function(SelectedItem) {
			vueCtl.user.age = SelectedItem[0].text;
			buttonUse();
		})
	});
	//判断是否为空
	function buttonUse() {
		if(vueCtl.user.age != "" && vueCtl.user.age != "") {
			document.getElementById("perfectUserinfoBtn").removeAttribute("disabled");
		}
	}
	/**
	 * 性别选择
	 */
	mui(".radioGroup").on("tap", ".radio", function() {
		mui(".radio").each(function() {
			this.className = "radio";
		});
		this.className = "radio radioActive";
		vueCtl.user.sex = this.getAttribute("sex");
	});
	/**
	 * 点击完成，调用完善个人信息
	 */
	app.tapEvent("perfectUserinfoBtn", function(element) {
		if(!vueCtl.changeHeadImg){
			mui.toast("请设置一个头像，让大家都认识你");
			return;
		}
		if(vueCtl.user.nickname == "" || vueCtl.user.nickname.length > 10) {
			mui.toast("请输入正确的昵称,昵称长度最多为10个字符");
			return;
		}
		if(vueCtl.user.age == null||vueCtl.user.age==""){
			mui.toast("请选择年龄");
			return;
		}

		app.perfectUserinfo(vueCtl.user, function(data) {

			if(data && data.status == app.STATUS_SUCCESS) {
				app.getUserInfo(function(result) {
					if(result && result.status == app.STATUS_SUCCESS) {
						// 将用户信息存放到本地
						var state = app.getState();
						state.userInfo = result.info;
						app.setState(state);
						if(plus.webview.getWebviewById("user/home")){
							plus.webview.getWebviewById("user/home").evalJS("initInfo()");
						}
						ws.close();
					}
				});
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);
			}
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
	// 设置过头像的标记
	vueCtl.changeHeadImg = true;
	
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
					vueCtl.user.headImgUrlPress = result.info.headImgUrlPress;
					vueCtl.user.headImgUrl = result.info.headImgUrl;
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