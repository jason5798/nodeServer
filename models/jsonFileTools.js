var fs = require("fs");
var moment = require('moment');
var folderPath = './public/data/';
console.log('folderPath : '+folderPath);
var temPath,humPath,dtaePath,interval;
var temobj,humobj;

//[[28.8,28.6],[27.7,27.6],[27.1,26.7]]
exports.saveFile = function (option,devices) {
    //Set path,format
    setByOption(option);
    temobj = [],humobj = [];

    for(var i=0;i<devices.length;i++){
        var temobj1 = [],humobj1 = [];
        temobj1.push(Number(devices[i].temperature1));
        temobj1.push(Number(devices[i].temperature2));
        temobj.push( temobj1);
        humobj1.push(Number(devices[i].humidity1));
        humobj1.push(Number(devices[i].humidity2));
        humobj.push( humobj1);
        console.log('Debug jsonFileTools -> devices \n'+devices[i]);
        console.log('Debug jsonFileTools -> temobj1 \n'+temobj1);
        console.log('Debug jsonFileTools -> temobj \n'+temobj);
        console.log('Debug jsonFileTools -> humobj1 \n'+humobj1);
        console.log('Debug jsonFileTools -> humobj \n'+humobj);
        if(i>1){
            break;
        }
    }

    saveFile(temPath,temobj);
    saveFile(humPath,humobj);
};

exports.saveFile1 = function (option,devices) {
    //Set path,format
    setByOption(option);
    temobj = [],humobj = [];
    var mlength = 1;
    var temArr1 = [],humArr1 = [],temArr2 = [],humArr2 = [];
    var temStr='',tem1Str='',tem2Str='',humStr='',hum1Str='',hum2Str='';
    for(var i=0;i<mlength;i++){

        var date = devices[i].recv_at;
        console.log('--------------------------------------------------------------------------------');
        console.log('date : '+ date);
        var timestamp = moment(date);

        console.log('timestamp : '+ timestamp);
        tem1Str = tem1Str + getTemperatureString(i,mlength,timestamp,devices[i].temperature1);
        tem2Str = tem2Str + getTemperatureString(i,mlength,timestamp,devices[i].temperature2);
        hum1Str = hum1Str + getHumidityString(i,mlength,timestamp,devices[i].humidity1);
        hum2Str = hum2Str + getHumidityString(i,mlength,timestamp,devices[i].humidity2);
        console.log('tem1Str : '+ tem1Str);
        console.log('tem2Str : '+ tem2Str);
        console.log('hum1Str : '+ hum1Str);
        console.log('hum2Str : '+ hum2Str);
    }

    temStr =  '{"tem1":'+tem1Str+',"tem2":'+tem2Str+'}';
    humStr =  '{"hum1":'+hum1Str+',"hum2":'+hum2Str+'}';
    console.log('temStr : ' + temStr);
    console.log('humStr : ' + humStr);
    saveStringToFile(temPath,temStr);
    saveStringToFile(humPath,humStr);
};

exports.saveDataToFile = function (option,devices) {

    //Save json string to file
    saveDataToFile(option,devices);
    //Jason add on 201608.05 for date range data
    var dateStr = getTimeRangeString(option,devices);
    console.log('dateStr : ' + dateStr);
    saveStringToFile(dtaePath,dateStr);
};

exports.saveDataAndGetTimeeString = function (option,devices) {

    //Save json string to file
    saveDataToFile(Number(option),devices);
    //Jason add on 201608.05 for date range data
    var dateStr = getTimeRangeString(option,devices);
    return dateStr ;
};

function getTimeRangeString(option,devices){
    var interval = '1 hour';
    var formatStr =  'YYYY/MM/DD H';
    if(option==0){
        interval = '1 hour';
        formatStr = 'YYYY/MM/DD H';
    }else if(option==1){
        interval = '2 hour';
            formatStr = 'YYYY/MM/DD H';
    }else if(option==2){
        interval = '1 day';
            formatStr = 'YYYY/MM/DD';
    }else if(option==3){
        interval = '1 day';
        formatStr = 'YYYY/MM/DD';
    }

    var min = moment(devices[0].recv_at).format(formatStr);
    var max = moment(devices[(devices.length-1)].recv_at);
    if(option==0){
        max = max.add(1,'hours').format(formatStr);
    }else if(option==1){
        max = max.add(1,'hours').format(formatStr);
    }else if(option==2){
        max = max.add(1,'days').format(formatStr);
    }else if(option==3){
        max = max.add(1,'days').format(formatStr);
    }
    return '{"option":'+option+',"deviceNumber":'+devices.length+',"interval":"'+interval+'","min":"'+min+'","max":"'+max+'"}';
}

//[ [ [1469062064000,28.8],[1469070793000,27.7] ] , [ [1469077315000,27.1],[1469079093000,27] ] ]
function saveDataToFile(option,devices){
    //Set path,format
    setByOption(option);
    temobj = [],humobj = [];
    var mlength = devices.length;
    var temArr1 = [],humArr1 = [],temArr2 = [],humArr2 = [],temArr = [],humArr = [];
    var temStr='',tem1Str='',tem2Str='',humStr='',hum1Str='',hum2Str='';
    for(var i=0;i<mlength;i++){
        var date = devices[i].recv_at;
        //console.log('--------------------------------------------------------------------------------');
        //console.log('date : '+ date);
        var timestamp = moment(date);
        //console.log('timestamp : '+ timestamp);
        temArr1.push([Number(timestamp),devices[i].temperature1]);
        temArr2.push([Number(timestamp),devices[i].temperature2]);
        humArr1.push([Number(timestamp),devices[i].humidity1]);
        humArr2.push([Number(timestamp),devices[i].humidity2]);
        /*console.log('temArr1 : ' + temArr1);
        console.log('temArr2 : ' + temArr2);
        console.log('humArr1 : ' + humArr1);
        console.log('humArr2 : ' + humArr2);*/
    }
    temArr.push(temArr1);
    temArr.push(temArr2);
    humArr.push(humArr1);
    humArr.push(humArr2);

    //console.log('temArr : ' + temArr);
    //console.log('humArr : ' + humArr);

    saveStringToFile(temPath,JSON.stringify(temArr));
    saveStringToFile(humPath,JSON.stringify(humArr));
}

function getTemperatureString(index,length,timestamp,value){
    var str = '{"temperature":"'+value+'","date":"'+timestamp+'"}';
    if( index === 0 && index != (length-1) ) {
         return '['+str;
    } else if( index === 0 && index === (length-1) ){
         return '['+str+']';
    }else if( index > 0 && index === (length-1) ) {
         return ','+str+']';
    }else if( index > 0 && index != (length-1) ) {
        return ','+str;
    }
}
function getHumidityString(index,length,timestamp,value){
    var str = '{"humidity":"'+value+'","date":"'+timestamp+'"}';
    if( index === 0 && index != (length-1) ) {
         return '['+str;
    } else if( index === 0 && index === (length-1) ){
         return '['+str + ']';
    }else if( index > 0 && index === (length-1) ) {
         return ','+str+']';
    }else if( index > 0 && index != (length-1) ) {
        return ','+str;
    }
}

function saveStringToFile(mpath,mstring){
    console.log("Debug jsonFileTools saveFile -> path: "+ mpath);
    //console.log("Debug jsonFileTools saveFile -> string: "+ mstring);
    //var json = JSON.stringify(obj);
    fs.writeFile(mpath, mstring, 'utf8');
    console.log("\n *START* \n");
    //var content = fs.readFileSync(mpath);
    //console.log("Output Content : \n"+ content);
}

function saveJaonToFile(path,obj){
    console.log("Debug jsonFileTools saveFile -> path: "+ path);
    var json = JSON.stringify(obj);
    fs.writeFile(path, json, 'utf8');
    console.log("\n *START* \n");
    //var content = fs.readFileSync(path);
    //console.log("Output Content : \n"+ content);
}

function setByOption(option){
    if(option==0){
        temPath = folderPath+'tem1.json';
        humPath = folderPath+'hum1.json';
        dtaePath = folderPath+'date1.json';
    }else if(option==1){
        temPath = folderPath+'tem2.json';
            humPath = folderPath+'hum2.json';
            dtaePath = folderPath+'date2.json';
    }else if(option==2){
        temPath = folderPath+'tem3.json';
            humPath = folderPath+'hum3.json';
            dtaePath = folderPath+'date3.json';
    }else if(option==3){
        temPath = folderPath+'tem4.json';
        humPath = folderPath+'hum4.json';
        dtaePath = folderPath+'date4.json';
    }
    console.log("Debug jsonFileTools setByOption -> temPath : "+ temPath);
    console.log("Debug jsonFileTools setByOption -> humPath : "+ humPath);
    console.log("Debug jsonFileTools setByOption -> dtaePath : "+ dtaePath);
}