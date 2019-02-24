<template>
  <div>
    <editor
        v-model='content'
        @init='editorInit'
        lang='c_cpp'
        theme='twilight'
        width='100%'
        height='500px'
        :options='options'
        ref='editor'
        >
    </editor>
    <div v-if="!debugMode">
      <b-btn @click='onSaveEvent'>Save</b-btn>
      <b-btn @click='onRunEvent'>Run</b-btn>
      <b-btn @click='onCompileEvent'>Compile</b-btn>
      <b-btn @click='onDebugEvent'>Debug</b-btn>
      <b-btn @click='onKillEvent'>Kill</b-btn>
    </div>
    <div v-else>
      <b-btn @click='onDebugStart' :disabled="debugStarted">Start</b-btn>
      <b-btn @click='onDebugNext'>Next</b-btn>
      <b-btn @click='onDebugContinue'>Continue</b-btn>
      <b-btn @click='onDebugInfoLocals'>Info locals</b-btn>
      <b-btn @click='onDebugStop'>Stop</b-btn>
    </div>
    <editor
        v-model='result'
        @init='resultEditorInit'
        lang='text'
        theme='terminal'
        width='100%'
        height='200px'
        :readonly='true'
        ref='resultEditor'
        >
    </editor>
    <a href="/Problems">Go to problems</a>
  </div>
</template>

<script>
import editor from 'vue2-ace-editor'
import io from 'socket.io-client';
import brace from 'brace'
const Range = brace.acequire('ace/range').Range

const socket = io(process.env.SOCKET_SERVER);
var loader = { hide: () => { console.log('nothing') } }
var breakpoints = []
export default {
  data () {
    return {
      result: '',
      options: {
        enableBasicAutocompletion: true,
        showGutter: true
      },
      marker: null,
      debugMode: false,
      debugStarted: false,
      content: 'Here write',
      problemID: this.$route.params.id
    }
  },
  mounted () {
    socket.on('result', (cmdResult) => {
      this.result = cmdResult
      loader.hide()
    })
    socket.on('debugResult', (debugResult) => {
      var resultEditor = this.$refs.resultEditor.editor
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
      debugger
      var resultEditor = this.$refs.resultEditor.editor
      var editor = this.$refs.editor.editor
        if (this.marker) {
          editor.session.removeMarker(this.marker)
        }
        this.marker = editor.session.addMarker(new Range(lineNumber - 1, 0, lineNumber - 1, 10), 'myMarker', 'fullLine');
    })
    socket.on('debugFinished', () => {
      this.onDebugEnd()
    })
    this.content = this.$api.problem.getUserSolution() ? this.$api.problem.getUserSolution() : ''
  },
  methods: {
    editorInit () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')
      require('brace/mode/c_cpp')    //language
      require('brace/mode/less')
      require('brace/theme/twilight')
      require('brace/theme/terminal')
      require('brace/snippets/c_cpp') //snippet
      require('brace/ext/searchbox')
      require('brace/ext/spellcheck')
      require('brace/ext/error_marker')
      require('brace/keybinding/emacs')
      this.$refs.editor.editor.renderer.setShowGutter(false)

      var editor = this.$refs.editor.editor
      editor.on('guttermousedown', function(e) {
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
    onRunEvent () {
      loader = this.$loading.show()
      this.result = 'Running...'
      socket.emit('run', this.content)
    },
    onCompileEvent () {
      loader = this.$loading.show()
      this.result = 'Running...'
      socket.emit('compile', this.content)
    },
    onDebugEvent () {
      loader = this.$loading.show()
      this.result = ''
      this.debugMode = true
      socket.emit('debugStart', this.content)
    },
    onKillEvent () {
      socket.emit('killProcess')
    },
    sendDebugCommand (command) {
      if (!command) {
        // the command is sent from console
        var resultEditor = this.$refs.resultEditor.editor
        const lines = resultEditor.getSession().getValue().split('\n')
        command = lines[lines.length - 1]
      }
      socket.emit('debug', command);
    },
    onDebugStart () {
      this.debugStarted = true
      breakpoints.sort((a, b) => a > b)
      for (var i = 0; i < breakpoints.length; i++) {
        let cmd = `break ${breakpoints[i] + 1}`
        this.sendDebugCommand(cmd)
      }
      this.sendDebugCommand('run')
    },
    onDebugEnd () {
      this.debugMode = false
      this.debugStarted = false
      var editor = this.$refs.editor.editor
      if (this.marker) {
        editor.session.removeMarker(this.marker)
      }
    },
    onDebugNext () {
      this.sendDebugCommand('next')
    },
    onDebugContinue () {
      this.sendDebugCommand('continue')
    },
    onDebugInfoLocals () {
      this.sendDebugCommand('info locals')
    },
    async onSaveEvent () {
      let loader = this.$loading.show()
      try {
        console.log(this.content.indexOf('\n'))
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
      this.sendDebugCommand('Quit')
    }
  },
  components: {
    editor
  }
  // props: {
  //   // to do: find a better way to send this
  //   content: {
  //     type: String,
  //     default: 'Write your code here',
  //     required: false
  //   },
  //   problemID: {
  //     type: String,
  //     default: '',
  //     required: true
  //   }
  // }
}
</script>

<style scoped>
</style>
