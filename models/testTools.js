var deviceDbTools =  require('./deviceDbTools.js');
var JsonFileTools =  require('./jsonFileTools.js');
var UnitDbTools =  require('./unitDbTools.js');

var recv = new Date();
//var devices = dbTools.findByMac(mac);
//console.log('find '+devices.length+' records');
var name　 = '瓜棚下感應裝置';
var choise = 3;
var step = 0;//0 change device info, 1:delete no info device

if(step == 0){//0 change device info
    deviceDbTools.findAllDevices(function(err,devices){
        if(err){
            console.log(err);
        }
        for(var i = 0; i < devices.length; i++){
            console.log('devices ('+i+'): '+devices[i]);
            if(devices[i].info == null){
                console.log('mac : '+devices[i].macAddr);
                console.log('data : '+devices[i].data);
                console.log('recv_at : '+devices[i].recv_at);
                console.log('info : '+devices[i].info);

               deviceDbTools.saveDevice(devices[i].macAddr,devices[i].data,devices[i].recv_at,function(err,voltage){
                    console.log('Debug save Device -----------------------------');
                    if(err){
                        console.log('Debug save Device fail : '+err);
                    }
                    console.log('Debug save Device success ');
                });
            }

        }
    });
}else{//1:delete no info device
    deviceDbTools.findAllDevices(function(err,devices){
        if(err){
            console.log(err);
        }
        for(var i = 0; i < devices.length; i++){
            console.log('devices ('+i+'): '+ devices[i]);
            if(devices[i].info == null){
                var device = devices[i];
                console.log('mac : '+ device.macAddr);
                console.log('data : '+ device.data);
                console.log('recv_at : '+ device.recv_at);
                console.log('id : '+ device._id );


                deviceDbTools.removeDeviceById(device._id,function(err,voltage){
                    console.log('Debug remove Device By Mac -----------------------------');
                    if(err){
                        console.log('Debug remove Device By Macfail : '+err);
                    }
                    console.log('Debug remove Device By Macsuccess ');
                });
            }

        }
    });

}
