var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var settings = require('./settings');
var routes = require('./routes/index');
var moment = require('moment');
var http = require('http'),
    https = require('https');
var ssl = require('./sslLicense');

//require private module ------------------------------------------
var UnitDbTools = require('./models/unitDbTools.js');
var DeviceDbTools = require('./models/deviceDbTools.js');
var UserDbTools = require('./models/userDbTools.js');
var GIotClient =  require('./models/gIotClient.js');
var tools =  require('./models/tools.js');
var JsonFileTools =  require('./models/jsonFileTools.js');

//app setting-------------------------------------------------------
var app = express();
var port = process.env.PORT || 3000;
app.set('port', port);
app.set('httpsport', 8080);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true
}));
//
routes(app);
var server = http.createServer(app);
var httpsServer = https.createServer(ssl.options, app).listen(app.get('httpsport'));
var socket = require('socket.io').listen(server.listen(port));




/*app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});*/

console.log('settings.cookieSecret : '+settings.cookieSecret);
console.log('settings.db : '+settings.db);

var isMqttConnection = false;
var date = moment();
var myUnits;

GIotClient.on('connect', function()  {
	if(isMqttConnection == false){
		console.log('Debug appjs -> Connect to mqtt topic:'+settings.gIoTopic);
  		GIotClient.subscribe(settings.gIoTopic,{qos:2});
		isMqttConnection = true;
		date = date.add(1,'minutes');

	}else{
		var testDate = moment();
		//console.log('Debug appjs -> testDate.valueOf():'+testDate.valueOf() + ", type:"+typeof(testDate.valueOf()));
		//console.log('Debug appjs -> date.valueOf():'+date.valueOf() + ", type:"+typeof(date.valueOf()));
		if(testDate.valueOf()>date.valueOf()){
			date = date.add(1,'minutes');//Update date
			console.log('Debug appjs -> Connect to mqtt topic:'+settings.gIoTopic);
		}
	}
});


socket.on('connection',function(client){

	//for register ----------------------------------------------------------------------------
	/*client.on('reg_client',function(data){
		console.log('Debug reg_client ------------------------------------------------------------start' );
		console.log('Debug reg_client :' + data );
	});

	client.on('reg_client_check',function(data){
		console.log('Debug reg_client_check ----------------------------------------------------start' );
		console.log('Debug reg_client_check:'+data.account + ' , password:'+ data.password);

		UserDbTools.findUserByName (data.account,function(err,user){
			if(err){
				console.log('Debug reg_client_check -> findUserByName :' + err);
				return;
			}
			console.log('Debug reg_client_check -> find user :\n'+user);
			if (user) {
				client.emit('reg_client_db_result',{result:'fail'});

			}else{
				client.emit('reg_client_db_result',{result:'ok'});
			}
		});

	});*/

	//for index ----------------------------------------------------------------------------
	client.on('index_client',function(data){
		console.log('Debug index ------------------------------------------------------------start' );
		console.log('Debug index :' + data );
		toCheckDeviceTimeout(client);
	});

	//for new message ----------------------------------------------------------------------------
	client.on('new_message_client',function(data){
		console.log('Debug new_message_client :'+data );
		UnitDbTools.findAllUnits(function(err,units){
			if(err){
				console.log('Debug ')
			}else{
				myUnits = units;
				//console.log('Debug new_message_client-> units : '+units);
				console.log('Debug new_message_client ------------------------------------------------------------start' );
				for(var i=0;i<units.length;i++){
					var unit = units[i];
					console.log('Debug new_message_client->unit : ('+i+') \n' + unit.macAddr );
					var unitMac = unit.macAddr;

					DeviceDbTools.findLastDeviceByUnit(unit,function(err,device){
						if(err){

						}else{
							if(device){
								var index = 0;
								for(var j=0;j<units.length;j++){
									if(units[j].macAddr == device.macAddr){
										 index = j;
									}
								}
								console.log('Debug new_message_client ->device ('+index+') :'+device.time.date );
								client.emit('new_message_db_findLast',{index:index,macAddr:device.macAddr,data:device.data,time:device.time.date,create:device.created_at,tmp1:device.temperature1,hum1:device.humidity2,tmp2:device.temperature2,hum2:device.humidity2,vol:device.voltage});
								console.log('Debug new_message_client ------------------------------------------------------------end' );
						}

						}
					});
				}
			}
		});
	});

	client.on('disconnect',function(){
         console.log('Server has disconnected!');
	});

	//for receive mqtt message to updata new message----------------------------------------------------------
	GIotClient.on('message', function( topic, message) {
		console.log('topic:'+topic.toString());
		console.log('message:'+message.toString());
		console.log('message type :'+getType(message));

		if(getType(message) !== 'object')
			return;
		try {
			// 需要測試的語句
			var obj = JSON.parse(message);
		}
		catch (e) {
			console.log('parse json error message :'+e.toString());
			return;
		}

        var index = 0;
		for(var k = 0; k<myUnits.length; k++){
			if(obj.macAddr === myUnits[k].macAddr){
				index  = k;
			}
		}

		console.log('macAddress:'+obj.macAddr +" , data : "+obj.data+" , recv : "+obj.recv);

        var macAddress = obj.macAddr;
        var mData = obj.data;
        var mRecv = obj.recv;
        var mCreate = new Date();
		//Jason modiy on 2016.07.21
		var arrData = tools.getDataArray('0104010c0105010f');
		var mTmp1 = arrData[0];
		var mHum1 = arrData[1];
		var mTmp2 = arrData[2];
		var mHum2 = arrData[3];
		var mV = arrData[4];
        var mCreate = new Date();
		var time = moment(mRecv).format("YYYY-MM-DD HH:mm:ss");
		console.log('tmp1:'+mTmp1 +' , hum1 : '+mHum1+" , tmp2 : "+mTmp2 +' , hum2 : '+mHum2);

		client.emit('new_message_receive_mqtt',{index:index,macAddr:macAddress,data:mData,time:time,create:mCreate,tmp1:mTmp1,hum1:mHum1,tmp2:mTmp2,hum2:mHum2,vol:mV});
	});
	//----------------------------------------------------------------------------
	client.on('chart_client',function(data){
		console.log('Debug cart_client ------------------------------------------------------------start' );
		console.log('Debug cart_client :'+data );
	});

	client.on('chart_client_find_db',function(data){
		console.log('Debug chart_client_find_db ----------------------------------------------------start' );
		console.log('Debug cart_client mac:'+data.mac +' , option:'+typeof(data.option)+' , date:'+typeof(data.date));
		DeviceDbTools.findDevicesByDate(data.date,data.mac,Number(data.option),'desc',function(err,devices){
			if(err){
				console.log('find name:'+find_mac);
				return;
			}

			if (devices.length>0) {
				console.log('Debug chart -> find '+devices.length+' records');
				var newDevices = devices;//getShortenDevices(devices);
				var timeJsonStr =JsonFileTools.saveDataAndGetTimeeString(data.option,newDevices);
				var timeJson = JSON.parse(timeJsonStr);
				console.log('Debug chart -> timeJsonStr : '+timeJsonStr);
				client.emit('chart_client_db_result',timeJson);
			}else{
				console.log('Debug find get -> can not find');
				client.emit('chart_client_db_result',null);
			}
		});

	});
});

/**toCheckDeviceTimeout
 * @param  {[client]}
 * @return client.emit to index page
 */
function toCheckDeviceTimeout(client){
	var now = Number(moment().subtract(1,'days'));
	UnitDbTools.findAllUnits(function(err,units){
		var successMessae,errorMessae;
		if(err){
			console.log('Debug toCheckDeviceStatus -> findAllUnits is fail '+err);
			return;
		}

		var macList=[];
		for(var i=0 ; i<units.length; i++){
			macList.push(units[i].macAddr);
		}

		//units.forEach(function(unit) {
		for(var i=0 ; i<units.length; i++){
			console.log('Debug toCheckDeviceStatus -> findLastDeviceByUnit mac :'+units[i].macAddr);
			DeviceDbTools.findLastDeviceByUnit(units[i],function(err,device){
				if(err == null){

					if(device == null){
						return;
					}
					console.log('Debug toCheckDeviceStatus -> findLastDeviceByUnit :'+device.macAddr+' time '+ moment(device.recv_at).format("YYYY-MM-DD HH:mm:ss"));

					//Verify is timeout or not?
					if(now>Number(moment(device.recv_at)) ){
                        //Is timeout
						console.log('Debug findUnitsAndShowList -> '+device.macAddr+' time '+ moment(device.recv_at).format("YYYY-MM-DD HH:mm:ss") +' is timeout ');
						var mIndex = macList.indexOf(device.macAddr);
						/*if(units[mIndex].status == 2){
							return;
						}*/
						UnitDbTools.updateUnit(device.macAddr,units[mIndex].name,2,function(err,result){
							if(err){
								console.log('Debug toCheckDeviceStatus -> updateUnit '+device.macAddr+' updat unit timeout is fail :'+err);
							}else{
								console.log('Debug toCheckDeviceStatus -> updateUnit '+device.macAddr+' updat unit timeout success');
								console.log('index :'+macList.indexOf(device.macAddr));
								//console.log('mac :'+device.macAddr);
								client.emit('index_client_timeout',{index:macList.indexOf(device.macAddr),status:2});
							}
						});
					}else{
						var mIndex = macList.indexOf(device.macAddr);
						if(units[mIndex].status == 0){
							return;
						}
						UnitDbTools.updateUnit(device.macAddr,units[mIndex].name,0,function(err,result){
							if(err){
								console.log('Debug toCheckDeviceStatus -> updateUnit '+device.macAddr+' updat unit normal is fail :'+err);
							}else{
								console.log('Debug toCheckDeviceStatus -> updateUnit '+device.macAddr+' updat unit normal success');
								console.log('index :'+macList.indexOf(device.macAddr));
								//console.log('mac :'+device.macAddr);
								client.emit('index_client_timeout',{index:macList.indexOf(device.macAddr),status:0});
							}
						});
					}
				}
			});
		}
	});
}

function getShortenDevices(devices){
	var interval = Math.floor(devices.length/145)+1;
	var newDevices=[];
	if(interval>1){
		for(var i=0;i<devices.length;i=i+interval){
			//console.log(devices[i]);
			newDevices.push(devices[i]);
		}
		return newDevices;
	}
	return devices;
}

function getType(p) {
	console.log('Debug getType :'+(typeof p))
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}


//Jason modify on 2016.05.23
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
