var mqtt = require('mqtt');
var settings = require('../settings');

var hostname = '52.193.146.103';
var portNumber = 80;
var client_Id = '200000166-generic-service';
var name = '200000166';
var pw = '80698426';
var mytopic = 'client/200000166/200000166-GIOT-MAKER';

var options = {
	port:settings.gIotPort,
    host: settings.gIotHost,
    clientId:settings.client_Id,
    username:settings.name,
    password:settings.pw,
    //keepalive: 60,
	//reconnectPeriod: 1000,
	protocolId: 'MQIsdp',
	protocolVersion: 3,
	//clean: true,
	encoding: 'utf8'
};
console.log('giotClient port:'+options.port);
console.log('giotClient host:'+options.host);
console.log('giotClient clientId:'+options.clientId);
console.log('giotClient username:'+options.username);
console.log('giotClient password:'+options.password);

var GIotClient = mqtt.connect(options);

module.exports = GIotClient;