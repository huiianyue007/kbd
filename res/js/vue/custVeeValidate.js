VeeValidate.Validator.localize('zh_CN');
VeeValidate.Validator.localize({
	zh_CN:{
		messages:{
			required:function(name){
				console.log(name);
				var msg = name+'不能为空';
				app.toast(msg);
				return msg;
			},
			email:function(){
				var msg = '邮箱格式无效';
				app.toast(msg);
				return msg;
			}
		},
		attributes:{
			mobile:'手机号',
			password: '密码',
			bankNum: '银行卡号',
			idCard: '身份证'
		},
		custom:{
			password:{
				min:function(){
					var msg = '密码为8-16位，数字、大小写字母组成';
					app.toast(msg);
					return msg;
				},
				max:function(){
					var msg = '密码为8-16位，数字、大小写字母组成';
					app.toast(msg)
					return msg;
				}
			},
//			bankNum:{
//				credit_card:function(){
//					let msg = '请输入正确银行卡账号';
//					app.toast(msg);
//					return msg;
//				}
//			},
			idCard:{
				idCard:function(){
					var msg = '身份证号格式错误';
					app.toast(msg);
					return msg;
				}
			}
		}
	}
});
VeeValidate.Validator.extend('phone', {
	getMessage: function(){ 
		var msg = '手机号码格式错误';
		app.toast(msg);
		return msg;
	},
  	validate: function(value){
    	return value.length == 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(value)
  	}
});
VeeValidate.Validator.extend('idCard', {
    getMessage: function(){
    	var msg = '身份证号码不正确！';
        app.toast(msg)
        return msg;
    },
    validate: function(value) {
        var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
        var pass = true;

        if (!value || !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
            pass = false;
        } else if (!city[value.substr(0, 2)]) {
            pass = false;
        } else {
            //18位身份证需要验证最后一位校验位
            if (value.length == 18) {
            	value = value.toUpperCase();
                value = value.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = value[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != value[17]) {
                    pass = false;
                }
            }
        }
        return pass;
    }
});
VeeValidate.Validator.extend('bankNum', {
    getMessage: function(){
    	var msg = '银行卡号码不正确！';
        app.toast(msg)
        return msg;
    },
    validate: function(bankno) {
        var lastNum = bankno.substr(bankno.length - 1, 1); //取出最后一位（与luhn进行比较）
	    var first15Num = bankno.substr(0, bankno.length - 1); //前15或18位
	    var newArr = new Array();
	    for (var i = first15Num.length - 1; i > -1; i--) { //前15或18位倒序存进数组
	        newArr.push(first15Num.substr(i, 1));
	    }
	    var arrJiShu = new Array(); //奇数位*2的积 <9
	    var arrJiShu2 = new Array(); //奇数位*2的积 >9
	    var arrOuShu = new Array(); //偶数位数组
	    for (var j = 0; j < newArr.length; j++) {
	        if ((j + 1) % 2 == 1) { //奇数位
	            if (parseInt(newArr[j]) * 2 < 9) arrJiShu.push(parseInt(newArr[j]) * 2);
	            else arrJiShu2.push(parseInt(newArr[j]) * 2);
	        } else //偶数位
	        arrOuShu.push(newArr[j]);
	    }
	
	    var jishu_child1 = new Array(); //奇数位*2 >9 的分割之后的数组个位数
	    var jishu_child2 = new Array(); //奇数位*2 >9 的分割之后的数组十位数
	    for (var h = 0; h < arrJiShu2.length; h++) {
	        jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
	        jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
	    }
	
	    var sumJiShu = 0; //奇数位*2 < 9 的数组之和
	    var sumOuShu = 0; //偶数位数组之和
	    var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
	    var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
	    var sumTotal = 0;
	    for (var m = 0; m < arrJiShu.length; m++) {
	        sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
	    }
	
	    for (var n = 0; n < arrOuShu.length; n++) {
	        sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
	    }
	
	    for (var p = 0; p < jishu_child1.length; p++) {
	        sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
	        sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
	    }
	    //计算总和
	    sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);
	
	    //计算luhn值
	    var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
	    var luhn = 10 - k;
	
	    if (lastNum == luhn) {
	        return true;
	    } else {
	        return false;
	    }
    }
});
Vue.use(VeeValidate,{
  events: 'blur', 
});