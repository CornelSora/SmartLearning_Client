// // const vm = require('vm');
// // vm.runInNewContext('this.constructor.constructor("return process")().exit()');
// const {NodeVM} = require('vm2');

// // const vm = new NodeVM({
// //     console: 'inherit',
// //     sandbox: {},
// //     require: {
// //         context: 'sandbox', // <------
// //         external: true,
// //         builtin: ['path'],
// //         root: "./",
// //         mock: {
// //         }
// //     }
// // });

// var helper = 'var log = [], console = {log: function(msg) { log.push(msg) }}; (function() { eval(userScript); return {output: multiply(input), log: log} })();';
// var userScript = "var request = require('request'); /* function which uses 'request' would go here * / function multiply(num) { console.log('test'); return num * 2; }";

// var vm = new NodeVM({
//     sandbox: {
//         input: 5,
//         userScript: userScript
//     },
//     require: true,
//     requireExternal: true
// });

// var result = vm.run(helper);

// console.log(result.output);
// console.log(result.log);

// try {
//     vm.run(`
//         const util = require('util');
//         const exec = util.promisify(require('child_process').exec);
//         async function lsfunction() {
//             const { stdout, stderr } = await exec('dir');
//             console.log('stdout:', stdout);
//             console.log('stderr:', stderr);
//         }
        
//         lsfunction();
//     `, 'vm.js');
// }
// catch(e) {
//     console.log(e)
//     console.log('you are not allowed to do this...')
// }
// let number = vm.run("1337");
// console.log(number)
// console.log('Never gets executed.');

var testVM = require('vm2').NodeVM;

var options = {
    require: true
};

var vm = new testVM(options);
var result = vm.run("require('request')");
console.log(result);


var app = require('express')();
const cmd = require('node-cmd');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require("body-parser");
var fs = require('fs');

app.use(bodyParser());

io.on('connection', function(socket){
    console.log('a user connected');
});

app.get('/', function(req, res){
    res.sendFile(__dirname);
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
            res.send(stderr)
        } else {
            cmd.get('a.exe', function(err, data, stderr) {
                res.send(data)
            })
        }
    })
});

http.listen(8080, function(){
  console.log('listening on http://localhost:8080');
});