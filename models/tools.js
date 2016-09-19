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
		arrDevice.push(tmpNumber);
	}
	return arrDevice;
}
exports.getDataArray = function (dataString) {
	return togGetDataArray(dataString);
};

exports. getInfoByType = function (type,data) {
	var info = {};
    
    var arrData =togGetDataArray(data);
    if(type){
        if(type == 'd001'){
            var a0 =  arrData[0];
            var a1 =  arrData[1];
            var a2 =  arrData[2];
            var a3 =  arrData[3];
            var a4 =  arrData[4];
            info.temperature1 =a0;
            info.humidity1 = a1;
            info.temperature2 = a2;
            info.humidity2 = a3;
            info.voltage = a4;
            console.log('data:'+data);
            console.log('mTmp1:'+arrData[0]);
            console.log('mHum1:'+arrData[1]);
            console.log('mTmp2'+arrData[2]);
            console.log('mHum2:'+arrData[3]);
            console.log('mV:'+arrData[4]);
        }
    }else{//type undefined
        if(data.length==20){
            var a0 =  arrData[0];
            var a1 =  arrData[1];
            var a2 =  arrData[2];
            var a3 =  arrData[3];
            var a4 =  arrData[4];
            info.temperature1 =a0;
            info.humidity1 = a1;
            info.temperature2 = a2;
            info.humidity2 = a3;
            info.voltage = a4;
            console.log('data:'+data);
            console.log('mTmp1:'+arrData[0]);
            console.log('mHum1:'+arrData[1]);
            console.log('mTmp2'+arrData[2]);
            console.log('mHum2:'+arrData[3]);
            console.log('mV:'+arrData[4]);
        }
    }
    
    return info;
}