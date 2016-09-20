function togGetDataArray(dataString) {
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
			tmpNumber = parseInt(tmp,16)/10;
		}else{
			//console.log('i:'+i+'value = vaue');
			tmpNumber = parseInt(tmp,16);
		}
		//arrDevice.push(tmpNumber.toString());
		arrDevice.push(tmpNumber);
	}
	return arrDevice;
}

function togGetDataArray2(dataString) {
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
	}else{
		return togGetDataArray2(dataString);
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