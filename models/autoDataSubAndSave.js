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
var tmp_mac,tmp_recv;

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});

socket.on('connect',function(){
    socket.emit('giot_client','hello,giot_client socket cient is ready');
});

GIotClient.on('connect', function()  {
	console.log('time:'+new Date()+'-> mqtt topic:'+settings.gIoTopic);
	/*GIotClient.subscribe(settings.gIoTopic,{qos:2},function(err,granted){
		if(err){
			console.log('subscribe fail: '+err);
		}
		console.log('subscribe success: '+JSON.stringify(granted));
	});*/
	GIotClient.subscribe(settings.gIoTopic,{qos:2});
});

var messageJSON,test = false;

if(test == false){
	GIotClient.on('message', function(topic, message) {

		//var message = '{"id":"2512c9fd-5719-4271-8991-6bb9e019d955","macAddr":"04000496","data":"00fc03a900fb01d701e7","buff":"2016-08-30T01:07:18.852Z","recv":"2016-08-30T01:07:17.000Z","extra":{"gwip":"134.208.228.32","gwid":"00001c497b431fa9","repeater":"00000000ffffffff","systype":4,"rssi":-119,"snr":-120}}';
		console.log('Debug mqtt data -----------------------------------------------------start' );
		console.log('topic:'+topic.toString());
		console.log('message:'+message.toString());
		console.log('message type :'+getType(message));

		try {
			messageJSON = JSON.parse(message.toString());
		}
		catch (e) {
			console.log('parse json error message :'+e.toString());
			return;
		}
		saveAndSendMessage(messageJSON);
		GIotClient.end();
	});

}else{//for test
	message = '{"id":"2512c9fd-5719-4271-8991-6bb9e019d955","macAddr":"04000496","data":"01fc03a900fb01d701e7","buff":"2016-08-30T01:07:18.852Z","recv":"2016-09-06T01:07:17.000Z","extra":{"gwip":"134.208.228.32","gwid":"00001c497b431fa9","repeater":"00000000ffffffff","systype":4,"rssi":-119,"snr":-120}}';
	obj = JSON.parse(message);
	saveAndSendMessage(obj);
	GIotClient.end();
}



function saveAndSendMessage(_JSON){
	//Notify update
	socket.emit('giot_client_message',_JSON);

	console.log('Debug saveAndSendMessage -----------------------------start');
	if(tmp_mac == _JSON['macAddr'] && tmp_recv == _JSON['recv'] && test == false){
		console.log('Debug saveAndSendMessage -----------------------------' );
		return;
	}else{
		tmp_mac = _JSON['macAddr'];
		tmp_recv = _JSON['recv'];
		socket.emit('giot_client',_JSON);
		console.log('tmp_mac :'+tmp_mac);
		console.log('tmp_recv :'+tmp_recv);
		console.log('Debug saveAndSendMessage -----------------------------' );
	}
	/*try {
		// 需要測試的語句
		macList = JsonFileTools.getJsonFromFile('../public/data/macList.json');
	}
	catch (e) {
		console.log('getJsonFromFile error message :'+e.toString());
		return;
	}*/
	var mData = _JSON.data;
	DeviceDbTools.saveDevice(_JSON['macAddr'],_JSON['data'],_JSON['recv'],function(err,voltage){
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
			UnitDbTools.findByMac(_JSON['macAddr'],function(err,unit){
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
}


function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}