const cmd = require('node-cmd');
const Ccompiler = require('./ccompiler')
const Pycompiler = require('./pycompiler')
const fs = require('fs');
const logger = require('../utils/logger');

var test = new Ccompiler();
functionDetails = {
	name: 'sum',
	returnType: 'int',
	tests: [
		{
			parameters: [2, 3],
			expectedResult: 5 
        },
        {
			parameters: [-2, 3],
			expectedResult: 1 
        },
        {
			parameters: [-10, 100],
			expectedResult: 909
        },
        {
			parameters: [2, 3],
			expectedResult: 7
        },
	]
}
//  test.test('1', functionDetails);


class Compiler {
    constructor(fileName) {
        while (fileName.indexOf('-') > -1 || fileName.indexOf('_') > -1) {
            fileName = fileName.replace('-', '');
            fileName = fileName.replace('_', '');
        }
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

    async test(functionDetails, code, language) {
        try {
            if (language == "c_cpp") {
                return await this.cCompiler.test(functionDetails, code);
            } else if (language == "python") {
                return await this.pCompiler.test(functionDetails, code);
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
                this.removeFiles()
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
            logger.info(`Removing files with name: ${this._fileName}`);
            this.cCompiler.removeFiles()
            this.pCompiler.removeFiles()
        } catch (e) {
            logger.errpr(`Error trying to remove files with name: ${this._fileName}`);
            logger.error(e);
        }
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
