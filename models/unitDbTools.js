//var DeviceModel = require('./device.js');
var UnitModel = require('./unit.js');
var moment = require('moment');

exports.saveUnit = function (macAddress,name,callback) {
    console.log('---saveUnit ---------------------------------------');
	var time = {
		date   : moment().format("YYYY-MM-DD HH:mm:ss"),
		year   : moment().format("YYYY"),
		month  : moment().format("YYYY-MM"),
		day    : moment().format("YYYY-MM-DD"),
		hour   : moment().format("YYYY-MM-DD HH"),
		minute : moment().format("YYYY-MM HH:mm"),
		cdate   : moment().format("YYYY-MM HH:mm")
	};

	console.log('Debug saveUnit: time.date'+time.date);
	var newUnit = new UnitModel({
		type       : type,
		macAddr    : macAddress,
		name 	   : name,
		status     : 0,
		update_at  : time,
		created_at : new Date()
	});
    newUnit.save(function(err){
		if(err){
			console.log('Debug : Unit save fail!/n'+err);
            return callback(err);
		}
		console.log('Debug : Unit save success!');
        return callback(err,'success');
	});
};

function toUpdateUint(type,find_mac,name,status,calllback) {
    console.log('---updateUnit ---------------------------------------');
    console.log('Debug : updateUnit mac='+find_mac+" , name ="+name);
	var time = {
		date   : moment().format("YYYY-MM-DD HH:mm:ss"),
		year   : moment().format("YYYY"),
		month  : moment().format("YYYY-MM"),
		day    : moment().format("YYYY-MM-DD"),
		hour   : moment().format("YYYY-MM-DD HH"),
		minute : moment().format("YYYY-MM HH:mm"),
	};
	console.log('Debug updateUnit: time.date'+time.date);
	if(find_mac && name){
		UnitModel.find({ macAddr: find_mac },function(err,units){
		if(err){
			console.log('Debug : updateUnit find unit by mac =>'+err);
			return calllback(err);
		}
		var JSON = {status : status , update_at:time};

		if(units.length>0){
			if(name){
				if(units[0].name ==null || units[0].name != name){
					JSON.name = name;
				}
			}
			if(type){
				if(units[0].type ==null || units[0].type != type){
					JSON.type = type;
				}
			}
			var unitId = units[0]._id;
			//console.log('Debug : getUnitId device ' + units);
			//console.log('Debug : getUnitId : ' +unitId);
        	UnitModel.update({_id : unitId},
	        	JSON,
	        	{safe : true, upsert : true},
	        	(err, rawResponse)=>{
 		        	if (err) {
                        console.log('Debug : updateUnit : '+ err);
                        return calllback(err);
		        	} else {
                        console.log('Debug : updateUnit : success');
			            return calllback(err,'success');
		            }
	            }
            );
		}else{
			console.log('Debug : updateUnit can not find unit!');
			return calllback('Can not find unit!');
		}
	});
	}else{
		console.log('Debug : updateUnit no reerance');
        return calllback('Referance nul!');
	}
}

/*
*Update unit name,date,type,status
*/
exports.updateUnitStatus = function (mac,status,calllback) {
    return toUpdateUint(null,find_mac,null,status,calllback);
};

/*
*Update unit name,date,type,status
*/
exports.updateUnit = function (type,find_mac,name,status,calllback) {
    return toUpdateUint(type,find_mac,name,status,calllback);
};

/*
*Remove all of unit
*Return -1:資�?存�??�誤 0:?�除完�? 1:?�除失�?
*/
exports.removeAllUnits = function (calllback) {
    UnitModel.remove({}, (err)=>{
	    console.log('---removeAllUnits ---------------------------------------');
	    if (err) {
		    console.log('Debug : Unit remove all occur a error:', err);
            return calllback(err);
	    } else {
		    console.log('Debug : Unit remove all success.');
            return calllback(err,'success');
	    }
    });
};

exports.removeUnitByMac = function (mac,calllback) {
    UnitModel.remove({macAddr:mac}, (err)=>{
	    console.log('---removeUnitByMac ---------------------------------------');
	    if (err) {
		    console.log('Debug : Unit remove mac :'+mac+' occur a error:', err);
            return calllback(err);
	    } else {
		    console.log('Debug : Unit remove mac :'+mac+' success.');
            return calllback(err,'success');
	    }
    });
};

/*Find all of unit
*/
exports.findAllUnits = function (calllback) {
    console.log('---findAllUnits---------------------------------------');
    UnitModel.find((err, units) => {
	    if (err) {
		    console.log('Debug : findAllUnits err:', err);
            return calllback(err);
	    } else {
            console.log('Debug : findAllUnits success\n:',units.length);
		    return calllback(err,units);
	    }
    });
};

exports.findByMac = function (mac,calllback) {
    console.log('---findByMac---------------------------------------');
    UnitModel.find({ macAddr: mac }, function(err,units){
		if(err){
			return callback(err);
		}
		if (units.length>0) {
			console.log('find '+units.length+' records');
			return calllback(err,units[0]);
		}else{
			console.log('?��??��???');
			return calllback(err,units);
		}
    });
};

