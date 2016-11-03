var settings = require('../settings');
var GIotClient =  require('./gIotClient.js');
var DeviceDbTools =  require('./deviceDbTools.js');
//var UnitDbTools =  require('./unitDbTools.js');
var JsonFileTools =  require('./jsonFileTools.js');
var moment = require('moment');
var date = moment();
var mac_tag_map = {};

//Combine data
var isCombine = false;
var firstData='',combineData='',secondInfo='';
var target = '';

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});

socket.on('connect',function(){
    socket.emit('giot_client','hello,giot_client socket cient is ready');
});

console.log('time:'+new Date()+'-> mqtt topic:'+settings.gIoTopic);
var messageJSON,test = false;

//if(test == false){
	//GIotClient.on('connect', function()  {
		GIotClient.subscribe(settings.gIoTopic);
    //});



	GIotClient.on('message', function(topic, message) {

		//console.log('Debug mqtt data -----------------------------------------------------start' );
		//console.log('topic:'+topic.toString());
		//console.log('message:'+message.toString());
		//console.log('message type :'+getType(message));

		try {
			messageJSON = JSON.parse(message.toString());
		}
		catch (e) {
			//console.log('parse json error message :'+e.toString());
			return;
		}
		console.log(messageJSON['recv'],', mac : '+ messageJSON['macAddr'] + ',  data : '+ messageJSON['data']);
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

function isSameTagCheck(data,mac){
	var data0 = data.substring(0,4);
	var data1 = data.substring(4,6);
	var tag = mac_tag_map[mac];
	console.log('mac : ' +mac + ' => tag : '+tag);
	if(data0 !='aa00'){
		return false;
	}
	if (tag == data1){
		return true;
	}else{
		mac_tag_map[mac] = data1;
		return false;
	}
}

function saveAndSendMessage(_JSON){

	var time = _JSON['recv'];
	if(test == true){
		time =  moment().format('YYYY-MM-DDThh:mm:ss');
	}

	//console.log('macAddr : '+ _JSON['macAddr'] + ',  recv : '+ _JSON['recv'] + ',  data : '+ _JSON['data']);
	var type = _JSON['data'].substring(0,4);
	if(type == 'aa03' || type == 'aa04' || type == 'aa05' ){
		//Combine data
		combinePM25(_JSON);
		return;
	}
	//Update and save data
	socket.emit('giot_client_message',_JSON);

	/*if( isSameTagCheck(_JSON['data'],_JSON['macAddr']) ){
		console.log('Debug drop same tag ');
		return;
	}*/


	DeviceDbTools.saveDevice(_JSON['macAddr'],_JSON['data'],time,function(err,info){

		if(err){
			//console.log('Debug save Device fail : '+err);
		}else{
			//console.log('Debug save Device success');
			/*UnitDbTools.findByMac(_JSON['macAddr'],function(err,unit){
				//console.log('Debug unit : '+unit);
				if(err == null){
					if(unit){
						if(unit.status == 2){
							UnitDbTools.updateUnitStatus(unit.macAddr,0,function(err,resut){
								if(err){
									console.log('Debug UnitDbTools.update Unit fail : '+err);
								}else{
									console.log('Debug UnitDbTools.update Unit success');
								}
							});
						}
					}
				}
			});*/
		}
	});
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function combinePM25(mJSON){
	var type = mJSON['data'].substring(0,4);
	var tag  = mJSON['data'].substring(4,6);
	var info = mJSON['data'].substring(6,mJSON['data'].length);
	if(target !=  tag){
		target = tag;
		if(type == 'aa03'){
			firstData =mJSON['data'];
			combineData = '';
		}

	}else{
		if(type == 'aa04'){
			secondInfo=info.substring(0,8);
			if(firstData !=''){
				combineData = firstData.concat(secondInfo);
			}
		}else if(type == 'aa05'){
			var mInfo = info.substring(0,12);
			if(combineData !=''){
				combineData = combineData.concat(mInfo);
			}else{
				combineData = firstData.concat(secondInfo);
				combineData = combineData.concat(mInfo);
			}
			//console.log('data length : '+combineData.length);
			//Save data
			if(combineData.length == 42){
				DeviceDbTools.saveDevice(mJSON['macAddr'],combineData,mJSON['recv'],function(err,info){
					if(err){
						console.log('Debug save Device fail : '+err);
					}
				});
			}

			//clear combineData
			combineData = '';
		}
	}
}