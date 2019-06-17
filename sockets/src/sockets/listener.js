const logger = require('../utils/logger');
const Compiler = require('../compiler/compiler');
const cmd = require('node-cmd');

// app.use(bodyParser());

const debugStarted = {};

class Listener {
    constructor(socket) {
        this.compiler = new Compiler(socket.id);
        this.socket = socket;
        this.processRef = null;
    }

    listenDisconnect() {
        this.socket.on('disconnect', async () => {
            logger.info(`Socket: ${this.socket.id} got disconnected;`);
            await this.compiler.killProcess();
            this.compiler.removeFiles();
        });
    }

    listenDebugStart() {
        this.socket.on('debugStart', async (code) => {
            logger.info(`Debugging started for this.socket: ${this.socket.id}`);
            try {
                await this.compiler.run(code.code, code.language);
                var command = this.compiler.getGDBCommand(code.language);
                this.processRef = cmd.get(command);
                this.processRef.stdout.on(
                    'data', (data) => {
                        logger.info(`Received data from gdb for: ${this.socket.id}`);
                        if (data.indexOf("exited") > -1 || data.indexOf('Quit') > -1 || data.indexOf('quit') > -1) {
                            this.socket.emit("debugFinished");
                            this.compiler.removeFiles();
                            return;
                        }
                        try {
                            this.socket.emit("debugResult", data);
                            var lineToColor = this.compiler.getGDBLine(data, code.code, code.language);
                            if (lineToColor) {
                                this.socket.emit("colorLine", lineToColor);
                            }
                        } catch (e) {
                            throw e
                        }
                    }
                );
                this.processRef.stdout.on('end', (data) => {
                    console.log('ended')
                })
            } catch(e) {
                this.socket.emit("debugResult", e.toString());            
                logger.error(`============ERROR on debuggin for this.socket: ${this.socket.id}==============`);
                logger.error(e.toString());
            }
        });
    }

    listenDebugCommands() {
        this.socket.on("debug", (command) => {
            try {
                logger.info(`Sending the debug command: ${command} to gdb from this.socket: ${this.socket.id}`)
                if (!this.processRef) return;
                this.processRef.stdin.write(`${command}
                `);
                if (command == 'quit') {
                    this.compiler.removeFiles();
                }
            } catch (e) {
                logger.error(`============ERROR sending debug command: ${command} for this.socket: ${this.socket.id}==============`);
                logger.error(e.toString());
            }
        });
    }

    listenCompileCommand() {
        this.socket.on("compile", async (command) => {
            try {
                logger.info(`Compiling code in language: ${command.language} from this.socket: ${this.socket.id}`)
                await this.compiler.compile(command.code, command.language);
                this.socket.emit("result", "Compilation successful!");
            } catch (e) {
                this.socket.emit("result", e.toString());            
                logger.error(`============ERROR compiling code in language: ${command.language} for this.socket: ${this.socket.id}==============`);
                logger.error(e.toString());
            } finally {
                this.compiler.removeFiles();
            }
        });
    }

    listenTestCodeCommand() {
        this.socket.on("test", async (functionDetails, code, language) => {
            try {
                logger.info(`Testing user's code from this.socket: ${this.socket.id}`)
                var testResult = await this.compiler.test(functionDetails, code, language);
                this.socket.emit("result", testResult);
            } catch (e) {
                logger.error(`============ERROR testing code for this.socket: ${this.socket.id}==============`);
                logger.error(e.toString());
                this.socket.emit("result", e.toString());
            } finally {
                this.compiler.removeFiles();
            }
        });
    }

    listenExecuteCommand() {
        this.socket.on("run", async (command) => {
            try {
                logger.info(`Executing code in language: ${command.language} from this.socket: ${this.socket.id}`)
                const data = await this.compiler.run(command.code, command.language);
                this.socket.emit("result", data);
            } catch (e) {
                logger.error(`============ERROR executing code in language: ${command.language} for this.socket: ${this.socket.id}==============`);
                logger.error(e.toString());
                this.socket.emit("result", e.toString());
            } finally {
                this.compiler.removeFiles();
            }
        });
    }

    listenForKillProcess() {
        this.socket.on("killProcess", () => {
            logger.info(`Killing process: ${this.socket.id}.exe`)
            this.compiler.killProcess()
            .then((data) => {
                this.socket.emit("result", data);
            })
            .catch ((e) => {
                this.socket.emit("result", e.toString());
                logger.error(`============ERROR trying to kill process: ${this.socket.id}.exe==============`);
                logger.error(e.toString());
            });
        });
    }

    listenAll() {
        this.listenCompileCommand();
        this.listenExecuteCommand();
        this.listenDebugStart();
        this.listenDebugCommands();
        this.listenTestCodeCommand();
        this.listenForKillProcess();
        this.listenDisconnect();
    }
}

module.exports = Listener;