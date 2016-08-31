var express = require('express');
var router = express.Router();
var DeviceDbTools = require('../models/deviceDbTools.js');
var UnitDbTools = require('../models/unitDbTools.js');
var JsonFileTools =  require('../models/jsonFileTools.js');
var UserDbTools =  require('../models/userDbTools.js');

var settings = require('../settings');
var moment = require('moment');

function findUnitsAndShowList(req,res,isUpdate){
	UnitDbTools.findAllUnits(function(err,units){
		var successMessae,errorMessae;
		var macList = [];

		if(err){
			errorMessae = err;
		}else{
			if(+units.length>0){
				successMessae = '查詢'+units.length+"個裝置";
			}
			for(var i=0;i<units.length;i++){
			if(units[i].macAddr){
					console.log('mac ('+i+'):'+units[i].macAddr);
					macList.push(units[i].macAddr);
				}
			}
			//Jason add for save mac array on 2016.08.18
			if(isUpdate){
				JsonFileTools.saveJsonToFile('./public/data/macList.json',macList);
			}
		}
		req.session.units = units;

		console.log( "successMessae:"+successMessae );
		res.render('index', { title: '首頁',
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
  		if(req.session.user){
  			findUnitsAndShowList(req,res,false);
  		}else{
  			//req.flash('error','尚未登入')
			//res.redirect('/login');
			res.render('user/login', { title: '登入',
				error: ''
			});
  		}
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
			UnitDbTools.updateUnit(post_mac,post_name,true,function(err,result){
				if(err){
					console.log('removeUnitByMac :'+post_mac + err);
					errorMessae = err;
				}else{
					console.log('removeUnitByMac :'+post_mac + 'success');
					successMessae = successMessae;
				}
				findUnitsAndShowList(req,res,false);
			});
		}

	});

  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '');
    res.redirect('/login');
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
		/*UserDbTools.removeAllUsers(function(err,result){
			if(err){
				console.log('removeAllUsers :'+err);
			}
			console.log('removeAllUsers : '+result);
		});*/
		UserDbTools.findUserByName(name,function(err,user){
			if(err){
				errorMessae = err;
				res.render('user/register', { title: '註冊',
					error: errorMessae
				});
			}
			console.log('Debug register user -> name: '+user);
			if(user != null ){
				errorMessae = '已有相同帳號';
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
						errorMessae = '新增帳戶失敗';
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
		//if(find_mac == ""){
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
		/*}else{
			DeviceDbTools.findDevicesByDate(find_mac,Number(option),'desc',function(err,devices){
				if(err){
					console.log('Debug chart get -> find name:'+find_mac);
					req.flash('error', err);
					return res.redirect('/find');
				}
				console.log("Debug chart get -> find all of mac "+find_mac+" : "+devices);

				if (devices.length>0) {
					console.log('Debug chart get -> find '+devices.length+' records');
					successMessae = '找到'+devices.length+'筆資料';
					timeStr = JsonFileTools.saveDataAndGetTimeeString(option,devices);
				}else{
					console.log('Debug chart get -> can not find');
					errorMessae = '無法找到資料';
				}

				console.log('Debug chart get -> timeStr'+timeStr);

				res.render('chart', { title: '圖表分析',
					units:req.session.units,
					mac:find_mac,
					option:option,
					devices: devices,
					timeStr:timeStr,
					success: successMessae,
					error: errorMessae
				});
			});
		}*/
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
		res.render('update', { title: '最新訊息',
			units  : req.session.units,
			user:req.session.user,
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
		var successMessae,errorMessae;
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
				error: errorMessae
			});
		}else{
			DeviceDbTools.findDevicesByDate(mdate,find_mac,Number(option),'asc',function(err,devices){
				if(err){
					console.log('find name:'+find_mac);
					req.flash('error', err);
					return res.redirect('/find');
				}

				/*devices.forEach(function(device) {
					console.log('mac:'+device.macAddr + ', data :' +device.data);
					count = count +1;
				});*/

				console.log('Debug find get mac '+find_mac+'-> find '+devices.length+' records');
				successMessae = '找到'+devices.length+'筆資料';

				res.render('find', { title: '資料查詢',
					units:req.session.units,
					user:req.session.user,
					mac:find_mac,
					option:option,
					mdate:mdate,
					devices: devices,
					success: successMessae,
					error: errorMessae
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
		console.log('render to find.ejs');
		var save_mac = req.flash('mac').toString();
		var save_name = req.flash('name').toString();
		var successMessae,errorMessae;
		console.log('save_mac:'+save_mac);
		console.log('save_name:'+save_name);
		if(save_mac.length>0 && save_name.length>0 ){
			UnitDbTools.saveUnit(save_mac,save_name,function(err,result){
				if(err){
					req.flash('error', err);
					return res.redirect('/setting');
				}
				successMessae = result;
				findUnitsAndShowList(req,res,true);
			});

		}else{
			res.render('setting', { title: '裝置設定',
				user:req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		}
  });

  app.post('/setting', checkLogin);
  app.post('/setting', function (req, res) {
		var	post_mac = req.body.mac;
		var post_name = req.body.name;

		if(	post_mac && post_name && post_mac.length>=1 && post_name.length>=1){
			console.log('post_mac:'+post_mac);
			console.log('post_name:'+post_name);
			req.flash('mac', post_mac);
			req.flash('name', post_name);
			return res.redirect('/setting');
		}/*else{
	　   	req.flash('error', '輸入資料不正確,請重新輸入!');
			return res.redirect('/setting');
		}*/
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
				errorMessae = '密碼已更換,請重新登入!';
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
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '');
    res.redirect('back');//返回之前的頁面
  }
  next();
}