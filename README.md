# IoT Heater

This is a basic example that struggle to show a little bit about IoT ecosystem. It's based on MRAA and UPM librarys and use JavaScript as constructure lenguage.

The main idea is have a little sensor core inside a room (like a server room) which take different ambient data. In this case the temperature. In other hand this sensor core could subscribe and cosume data to different topic using MQTT.

## What you need for

* Display, temperature sensor, and relay from [Groove sensor kit starter](https://www.seeedstudio.com/Grove-Starter-Kit-for-Arduino-p-1855.html).
* [Edison board](https://software.intel.com/en-us/iot/hardware/edison).
* An Ubidots [account](https://ubidots.com).

## Do de magic

Edison board must to have installed an OS (check it out the Yocto version by Intel for Edison). Yocto OS has already installed MRAA and UPM, but you should update it by npm.

Setup your own Ubidot credential and topics in the project. Copy the project to the board and run it.

Tip: MRAA and UPM are developed for *nix distribution not for Windows.