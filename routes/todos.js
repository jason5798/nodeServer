var express = require('express');
var router = express.Router();
var UnitDbTools = require('../models/unitDbTools.js');
var async = require('async');
var DeviceDbTools = require('../models/deviceDbTools.js');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  //if(req.session.user){
  	UnitDbTools.findAllUnits(function(err,units){
  		async.each(units,function(unit,callback){
					updateStatus(unit,function(){
						callback();
					});
  		},function(err){
  			console('Debug todos -> get unit err : '+err);
  			return res.json({result:'Get unit err : '+err});
  		});
  		
  	});
  /*}else{
  	return res.json('No unit');
  }*/
});

module.exports = router;

function updateStatus(unit,callback){
	console.log('unit : '+unit);
	var tasks = ['find_last_device','compare_status'];
	var now = Number(moment().subtract(1,'days'));
	var status = 0;
	DeviceDbTools.findLastDeviceByMac(unit.macAddr,function(err,device){
		if(err){
			return callback(unit.status);
		}
		console.log('device : '+device);
		console.log('find Last Device By Mac : '+device);
			if(now>=Number(moment(device.recv_at)) && unit.status != 2 ){
				status = 2;
			}if(now<Number(moment(device.recv_at)) && unit.status == 2 ){
				status = 0;
			}else{
				return callback(unit.status);
			}
			UnitDbTools.updateUnitStatus(device.macAddr,status,function(err,result){
				if(err){
					return callback(unit.status);
				}else{
					return callback(status);
				}
			});
		});
}