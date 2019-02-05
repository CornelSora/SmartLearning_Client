'use strict'

const cmd = require('node-cmd');
var express = require('express');

var app = express();

const processRef = cmd.get('gdb --quiet a.exe');

processRef.stdout.on(
    'data',
    function(data) {
        console.log(data.trim());
    }
);

console.log(typeof processRef.stdin.write)

setTimeout(function () {
    processRef.stdin.write('run')
    // processRef.stdin.write('break 1')
}, 1000)
processRef.stdin.write('run')

app.listen(8080, function() {
    console.log("app started");
});
