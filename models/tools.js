exports.getDataArray = function (dataString) {
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
};
