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
        <b-btn @click='onSaveEvent' v-if="!this.loadedAlone" variant="primary">Save</b-btn>
        <b-btn @click='onCompileEvent' v-if="language !== this.languages.python" variant="primary">Compile</b-btn>
        <b-btn @click='onRunEvent' variant="success">Run</b-btn>
        <!-- <b-btn @click='onDebugEvent'>Debug</b-btn> -->
        <b-btn @click='onDebugEvent' variant="danger"><span class="glyphicon glyphicon-share-alt"></span>Debug mode</b-btn>
        <!-- <b-btn @click="onBeautifyEvent">Beautify</b-btn> -->
        <b-btn @click='onTestEvent' v-if="language !== this.languages.python && !this.loadedAlone" variant="primary">Test</b-btn>
        <b-btn @click='onKillEvent'>Kill</b-btn>
      </div>
      <div v-else class="buttons-area">
        <b-btn @click='onDebugStart' :disabled="debugStarted">Start</b-btn>
        <b-btn @click='onDebugNext'>Next</b-btn>
        <b-btn @click='onDebugContinue'>Continue</b-btn>
        <b-btn @click='onDebugInfoLocals'>Info locals</b-btn>
        <b-btn @click='onDebugStop'>Stop</b-btn>
      </div>
    </center>
    <div class="editor-border">
      <editor
          v-model='result'
          @init='resultEditorInit'
          lang='batchfile'
          :theme='theme'
          :width='debugMode ? "49%" : "100%"'
          height='200px'
          :readonly='true'
          ref='resultEditor'
          >
      </editor>
      <!-- <editor
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
      </editor> -->
    </div>
  </div>
</template>

<script>
import editor from 'vue2-ace-editor'
import io from 'socket.io-client'
import brace from 'brace'
import jwt from 'jsonwebtoken'
const SECRET_KEY = '1@CNC@Debug1#'

const Range = brace.acequire('ace/range').Range

var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
var token = jwt.sign({date: utc}, SECRET_KEY);

const socket = io(process.env.SOCKET_SERVER, {
  query: {token: token}
});
const socketErrorMessage = `It seems like there is an error with the compiler.
Please refresh the page.
If the error persists try again later. Thank you!`

var loader = { hide: () => { console.log('nothing') } }
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
      content: 'Write your code here',
      functions: [],
      problemID: this.$route.params.id,
      languages: {
        c_cpp: 'c_cpp',
        python: 'python'
      },
      language: 'c_cpp',
      editorReference: '',
      resultEditorReference: '',
      loadedAlone: true,
      theme: 'dawn'
    }
  },
  mounted () {
    // if (this.$userID) {
    //   this.content = this.$api.problem.getUserSolution() ? this.$api.problem.getUserSolution() : ''
    //   this.functions = this.$api.problem.getProblemFunctions() ? this.$api.problem.getProblemFunctions() : {}
    // }
    this.setListeners()
    this.editorReference = this.$refs.editor
    this.resultEditorReference = this.$refs.resultEditor
    console.warn(`reference is: ${this.editorReference.editor}`)
  },
  methods: {
    setListeners () {
      socket.on('result', (cmdResult) => {
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
        var resultEditor = this.resultEditorReference.editor
        var n = resultEditor.getSession().getValue().split('\n').length;
        if (debugResult.trim().length != 0) {
          this.result += (n > 1 ? '\n' : '') + debugResult.trim() + '\n'
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
      var subscription = this.$subject.subscribe({
        next: (sender) => {
          if (sender.type == 'EDITOR') {
            console.log('--I received the problems--')
            this.content = sender.userSolution
            this.functions = sender.testFunctions
            this.loadedAlone = false
            subscription.unsubscribe()
          }
        }
      })
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
    },
    async onRunEvent () {
      // await this.onSaveEvent()
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      loader = this.$loading.show()
      this.result = 'Running...'
      socket.emit('run', { code: this.content, language: this.language })
    },
    async onCompileEvent () {
      // await this.onSaveEvent()
       if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      loader = this.$loading.show()
      this.result = 'Running...'
      socket.emit('compile', { code: this.content, language: this.language })
    },
    onDebugEvent () {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      loader = this.$loading.show()
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
      if (this.language == this.languages.c_cpp) {
        this.sendDebugCommand('info locals')
      } else if (this.language == this.languages.python) {
        this.sendDebugCommand('locals()')
      }
    },
    onTestEvent () {
      if (!socket.connected) {
        this.result = socketErrorMessage
        return
      }
      loader = this.$loading.show()
      this.result = ''
      socket.emit('test', this.functions[0], this.content)
    },
    async onSaveEvent () {
      // this.editorReference.editor.getSession().setAnnotations([{
      //   row: 1,
      //   column: 0,
      //   text: "Error Message", // Or the Json reply from the parser 
      //   type: "error" // also "warning" and "information"
      // }]);
      let loader = this.$loading.show()
      try {
        //  const contentToSend = this.content.replace('\n', '\\n')
        let contentToSend = this.content.split('\n').join('\\n')
        contentToSend = contentToSend.split('"').join('\\\"')
        await this.$api.problem.saveProblemSolution(this.problemID, this.$userID, `${contentToSend}`)
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
    }
    // onBeautifyEvent () {
    //   console.warn(beautify)
    //   beautify.beautify(this.editorReference.editor.getSession())
    // }
  },
  components: {
    editor
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
</style>
