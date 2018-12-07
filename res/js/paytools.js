var pays={};
mui.plusReady(function(){
	// 获取支付通道
	plus.payment.getChannels(function(channels){
		for(var i in channels){
			var channel=channels[i];
			pays[channel.id]=channel;
			checkServices(channel);
		}
	},function(e){
		outLine("获取支付通道失败："+e.message);
	});
});
// 检测是否安装支付服务
function checkServices(pc){
	if(!pc.serviceReady){
		var txt=null;
		switch(pc.id){
			case "alipay":
			txt="检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？";
			break;
			default:
			// 如果是微信支付功能
//			if(mui.os.ios){
				if(document.getElementById("wxpaybtn")){
					document.getElementById("wxpaybtn").remove();
				}
				return false;
//			}
//			txt="系统未安装“"+pc.description+"”服务，无法完成支付，是否立即安装？";
			break;
		}
		plus.nativeUI.confirm(txt,function(e){
			if(e.index==0){
				pc.installService();
			}
		},pc.description);
	}
}

var w=null;
var PAYSERVER='/pay/order';
var WXPAYSERVER='/pay/order';
// 获得token
var state = app.getState();
// 支付
function pay(payid,orderid,callback){
//	if(w){return;}//检查是否请求订单中
	outSet("----- 请求支付 -----");
	var url=PAYSERVER;
	
	w=plus.nativeUI.showWaiting();
	// 请求支付订单
	console.log(JSON.stringify(orderid))
	app.ajaxc("post", url, {
		orderid: orderid
	}, function(data){
		outLine("----- 请求订单成功 -----");
		var order = "";
		order=data.info;
		w.close();
		plus.payment.request(pays[payid],order,function(result){
			outLine("----- 支付成功 -----");
			if(typeof(callback)=="function"){
				callback(true);
			}
		},function(e){
			outLine("----- 支付失败 -----");
			outLine("["+e.code+"]："+e.message);
//					plus.nativeUI.alert(e.message,null,"支付失败");
			if(typeof(callback)=="function"){
				callback(false);
			}
		});
	},function(xhr,type,errorThrown){
		//异常处理；
		console.log(JSON.stringify(xhr))
		outLine("----- 请求订单失败 -----");
	});
}


// 输出内容
function outSet(s){
	console.log(s);
};
// 输出行内容
function outLine(s){
	console.log(s);
};