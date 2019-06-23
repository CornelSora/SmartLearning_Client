<template>
  <div>
    <!--<div style="display: flex;">
      <label>Language:</label>
      <b-select v-model="language">
        <option>{{this.languages.python}}</option>
        <option>{{this.languages.c_cpp}}</option>
      </b-select>
    </div> -->
    <b-form inline class="small right preferences">
        <label class="mr-sm-2" for="inline-form-custom-select-pref">Language</label>
        <b-form-select
          class="mb-2 mr-sm-2 mb-sm-0"
          v-model="language">
        >
          <option>{{this.languages.python}}</option>
          <option>{{this.languages.c_cpp}}</option>
        </b-form-select>
        <label class="mr-sm-2" for="inline-form-custom-select-pref">Theme</label>
        <b-form-select
          class="sm-2 mr-sm-2 mb-sm-0"
          v-model="theme">
        >
          <option>dawn</option>
          <option>twilight</option>
          <option>terminal</option>
          <option>cobalt</option>
          <option>eclipse</option>
        </b-form-select>
    </b-form>
    <div class="editor-border">
      <editor
          v-model='content'
          @init='editorInit'
          :readOnly='true'
          :lang='language'
          :theme='theme'
          width='100%'
          height='500px'
          :options='options'
          ref='editor'
          >
      </editor>
    </div>
    <center>
      <div v-if="!debugMode" class="buttons-area">
        <b-btn @click='onSaveEvent' v-if="!loadedAlone && !isReadonly" variant="primary">Save</b-btn>
        <b-btn @click='onCompileEvent' v-if="language !== this.languages.python" variant="primary">Compile</b-btn>
        <b-btn @click='onRunEvent' variant="success">Run</b-btn>
        <!-- <b-btn @click='onDebugEvent'>Debug</b-btn> -->
        <b-btn @click='onDebugEvent' variant="danger"><span class="glyphicon glyphicon-share-alt"></span>Debug mode</b-btn>
        <!-- <b-btn @click="onBeautifyEvent">Beautify</b-btn> -->
        <b-btn @click='onTestEvent' v-if="!this.loadedAlone" variant="primary">Test</b-btn> <!-- language !== this.languages.python && -->
        <b-btn @click='onKillEvent'>Kill</b-btn>
      </div>
      <div v-else class="buttons-area">
        <b-btn @click='onDebugStart' :disabled="debugStarted">Start</b-btn>
        <b-btn @click='onDebugNext' :disabled="!debugStarted">Next</b-btn>
        <b-btn @click='onDebugContinue' :disabled="!debugStarted">Continue</b-btn>
        <b-btn @click='onDebugInfoLocals' :disabled="!debugStarted">Info locals</b-btn>
        <b-btn @click='onDebugInfoArgs' :disabled="!debugStarted">Info args</b-btn>
        <b-btn @click='onDebugStop' :disabled="!debugStarted">Stop</b-btn>
      </div>
    </center>
    <div class="editor-border">
      <editor
        v-model='result'
        @init='resultEditorInit'
        lang='batchfile'
        :readonly='true'
        :theme='theme'
        :width='debugMode ? "50%" : "100%"'
        style="float: left"
        height='200px'
        ref='resultEditor'
        >
      </editor>
      <editor
        v-if="debugMode"
        v-model='debugInfo'
        @init='debugEditorInit'
        lang='batchfile'
        :theme='theme'
        width='49%'
        height='200px'
        :readonly='true'
        ref='debugEditor'
        style="float: right"
        >
      </editor>
    </div>
  </div>
</template>

<script>
import editor from 'vue2-ace-editor'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import io from 'socket.io-client'
import brace from 'brace'
import jwt from 'jsonwebtoken'
const SECRET_KEY = '1@CNC@Debug1#'

const Range = brace.acequire('ace/range').Range

var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
var token = jwt.sign({date: utc}, SECRET_KEY);

const socket = io(process.env.SOCKET_SERVER, {
  query: {token: token}
})

const socketErrorMessage = `It seems like there is an error with the compiler.
Please refresh the page.
If the error persists try again later. Thank you!`

var loader = { hide: () => { console.log('nothing') } }
var isTimeout = false
var breakpoints = []
var breakpointsSent = []

export default {
  name: 'Editor',  
  data () {
    return {
      result: '',
      debugInfo: '',
      options: {
        enableBasicAutocompletion: true,
        showGutter: true
      },
      marker: null,
      debugMode: false,
      debugStarted: false,
      content: (this.language == 'python' ? '#' : '//') + 'Write your code here',
      functions: [],
      problemID: this.$route.params.id,
      languages: {
        c_cpp: 'c_cpp',
        python: 'python'
      },
      editorReference: '',
      resultEditorReference: '',
      loadedAlone: true,
      language: this.$settings.getLanguage() ? this.$settings.getLanguage() : 'c_cpp',
      theme: this.$settings.getTheme() ? this.$settings.getTheme() : 'dawn',
      defaultMesage: 'Write your code here',
      isInfoLocalsCommand: false,
      isInvitation: false
    }
  },
  mounted () {
    console.warn(this.isReadonly)
    // if (this.$userID) {
    //   this.content = this.$api.problem.getUserSolution() ? this.$api.problem.getUserSolution() : ''
    //   this.functions = this.$api.problem.getProblemFunctions() ? this.$api.problem.getProblemFunctions() : {}
    // }
    var subscription = this.$subject.subscribe({
      next: (sender) => {
        if (sender.type == 'EDITOR') {
          var localCode = this.$settings.getCode(this.language)
          this.content = localCode ? localCode : sender.userSolution
          this.functions = sender.testFunctions
          this.setContent()
          this.loadedAlone = false
          //  subscription.unsubscribe()
        } if (sender.type == 'INVITATION') {
          this.isInvitation = true
          this.content = sender.userSolution
          this.functions = sender.testFunctions
          this.setContent()
          this.loadedAlone = false
        } else {
          this.loadedAlone = true
          //  subscription.unsubscribe()
        }
      }
    })
    this.setListeners()
    this.editorReference = this.$refs.editor
    this.resultEditorReference = this.$refs.resultEditor
  },
  methods: {
    setListeners () {
      socket.on('connection', function (socketR) {
        console.warn(socketR)
      })
      socket.on('result', (cmdResult) => {
        if (isTimeout) {
          isTimeout = false
          return
        }
        this.editorReference.editor.getSession().setAnnotations([])
        this.result = cmdResult ? cmdResult : ''
        if (this.result.indexOf('error') > -1) {
          var lines = this.result.split('\n')
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('error') > -1) {
              var numbers = lines[i].split(':')
              var oldAnnotations = this.editorReference.editor.getSession().getAnnotations()
              var newAnnotation = {
                row: parseInt(numbers[1]) - 1,
                column: parseInt(numbers[2]),
                text: lines[i].split('error')[1], 
                type: 'error'
              }
              oldAnnotations.push(newAnnotation)
              this.editorReference.editor.getSession().setAnnotations(oldAnnotations)
            }
          }
        }
        loader.hide()
      })
      socket.on('debugResult', (debugResult) => {
        if (isTimeout) {
          isTimeout = false
          return
        }
        var resultEditor = this.resultEditorReference.editor
        var n = resultEditor.getSession().getValue().split('\n').length;
        if (debugResult.trim().length != 0) {
          if (!this.isInfoLocalsCommand) {
              this.result += (n > 1 ? '\n' : '') + debugResult.trim() + '\n'
          } else {
            var lngth = this.$refs.debugEditor.editor.getSession().getValue().split('\n').length;
            this.debugInfo += (lngth > 1 ? '\n' : '') + debugResult.trim() + '\n'
            this.isInfoLocalsCommand = false
          }
        }
        setTimeout(() => {
          resultEditor.focus()
          resultEditor.resize(true);
          resultEditor.scrollToLine(n + 1, true, true, function () {});
          resultEditor.gotoLine(n*2, 1, true);
          loader.hide()
        }, 100)
      })
      socket.on('colorLine', (lineNumber) => {
        var resultEditor = this.resultEditorReference.editor
        var editor = this.editorReference.editor
          if (this.marker) {
            editor.session.removeMarker(this.marker)
          }
          this.marker = editor.session.addMarker(new Range(lineNumber - 1, 0, lineNumber - 1, 10), 'myMarker', 'fullLine');
      })
      socket.on('debugFinished', () => {
        this.onDebugEnd()
      })
      // document.addEventListener("trigger", (e) => {
      //   this.editorReference.editor.focus()
      //   if (this.content || !this.userID) return
      //   this.content = this.$api.problem.getUserSolution() ? this.$api.problem.getUserSolution() : ''
      //   this.functions = this.$api.problem.getProblemFunctions() ? this.$api.problem.getProblemFunctions() : {}
      // });
    },
    editorInit () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')
      require('brace/mode/c_cpp')    //language
      require('brace/mode/python')    //language
      require('brace/mode/less')
      require('brace/theme/twilight')
      require('brace/theme/terminal')
      require('brace/theme/cobalt')
      require('brace/theme/eclipse')     
      require('brace/theme/dawn')      
      require('brace/snippets/c_cpp') //snippet
      require('brace/ext/searchbox')
      require('brace/ext/spellcheck')
      require('brace/ext/error_marker')
      require('brace/keybinding/emacs')
      var editor = this.$refs.editor.editor
      editor.renderer.setShowGutter(false)

      editor.on('guttermousedown', (e) => {
        var target = e.domEvent.target;
        if (target.className.indexOf('ace_gutter-cell') == -1) {
          return;
        }
        if (!editor.isFocused()) {
          return;
        }
        if (e.clientX > 25 + target.getBoundingClientRect().left) {
          return
        }
        var row = e.getDocumentPosition().row
        var breakpointsArray = e.editor.session.getBreakpoints()
        if(!(row in breakpointsArray)) {
          e.editor.session.setBreakpoint(row)
          breakpoints.push(row)
        } else {
          e.editor.session.clearBreakpoint(row)
          breakpoints.splice(breakpoints.indexOf(row), 1)
          if (this.debugStarted) {
            this.removeBreakpointFromGdb(breakpointsSent.indexOf(row) + 1)
          }
        }
        e.stop()
      });
    },
    resultEditorInit () {
      var resultEditor = this.$refs.resultEditor.editor
      resultEditor.commands.on('exec', function(e) {
        if (this.debugMode) return;
        if (e.command.readOnly)
            return;
        var editableRow = resultEditor.session.getLength() - 1;
        var deletesLeft = e.command.name == 'backspace' || e.command.name == 'removewordleft';
        var notEditable = resultEditor.selection.getAllRanges().some(function(r) {
          if (deletesLeft && r.start.column == 0 && r.end.column == 0) return true;
          return r.start.row != editableRow || r.end.row != editableRow;
        });
        if (notEditable) {
          e.preventDefault();
        }
      });

      resultEditor.keyBinding.origOnCommandKey = resultEditor.keyBinding.onCommandKey;
      resultEditor.keyBinding.onCommandKey = (e, hashId, keyCode) => {
        if (e.code == 'Enter') {
          if (!this.debugMode) return;
          this.sendDebugCommand()
          e.preventDefault()
        }
      }
    },
    debugEditorInit() {
      var resultEditor = this.$refs.debugEditor.editor
      resultEditor.commands.on('exec', function(e) {
        if (notEditable) {
          e.preventDefault();
        }
      });
    },
    async onRunEvent () {
      // await this.onSaveEvent()
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      this.displayLoading()
      this.result = 'Running...'
      socket.emit('run', { code: this.content, language: this.language })
    },
    async onCompileEvent () {
      // await this.onSaveEvent()
       if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      this.displayLoading()
      this.result = 'Running...'
      socket.emit('compile', { code: this.content, language: this.language })
    },
    onDebugEvent () {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      this.displayLoading()
      this.result = ''
      this.debugMode = true
      socket.emit('debugStart', { code: this.content, language: this.language })
    },
    onKillEvent () {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      socket.emit('killProcess')
    },
    sendBreakpoints () {
      breakpoints.sort((a, b) => a > b)
      for (var i = 0; i < breakpoints.length; i++) {
        if (breakpointsSent.indexOf(breakpoints[i]) == -1) {
          let cmd = `break ${breakpoints[i] + 1}`
          this.sendDebugCommand(cmd)
          breakpointsSent.push(breakpoints[i])
        }
      }
    },
    removeBreakpointFromGdb(breakpoint) {
      let cmd = `del ${breakpoint}`
      this.sendDebugCommand(cmd)
    },
    sendDebugCommand (command) {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      if (!command) {
        // the command is sent from console
        var resultEditor = this.resultEditorReference.editor
        const lines = resultEditor.getSession().getValue().split('\n')
        command = lines[lines.length - 1]
      }
      socket.emit('debug', command);
    },
    onDebugStart () {
      breakpointsSent = []
      this.debugStarted = true
      this.sendBreakpoints()
      this.sendDebugCommand('run')
    },
    onDebugEnd () {
      this.debugMode = false
      this.debugStarted = false
      var editor = this.editorReference.editor
      if (this.marker) {
        editor.session.removeMarker(this.marker)
      }
    },
    onDebugNext () {
      this.sendBreakpoints()
      this.sendDebugCommand('next')
    },
    onDebugContinue () {
      this.sendBreakpoints()
      this.sendDebugCommand('continue')
    },
    onDebugInfoLocals () {
      this.isInfoLocalsCommand = true
      if (this.language == this.languages.c_cpp) {
        this.sendDebugCommand('info locals')
      } else if (this.language == this.languages.python) {
        this.sendDebugCommand('locals()')
      }
    },
    onDebugInfoArgs () {
      this.isInfoLocalsCommand = true
      if (this.language == this.languages.c_cpp) {
        this.sendDebugCommand('info args')
      }
    },
    onTestEvent () {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      this.displayLoading()
      this.result = ''
      socket.emit('test', this.functions[0], this.content, this.language)
    },
    async onSaveEvent () {
      // this.editorReference.editor.getSession().setAnnotations([{
      //   row: 1,
      //   column: 0,
      //   text: "Error Message", // Or the Json reply from the parser 
      //   type: "error" // also "warning" and "information"
      // }]);
      let loader = this.displayLoading()
      try {
        let contentToSend = this.content
        if (contentToSend && contentToSend.indexOf('\n') > -1) {
        //  const contentToSend = this.content.replace('\n', '\\n')
          contentToSend = this.content.split('\n').join('\\n')
          contentToSend = contentToSend.split('"').join('\\\"')
        }
        if (this.$userID && !this.isInvitation) {
          await this.$api.problem.saveProblemSolution(this.problemID, this.$userID, `${contentToSend}`)
          this.$settings.setCode(this.content, this.language)
        }
        if (this.isInvitation) {
          // this.$subject.next({
          //   type: 'SAVE_SOLUTION',
          //   solution: this.content
          // })
          this.$emit('test', this.content)
        }
        this.result = "File saved"
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    },
    onDebugStop () {
      this.debugMode = false
      if (this.language == this.languages.c_cpp) {
        this.sendDebugCommand('quit')
      } else if (this.language == this.languages.python) {
        this.sendDebugCommand('exit()')
        this.onDebugEnd()
      }
    },
    onCancel () {
      console.log('User cancelled the loader.')
    },
    displayLoading () {
      loader = this.$loading.show()
      setTimeout(() => {
        if (loader.isActive) {
          isTimeout = true
          this.onKillEvent()
          this.result = 'Event stopped due to timeout;\nYou could have an infinite loop or scanf in your code; (scanf is not allowed);'
        }
      }, 5000)
      return loader
    },
    setContent () {
      this.content = (!this.content || this.content.indexOf(this.defaultMesage) > -1) ? this.setDefaultContent() : this.content
    },
    setDefaultContent() {
      if (!this.isInvitation) {
        var localCode = this.$settings.getCode(this.language)
        if (localCode) {
          return localCode
        }
      }
      if (this.language == 'c_cpp') {
        var functionDetails = this.functions[0]
        var vars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
        var params = ''
        for (var i = 0; i < functionDetails.parameters.length; i++) {
          if (i != functionDetails.parameters.length - 1) {
            params += `${functionDetails.parameters[i].parameterType} ${vars[i]}, `
          } else {
            params += `${functionDetails.parameters[i].parameterType} ${vars[i]}`
          }
        }
        var code = `#include<stdio.h>
${functionDetails.returnType} ${functionDetails.name}(${params}) {
  
}

int main() {
  
}`
        return code
      }
      return '#Write your code here'
    }
    // onBeautifyEvent () {
    //   console.warn(beautify)
    //   beautify.beautify(this.editorReference.editor.getSession())
    // }
  },
  watch: {
    language: function (newLanguage, oldLanguage) {
      this.content = this.setDefaultContent()
      this.$settings.setLanguage(newLanguage)
    },
    theme: function (newTheme, oldTheme) {
      this.$settings.setTheme(newTheme)
    },
    isReadonly: function(n, o) {
      this.isReadonly = n
    }
  },
  props: {
    isReadonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    editor,
    Loading
  }
}
</script>

<style scoped>
.preferences {
  padding: 10px;
  background-color: aliceblue;
  margin-bottom: 0;
  border: 1px solid #dadadb;
}
.preferences select {
  background-color: azure;
  color: #000;
}
.buttons-area {
  width: 100%;
  border: 2px solid #dadadb;
  display: block;
}
.editor-border {
  width: 100%;
  background-color: aliceblue !important;
  border: 1px solid #dadadb;
  display: block;
}
.ace_editor {
  float: left;
}
</style>
