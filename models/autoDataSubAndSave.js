var settings = require('../settings');
var GIotClient =  require('./gIotClient.js');
var DeviceDbTools =  require('./deviceDbTools.js');
var UnitDbTools =  require('./unitDbTools.js');
var moment = require('moment');
var date = moment();
var isMqttConnection = false;

GIotClient.on('connect', function()  {
	if(isMqttConnection == false){
		console.log('time:'+moment().format("YYYY-MM-DD HH:mm:ss")+'-> mqtt topic:'+settings.gIoTopic);
  		GIotClient.subscribe(settings.gIoTopic,{qos:0});
		isMqttConnection = true;
		date = date.add(1,'minutes');
		
	}else{
		var testDate = moment();
		//console.log('Debug appjs -> testDate.valueOf():'+testDate.valueOf() + ", type:"+typeof(testDate.valueOf()));
		//console.log('Debug appjs -> date.valueOf():'+date.valueOf() + ", type:"+typeof(date.valueOf()));
		if(testDate.valueOf()>date.valueOf()){
			date = date.add(1,'minutes');//Update date
			console.log('time:'+moment().format("YYYY-MM-DD HH:mm:ss")+'-> mqtt topic:'+settings.gIoTopic);
		}
	}
});

GIotClient.on('message', function(topic, message) {
		console.log('Debug mqtt data ------------------------------------------------------------start' );
		console.log('topic:'+topic.toString());
		console.log('message:'+message.toString());
		console.log('message type :'+getType(message));

		if(getType(message) !== 'object')
			return;
		try {
			var obj = JSON.parse(message);
		}
		catch (e) {
			console.log('parse json error message :'+e.toString());
			return;
		}
		console.log('mac:'+obj.macAddr +', data:'+obj.data+', recv:'+obj.recv);
        var mData = obj.data;
		DeviceDbTools.saveDevice(obj.macAddr,obj.data,obj.recv,function(err,voltage){
			if(err){
				console.log('Debug saveDevice fail : '+err);
			}else{
				//Statu 0:normal 1:low power 2:loss
				var status = 0;
				if(voltage<300){
					status = 1;
				}
				//Verify unit status is same
				UnitDbTools.findUnitBymac(obj.macAddr,function(err,unit){
					if(err == null){
						if(unit){
							if(unit.status != status){
								UnitDbTools.updateUnit(unit.macAddr,unit.name,status,function(err,resut){
									if(err){
										console.log('Debug UnitDbTools.updateUnit fail : '+err);
									}else{
										console.log('Debug UnitDbTools.updateUnit success');
									}
								});
							}
						}
					}
				})
			}
			findUnitBymac
		});
		console.log('Debug mqtt data ------------------------------------------------------------end' );
});

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}


