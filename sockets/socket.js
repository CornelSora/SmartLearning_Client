try {
var express = require('express')
var app = express();
const cmd = require('node-cmd');
var http = require('http').Server(app);
var io = require('socket.io')(http)
var bodyParser = require("body-parser");
var fs = require('fs');

app.use(bodyParser());

const debugStarted = {};

io.on('connection', function(socket){
    console.warn(`socket connected: ${socket.id}`)
    var processRef
    socket.on('disconnect', () => {
        fs.unlink(`${socket.id}.c`, (data, err) => {
        })
        fs.unlink(`${socket.id}.exe`, (data, err) => {
        })
    })
    socket.on('debugStart', () => {
        let i = 0
        var command = `gdb --quiet ${socket.id}.exe`
        console.warn(command)
        processRef = cmd.get(command);
        debugStarted[socket.id] = true
        processRef.stdout.on(
            'data',
            function(data) {
                console.log(data)
                if (data.indexOf("exited") > -1) {
                    debugStarted[socket.id] = false
                }
                try {
                    socket.emit("debugResult", data)
                } catch (e) {
                    console.log(e)
                }
            }
        );
    })

    socket.on("debug", function(command) {
        // if (command === 'next' || command === 'continue') {
        //     socket.emit("next", true)
        // }
        console.log('command is -----------: ' + command)
        processRef.stdin.write(`${command}
        `);
    })

    socket.on("compile", async (code) => {
        await writeFile(socket.id + ".c", code)
        const processRef = cmd.get(`g++ -g ${socket.id}.c -o ${socket.id}`, function(err, data, stderr) {
            if (stderr) {
                socket.emit("result", stderr)
            } else {
                socket.emit("result", "Compilation successful!")
            }
            // fs.unlink(`${socket.id}.c`, (data, err) => {
            // })
        })
    })

    socket.on("run", async (code) => {
        await writeFile(socket.id + ".c", code)
        // if (debugStarted[socket.id]) {
        //     socket.emit("error", "Please stop the debug session")
        // }
        const processRef = cmd.get(`g++ -g ${socket.id}.c -o ${socket.id}`, function(err, data, stderr) {
            if (stderr) {
                console.log(`-------------error----------------: ${stderr}`)
                socket.emit("result", stderr)                
            } else {
                cmd.get(`${socket.id}.exe`, function(err, data, stderr) {
                    socket.emit("result", data)
                    // fs.unlink(`${socket.id}.exe`, (data, err) => {
                    // })        
                })
            }
            // fs.unlink(`${socket.id}.c`, (data, err) => {
            // })
        })
    });
    

    socket.emit("auth", socket.id)
});

app.use(express.static(__dirname + '/public'));

function writeFile (fileName, code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, code, function(err) {
            if(err) {
                reject(err)
            }
            console.log("The file was saved!");
            resolve(true);
        });
    })
}

app.post("/saveFile", async (req, res) => {
    var result = await writeFile(req.body.id + ".c", req.body.code)
    if (result) {
        res.send('Files uploaded!');
    }
});

app.post("/compile", async (req, res) => {
    await writeFile(req.body.id + ".c", req.body.code)
    const processRef = cmd.get(`g++ -g ${req.body.id}.c -o ${req.body.id}`, function(err, data, stderr) {
        if (stderr) {
            res.send(stderr)
        } else {
            res.send("Compilation successfull!")
        }
    })
});

app.post("/run", async (req, res) => {
    await writeFile(req.body.id + ".c", req.body.code)
    if (debugStarted[req.body.id]) {
        res.status(400).send("Please stop the debug session")
    }
    console.log("I received the run command")
    const processRef = cmd.get(`g++ -g ${req.body.id}.c -o ${req.body.id}`, function(err, data, stderr) {
        if (stderr) {
            res.send(stderr)
        } else {
            cmd.get(`${req.body.id}.exe`, function(err, data, stderr) {
                res.send(data)
            })
        }
    })
});

app.get('/', (req, res) => {
    res.status(200).send("Hello, I'm done!");
});

http.listen(8081, function(){
  console.log('listening on http://localhost:8081');
});

} catch (e) {
    console.log(e)
}