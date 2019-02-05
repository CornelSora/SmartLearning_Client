'use strict'

const cmd = require('node-cmd');
var express = require('express');
var bodyParser = require("body-parser");

var fs = require('fs');

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + "/client"))

app.listen(8080, function() {
    console.log("app started");
});

var data_line = '';

app.get("/test/:command", (req, res) => {
    const processRef = cmd.get('gdb --quiet a.exe');
    let done = false
    var command = req.params.command;
    command = (command == 'c' || command == 'n' || command == 'continue' || command == 'next') ? `${command} 
info locals ` : command;
    
    processRef.stdin.write(`${command}
    `);
    processRef.stdout.on(
        'data',
        function(data) {
            data_line += data;
            if (data_line[data_line.length-1] == '\n') {
                console.log(data_line);
            }
        }
    );

    done = true

    //  res.status(200).send(command);
});

app.post("/saveFile", (req, res) => {
    fs.writeFile("2.c", req.body.code, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
        res.send('Files uploaded!');
    }); 
});

app.get("/run", (req, res) => {
    console.log("I received the run command")
    const processRef = cmd.get('g++ -g 2.c', function(err, data, stderr) {
        if (stderr) {
            console.log(stderr)
            res.send(stderr)
        } else {
            console.log('ahoi')
            res.send("Compilation successfull")
        }
    })
});

app.get("/testFile", (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<form action="testFile" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload" multiple><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});
