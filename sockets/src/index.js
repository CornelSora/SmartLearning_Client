var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var logger = require('./utils/logger');
var jwt = require('jsonwebtoken');
const SECRET_KEY = '1@CNC@Debug1#'

// var bodyParser = require("body-parser");
var Listener = require('./sockets/listener');

// app.use(bodyParser());

const debugStarted = {};

io.use(function(socket, next){
    logger.info(`Testing connection: ${socket.id}`)
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, SECRET_KEY, function(err, decoded) {
            var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            if (!err && decoded.date != null && decoded.date == utc) {
                socket.decoded = decoded;
                next();
            } else {
                logger.error(`Authentication error`)
                return next(new Error('Authentication error'));
            }                
        });
    } else {
        logger.error(`Authentication error`)
        next(new Error('Authentication error'));
    }    
})

io.on('connection', function(socket) {
    logger.info(`New connection: ${socket.id}`)
    var listener = new Listener(socket);
    listener.listenAll();
    //  socket.emit("auth", socket.id)
});

// app.use(express.static(__dirname + '/public'));

http.listen(8081, function(){
    logger.info('App started: listening on http://localhost:8081');
});
