var WebSocket = require('faye-websocket'),
    fs        = require('fs'),
    http      = require('http'),
    https     = require('https');

var port   = process.argv[2] || 7000;

var longer = Array(16500).join('x');

var upgradeHandler = function(request, socket, head) {
  var ws = new WebSocket(request, socket, head);
  console.log('open', ws.url, ws.version, ws.protocol);

  var interval = null;

  var howMany = 0;

  ws.onopen = function () {
    // Without running both of these lines, this becomes an echo server.
    // With both, it gets stuck (specifically, the IO in streams.js gets paused
    // and never resumed, so the TCP stream from the client stops writing to
    // it).
    if (process.env.BREAKIT) {
      ws.send(longer);
      ws.send("bazbaz\n");
    }
  };

  ws.onmessage = function (event) {
    console.log("got data", event.data);
    ws.send(event.data);
  };

  ws.onclose = function(event) {
    console.log('close', event.code, event.reason);
    ws = null;
  };
};

var requestHandler = function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write('Hello');
  response.end();
};

var staticHandler = function(request, response) {
  var path = request.url;

  fs.readFile(__dirname + path, function(err, content) {
    var status = err ? 404 : 200;
    response.writeHead(status, {'Content-Type': 'text/html'});
    response.write(content || 'Not found');
    response.end();
  });
};

var server = http.createServer();

server.on('request', requestHandler);
server.on('upgrade', upgradeHandler);
server.listen(port);

