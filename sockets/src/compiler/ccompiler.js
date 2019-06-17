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
                    if (stderr) {
                        reject(stderr)
                    } else {
                        resolve(data)
                    }
                })
            } catch (e) {
                reject(e);
            } finally {
            }
        })
    }

    async test(functionDetails, code = '', filename = null) {
        if (!filename) {
            filename = this._fileName
        }
        var noMainFileName = filename + '-nomain.c';
        var testFileName = filename + "test";
        try {
            if (!code) {
                code = await this.readFile(filename + '.c');
            }
            if (code.indexOf('main') > -1) {
                code = code.substring(0, code.indexOf('main') - 5);
            }
            await this.writeFile(noMainFileName, code);
            var testZone = '';
            var listOfParameters = '';
            testZone += `int fLength123abc=${functionDetails.tests.length};`
            testZone += `int currentTest123abc = 0;`
            for (var i = 0; i < functionDetails.tests.length; i++) {
                listOfParameters = '';
                for (var j = 0; j < functionDetails.tests[i].parameters.length; j++) {
                    if (j > 0) {
                        listOfParameters += ','
                    }
                    var paramType = functionDetails.parameters[j].parameterType;
                    if (paramType.indexOf('*') > -1) {
                        var pType = paramType.split('*')[0]
                        testZone += `${pType} param${i}[${functionDetails.tests[i].parameters[j].split(',').length}] = ${functionDetails.tests[i].parameters[j]};`
                        listOfParameters += `param${i}`
                    } else {
                        listOfParameters += `${functionDetails.tests[i].parameters[j]}`
                    }
                }
                //  testZone += `${functionDetails.returnType} x${i} = ${functionDetails.name}(${functionDetails.tests[i].parameters.join(',')});
                testZone += `${functionDetails.returnType} x${i} = ${functionDetails.name}(${listOfParameters});

                if (${functionDetails.tests[i].expectedResult} != x${i}) {
                    if (currentTest123abc < (fLength123abc / 2)) {
                        printf("==========\\n");
                        printf("Test failed:\\n");
                        printf("Parameters: ${functionDetails.tests[i].parameters.join(',')}\\n");
                        printf("Expected result: %d; Actual result: %d\\n", ${functionDetails.tests[i].expectedResult}, x${i});
                        printf("==========\\n");
                    } else {
                        printf("Your code failed a hidden test: test${i + 1}\\n");
                    }
                    currentTest123abc++;
                }`
                // printf("%d, %d\n", x${i}, ${functionDetails.tests[i].expectedResult});
                // printf("%d == %d ? ", x${i}, ${functionDetails.tests[i].expectedResult});`
            }
            var testCode = `#include<stdio.h>
            #include "${noMainFileName}"
            int main() {
                ${testZone}
            }`;
            try {
                var errors = await this.run(testCode, testFileName);
                if (!errors) {
                    var responseMsg = "Your code passed the tests!\n";
                    for (var i = 0; i < functionDetails.tests.length; i++) {
    responseMsg += `Test ${i + 1}: 
    Parameters: ${functionDetails.tests[i].parameters.join(',')}
    Expected result: ${functionDetails.tests[i].expectedResult}\n`;
                    }
                    return responseMsg;
                } else {
                    return errors;
                }
            } catch (error) {
                return error
            }
        } catch (e) {
            throw e;
        } finally {
            try {
                this.removeFile(noMainFileName);
                this.removeFile(`${testFileName}.c`);
                this.removeFile(`${testFileName}.exe`);
            } catch (err) {
                throw err
            }
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

    async removeFiles () {
        try {
            await this.removeFile(`${this._fileName}.exe`);
            await this.removeFile(`${this._fileName}.c`);
        } catch (e) {
            throw e
        }
    }

    removeFile(fileName) {
        return new Promise((resolve, reject) => {
            fs.unlink(fileName, (data, err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    getFileName() {
        return this._fileName;
    }

    getGDBCommand() {
        return `gdb --quiet ${this._fileName}.exe`;
    }
}

module.exports = CCompiler;
