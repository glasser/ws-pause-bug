var WebSocket = require('faye-websocket'),
    port      = process.argv[2] || 7000,
    scheme    = 'ws',
    url       = scheme + '://localhost:' + port + '/',
    headers   = {Origin: 'http://faye.jcoglan.com'},
    ws        = new WebSocket.Client(url, null, {headers: headers});

console.log('Connecting to ' + ws.url);

var howMany = 0;

var interval = null;

ws.onopen = function(event) {
  console.log('open');
  interval = setInterval(function () {
    ws.send('Here is some text!');
  }, 100);
};

ws.onmessage = function(event) {
  console.log('message', event.data.length, ++howMany);
};

ws.onclose = function(event) {
  console.log('close', event.code, event.reason);
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

