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
            await compiler.run(code.code, code.language)
            var command = compiler.getGDBCommand(code.language)
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
                        var lineToColor = compiler.getGDBLine(data, code.code, code.language);
                        socket.emit("colorLine", lineToColor);
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

    socket.on("compile", async (command) => {
        compiler.compile(command.code, command.language)
        .then(() => {
            socket.emit("result", "Compilation successful!");
            compiler.removeFiles();
        })
        .catch ((e) => {
            socket.emit("result", e.toString());            
        });
    })

    // socket.on("compile", async (code, language) => {
    //     compiler.compile(code, language)
    //     .then(() => {
    //         socket.emit("result", "Compilation successful!");
    //         compiler.removeFiles();
    //     })
    //     .catch ((e) => {
    //         socket.emit("result", e.toString());            
    //     });
    // })

    socket.on("run", (command) => {
        compiler.run(command.code, command.language)
        .then((data) => {
            socket.emit("result", data);
            compiler.removeFiles();
        })
        .catch ((e) => {
            console.log(e)
            socket.emit("result", e.toString());
        });
    });

    socket.on("killProcess", () => {
        console.log("I will kill it")
        compiler.killProcess()
        .then((data) => {
            socket.emit("result", data);
        })
        .catch ((e) => {
            socket.emit("result", e.toString());
        });
    })

    //  socket.emit("auth", socket.id)
});

app.use(express.static(__dirname + '/public'));

http.listen(8081, function(){
  console.log('listening on http://localhost:8081');
});
