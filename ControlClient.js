function temp_brightness(temp) {

//turn the power on, if already on, this will not turn it off
//Needed because 'set_bright' only works if the bulb is on
  var message = '{"id":1,"method":"set_power","params":["on", "smooth", 500]}';
  rtm({
    type: 'request',
    message: message
  });
  if(temp < 65){
    var message = '{"id":1,"method":"set_ct_abx","params":[1700, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });
  }elseif(temp>=65 || temp<=75){
    var message = '{"id":1,"method":"set_ct_abx","params":[3500, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });
  }elseif(temp>75){
    var message = '{"id":1,"method":"set_ct_abx","params":[6500, "smooth", 500]}';
    rtm({
      type: 'request',
      message: message
    });  }
}

function getTemp(callback) {
    const http = new XMLHttpRequest();
    const url = "https://api.openweathermap.org/data/2.5/weather?q=Honolulu,usa&APPID=c4cba4191bf19aa590a4e6d7c6edb208";
    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {       
            callback(http.responseText);
    }
}

getTemp(function(temp) {
    // anonymous callback function
    let obj = JSON.parse(temp);
    temp_brightness(obj.main.temp);
})

function yeelight_sleep(){
  var message = '{"id":0,"method":"set_power","params":["off", "smooth"]}';
  rtm({
    type: 'request',
    message: message
  });
}
function yeelight_sleep_thirty(){
  setTimeout(yeelight_sleep(), 30000);
}
function yeelight_sleep_five(){
  setTimeout(yeelight_sleep(), 5000);
}




function ControlClient(config) {
  this.leds = {};
  this.nr_leds = 0;
  this.act_dev = {};
  MulticastSocket.call(this, config);
}

function emptyFn() {
}

var proto = ControlClient.prototype =
  Object.create(MulticastSocket.prototype);

proto.connected = false;

proto.onConnected = function () {
  var me = this;
  //this.onInfo("Connected");
  this.connected = true;
};

proto.onDisconnected = function () {
  this.onInfo("Disconnected");
  this.connected = false;
};

proto.onError = function (message) {
    this.onInfo(message);
};

proto.onDiagram = function (message) {
    message = this.arrayBufferToString(message);
    this.addDevice(message);
};

proto.addDevice = function (message) {
    did = "";
    loc = "";

    headers = message.split("\r\n");
    for (i = 0; i < headers.length; i++) {
        if (headers[i].indexOf("id:") >= 0)
            did = headers[i].slice(4);
        if (headers[i].indexOf("Location:") >= 0)
            loc = headers[i].slice(10);
    }
    if (did == "" || loc == "")
        return;

    if (did in this.leds) {
        return;
    } else {
        loc = loc.split("//")[1];
        this.leds[did] = {did:did, location:loc, connected:false, socket:-1};
        this.nr_leds++;
    }
    this.onAddDevice(did, loc);
};

proto.onAddDevice = function (did, loc) {
};

proto.onResult = function (result) {
};

proto.onDevResponse = function (data) {
};

proto.scan = function () {
  if (!this.connected) {
      this.connect(function () {
          this.sendDiagram("M-SEARCH * HTTP/1.1\r\n MAN: \"ssdp:discover\"\r\n wifi_bulb");
      });
  } else {
      this.sendDiagram("M-SEARCH * HTTP/1.1\r\n MAN: \"ssdp:discover\"\r\n wifi_bulb");
  }
};

proto.pollDev = function (dev) {
    var me = this;
    chrome.socket.read(dev.socket, 4096, function (info) {
        if (info.resultCode >= 0) {
            me.onDevResponse(me.arrayBufferToString(info.data).split("\r\n")[0]);
            me.pollDev(dev);       
        } else {
            me.handleError("read data failed", "error");
        }
    });

};

proto.connectDev = function (message, target, callback) {
    this.onInfo(message);
    var led = this.leds[target];
    var me = this;

    tmp = led.location.split(":");
    devAddr = tmp[0];
    port = tmp[1];

    this.act_dev = led;
        
    if (!led.connected) {
        this.onInfo("Connecting ...");
        
        chrome.socket.create('tcp', function (socket) {
            var socketId = socket.socketId;            
            chrome.socket.setKeepAlive(socketId, true, function (result) {
                chrome.socket.connect(socketId, devAddr, parseInt(port,10), function (result) {
                    if (result != 0) {
                        me.handlerError("failed to connected", "error");
                    } else {
                        led.connected = true;
                        me.onInfo("Connected successfully");
                        led.socket = socketId;
                        me.pollDev(led);
                    }
                });
            });
        });
    } else {
        this.onInfo("already connected");
    } 
};

proto.sendRequest = function (message) {
    var me = this;
    if (this.act_dev && this.act_dev.connected == true) {
        chrome.socket.write(this.act_dev.socket, this.stringToArrayBuffer(message + "\r\n"), function () { me.onInfo("REQ :" + message);
});
    } else {
        this.onInfo("Device is not connected yet");
    }
};
