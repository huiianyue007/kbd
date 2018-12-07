// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt) { //author: meizz   
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
//数值格式化，保留一位小数
function fmtNumber(numBefor, num) {
	numBefor = Number(numBefor);
	numBefor = numBefor.toFixed(num);
	return numBefor;
}
// 获得cookies
function getCookie(name) {
	var cookieValue = null;
	if(plus.navigator.getCookie(app.server) && plus.navigator.getCookie(app.server) != '') {
		var cookies = plus.navigator.getCookie(app.server).split(';');
		for(var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].replace(/(^\s*)|(\s*$)/g, "");
			// Does this cookie string begin with the name we want?
			if(cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}
/**
 * 计算新日期
 */
function getNewDay(dateTemp, days) {
	var dateTemp = dateTemp.split("-");
	var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式    
	var millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
	var rDate = new Date(millSeconds);
	var year = rDate.getFullYear();
	var month = rDate.getMonth() + 1;
	if(month < 10) month = "0" + month;
	var date = rDate.getDate();
	if(date < 10) date = "0" + date;
	return(year + "-" + month + "-" + date);
}

function trim(str){ //删除左右两端的空格
	str = str||"";  
	return str.replace(/(^\s*)|(\s*$)/g, "");
}

function iosBackEvent(callback){
	vueCtl.selfWebView=plus.webview.currentWebview();
    vueCtl.selfWebView.addEventListener( "popGesture", function(e){
        if(e.type=="start"){
            //关闭div滚动
            callback();
        }
    }, false );
}
