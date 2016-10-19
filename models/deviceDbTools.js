var DeviceModel = require('./device.js');
var JsonFileTools =  require('./jsonFileTools.js');
var Tools = require('./tools.js');
var moment = require('moment');

function toGetInfoByData(mac,data){
    var info = {};
    //Jason test
    var flag = 0;//value/10 for old
    var tag = data.substring(0,4);
    if(tag == 'aa01'){
        flag = 1;
    }else if(tag == 'aa02'){
        flag = 2;
    }else if(tag == 'aa00'){
        flag = 0;
    }else {
        flag = 4;//value/100 for new
    }
    var arrData =Tools.getDataArray(flag,data);
    for(var i = 0;i<arrData.length ;i++){
        var a = 'data' + i;
        info[a] = arrData[i];
    }
    return info;
}

exports.saveDevice = function (macAddress,data,recv,callback) {
    var mRecv = new Date(recv);
    var info = toGetInfoByData(macAddress,data);

    var index = '';
    var tag = data.substring(0,4);
    if( tag == 'aa01' ||  tag == 'aa02' || tag == 'aa00'){
        index = data.substring(0,4);
    }else{
        console.log('mV:'+info.data4);
    }

    console.log('macAddress:'+macAddress);
    console.log('mRecv:'+ mRecv);
    console.log('info:'+JSON.stringify( info));

    if(isEmpty(info)){
       return callback('Data is not correct!!!');
    }


    var time = {
        date   : moment(recv).format('YYYY-MM-DD HH:mm:ss'),
        /*year   : moment(recv).format("YYYY"),
        month  : moment(recv).format("YYYY-MM"),
        day    : moment(recv).format("YYYY-MM-DD"),
        hour   : moment(recv).format("YYYY-MM-DD HH"),
        minute : moment(recv).format("YYYY-MM-DD HH:mm"),*/
        cdate   : moment(recv).format('YYYY-MM-DD HH:mm:ss')
    };

    console.log('time:'+JSON.stringify( time));

    var newDevice = new DeviceModel({
        macAddr    : macAddress,
        index      : index,
        data       : data,
        info       : info,
        recv_at    : mRecv,
        created_at : new Date(),
        time:time
    });

    newDevice.save(function(err){
        if(err){
            console.log('Debug : Device save fail!');
            return callback(err);
        }
        console.log('Debug : Device save success!');
        return callback(err,info);
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
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Deb u All Units');
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

function toFindDevices(json,calllback) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Debug : toFindDevices()');
    DeviceModel.find(json,(err, Devices) => {
        if (err) {
            console.log('Debug : findDevice err:', err);
            return calllback(err);
        } else {
            console.log('Debug :findDevice success\n:',Devices);
            return calllback(err,Devices);
        }
    });
}

function toFindLastDevice(json,calllback) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Debug : toFindLastDevice()' );
    DeviceModel.find(json).sort({recv_at: -1}).limit(1).exec(function(err,devices){
        if(err){
            console.log('Debug deviceDbTools find Last Device By Unit -> err :'+err);
            return calllback(err,null);
        }else{
            console.log('Debug deviceDbTools find Last Device By Unit('+json+') -> device :'+devices.length);
            return calllback(err,devices[0]);
        }
    });
}

exports.findDevices = function (json,calllback) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Debug : findDevices()');
    DeviceModel.find(json,(err, Devices) => {
        if (err) {
            console.log('Debug : findDevice err:', err);
            return calllback(err);
        } else {
            console.log('Debug :findDevice success\n:',Devices.length);
            return calllback(err,Devices);
        }
    });
};

//Find last record by mac
exports.findLastDeviceByMac = function (mac,calllback) {
    return toFindLastDevice({macAddr:mac},calllback);
};

//Find last record by json
exports.findLastDevice = function (json,calllback) {
    return toFindLastDevice(json,calllback);
};

/*Find devices by date
*date option: 0:one days 1:one weeks 2:one months 3:three months
*/
exports.findDevicesByDate = function (dateStr,mac,dateOption,order,calllback) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Debug : findDevicesByDate()');
    console.log('-mac : '+mac);
    /*var testDate = moment().format('YYYY-MM-DD');
    if(dateStr && dateStr == testDate){
        testDate = testTime;
    }else{
        testDate = moment(dateStr).add(1,'days').toDate();
    }*/
    testDate = moment(dateStr).add(1,'days').toDate();
    var now = moment(testDate).toDate();

    var from;
    switch(dateOption) {
    case 0:
        from =  moment(testDate).subtract(1,'days').toDate();
        break;
    case 1:
        from =  moment(testDate).subtract(1,'weeks').toDate();
        break;
    case 2:
        from =  moment(testDate).subtract(1,'months').toDate();
        break;
    case 3:
        from =  moment(testDate).subtract(3,'months').toDate();
        break;
    default:
        from =  moment(testDate).subtract(3,'months').toDate();
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
        /*year   : moment(updateTime).format("YYYY"),
        month  : moment(updateTime).format("YYYY-MM"),
        day    : moment(updateTime).format("YYYY-MM-DD"),
        hour   : moment(updateTime).format("YYYY-MM-DD HH"),
        minute : moment(updateTime).format("YYYY-MM HH:mm"),*/
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
    var arrData =Tools.getDataArray(data);
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

exports.removeDeviceById = function (id,calllback) {
    DeviceModel.remove({_id:id}, (err)=>{
      console.log('---removeUserByName ---------------------------------------');
      if (err) {
        console.log('Debug : User remove id :'+id+' occur a error:', err);
            return calllback(err);
      } else {
        console.log('Debug : User remove id :'+id+' success.');
            return calllback(err,'success');
      }
    });
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true && JSON.stringify(obj) === JSON.stringify({});
}

exports.saveTestDevice = function (macAddress,tag,info,recv,callback) {
    var mRecv = new Date(recv);

    var index = tag;

    console.log('macAddress:'+macAddress);
    console.log('mRecv:'+ mRecv);
    console.log('info:'+JSON.stringify( info));

    var time = {
        date   : moment(recv).format('YYYY-MM-DD HH:mm:ss'),
        /*year   : moment(recv).format("YYYY"),
        month  : moment(recv).format("YYYY-MM"),
        day    : moment(recv).format("YYYY-MM-DD"),
        hour   : moment(recv).format("YYYY-MM-DD HH"),
        minute : moment(recv).format("YYYY-MM-DD HH:mm"),*/
        cdate   : moment(recv).format('YYYY-MM-DD HH:mm:ss')
    };

    console.log('time:'+JSON.stringify( time));

    var newDevice = new DeviceModel({
        macAddr    : macAddress,
        index      : index,
        data       : null,
        info       : info,
        recv_at    : mRecv,
        created_at : new Date(),
        time:time
    });

    newDevice.save(function(err){
        if(err){
            console.log('Debug : Device save fail!');
            return callback(err);
        }
        console.log('Debug : Device save success!');
        return callback(err,info);
    });
};

