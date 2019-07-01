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

    async run(code, fileName) {
        if (!fileName) {
            fileName = this._fileName
        }
        return new Promise(async (resolve, reject) => {
            try {
                await this.writeFile(fileName + ".py", code);
                cmd.get(`py ${fileName}.py`, function(err, data, stderr) {
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

    async test(functionDetails, code = '', filename = null) {
        console.log(this._fileName)
        if (!filename) {
            filename = this._fileName
        }
        var testFileName = filename + "test";
        try {
            if (!code) {
                code = await this.readFile(filename + '.py');
            } else {
                await this.writeFile(filename + '.py', code);
            }
            var testZone = '';
            var listOfParameters = '';
            testZone += `fLength123abc=${functionDetails.tests.length};`
            testZone += `currentTest123abc = 0;\n`
            for (var i = 0; i < functionDetails.tests.length; i++) {
                listOfParameters = '';
                for (var j = 0; j < functionDetails.tests[i].parameters.length; j++) {
                    if (j > 0) {
                        listOfParameters += ','
                    }
                    var paramType = functionDetails.parameters[j].parameterType;
                    if (paramType.indexOf('*') > -1) {
                        var parameterArray = functionDetails.tests[i].parameters[j].replace('{', '[');
                        parameterArray = parameterArray.replace('}', ']');
                        testZone += `    param${i} = ${parameterArray};`
                        listOfParameters += `param${i}`
                    } else {
                        listOfParameters += `${functionDetails.tests[i].parameters[j]}`
                    }
                }
                //  testZone += `${functionDetails.returnType} x${i} = ${functionDetails.name}(${functionDetails.tests[i].parameters.join(',')});
                testZone += `x${i} = ${functionDetails.name}(${listOfParameters})
    if ${functionDetails.tests[i].expectedResult} != x${i}:
        if currentTest123abc < (fLength123abc / 2):
            print("==========");
            print("Test failed:");
            print("Parameters: ${functionDetails.tests[i].parameters.join(',')}");
            print("Expected result: {a}; Actual result: {b}".format(a = ${functionDetails.tests[i].expectedResult}, b = x${i}));
            print("==========");
        else:
            print("Your code failed a hidden test: test${i + 1}\\n");
        currentTest123abc+=1;\n`
                // printf("%d, %d\n", x${i}, ${functionDetails.tests[i].expectedResult});
                // printf("%d == %d ? ", x${i}, ${functionDetails.tests[i].expectedResult});`
                // from ${filename} import ${functionDetails.name}
            }
            var testCode = `from ${filename} import ${functionDetails.name}

if __name__ == '__main__':
    ${testZone}`;
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
                this.removeFiles(`${filename}.py`);
                this.removeFiles(`${testFileName}.py`);
            } catch (err) {
                throw err
            }
        }
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
                if (err) {
                    throw err;
                }
            })
            fs.unlink(`${this._fileName}.exe`, (data, err) => {
                if (err) {
                    throw err;
                }
            })
        } catch (e) {
            throw e;
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
