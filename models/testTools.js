/*var Tools =  require('./tools.js');
var string = '011501c0011401cc020d';
var arr = Tools.getDataArray(string);
for(var num in arr){
    console.log('num : '+arr[num]);
}*/

var moment = require('moment');

var mac = '04000496';
var data = '012001ca011e01d7012f';
var recv = new Date();
//var devices = dbTools.findByMac(mac);
//console.log('find '+devices.length+' records');
var name　 = '瓜棚下感應裝置';
var choise = 3;
//dbTools.saveUnit(mac,name);

//dbTools.updateUnit(mac,name2);
//dbTools.removeAllUnits();

//0 save 1:find 2:deete 3:update
/*
var dbTools =  require('./unitDbTools.js');
var name2　 = '瓜棚下感應裝置2';


if(choise == 0){//save
    dbTools.saveUnit(mac,name,function(err,result){
        if(err){
            console.log('saveUnit :'+err);
        }
        console.log('saveUnit : '+result);
    });
}else if(choise == 1){//
    dbTools.findAllUnits(function(err,units){
        if(err){
            console.log('findAllUnits :'+err);
        }
        console.log('findAllUnits'+units);
    });
}else if(choise == 2){
    dbTools.removeAllUnits(function(err,result){
        if(err){
            console.log('removeAllUnits :'+err);
        }
        console.log('removeAllUnits : '+result);
    });
}else{
    dbTools.updateUnit(mac,name2,function(err,result){
        if(err){
            console.log('updateUnit :'+err);
        }
        console.log('updateUnit  mac:'+mac+", name2:"+name2+" , result :" +result);
    });
}*/

var deviceDbTools =  require('./deviceDbTools.js');
var JsonFileTools =  require('./jsonFileTools.js');
/*if(choise == 3){//find
    var option = 1;
    deviceDbTools.findDevicesByDate(mac,option,function(err,devices){
        if(err){
            console.log('findDevices :'+err);
        }
        console.log('findDevices mac:'+mac+" , result :" +devices.length);
        getDeviceist(devices,option);
        var deviceList = getDeviceist(devices,option);
        console.log('deviceList:'+deviceList);

    });
}*/
/*var UnitDbTools =  require('./unitDbTools.js');
UnitDbTools.removeAllUnits(function(err,result){
    if(err){
        console.log('err : '+err);
    }else{
        console.log('success');
    }

})*/

/*function getDeviceist(devices,option){
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
}*/


deviceDbTools.findAllDevices(function(err,devices){
    if(err){
        console.log('findDevices :'+err);
    }

    //var device = devices[0];
    console.log('Debug testTools device'+devices.length);
    /*for(var i=0;i<devices.length;i++){
        updateData(devices[i]._id,devices[i].data);
        if(i>1){
            break;
        }
    }*/
    JsonFileTools.saveDataToFile(0,devices);
    //Remove device data
    /*deviceDbTools.removeDevicesByDate('20160720',3,1,function(err,result){
        if(err){
            console.log('Debug removeDevicesByDate fail /n'+err);
        }
        console.log('Debug removeDevicesByDate success');
    });*/

});

function update(id,time){
    deviceDbTools.updateDeviceTime(id,time,function(err,result){
        if(err){
            console.log('Debug testTools updateDeviceTime fail /n'+err);
        } else{
            console.log('Debug testTools updateDeviceTime success');
        }
    });
}

function updateData(id,data){
    deviceDbTools.updateDeviceData(id,data,function(err,result){
        if(err){
            console.log('Debug testTools updateDeviceTime fail /n'+err);
        } else{
            console.log('Debug testTools updateDeviceTime success');
        }
    });
}
