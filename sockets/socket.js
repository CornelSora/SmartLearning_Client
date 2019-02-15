var express = require('express')
var app = express();
const cmd = require('node-cmd');
var http = require('http').Server(app);
var io = require('socket.io')(http)
var bodyParser = require("body-parser");
var Compiler = require('./compiler/compiler')

app.use(bodyParser());

const debugStarted = {};

io.on('connection', function(socket){
    var compiler = new Compiler(socket.id)

    var processRef
    socket.on('disconnect', () => {
    })
    socket.on('debugStart', async (code) => {
        let i = 0
        try {
            await compiler.run(code)
            var command = compiler.getGDBCommand()
            processRef = cmd.get(command);
            processRef.stdout.on(
                'data',
                function(data) {
                    if (data.indexOf("exited") > -1 || data.indexOf('Quit') > -1) {
                        compiler.removeFiles();
                        socket.emit("debugFinished");
                    }
                    try {
                        socket.emit("debugResult", data);
                        var lines = data.split('\n')
                        var numbers = lines.filter(x => (x[0] > 0))
                        if (numbers.length > 0) {
                            for (var i = 0; i < numbers.length; i++) {
                                socket.emit("colorLine", numbers[i][0]);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            );
        } catch(e) {
            socket.emit("result", e.toString());            
        }
    })

    socket.on("debug", function(command) {
        try {
            processRef.stdin.write(`${command}
            `);
        } catch (e) {

        }
    })

    socket.on("compile", async (code) => {
        compiler.compile(code)
        .then(() => {
            socket.emit("result", "Compilation successful!");
            compiler.removeFiles();
        })
        .catch ((e) => {
            socket.emit("result", e.toString());            
        });
    })

    socket.on("run", (code) => {
        compiler.run(code)
        .then((data) => {
            socket.emit("result", data);
            compiler.removeFiles();
        })
        .catch ((e) => {
            console.log(e)
            socket.emit("result", e.toString());
        });
    });    

    //  socket.emit("auth", socket.id)
});

app.use(express.static(__dirname + '/public'));

http.listen(8081, function(){
  console.log('listening on http://localhost:8081');
});
