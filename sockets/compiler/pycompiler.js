const cmd = require('node-cmd');
const fs = require('fs');

class PyCompiler {
    constructor(fileName) {
        this._fileName = fileName;
    }

    async compile(code) {
        await this.writeFile(this._fileName + ".py", code);
        return new Promise((resolve, reject) => {
            try {
                cmd.get(`py ${this._fileName}.py`, function(err, data, stderr) {
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
                await this.writeFile(this._fileName + ".py", code);
                cmd.get(`py ${this._fileName}.py`, function(err, data, stderr) {
                    if (stderr) {
                        reject(stderr);
                    } else {
                        resolve(data);
                    }
                })
            } catch (e) {
                reject(e);
            } finally {
            }
        })
    }

    getGDBLine(data, code) {
        try {
            var it = data.split('-> ')[1].split('(Pdb)')[0].trim()
            var lines = code.split('\n')
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].trim() == it.trim()) {
                    return i + 1;
                }
            }
        } catch(e) {
        }
        return 0;
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
            fs.unlink(`${this._fileName}.py`, (data, err) => {
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
        return `py -m pdb ${this._fileName}.py`;
    }
}

module.exports = PyCompiler;
