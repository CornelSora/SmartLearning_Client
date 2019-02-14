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
            cmd.get(`g++ -g ${this._fileName}.c -o ${this._fileName}`, function(err, data, stderr) {
                if (stderr) {
                    reject(stderr);
                } else {
                    resolve("Compilation successful!");
                }
            })
        })
    }

    async run(code) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.compile(code);
                cmd.get(`${this._fileName}.exe`, function(err, data, stderr) {
                    resolve(data)
                })
            } catch (e) {
                reject(e);
            }
        })
    }

    writeFile (fileName, code) {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, code, function(err) {
                if(err) {
                    reject(err);
                }
                resolve(true);
            });
        })
    }

    getFileName() {
        return this._fileName;
    }
}

module.exports = Compiler;
