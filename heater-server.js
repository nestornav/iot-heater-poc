'use strict';

var mraa = require('mraa');
var mqtt = require('mqtt');
var RELAY = require('jsupm_grove');
var LCD  = require ('jsupm_i2clcd');

var CONF = {
	'data_source' : '/v1.6/devices/edison-nn',
	'token' : '41kKbOaww8WAWcd67mMq2RaJ59jKLi'
};

function startSensing(){
    process.setMaxListeners(0);
    var client  = mqtt.connect('mqtt://things.ubidots.com', {username:CONF.token, password:""});
    
    var myAnalogPin = new mraa.Aio(0);
    var myRelay = new RELAY.GroveRelay(2);
    var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);

    var api_suscribe = CONF.data_source + '/button-realy';

    client.subscribe({ '/v1.6/devices/edison-nn/button-relay' : 1 }, function(err, granted) {
            console.log('Subscription', granted);
        });
        
    setInterval(function () {
        var resistance = myAnalogPin.read(),
            celsius_temp = getTemperature(resistance),
            relay_2_publish = temperatureManagement(celsius_temp, myRelay);
        
        setDisplayData(myLCD, celsius_temp);        

        var temperature_2_publish = JSON.stringify({'temperature': Number(celsius_temp.toFixed(2))});
        
        client.publish(CONF.data_source, temperature_2_publish, {'qos': 1, 'retain': false},
            function (error, response) {
        });

        client.publish(CONF.data_source, relay_2_publish, {'qos': 1, 'retain': false},
            function (error, response) {
            });
        
        client.on('message', function(topic, message, packet){
            var _topic = getRawTopic(topic);
    
            if(_topic == 'button-relay'){
                fanManagement(myRelay, message.value);
            }
        })

    }, 4000);
}

function getTemperature(resistance_val){
    var B = 3975;
    
    var resistance = (1023 - resistance_val) * 10000 / resistance_val,        
        temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;

    return temperature
}

function setDisplayData(display, data){
    display.setCursor(0, 0);
    display.write('Room Temp: ' + data);
}

/**
 * Extract the topic of a subscription(a url) and return it.
 * @param topic
 */
function getRawTopic(topic){
    return topic.substring(24, topic.search(/\/lv\b/));
}

/**
 * Turn on/off the fan by relay management taking into account the payload and relay state.
 */
function fanManagement(relay, payload){
    
    if(relay.isOn() && payload == 0){
        relay.off();
        console.log('realy off');
    }else if(relay.isOff() && payload == 1){
        relay.on();
        console.log('realy on');
    }
}

/**
 * The fan will start if the temperature into the room is greater than a threshold 
*/
function temperatureManagement(local_temp, relay){
    var threshold = 30;

    if(local_temp > threshold){
        fanManagement(relay, 1);
        return JSON.stringify({'button-relay': 1});
    }
    fanManagement(relay, 0);
    return JSON.stringify({'button-relay': 0}); 
}

console.log('Heating service up...');

startSensing();