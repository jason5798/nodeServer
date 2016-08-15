var DeviceModel = require('./device.js');
var Toos = require('./tools.js');
var moment = require('moment');

exports.saveDevice = function (macAddress,data,recv,callback) {
    var arrData =Toos.getDataArray(data);
    var mTmp1 = arrData[0];
	var mHum1 = arrData[1];
	var mTmp2 = arrData[2];
	var mHum2 = arrData[3];
	var mV = arrData[4];
	var mRecv =new Date(recv);
	/*console.log('macAddress:'+macAddress);
    console.log('data:'+data);
    console.log('mTmp1:'+mTmp1);
    console.log('mHum1:'+mHum1);
    console.log('mTmp2'+mTmp2);
    console.log('mHum2:'+mHum2);
    console.log('mV:'+mV);
	console.log('mRecv:'+mRecv);*/
    var time = {
		date   : moment().format("YYYY-MM-DD HH:mm:ss"),
		year   : moment().format("YYYY"),
		month  : moment().format("YYYY-MM"),
		day    : moment().format("YYYY-MM-DD"),
		hour   : moment().format("YYYY-MM-DD HH"),
		minute : moment().format("YYYY-MM-DD HH:mm"),
		cdate   : moment().format("YYYY年MM月DD日 HH時mm分ss秒")
	};
	var newDevice = new DeviceModel({
			macAddr    : macAddress,
			data 	   : data,
			temperature1:mTmp1 ,
			humidity1:mHum1,
			temperature2:mTmp2,
			humidity2:mHum2,
            voltage:mV,
			recv_at: mRecv,
			created_at : new Date(),
            time:time
		});
    newDevice.save(function(err){
		if(err){
			console.log('Debug : Device save fail!');
            return callback(err);
		}
		console.log('Debug : Device save success!');
        return callback(err,mV);
	});
};

exports.findByMac = function (find_mac,callback) {
    if(find_mac.length>0){
			console.log('find_mac.length>0');
			DeviceModel.find({ macAddr: find_mac }, function(err,devices){
				if(err){
					return callback(err);
				}
				/*console.log("find all of mac "+find_mac+" : "+devices);
				devices.forEach(function(device) {
					console.log('mac:'+device.macAddr + ', data :' +device.data);
				});*/

				if (devices.length>0) {
					console.log('find '+devices.length+' records');
                    return calllback(err,devices);
				}else{
					console.log('找不到資料!');
                    return callback('找不到資料!');
	  		    }
    	    });
	}else{
		console.log('find_name.length=0');
			return callback('找不到資料!');
	}
};	

/*Find all of unit 
*/
exports.findAllDevices = function (calllback) {
    console.log('---findAllUnits---------------------------------------');
    DeviceModel.find((err, Devices) => {
	    if (err) {
		    console.log('Debug : findAllDevices err:', err);
            return calllback(err);
	    } else {
            console.log('Debug : findAllDevices success\n:',Devices.length);
		    return calllback(err,Devices);
	    }
    });
};

exports.findDevices = function (json,calllback) {
    console.log('---findDevices---------------------------------------');
    DeviceModel.find(json,(err, Devices) => {
	    if (err) {
		    console.log('Debug : findDevice err:', err);
            return calllback(err);
	    } else {
            console.log('Debug :findDevice success\n:',Devices);
		    return calllback(err,Devices);
	    }
    });
};

//Find last record by mac
exports.findLastDeviceByUnit = function (unit,calllback) {
    var mac = unit.macAddr;
    DeviceModel.find({macAddr:mac}).sort({recv_at: -1}).limit(1).exec(function(err,devices){
        if(err){
            console.log('Debug deviceDbTools findLastDeviceByUnit -> err :'+err);
            return calllback(err);
        }else{
            console.log('Debug deviceDbTools findLastDeviceByUnit('+mac+') -> device :'+devices.length);
            return calllback(err,devices[0]);
        }
    });
	
};

/*Find devices by date 
*date option: 0:one ours 1:one days 2:one weeks 3:one months
*/
exports.findDevicesByDate = function (mac,dateOption,order,calllback) {
    console.log('---findDevices---------------------------------------');
    console.log('-mac : '+mac);
    var testDate = '20160724';
    var now = moment(testDate).toDate();
    
    var from;
    switch(dateOption) {
    case 0:
        from =  moment(testDate).subtract(4,'hours').toDate();
        break;
    case 1:
        from =  moment(testDate).subtract(1,'days').toDate();
        break;
    case 2:
        from =  moment(testDate).subtract(1,'weeks').toDate();
        break;
    case 3:
        from =  moment(testDate).subtract(1,'months').toDate();
        break;
    default:
        from =  moment(testDate).subtract(1,'days').toDate();
    }
    console.log( 'now :'+now );
    console.log( 'from :'+from );

    var json = {macAddr:mac,
                recv_at:{
                    $gte:from,
                    $lt:now
                }
        }

    DeviceModel.find(json,(err, Devices) => {
	    if (err) {
		    console.log('Debug : findDevice err:', err);
            return calllback(err);
	    } else {
            console.log('Debug :findDevice success\n:',Devices.length);
            var mDevices = [];
            if(order == 'asc' && Devices.length>0){
               for(var i= (Devices.length-1);i>-1 ;i--){
                   mDevices.push(Devices[i]);
               }
               return calllback(err,mDevices);
            }
            return calllback(err,Devices);
        }
    });
};

exports.getOptioDeviceList = function (devices,option) {
    var diff = 1;
    switch(option) {
    case 0:
        diff = 1;
        break;
    case 1:
        diff = 6;
        break;
    case 2:
        diff = 24*6;
        break;
    case 3:
        diff = 24*6;
        break;
    default:
        from =  moment().subtract(1,'days').toDate();
    }
    var deviceList = []; 
    var i = 0;
    for(i=0; i< devices.length ; i=i+diff){
        deviceList.push(devices[i]);
    }
    return deviceList;
};

exports.updateDeviceTime = function (unitId,updateTime,calllback) {
    console.log('---updateDeviceTime ---------------------------------------');
    console.log('Debug : updateDeviceTime id='+unitId+" , time ="+time);
	var time = {
		date   : moment(updateTime).format("YYYY-MM-DD HH:mm:ss"),
		year   : moment(updateTime).format("YYYY"),
		month  : moment(updateTime).format("YYYY-MM"),
		day    : moment(updateTime).format("YYYY-MM-DD"),
		hour   : moment(updateTime).format("YYYY-MM-DD HH"),
		minute : moment(updateTime).format("YYYY-MM HH:mm"),
		cdate   : moment(updateTime).format("YYYY年MM月DD日 HH時mm分ss秒")
	};
	console.log('Debug updateDeviceTime: time.date'+time.cdate);
	DeviceModel.update({_id : unitId},
        {time : time},
        {safe : true, upsert : true},
        (err, rawResponse)=>{
            if (err) {
                console.log('Debug updateDeviceTime : '+ err);
                return calllback(err);
            } else {
                console.log('Debug updateDeviceTime : success');
                return calllback(err,'success');
            }
        }
    );
};

exports.updateDeviceData = function (unitId,data,calllback) {
    console.log('---updateDeviceTime ---------------------------------------');
    console.log('Debug : updateDeviceTime id='+unitId+" , data ="+data);
	var arrData =Toos.getDataArray(data);
    var mTmp1 = arrData[0];
	var mHum1 = arrData[1];
	var mTmp2 = arrData[2];
	var mHum2 = arrData[3];
	
	DeviceModel.update({_id : unitId},
        {temperature1:mTmp1 ,
			humidity1:mHum1,
			temperature2:mTmp2,
			humidity2:mHum2,},
        {safe : true, upsert : true},
        (err, rawResponse)=>{
            if (err) {
                console.log('Debug updateDeviceData : '+ err);
                return calllback(err);
            } else {
                console.log('Debug updateDeviceData : success');
                return calllback(err,'success');
            }
        }
    );
};

exports.removeDevicesByDate = function (startDate,option,number,calllback) {
    console.log('--removeDevicesByDate---------------------------------------');
   
    var now = moment(startDate).toDate();
    var from
    switch(option) {
    case 0:
        from =  moment(startDate).subtract(number,'hours').toDate();
        break;
    case 1:
        from =  moment(startDate).subtract(number,'days').toDate();
        break;
    case 2:
        from =  moment(startDate).subtract(number,'weeks').toDate();
        break;
    case 3:
        from =  moment(startDate).subtract(number,'months').toDate();
        break;
    default:
        from =  moment(startDate).subtract(number,'days').toDate();
    }
    console.log( 'now :'+now );
    console.log( 'from :'+from );

    var json = {
                recv_at:{
                    $gte:from,
                    $lt:now
                }
        }

    DeviceModel.remove(json,(err, Devices) => {
	    if (err) {
		    console.log('Debug : findDevice err:', err);
            return calllback(err);
	    } else {
            console.log('Debug :findDevice success\n:',Devices.length);
		    return calllback(err,Devices);
	    }
    });
};