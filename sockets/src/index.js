var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var logger = require('./utils/logger');

// var bodyParser = require("body-parser");
var Listener = require('./sockets/listener');

// app.use(bodyParser());

const debugStarted = {};

io.on('connection', function(socket) {
    var listener = new Listener(socket);
    listener.listenAll();
    //  socket.emit("auth", socket.id)
});

// app.use(express.static(__dirname + '/public'));

http.listen(8081, function(){
    logger.info('App started: listening on http://localhost:8081');
});
