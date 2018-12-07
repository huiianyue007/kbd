// 初始化mui
mui.init({
	pullRefresh : {
	    container:"#consumptionInfo",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
	    down : {
	      style:'circle',//必选，下拉刷新样式，目前支持原生5+ ‘circle’ 样式
	      color:'#FFD006', //可选，默认“#2BD009” 下拉刷新控件颜色
	      height:'50px',//可选,默认50px.下拉刷新控件的高度,
	      range:'100px', //可选 默认100px,控件可下拉拖拽的范围
	      offset:44+immersed+'px', //可选 默认0px,下拉刷新控件的起始位置
	      auto: false,//可选,默认false.首次加载自动上拉刷新一次
	      callback :pulldownRefresh //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	    }
	}
});
// vue控制器，用于页面数据控制
var vueCtl = new Vue({
	el: '#app',
	data: {
		app: window.app,
		selfWebView: {},
		consumptions: [],
		liTitle: "自用消费",
		emptyTitle: "目前没有自用消费记录",
		headerTitle:"自用详情",
		consumptionName:"储值卡核销",
		cardParam: {
			cardid: "",
			status: "2"
		}
	},
	filters: {
		floatVal: function(value) {
			value = Number(value).toFixed(2);
			return value;
		}
	},
	methods: {
		openIncomeDetails: function(id) {
			var param = {
				incomeId: id,
				status: this.cardParam.status,
				headerTitle:this.headerTitle,
				consumptionName:this.consumptionName
			};
			app.signinOpen("user/wallet/incomeDetails", "../wallet/incomeDetails.html", null, param);
		}
	}
});

mui.plusReady(function() {
	
	if(plus.device.model=="iPhoneX"){
		document.getElementById("securityArea").style.display="";
	}
	//获取当前页面视图
	var webview = plus.webview.currentWebview();
	//获取储值卡Id
	vueCtl.cardParam.cardid = webview.cardId;

/**
	 * 点击导航菜单
	 */
	mui("#consumptionsType").on("tap", "li", changeType);
	/**
	 * 改变状态
	 */
	function changeType(e) {
		document.getElementById("emptyData").style.display = "none";
		document.getElementById("consumptions").style.display = "none";
		var status = this.getAttribute("status");
		changeClass();
		this.className = "headerLi headerLiActive";
		if(status == "2") {
			vueCtl.liTitle = "自用消费";
			vueCtl.emptyTitle = "目前没有自用消费记录";
			vueCtl.headerTitle = "自用详情";
			vueCtl.consumptionName = "储值卡核销";
		} else if(status == "3") {
			vueCtl.liTitle = "共享消费";
			vueCtl.emptyTitle = "目前没有共享消费记录";
			vueCtl.headerTitle = "共享订单";
			vueCtl.consumptionName = "卡余额减少";
		} else {
			vueCtl.liTitle = "储值卡充值";
			vueCtl.emptyTitle = "目前没有充值消费记录";
			vueCtl.headerTitle = "充值订单";
			vueCtl.consumptionName = "充值";
		}
		vueCtl.cardParam.status = status;
		findConsumptions();
	}
	/**
	 * 改变样式
	 */
	function changeClass() {
		mui("#consumptionsType li").each(function() {
			this.className = "headerLi";
		});
	}
	
	// 初始化
	findConsumptions();
});

/**
 * 获取用户的储值卡
 */
function findConsumptions() {
	plus.nativeUI.showWaiting(app.loadingWords);
	app.consumptions(vueCtl.cardParam, function(data) {
		mui.later(function(){plus.nativeUI.closeWaiting();},250);
		if(data && data.status == app.STATUS_SUCCESS) {
			if(data.info == "" || data.info.length == 0) {
				document.getElementById("emptyData").style.display = "";
			} else {
				vueCtl.consumptions = data.info;
				document.getElementById("consumptions").style.display = "";
			}

		} else {
			if(data=='error'){
				mui.toast("数据加载失败...")
				return;
			}
			mui.toast(data.info);
		}
	});
}

function pulldownRefresh() {
	//初始数据
	findConsumptions();
	
	mui.later(function() {
		mui('#consumptionInfo').pullRefresh().endPulldownToRefresh();
	}, 500);
}