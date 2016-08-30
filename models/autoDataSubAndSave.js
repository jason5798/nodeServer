var settings = require('../settings');
var GIotClient =  require('./gIotClient.js');
var DeviceDbTools =  require('./deviceDbTools.js');
var UnitDbTools =  require('./unitDbTools.js');
var JsonFileTools =  require('./jsonFileTools.js');
var moment = require('moment');
var date = moment();
var isMqttConnection = false;
var allUnits;
var macList;

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
		//var message = '{"id":"2512c9fd-5719-4271-8991-6bb9e019d955","macAddr":"04000496","data":"00fc03a900fb01d701e7","buff":"2016-08-30T01:07:18.852Z","recv":"2016-08-30T01:07:17.000Z","extra":{"gwip":"134.208.228.32","gwid":"00001c497b431fa9","repeater":"00000000ffffffff","systype":4,"rssi":-119,"snr":-120}}';
		console.log('Debug mqtt data ------------------------------------------------------------start' );
		//console.log('topic:'+topic.toString());
		console.log('message:'+message.toString());
		console.log('message type :'+getType(message));
		try {
			// 需要測試的語句
			macList = JsonFileTools.getJsonFromFile('../public/data/macList.json');
		}
		catch (e) {
			console.log('getJsonFromFile error message :'+e.toString());
			return;
		}
		console.log('message type:'+getType(message));

		if(getType(message) != 'string'){
			console.log('message is not string');
			return;
		}
		var obj;
		try {
			obj = JSON.parse(message);
		}
		catch (e) {
			console.log('parse json error message :'+e.toString());
			return;
		}
		console.log('mac:'+obj.macAddr +', data:'+obj.data+', recv:'+obj.recv);
		if(macList){
			console.log('**** :got macist');
			var testIndex = macList.indexOf(obj.macAddr);
			if(testIndex == -1){
				console.log('???? :not setting mac -> reject mqtt message');
				return;
			}
		}else{
			console.log('???? :no macist');
		}


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
				//console.log('Debug findBymac : '+obj.macAddr);
				UnitDbTools.findByMac(obj.macAddr,function(err,unit){
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

		});
		console.log('Debug mqtt data ------------------------------------------------------------end' );
});

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}