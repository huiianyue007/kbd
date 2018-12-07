// mui初始化
mui.init();
// vue控制器，用于页面数据控制：
// ======================================================
var vueCtl = new Vue({
	el:'#app',
	data:{
		app : window.app
	}
})
// ======================================================


// 子页面id，实际的html文件也是按照这个：
// ======================================================
var subpages = ['index' ,'listview' , 'order', 'setting'];
// 子页面样式
var subpage_style = {
	top: '0px',
	bottom: '51px'
};
// 动画
var aniShow = {};

// 当前激活选项
var activeTab = subpages[0];
var title = document.getElementById("title");
// 选项卡点击事件
mui('.mui-bar-tab').on('tap', 'a', function(e) {
	var targetTab = this.getAttribute('href');
	if (targetTab == activeTab) {
		return;
	}
	// 不更换标题,若更换标题，解除下面一行注释
	// title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
	// 显示目标选项卡
	// 若为iOS平台或非首次显示，则直接显示
	if(mui.os.ios||aniShow[targetTab]){
		plus.webview.show(targetTab);
	}else{
		//否则，使用fade-in动画，且保存变量
		var temp = {};
		temp[targetTab] = "true";
		mui.extend(aniShow,temp);
		plus.webview.show(targetTab,"fade-in",300);
	}
	//隐藏当前;
	plus.webview.hide(activeTab);
	//更改当前活跃的选项卡
	activeTab = targetTab;
});
// 自定义事件，模拟点击“首页选项卡”
document.addEventListener('gohome', function() {
	var defaultTab = document.getElementById("defaultTab");
	//模拟首页点击
	mui.trigger(defaultTab, 'tap');
	//切换选项卡高亮
	var current = document.querySelector(".mui-bar-tab>.mui-tab-item.mui-active");
	if (defaultTab !== current) {
		current.classList.remove('mui-active');
		defaultTab.classList.add('mui-active');
	}
});
// ======================================================


// 主页、菜单、遮罩层：
// ======================================================
var main,menu;
// 菜单显示状态
var showMenu = false,mode = 'menu-move';

if (!mui.os.android) {
	//整体滑动暂不支持android手机，因为两个页面的移动动画，无法保证同步性；
//	document.getElementById("move-togger").classList.remove('mui-hidden');
	var spans = document.querySelectorAll('.android-only');
	for (var i=0,len=spans.length;i<len;i++) {
		spans[i].style.display = "none";
	}
}
function back() {
	if (showMenu) {
		//菜单处于显示状态，返回键应该先关闭菜单,阻止主窗口执行mui.back逻辑；
		closeMenu();
		return false;
	} else {
		//菜单处于隐藏状态，执行返回时，要先close菜单页面，然后继续执行mui.back逻辑关闭主窗口；
		menu.close('none');
		return true;
	}
}
/**
 * 显示菜单菜单
 */
function openMenu() {
	if (!showMenu) {
		//侧滑菜单处于隐藏状态，则立即显示出来；
		//显示完毕后，根据不同动画效果移动窗体；
		menu.show('none', 0, function() {
			switch (mode){
				case 'main-move':
					//主窗体开始侧滑；
					main.setStyle({
						left: '70%',
						transition: {
							duration: 150
						}
					});
					break;
				case 'menu-move':
					menu.setStyle({
						left: '0%',
						transition: {
							duration: 150
						}
					});
					break;
				case 'all-move':
					main.setStyle({
						left: '70%',
						transition: {
							duration: 150
						}
					});
					menu.setStyle({
						left: '0%',
						transition: {
							duration: 150
						}
					});
					break;
			}
		});
		//显示遮罩
		main.setStyle({mask:"rgba(0,0,0,0.5)"});
		showMenu = true;
	}
}



/**
 * 关闭侧滑菜单
 */
function closeMenu () {
	_closeMenu();
	//关闭遮罩
	ws.setStyle({mask:"none"});
}

/**
 * 关闭侧滑菜单（业务部分）
 */
function _closeMenu() {
	if (showMenu) {
		//关闭遮罩；
		switch (mode){
			case 'main-move':
				//主窗体开始侧滑；
				main.setStyle({
					left: '0',
					transition: {
						duration: 150
					}
				});
				break;
			case 'menu-move':
				//主窗体开始侧滑；
				menu.setStyle({
					left: '-70%',
					transition: {
						duration: 150
					}
				});
				break;
			case 'all-move':
				//主窗体开始侧滑；
				main.setStyle({
					left: '0',
					transition: {
						duration: 150
					}
				});
				//menu页面同时移动
				menu.setStyle({
					left: '-70%',
					transition: {
						duration: 150
					}
				});
				
				break;
		}
	
		//等窗体动画结束后，隐藏菜单webview，节省资源；
		setTimeout(function() {
			menu.hide();
		}, 200);
		//改变标志位
		showMenu = false;
	}
}

//变换侧滑动画移动效果；
mui('.mui-input-group').on('change', 'input', function() {
	if (this.checked) {
		switch (this.value) {
			case 'main-move':
				//仅主窗口移动的时候，menu页面的zindex值要低一点；
				menu.setStyle({left:'0',zindex:9997});
				if(mode=='all-move'){
					menu.setStyle({
						left: '0%'
					});
				}
				mode = 'main-move';
				break;
			case 'menu-move':
				menu.setStyle({left:'-70%',zindex:9999});
				if(mode=='all-move'){
					menu.setStyle({
						left: '0%'
					});
				}
				mode = 'menu-move';
				break;
			case 'all-move':
				//切换为整体移动
				//首先改变移动标志
				slideTogether = true;
				//变换menu界面初始化位置，整体移动时，Menu界面left需要在-70%的地方；
				menu.setStyle({
					left: '-70%'
				});
				mode = 'all-move';
				break;
		}
	}
});

//重写mui.menu方法，Android版本menu按键按下可自动打开、关闭侧滑菜单；
mui.menu = function() {
	if (showMenu) {
		closeMenu();
	} else {
		openMenu();
	}
}

// 子页面滑动切换事件
window.addEventListener("openMenu", function(event) {
	openMenu();
})
// ======================================================

// 初始化mui
mui.init({
	swipeBack: false,
	beforeback: back
});

mui.plusReady(function() {
	// 创建子页面，首个选项卡页面显示，其它均隐藏；
	main = plus.webview.currentWebview();
	// 用户点击Webview窗口后不显示遮罩层
	main.addEventListener("maskClick",function(){
	    main.setStyle({mask:"none"});
	    _closeMenu();
	},false);
	
	for (var i = 0; i < subpages.length; i++) {
		var temp = {};
		var sub = plus.webview.create('/view/subpage/'+subpages[i]+'.html', subpages[i], subpage_style);
		if (i > 0) {
			sub.hide();
		}else{
			temp[subpages[i]] = "true";
			mui.extend(aniShow,temp);
		}
		main.append(sub);
	}
	
	//setTimeout的目的是等待窗体动画结束后，再执行create webview操作，避免资源竞争，导致窗口动画不流畅；
	setTimeout(function () {
		//侧滑菜单默认隐藏，这样可以节省内存；
		menu = mui.preload({
			id: 'main-menu',
			url: 'main-menu.html',
			styles: {
				left: 0,
				width: '70%',
				zindex: 9997
			}
		});
	},300);
	
	/**
	 * 设置语音播报的前缀
	 */
	var play = null;
	/**
	 * android语音播报功能
	 */
	if(mui.os.android){
		var mainActivity = plus.android.runtimeMainActivity();
		var SpeechUtility = plus.android.importClass('com.iflytek.cloud.SpeechUtility');
		SpeechUtility.createUtility(mainActivity, "appid=587dc974");
		var SynthesizerPlayer = plus.android.importClass('com.iflytek.cloud.SpeechSynthesizer');
		play = SynthesizerPlayer.createSynthesizer(mainActivity, null);
	}
	/**
	 * IOS语音播报
	 */
	if(mui.os.ios){
		var AVSpeechSynthesizer = plus.ios.importClass("AVSpeechSynthesizer");
		var AVSpeechUtterance = plus.ios.importClass("AVSpeechUtterance");
		var AVSpeechSynthesisVoice = plus.ios.import("AVSpeechSynthesisVoice");
	}
	
	// 获得应用状态
	var settings = app.getSettings();
	var state = app.getState();
	// 清除正在登录的标志
	localStorage.removeItem('logining');
	//检查 "登录状态" 开始，如果没有登录，则跳转到登录页面
	if (!state.token) {
		mui.preload({
			'id': 'login',
			'url': 'user/login.html'
		});
		app.turnPage('login');
	}
	
	// 添加监听从系统消息中心点击某条消息启动应用事件（消息推送）
	plus.push.addEventListener( "receive", function ( msg ) {
		// 分析msg.payload处理业务逻辑 
		try{
			// 收到通知
			var content = JSON.parse(msg.content);
			var msg = "订单"+content.order_code+"已经收款成功！";
			// 播报消息
			play.startSpeaking(msg,null);
			// 显示消息
			mui.toast(msg);
			// 初始化其他页面
			// code-----
			// code----
			// code---
		}catch(error){
			
		}
	}, false ); 
	
	
	
});

