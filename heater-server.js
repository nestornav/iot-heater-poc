'use strict';

var mraa = require('mraa');
var mqtt = require('mqtt');
var http = require('http');

var LCD  = require ('jsupm_i2clcd');
var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);

var CONF = {
	'data_source' : '/v1.6/devices/edison-nn',
	'token' : '41kKbOaww8WAWcd67mMq2RaJ59jKLi'
};

var B = 3975;
var myAnalogPin = new mraa.Aio(0);
var client  = mqtt.connect('mqtt://things.ubidots.com', {username:CONF.token, password:""});

function startSensing(){
    setInterval(function () {
        var a = myAnalogPin.read();
        myLCD.setCursor(0,1);
       
        var resistance = (1023 - a) * 10000 / a; 
        
        var celsius_temp = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;
        
        var temperature_2_publish = JSON.stringify({"temperature": Number(celsius_temp.toFixed(2))});
        
        myLCD.setCursor(0, 0);
        myLCD.write('Room Temp: ' + celsius_temp);

        client.publish(CONF.data_source, temperature_2_publish, {'qos': 1, 'retain': false},
            function (error, response) {
            console.log(response);
        });

    }, 4000);
}

/*var heater = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'test/plain'});
	res.end('connected ...');
    
});

heater.listen(3000);
*/


console.log('Heating service up...');

startSensing();