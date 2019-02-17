const cmd = require('node-cmd');
const fs = require('fs');

class Compiler {
    constructor(fileName) {
        fileName = fileName.replace('-', '');
        this._fileName = fileName;
    }

    async compile(code) {
        await this.writeFile(this._fileName + ".c", code);
        return new Promise((resolve, reject) => {
            try {
                cmd.get(`g++ -g ${this._fileName}.c -o ${this._fileName}`, function(err, data, stderr) {
                    if (stderr) {
                        reject(stderr);
                    } else {
                        resolve("Compilation successful!");
                    }
                })
            } catch(e) {
                reject(e)
            } finally {
            }
        })
    }

    async run(code) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.compile(code);
                cmd.get(`${this._fileName}.exe timeout /t 1`, function(err, data, stderr) {
                    console.log('--------------------------')
                    resolve(data)
                })
            } catch (e) {
                reject(e);
            } finally {
            }
        })
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
        try {
            fs.unlink(`${this._fileName}.c`, (data, err) => {
            })
            fs.unlink(`${this._fileName}.exe`, (data, err) => {
            })
        } catch (e) {
            console.log(e)
        }
    }

    getFileName() {
        return this._fileName;
    }

    getGDBCommand() {
        return `gdb --quiet ${this._fileName}.exe`;
    }
}

module.exports = Compiler;
