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
var count = 0;

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});

socket.on('connect',function(){
    socket.emit('giot_client','hello,giot_client socket cient is ready');
});



var messageJSON,test = false;

//if(test == false){
	GIotClient.on('connect', function()  {
		//console.log('time:'+new Date()+'-> mqtt topic:'+settings.gIoTopic);
		/*GIotClient.subscribe(settings.gIoTopic,{qos:2},function(err,granted){
			if(err){
				console.log('subscribe fail: '+err);
			}
			console.log('subscribe success: '+JSON.stringify(granted));
		});*/
		//GIotClient.subscribe(settings.gIoTopic,{qos:2});
		GIotClient.subscribe(settings.gIoTopic);
	});

	GIotClient.on('message', function(topic, message) {

		console.log('Debug mqtt data -----------------------------------------------------start' );
		//console.log('topic:'+topic.toString());
		console.log('message:'+message.toString());
		//console.log('message type :'+getType(message));

		try {
			messageJSON = JSON.parse(message.toString());
		}
		catch (e) {
			console.log('parse json error message :'+e.toString());
			return;
		}
		saveAndSendMessage(messageJSON);
	});

	GIotClient.on('disconnect', function() {
		console.log('Debug mqtt disconnect ????????????????????????????????????' );
	});


/*}else{
	message = '{"id":"2512c9fd-5719-4271-8991-6bb9e019d955","macAddr":"04000496","data":"01fc03a900fb01d701e7","buff":"2016-08-30T01:07:18.852Z","recv":"2016-09-06T01:07:17.000Z","extra":{"gwip":"134.208.228.32","gwid":"00001c497b431fa9","repeater":"00000000ffffffff","systype":4,"rssi":-119,"snr":-120}}';
	obj = JSON.parse(message);
	saveAndSendMessage(obj);
}*/



function saveAndSendMessage(_JSON){

	var time = _JSON['recv'];
	if(test == true){
		time =  moment().format('YYYY-MM-DDThh:mm:ss');
	}

	console.log('Debug saveAndSendMessage -----------------------------start');
	console.log('tmp_mac :'+tmp_mac + ', tmp_recv :'+tmp_recv);
	console.log('macAddr : '+ _JSON['macAddr'] + ',  recv : '+ _JSON['recv']);

	/*if(tmp_mac == _JSON['macAddr'] && tmp_recv == _JSON['recv'] && test == false){
		console.log('Dbuge saveAndSendMessage -----------------------------reject' );
		return;
	}else{*/
		tmp_mac = _JSON['macAddr'];
		tmp_recv = _JSON['recv'];
		//Notify update
		socket.emit('giot_client_message',_JSON);
		count ++;
		//console.log('Debug saveAndSendMessage -----------------------------(count :'+ count);
	//}

	console.log('Debug save Device time : '+time);

	DeviceDbTools.saveDevice(_JSON['macAddr'],_JSON['data'],time,function(err,info){
		console.log('Debug save Device -----------------------------');
		if(err){
			console.log('Debug save Device fail : '+err);
		}else{
			//Statu 0:normal 1:low power 2:loss
			var status = 0;
			//For device type = 'd001'  ----------------------------- -----------------------------
			/*if(info.data4 == undefined){
				return;
			}*/
			//console.log('Debug save Device success ');
			//Verify unit status is same
			//console.log('Debug findBymac : '+obj}.macAddr);
			/*UnitDbTools.findByMac(_JSON['macAddr'],function(err,unit){
				console.log('Debug unit : '+unit);
				if(err == null){
					if(unit){
						if(unit.status != status){
							UnitDbTools.updateUnitStatus(unit.macAddr,status,function(err,resut){
								if(err){
									console.log('Debug UnitDbTools.update Unit fail : '+err);
								}else{
									console.log('Debug UnitDbTools.update Unit success');
								}
							});
						}
					}
				}
			})*/
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