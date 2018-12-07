mui.init();
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		title: '意见反馈',
		question: {
			uid: "",
			feedback: "",
			type: "BUG：程序报错或者异常",
			picOne: "",
			picOnePress: "../../../res/img/common/addImg.png",
			picTwo: "",
			picTwoPress: "../../../res/img/common/addImg.png",
			picThree: "",
			picThreePress: "../../../res/img/common/addImg.png",
			picFour: "",
			picFourPress: "../../../res/img/common/addImg.png"
		},
		contentLength: "0"
	},
	methods: {

	}
});
mui.plusReady(function() {
	if(plus.device.model=="iPhoneX"){
		document.getElementById("question_btn").style.marginTop="0.4rem";
	}
	vueCtl.question.uid = app.getState().userInfo.id;
	/**
	 * 触发图片上传
	 */
	mui(".pic_content").on("tap", ".addImg", function() {
		var imgSrc = this.getAttribute("imgSrc");
		var imgSrcPress = this.getAttribute("imgSrcPress");
		uploadImg(imgSrc, imgSrcPress);
	});
	//删除第一张图片
	app.tapEvent("delone", function() {
		document.getElementById("delone").style.display = "none";
		vueCtl.question.picOne = "";
		vueCtl.question.picOnePress = "../../../res/img/common/addImg.png";
		if(vueCtl.question.picTwoPress.indexOf("addImg") >= 0) {
			document.getElementById("two").style.display = "none";
		} else {
			vueCtl.question.picOne = vueCtl.question.picTwo;
			vueCtl.question.picOnePress = vueCtl.question.picTwoPress;
			vueCtl.question.picTwo = "";
			vueCtl.question.picTwoPress = "../../../res/img/common/addImg.png";
			document.getElementById("delone").style.display = "";
			document.getElementById("deltwo").style.display = "none";
		}
		if(vueCtl.question.picThreePress.indexOf("addImg") >= 0) {
			document.getElementById("three").style.display = "none";
		} else {
			vueCtl.question.picTwo = vueCtl.question.picThree;
			vueCtl.question.picTwoPress = vueCtl.question.picThreePress;
			vueCtl.question.picThree = "";
			vueCtl.question.picThreePress = "../../../res/img/common/addImg.png";
			document.getElementById("deltwo").style.display = "";
			document.getElementById("delthree").style.display = "none";
		}
		if(vueCtl.question.picFourPress.indexOf("addImg") >= 0) {
			document.getElementById("four").style.display = "none";
		} else {
			vueCtl.question.picThree = vueCtl.question.picFour;
			vueCtl.question.picThreePress = vueCtl.question.picFourPress;
			vueCtl.question.picFour = "";
			vueCtl.question.picFourPress = "../../../res/img/common/addImg.png";
			document.getElementById("delthree").style.display = "";
			document.getElementById("delfour").style.display = "none";
		}
	});
	//删除第二张图片
	app.tapEvent("deltwo", function() {
		document.getElementById("deltwo").style.display = "none";
		vueCtl.question.picTwo = "";
		vueCtl.question.picTwoPress = "../../../res/img/common/addImg.png";
		if(vueCtl.question.picThreePress.indexOf("addImg") >= 0) {
			document.getElementById("three").style.display = "none";
		} else {
			vueCtl.question.picTwo = vueCtl.question.picThree;
			vueCtl.question.picTwoPress = vueCtl.question.picThreePress;
			vueCtl.question.picThree = "";
			vueCtl.question.picThreePress = "../../../res/img/common/addImg.png";
			document.getElementById("deltwo").style.display = "";
			document.getElementById("delthree").style.display = "none";
		}
		if(vueCtl.question.picFourPress.indexOf("addImg") >= 0) {
			document.getElementById("four").style.display = "none";
		} else {
			vueCtl.question.picThree = vueCtl.question.picFour;
			vueCtl.question.picThreePress = vueCtl.question.picFourPress;
			vueCtl.question.picFour = "";
			vueCtl.question.picFourPress = "../../../res/img/common/addImg.png";
			document.getElementById("delthree").style.display = "";
			document.getElementById("delfour").style.display = "none";
		}
	});
	//删除第三张图片
	app.tapEvent("delthree", function() {
		document.getElementById("delthree").style.display = "none";
		vueCtl.question.picThree = "";
		vueCtl.question.picThreePress = "../../../res/img/common/addImg.png";
		if(vueCtl.question.picFourPress.indexOf("addImg") >= 0) {
			document.getElementById("four").style.display = "none";
		} else {
			vueCtl.question.picThree = vueCtl.question.picFour;
			vueCtl.question.picThreePress = vueCtl.question.picFourPress;
			vueCtl.question.picFour = "";
			vueCtl.question.picFourPress = "../../../res/img/common/addImg.png";
			document.getElementById("delthree").style.display = "";
			document.getElementById("delfour").style.display = "none";
		}
	});
	//删除第四张图片
	app.tapEvent("delfour", function() {
		document.getElementById("delfour").style.display = "none";
		vueCtl.question.picFour = "";
		vueCtl.question.picFourPress = "../../../res/img/common/addImg.png";
	});
	/**
	 * 文字输入
	 */
	document.getElementById("desc").addEventListener("input", function() {
		var value = this.value;
		if(value.length > 200) {
			this.value = value.substring(0, value.length - 1);
		} else {
			vueCtl.question.feedback = value;
		}
		vueCtl.contentLength = value.length;
	});
	/**
	 * 选择类型
	 */
	mui(".queationType").on("tap", "p", function() {
		vueCtl.question.type = this.getAttribute("desc");
		var typeid = this.getAttribute("typeid");
		mui(".queationType img").each(function() {
			this.setAttribute("src", "../../../res/img/common/question.png");
		});
		document.getElementById(typeid).setAttribute("src", "../../../res/img/common/questionchecked.png");
	});
	/**
	 * 图片上传
	 */
	function uploadImg(imgSrc, imgSrcPress) {
		if(vueCtl.question[imgSrcPress].indexOf("addImg") < 0) {
			return;
		}
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
				// 创建上传任务
				var task = plus.uploader.createUpload(app.server + "/upload/base64_origin_thumb", {
					method: "POST"
				}, function(t, status) {
					if(status == 200) {
						var dataResult = t.responseText;
						dataResult = JSON.parse(dataResult);
						vueCtl.question[imgSrc] = dataResult.pic;
						vueCtl.question[imgSrcPress] = dataResult.picPress;
						if(imgSrc.toLowerCase().indexOf("one") >= 0) {
							document.getElementById("delone").style.display = "";
							document.getElementById("two").style.display = "";
						} else if(imgSrc.toLowerCase().indexOf("two") >= 0) {
							document.getElementById("deltwo").style.display = "";
							document.getElementById("three").style.display = "";
						} else if(imgSrc.toLowerCase().indexOf("three") >= 0) {
							document.getElementById("delthree").style.display = "";
							document.getElementById("four").style.display = "";
						} else if(imgSrc.toLowerCase().indexOf("four") >= 0) {
							document.getElementById("delfour").style.display = "";
						} else {
							document.getElementById("one").style.display = "";
						}
						wt.close();
					} else {
						wt.close();
					}
				});
				switch(b.index) {
					case 0:
						wt.close();
						break;
					case 1:
						app.getImage(function(imgbase64) {
							// base64的头像
							task.addData("strImg", imgbase64);
							task.addData("uid", app.getState().userInfo.id);
							// 设置自定义数据头
							task.setRequestHeader('token', app.getState().token);
							task.start();
						});
						break;
					case 2:
						app.galleryImg(function(imgbase64) {
							// base64并且上传
							task.addData("strImg", imgbase64);
							task.addData("uid", app.getState().userInfo.id);
							// 设置自定义数据头
							task.setRequestHeader('token', app.getState().token);
							task.start();
						});
						break;
					default:
						wt.close();
						break
				}
			})
		}
	}
	/**
	 * 保存产品反馈
	 */
	app.tapEvent("saveQuestion", function(element) {
		if(vueCtl.question.feedback==""){
			mui.toast("请输入您的意见");
			return;
		}
		if(vueCtl.question.picOnePress.indexOf("addImg")>=0){
			vueCtl.question.picOnePress="";
		}
		if(vueCtl.question.picTwoPress.indexOf("addImg")>=0){
			vueCtl.question.picTwoPress="";
		}
		if(vueCtl.question.picThreePress.indexOf("addImg")>=0){
			vueCtl.question.picThreePress="";
		}
		if(vueCtl.question.picFourPress.indexOf("addImg")>=0){
			vueCtl.question.picFourPress="";
		}
		app.saveQuestion(vueCtl.question, function(data) {
			
			if(data && data.status == app.STATUS_SUCCESS) {
				var ws = plus.webview.currentWebview();
				mui.toast("感谢您的反馈");
				ws.hide();
				mui.later(function(){
					ws.close();
				},3000)
			} else {
				if(data=='error'){
					mui.toast("数据加载失败...")
					return;
				}
				mui.toast(data.info);mui.toast(data.info);
			}
		});
	});
});