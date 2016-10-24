function togGetDataArray(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;
	var tmpNumber = 0;

	//console.log('dataString :'+dataString);
	var index = dataString.substring(0,4);

	var test = parseInt(dataString.substring(0,4),16);//AA01(16) -> 43521(10)
	//console.log('dataString.substring(0,4):'+dataString.substring(0,4) + ' , number = '+ test);
	var data0 = parseInt(dataString.substring(6,10),16)/100;
	var data1 = parseInt(dataString.substring(10,14),16)/100;
	var data2 = parseInt(dataString.substring(14,18),16);

	arrDevice.push(data0);
	arrDevice.push(data1);
	arrDevice.push(data2);
	return arrDevice;

}

function togGetDataArray4(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;

	//console.log('dataString :'+dataString);

	for(var i = 0;i<dataString.length;i=i+4){
        var tmp = dataString.substring(i,i+4);
		console.log('tmp '+i+':'+tmp);
		var tmpNumber = 0;
		if(i<(arrLength-1)*4){
			//console.log('i:'+i+'value = vaue/10');
			tmpNumber = parseInt(tmp,16)/100;
		}else{
			//console.log('i:'+i+'value = vaue');
			tmpNumber = parseInt(tmp,16);
		}
		//arrDevice.push(tmpNumber.toString());
		arrDevice.push(tmpNumber);
	}
	return arrDevice;
}

//For aa01
function togGetDataArray1(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;
	var tmpNumber = 0;

	//console.log('dataString :'+dataString);
	var index = dataString.substring(0,4);

	var test = parseInt(dataString.substring(0,4),16);//AA01(16) -> 43521(10)
	//console.log('dataString.substring(0,4):'+dataString.substring(0,4) + ' , number = '+ test);
	var data0 = parseInt(dataString.substring(4,8),16);
	var data1 = parseInt(dataString.substring(8,12),16);
	var data2 = parseInt(dataString.substring(12,14),16);
	var data3 = parseInt(dataString.substring(14,16),16);
	var data4 = parseInt(dataString.substring(16,20),16);

	arrDevice.push(data0);
	arrDevice.push(data1);
	arrDevice.push(data2);
	arrDevice.push(data3);
	arrDevice.push(data4);
	return arrDevice;
}

//For aa02
function togGetDataArray2(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;

	//aa01(16) -> 43522(10)
	for(var i = 0;i<dataString.length;i=i+4){
        var tmp = dataString.substring(i,i+4);
		console.log('tmp '+i+':'+tmp);
		var tmpNumber = 0;
		if(i==0){
			continue;
		}else{
			//console.log('i:'+i+'value = vaue');
			tmpNumber = parseInt(tmp,16);
			//arrDevice.push(tmpNumber.toString());
			arrDevice.push(tmpNumber);
		}
	}
	return arrDevice;
}

//For aa03
function togGetDataArray3(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;

	//console.log('dataString :'+dataString);

	for(var i = 0;i<dataString.length;i=i+4){
        var tmp = dataString.substring(i,i+4);
		console.log('tmp '+i+':'+tmp);
		var tmpNumber = 0;
		if(i<(arrLength-1)*4){
			//console.log('i:'+i+'value = vaue/10');
			tmpNumber = parseInt(tmp,16)/100;
		}else{
			//console.log('i:'+i+'value = vaue');
			tmpNumber = parseInt(tmp,16);
		}
		//arrDevice.push(tmpNumber.toString());
		arrDevice.push(tmpNumber);
	}
	return arrDevice;
}

exports.getDataArray = function (flag,dataString) {
	if(flag == 0){
		return togGetDataArray(dataString);
	}else if(flag == 1){
		return togGetDataArray1(dataString);
	}else if(flag == 2){
		return togGetDataArray2(dataString);
	}else if(flag == 3){
		return togGetDataArray3(dataString);
	}else if(flag == 4){
		return togGetDataArray4(dataString);
	}
};

exports.getType = function (p) {
    console.log('Debug getType :'+(typeof p))
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

exports.isEmpty = function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true && JSON.stringify(obj) === JSON.stringify({});
}