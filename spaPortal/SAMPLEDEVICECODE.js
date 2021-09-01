'use strict';
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var Amqp = require('azure-iot-device-amqp').Amqp;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;
var fs = require('fs');
var path = require("path");

var connectionString = "[PLACEHOLDER_DEVICE_CONNECTION_STRING]"
//secondary usabel connection string is: [PLACEHOLDER_DEVICE_CONNECTION_STRING2]"

var client = DeviceClient.fromConnectionString(connectionString, Mqtt); //choose either Mqtt or Amqp

//D2C(Device to Cloud) message function
function sendTelemetryMsg(rawPayload) {
  /*-----rawPayload should follow below telemetry message payload pattern-------
  [PLACEHOLDER_TELEMETRY_PAYLOAD_SAMPLE]
  ----------------------------------------------------------*/
  var iothubDeviceMessage = new Message(JSON.stringify(rawPayload));

  //Optional: A message can have custom properties that are also encoded and can be used for routing at iot hub cloud side
  iothubDeviceMessage.properties.add('propertyName', 'propertyValue');

  client.sendEvent(iothubDeviceMessage, function (err) {
    if (err) {
      console.error('send error: ' + err.toString());
    } else {
      console.log('sent');
    }
  });
}

//upload blob file to cloud function
function uploadRawFile(filePath) {
  fs.stat(filePath, function (err, fileStats) {
    if (err) {
      console.error('could not read file: ' + err.toString());
    } else {
      var fileStream = fs.createReadStream(filePath);
      var fileName = path.basename(filePath)
      client.uploadToBlob(fileName, fileStream, fileStats.size, function (err, result) {
        fileStream.destroy();
        if (err) {
          console.error('error uploading file: ' + err.constructor.name + ': ' + err.message);
        } else {
          console.log('Upload successful - ' + result);
        }
      });
    }
  });
}

//C2D(Cloud to Device) message function
client.on('message', function (msg) {
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
  client.complete(msg, function (err) {
    if (err) {
      console.error('complete error: ' + err.toString());
    } else {
      console.log('complete sent');
    }
  });
});

//Expose direct method to be invoked from cloud side 
client.onDeviceMethod('sampleDirectMethod1', function (request, response) {
  console.log('received a request for sampleDirectMethod1');
  console.log(JSON.stringify(request.payload, null, 2));
  var fakeResponsePayload = {
    key: 'value'
  };
  response.send(200, fakeResponsePayload, function (err) {
    if (err) {
      console.error('Unable to send method response: ' + err.toString());
    } else {
      console.log('response to sampleDirectMethod1 sc.');
    }
  });
});

//device twin features:
//1. Notified when device twin desired property change
//2. Notify cloud side device twin report property change
client.getTwin(function (err, twin) {
  if (err) {
    console.error('could not get twin');
  } else {
    //device twin desired property change listener
    twin.on('properties.desired', function (delta) {
      console.log('new desired properties received:'+ JSON.stringify(delta));
    });
    //notify cloud device twin report properties new value
    twin.properties.reported.update({"reportProperty1":"new_reportProperty1_value"}, function(err) {
      if (err) {
        console.error('unable to update twin: ' + err.toString());
      } else {
        console.log('twin state reported');
      }
    });
  }
})