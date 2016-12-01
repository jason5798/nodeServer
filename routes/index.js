var express = require('express');
var router = express.Router();
var DeviceDbTools = require('../models/deviceDbTools.js');
var UnitDbTools = require('../models/unitDbTools.js');
var JsonFileTools =  require('../models/jsonFileTools.js');
var UserDbTools =  require('../models/userDbTools.js');

var settings = require('../settings');
var moment = require('moment');
var noWeatherDevice = false;

function findUnitsAndShowList(req,res,isUpdate){
	UnitDbTools.findAllUnits(function(err,units){
		var successMessae,errorMessae;
		var macTypeMap = {};

		if(err){
			errorMessae = err;
		}else{
			if(+units.length>0){
				successMessae = '查詢到'+units.length+'筆資料';
			}
			/*for(var i=0;i<units.length;i++){
				console.log( "unit :"+units[i] );
				if(units[i].macAddr){
					console.log('mac ('+i+'):'+units[i].macAddr);
					if(units[i].type){
						macTypeMap[units[i].macAddr]=units[i].type;
					}
				}
			}
			//Jason add for save mac array on 2016.08.18
			if(isUpdate){//For new and delete unit
				JsonFileTools.saveJsonToFile('./public/data/macTypeMap.json',macTypeMap);
			}*/
		}
		req.session.units = units;

		console.log( "successMessae:"+successMessae );
		res.render('index', { title: '首頁',
			units:req.session.units,
			user:req.session.user,
			success: successMessae,
			error: errorMessae,
			noWeatherDevice : noWeatherDevice
		});
	});
}

function findUnitsAndShowSetting(req,res,isUpdate){
	UnitDbTools.findAllUnits(function(err,units){
		var successMessae,errorMessae;
		var macTypeMap = {};

		if(err){
			errorMessae = err;
		}else{
			if(+units.length>0){
				successMessae = '查詢到'+units.length+'筆資料';
			}
			/*for(var i=0;i<units.length;i++){
				console.log( "unit :"+units[i] );
				if(units[i].macAddr){
					console.log('mac ('+i+'):'+units[i].macAddr);
					if(units[i].type){
						macTypeMap[units[i].macAddr]=units[i].type;
					}
				}
			}
			//Jason add for save mac array on 2016.08.18
			if(isUpdate){//For new and delete unit
				JsonFileTools.saveJsonToFile('./public/data/macTypeMap.json',macTypeMap);
			}*/
		}
		req.session.units = units;

		console.log( "successMessae:"+successMessae );
		res.render('setting', { title: '裝置設定',
			units:req.session.units,
			user:req.session.user,
			success: successMessae,
			error: errorMessae
		});
	});
}

module.exports = function(app){
  app.get('/', checkLogin);
  app.get('/', function (req, res) {

	findUnitsAndShowList(req,res,false);
  });

  app.post('/', checkLogin);
  app.post('/', function (req, res) {
		var	post_mac = req.body.postMac;
		var post_name = req.body.postName;
		var successMessae,errorMessae;
		if(post_name == ""){//Delete mode
			UnitDbTools.removeUnitByMac(post_mac,function(err,result){
				if(err){
					console.log('removeUnitByMac :'+post_mac + err);
					errorMessae = err;
				}else{
					console.log('removeUnitByMac :'+post_mac + 'success');
					successMessae = successMessae;
				}
				findUnitsAndShowList(req,res,false);
			});

		}else{//Edit mode
			UnitDbTools.updateUnitName(post_mac,post_name,function(err,result){
				if(err){
					console.log('edit  :'+post_mac + err);
				}else{
					console.log('edit :'+post_mac + 'success');
				}
				findUnitsAndShowList(req,res,false);
			});
		}
	});

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
	req.session.user = null;
  	var name = req.flash('post_name').toString();
	var successMessae,errorMessae;
	console.log('Debug register get -> name:'+ name);

	if(name ==''){
		errorMessae = '';
		res.render('user/login', { title: '登入',
			error: errorMessae
		});
	}else{
		var password = req.flash('post_password').toString();

		console.log('Debug register get -> password:'+ password);
		UserDbTools.findUserByName(name,function(err,user){
			if(err){
				errorMessae = err;
				res.render('user/login', { title: '登入',
					error: errorMessae
				});
			}
			if(user == null ){
				//login fail
				errorMessae = '無此帳號';
				res.render('user/login', { title: '登入',
					error: errorMessae
				});
			}else{
				//login success
				if(password == user.password){
					req.session.user = user;
					return res.redirect('/');
				}else{
					//login fail
					errorMessae = '密碼錯誤';
					res.render('user/login', { title: '登入',
						error: errorMessae
					});
				}
			}
		});
	}
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
  	var post_name = req.body.account;
  	var	post_password = req.body.password;
  	console.log('Debug login post -> name:'+post_name);
	console.log('Debug login post -> password:'+post_password);
	req.flash('post_name', post_name);
	req.flash('post_password', post_password);
	return res.redirect('/login');
  });

  app.get('/register', checkNotLogin);
  app.get('/register', function (req, res) {
  	var name = req.flash('post_name').toString();
	var password = req.flash('post_password').toString();
	var email = req.flash('post_email').toString();
	var successMessae,errorMessae;
	var count = 0;
	var level = 1;
	console.log('Debug register get -> name:'+ name);
	console.log('Debug register get -> password:'+ password);
	console.log('Debug register get -> email:'+ email);
	if(name==''){
		//Redirect from login
		res.render('user/register', { title: '註冊',
			error: errorMessae
		});
	}else{
		//Register submit with post method
		var test = false;
		if(test == true){ //for debug to remove all users
			UserDbTools.removeAllUsers(function(err,result){
				if(err){
					console.log('removeAllUsers :'+err);
				}
				console.log('removeAllUsers : '+result);
			});
		}

		UserDbTools.findUserByName(name,function(err,user){
			if(err){
				errorMessae = err;
				res.render('user/register', { title: '註冊',
					error: errorMessae
				});
			}
			console.log('Debug register user -> name: '+user);
			if(user != null ){
				errorMessae = '已有此帳號';
				res.render('user/register', { title: '註冊',
					error: errorMessae
				});
			}else{
				//save database
				if(name == 'admin'){
					level = 0;
				}
				UserDbTools.saveUser(name,password,email,level,function(err,result){
					if(err){
						errorMessae = '註冊帳戶失敗';
						res.render('user/register', { title: '註冊',
							error: errorMessae
						});
					}
					UserDbTools.findUserByName(name,function(err,user){
						if(user){
							req.session.user = user;
						}
						return res.redirect('/');
					});
				});
			}
		});
	}
  });

  app.post('/register', checkNotLogin);
  app.post('/register', function (req, res) {
		var post_name = req.body.register_account;

		var successMessae,errorMessae;
		var	post_password = req.body.register_password;
		var	post_email = req.body.register_email;
		console.log('Debug register post -> post_name:'+post_name);
		console.log('Debug register post -> post_password:'+post_password);
		console.log('Debug register post -> post_emai:'+post_email);
		req.flash('post_name', post_name);
		req.flash('post_password', post_password);
		req.flash('post_email', post_email);
		return res.redirect('/register');
  });

  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '');
    res.redirect('/login');
  });

  app.get('/chart', checkLogin);
  app.get('/chart', function (req, res) {

		console.log('Debug chart get -> render to find.ejs');
		var find_mac = req.flash('mac').toString();
		var option = req.flash('option').toString();
		var successMessae,errorMessae;
		var count = 0;
		var timeStr = '';
		console.log('Debug chart get -> find mac:'+find_mac);
		console.log('Debug chart get -> find option:'+option);
		res.render('chart', { title: '圖表分析',
			units:req.session.units,
			user:req.session.user,
			mac:find_mac,
			option:option,
			mdate:moment().format('YYYY-MM-DD'),
			devices: null,
			timeStr:timeStr,
			success: successMessae,
			error: errorMessae
		});

  });

  /*app.post('/chart', function (req, res) {
		var	post_mac = req.body.mac;
		var option = req.body.time_option;
		console.log('option:'+option);
		console.log('find mac:'+post_mac);
		req.flash('mac', post_mac);
		req.flash('option', option);
		return res.redirect('/chart');
  });*/

  app.get('/update', checkLogin);
  app.get('/update', function (req, res) {
	  //Jason add for filter weather device start
  		var newUnits = [];
  		var units = req.session.units;
  		for(var i = 0;i<units.length;i++){
  			console.log('Debug update -> check '+ units[i].name +' type : '+ units[i].type);
  			if(units[i].type == 'd001'){
  				newUnits.push(units[i]);
  			}
  		}
		//Jason add for filter weather device -- end
		res.render('update', { title: '最新訊息',
			units  : newUnits,
			user   : req.session.user,
			success: null,
			error  : null
		});
  });

  app.get('/find', checkLogin);
  app.get('/find', function (req, res) {
		console.log('render to find.ejs');
		var find_mac = req.flash('mac').toString();
		var option = req.flash('option').toString();
		var mdate = req.flash('mdate').toString();
		var successMessae,errorMessae,findType;
		var count = 0;

		console.log('Debug find get -> mac:'+ find_mac);
		console.log('Debug find get -> option:'+ option);
		console.log('Debug find get -> date:'+ mdate);
		if(find_mac == ""){
			res.render('find', { title: '資料查詢',
				units:req.session.units,
				user:req.session.user,
				mac:find_mac,
				option:option,
				mdate:moment().format('YYYY-MM-DD'),
				devices: null,
				success: successMessae,
				error: errorMessae,
				selectedType:findType
			});
		}else{
			//Jason modify for get selected device type on 2016.0.21
			req.session.units.forEach(function(unit) {
				if(unit.macAddr == find_mac){
					console.log('unit.type:'+unit.type);
					findType = unit.type;
				}
			});
			DeviceDbTools.findDevicesByDate(mdate,find_mac,Number(option),'asc',function(err,devices){
				if(err){
					console.log('find name:'+find_mac+" err : "+err);
					req.flash('error', err);
					return res.redirect('/find');
				}

				/*devices.forEach(function(device) {
					console.log('mac:'+device.macAddr + ', data :' +device.data);
					count = count +1;
				});*/
				//console.log('find type:'+findType);
				//console.log('Debug find get mac '+find_mac+'-> find '+devices.length+' records');
				console.log('Debug find device '+find_mac+'-> find '+devices);
				successMessae = '查詢到'+devices.length+'筆資料';
				var newDevices = [];
				if(findType == 'd001'){
					newDevices = devices;
				}else if(findType == 'd002'){
					var tag = -1;
					var arrIndex = -1;
					for(var i=0;i<devices.length;i++){
						if (tag != devices[i].tag){
							tag = devices[i].tag;
							arrIndex ++;
						}
						if( devices[i].index == 'aa03'){
							newDevices[arrIndex].push([devices[i].info.data0,devices[i].info.data1,devices[i].info.data2]);
						}else if( devices[i].index == 'aa04'){
							if(newDevices[arrIndex].length == 0){
								newDevices[arrIndex].push(['','','']);
							}
							newDevices[arrIndex].push([devices[i].info.data0,devices[i].info.data1])
						}if( devices[i].index == 'aa05'){
							if(newDevices[arrIndex].length == 0){//loss aa03 & aa04
								newDevices[arrIndex].push(['','','','','','']);
							}else if(newDevices[arrIndex].length == 3){//loss aa04
								newDevices[arrIndex].push(['','','',]);
							}
							newDevices[arrIndex].push([devices[i].info.data0,devices[i].info.data1,devices[i].info.data2]);
						}
					}
				}

				res.render('find', { title: '資料查詢',
					units:req.session.units,
					user:req.session.user,
					mac:find_mac,
					option:option,
					mdate:mdate,
					devices: devices,
					success: successMessae,
					error: errorMessae,
					selectedType:findType
				});
			});
		}
  });

  app.post('/find', checkLogin);
  app.post('/find', function (req, res) {
		var	post_mac = req.body.mac;
		var option = req.body.time_option;
		var mdate = req.body.datepicker1;
		console.log('Debug find post -> option:'+option);
		console.log('Debug find post -> find mac:'+post_mac);
		console.log('Debug find post -> date:'+mdate);
		req.flash('mac', post_mac);
		req.flash('option', option);
		req.flash('mdate', mdate);
		return res.redirect('/find');
  	});

  	app.get('/setting', checkLogin);
	app.get('/setting', function (req, res) {
		console.log('render to setting.ejs');
		findUnitsAndShowSetting(req,res,true);
  });

  app.post('/setting', checkLogin);
  app.post('/setting', function (req, res) {
		var	post_mac = req.body.mac;
		var post_name = req.body.name;
		var post_type = req.body.type_option;
		var post_mode = req.body.mode;
		var typeString = req.body.typeString;
		console.log('mode : '+post_mode);
		if(post_mode == 'new'){
			if(	post_mac && post_name && post_mac.length==8 && post_name.length>=1){
				console.log('post_mac:'+post_mac);
				console.log('post_name:'+post_name);
				UnitDbTools.saveUnit(post_mac,post_name,post_type,typeString,function(err,result){
					if(err){
						req.flash('error', err);
						return res.redirect('/setting');
					}
					findUnitsAndShowSetting(req,res,true);
				});
				return res.redirect('/setting');
			}
		}else if(post_mode == 'del'){//Delete mode
			post_mac = req.body.postMac;
			UnitDbTools.removeUnitByMac(post_mac,function(err,result){
				if(err){
					req.flash('error', err);
					console.log('removeUnitByMac :'+post_mac + err);
					return res.redirect('/setting');
				}else{
					req.flash('error', err);
					console.log('removeUnitByMac :'+post_mac + 'success');
				}
				findUnitsAndShowSetting(req,res,false);
			});

		}else{//Edit mode
			post_mac = req.body.postMac;
			UnitDbTools.updateUnit(post_type,post_mac,post_name,null,typeString,function(err,result){
				if(err){
					req.flash('error', err);
					console.log('edit  :'+post_mac + err);
					return res.redirect('/setting');
				}else{
					console.log('edit :'+post_mac + 'success');
				}
				findUnitsAndShowSetting(req,res,false);
			});
		}
  	});

   app.get('/info', checkLogin);
   app.get('/info', function (req, res) {
		console.log('render to info.ejs');
		var save_password = req.flash('password').toString();
		var save_name = req.flash('name').toString();
		var save_email = req.flash('email').toString();
		var user = req.session.user;
		var successMessae,errorMessae;
		console.log('save_password:'+save_password);
		console.log('save_name:'+save_name);
		console.log('save_email:'+save_email);
		var json = {password:save_password};
		if(save_password==''){
			res.render('user/info', { title: '帳號資訊',
					user:req.session.user,
					error: errorMessae,
					success: null
				});
		}else{
			if(save_password == user.password){
				return res.redirect('/');
			}
			UserDbTools.updateUser(user.name,json,function(err,result){
				if(err){
					req.flash('error', err);
					req.flash('success', null);
					return res.redirect('/info');
				}
				req.session.user = null;
				errorMessae = '密碼已更改請重新登入';
				res.render('user/login', { title: '登入',
					error: errorMessae
				});
			});
		}
    });

  	app.post('/info', checkLogin);
  	app.post('/info', function (req, res) {
		var	post_password = req.body.password;
		var	post_name = req.body.name;
		var	post_email = req.body.email;
		console.log('post_password:'+post_password);
		console.log('post_name:'+post_name);
		console.log('post_email:'+post_email);
		req.flash('password',post_password);
		req.flash('name', post_name);
		req.flash('email', post_email);
		return res.redirect('/info');
  	});

  	app.get('/account', checkLogin);
    app.get('/account', function (req, res) {

		console.log('render to account.ejs');
		var refresh = req.flash('refresh').toString();
		var myuser = req.session.user;
		var myusers = req.session.userS;
		var successMessae,errorMessae;
		var post_name = req.flash('name').toString();

		console.log('Debug account get -> refresh :'+refresh);
		UserDbTools.findAllUsers(function (err,users){
			if(err){
				errorMessae = err;
			}
			if(refresh == 'delete'){
				successMessae = '刪除帳號['+post_name+']完成';
			}else if(refresh == 'edit'){
				successMessae = '編輯帳號['+post_name+']完成';
			}
			req.session.userS = users;
			console.log('Debug account get -> users:'+users.length+'\n'+users);
			console.log('----------------------------------------------------------------');
			console.log('Debug account get -> users:'+users[0].authz.a01);
			console.log('----------------------------------------------------------------');
			//console.log('Debug account get -> user:'+mUser.name);
			res.render('user/account', { title: '帳戶管理', // user/account : ejs path
				user:myuser,//current user : administrator
				users:users,//All users
				error: errorMessae,
				success: successMessae
			});
		});
    });

  	app.post('/account', checkLogin);
  	app.post('/account', function (req, res) {
  		var	post_name = req.body.postName;
		var postSelect = req.body.postSelect;
		console.log('post_name:'+post_name);
		console.log('postSelect:'+postSelect);
		var successMessae,errorMessae;
		req.flash('name',post_name);//For refresh users data

		if(postSelect == ""){//Delete mode
			UserDbTools.removeUserByName(post_name,function(err,result){
				if(err){
					console.log('removeUserByName :'+post_name+ " fail! \n" + err);
					errorMessae = err;
				}else{
					console.log('removeUserByName :'+post_name + 'success');
					successMessae = successMessae;
				}
				UserDbTools.findAllUsers(function (err,users){
					console.log('查詢到帳戶 :'+users.length);
				});
				req.flash('refresh','delete');//For refresh users data
				return res.redirect('/account');
			});

		}else{//Edit modej
			console.log('postSelect[0] :'+typeof(postSelect) );
			var arr = postSelect.split(",");
			var authz = {a01:arr[1],a02:arr[2],a03:arr[3],a04:arr[4],a05:arr[5],a06:arr[6]};
			if(arr[1]=='true'){
				authz.a01 = true;
			}else{
				authz.a01 = false;
			}
			if(arr[2]=='true'){
				authz.a02 = true;
			}else{
				authz.a02 = false;
			}
			if(arr[3]=='true'){
				authz.a03 = true;
			}else{
				authz.a03 = false;
			}
			if(arr[4]=='true'){
				authz.a04 = true;
			}else{
				authz.a04 = false;
			}
			if(arr[5]=='true'){
				authz.a05 = true;
			}else{
				authz.a05 = false;
			}
			if(arr[6]=='true'){
				authz.a06 = true;
			}else{
				authz.a06 = false;
			}
			var json = {enable:arr[0],authz:authz};

			console.log('updateUser json:'+json );

			UserDbTools.updateUser(post_name,json,function(err,result){
				if(err){
					console.log('updateUser :'+post_name + err);
					errorMessae = err;
				}else{
					console.log('updateUser :'+post_name + 'success');
					successMessae = successMessae;
				}
				req.flash('refresh','edit');//For refresh users data
				return res.redirect('/account');
			});
		}
  	});
  	app.get('/control', checkLogin);
    app.get('/control', function (req, res) {
    	var _max='',_min='';
    	var json = JsonFileTools.getJsonFromFile('./public/data/temp.json');
    	if(json){
    		_max = json['max'];
    		_min = json['min'];
    	}
    	res.render('control', { title: '控制',
			user:req.session.user,
			error: null,
			success: null,
			units:null,
			max:_max,
			min:_min
		});
    });

    app.post('/control', checkLogin);
  	app.post('/control', function (req, res) {
		var	post_max = req.body.max;
		var post_min = req.body.min;
		var json = {max:post_max,min:post_min};
		JsonFileTools.saveJsonToFile('./public/data/temp.json',json);
		return res.redirect('/control');
	});
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '');
    res.redirect('/login');
  }else{
	  next();
  }
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '');
    res.redirect('back');
  }else{
	  next();
  }
}