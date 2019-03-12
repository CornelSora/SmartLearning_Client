const cmd = require('node-cmd');
const Ccompiler = require('./ccompiler')
const Pycompiler = require('./pycompiler')
const fs = require('fs');

class Compiler {
    constructor(fileName) {
        fileName = fileName.replace('-', '');
        this.cCompiler = new Ccompiler(fileName);
        this.pCompiler = new Pycompiler(fileName);
        this._fileName = fileName;
    }

    async compile(code, language) {
        try {
            if (language == "c_cpp") {
                await this.cCompiler.compile(code);
            } else if (language == "python") {
                await this.pCompiler.compile(code);
            }
        } catch (e) {
            throw e
        }
    }

    async run(code, language) {
        try {
            if (language == "c_cpp") {
                return await this.cCompiler.run(code);
            } else if (language == "python") {
                return await this.pCompiler.run(code);
            }
        } catch (e) {
            throw e
        }
    }

    async killProcess() {
        return new Promise(async (resolve, reject) => {
            try {
                cmd.get(`Taskkill /IM ${this._fileName}.exe /F`, function(err, data, stderr) {
                    resolve(data)
                })
            } catch (e) {
                reject(e);
            } finally {
            }
        })
    }

    writeFile (fileName, code) {
        return new Promise((resolve, reject) => {
            fs.writeFile('' + fileName, code, function(err) {
                if(err) {
                    reject(err);
                }
                resolve(true);
            });
        })
    }

    removeFiles () {
        // try {
        //     fs.unlink(`${this._fileName}.c`, (data, err) => {
        //     })
        //     fs.unlink(`${this._fileName}.exe`, (data, err) => {
        //     })
        // } catch (e) {
        //     console.log(e)
        // }
    }

    getGDBLine(data, code, language) {
        if (language === "c_cpp") {
            return this.cCompiler.getGDBLine(data);
        } else if (language === "python") {
            return this.pCompiler.getGDBLine(data, code);
        }
    }

    getFileName() {
        return this._fileName;
    }

    getGDBCommand(language) {
        if (language === "c_cpp") {
            return this.cCompiler.getGDBCommand();
        } else if (language === "python") {
            return this.pCompiler.getGDBCommand();
        }
    }
}

module.exports = Compiler;
