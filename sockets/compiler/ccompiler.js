const cmd = require('node-cmd');
const fs = require('fs');

class CCompiler {
    constructor(fileName) {
        this._fileName = fileName;
    }

    async compile(code, fileName = "") {
        if (!fileName) {
            fileName = this._fileName;
        }
        await this.writeFile(fileName + ".c", code);
        return new Promise((resolve, reject) => {
            try {
                cmd.get(`g++ -g ${fileName}.c -o ${fileName}`, function(err, data, stderr) {
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

    async run(code, fileName = "") {
        if (!fileName) {
            fileName = this._fileName;
        }
        return new Promise(async (resolve, reject) => {
            try {
                await this.compile(code, fileName);
                cmd.get(`${fileName}.exe timeout /t 1`, function(err, data, stderr) {
                    resolve(data)
                })
            } catch (e) {
                reject(e);
            } finally {
            }
        })
    }

    async test(functionDetails, filename = null,  code = '') {
        if (!filename) {
            filename = this._fileName
        }
        try {
            if (!code) {
                code = await this.readFile(filename + '.c');
            }
            code = code.substring(0, code.indexOf('main') - 5);
            var newFilename = filename + '-nomain.c';
            await this.writeFile(newFilename, code);
            var testZone = '';
            for (var i = 0; i < functionDetails.tests.length; i++) {
                testZone += `${functionDetails.returnType} x${i} = ${functionDetails.name}(${functionDetails.tests[i].parameters.join(',')});
                if (${functionDetails.tests[i].expectedResult} != x${i}) {
                    printf("Expected result: %d; Actual result: %d\\n", ${functionDetails.tests[i].expectedResult}, x${i});
                }`
                // printf("%d, %d\n", x${i}, ${functionDetails.tests[i].expectedResult});
                // printf("%d == %d ? ", x${i}, ${functionDetails.tests[i].expectedResult});`
            }
            var testCode = `#include "${newFilename}"
            int main() {
                ${testZone}
            }`;
            try {
                var errors = await this.run(testCode, filename + "test");
                console.log(errors)
                if (!errors) {
                    return "Your code is ok.";
                } else {
                    return errors;
                }
            } catch (error) {
                console.log(error)
            }
        } catch (e) {
            throw "You must run the code first";
        }
    }

    getGDBLine(data) {
        var lines = data.split('\n')
        var numbers = lines.filter(x => x[0] && x[1] && x[2] && (x[0].concat(x[1]).concat(x[2]) > 0))
        if (numbers.length > 0) {
            for (var i = 0; i < numbers.length; i++) {
                return parseInt(numbers[i][0].concat(numbers[i][1]).concat(numbers[i][2]).trim());
            }
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

    readFile (fileName) {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data != null ? data.toString() : "")
            })
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

module.exports = CCompiler;
