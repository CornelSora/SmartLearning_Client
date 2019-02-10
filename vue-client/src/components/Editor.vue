<template>
  <div>
    <editor
        v-model="content"
        @init="editorInit"
        lang="c_cpp"
        theme="twilight"
        width="100%"
        height="500px"
        :options="options"
        ref="editor"
        >
    </editor>
    <b-btn @click="onRunEvent">Run</b-btn>
    <b-btn @click="onCompileEvent">Compile</b-btn>
    <b-btn @click="onDebugEvent">Debug</b-btn>
    <editor
        v-model="result"
        @init="resultEditorInit"
        lang="text"
        theme="chrome"
        width="100%"
        height="200px"
        :readonly="true"
        ref="resultEditor"
        >
    </editor>
  </div>
</template>

<script>
import editor from 'vue2-ace-editor'
import io from 'socket.io-client';
const socket = io('http://localhost:8081');
var loader = { hide: () => { console.log("nothing") } }

export default {
  data () {
    return {
      content: `#include<stdio.h>
int main() {
    printf("Something");
}`,
      result: '',
      options: {
        enableBasicAutocompletion: true,
        showGutter: true
      }
    }
  },
  mounted () {
    socket.on('result', (cmdResult) => {
      this.result = cmdResult
      loader.hide()
    })
    socket.on('debugResult', (debugResult) => {
      this.result += debugResult + '\n'
      var resultEditor = this.$refs.resultEditor.editor
      var n = resultEditor.getSession().getValue().split("\n").length;
      resultEditor.focus()
      resultEditor.gotoLine(n + 1, 0, true)
      resultEditor.focus()
      loader.hide()
    })
  },
  methods: {
    editorInit () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')                
      require('brace/mode/c_cpp')    //language
      require('brace/mode/less')
      require('brace/theme/twilight')
      require('brace/theme/chrome')
      require('brace/snippets/c_cpp') //snippet
      require('brace/ext/searchbox')
      require('brace/ext/spellcheck')
      require('brace/ext/error_marker')
      require('brace/keybinding/emacs')
      this.$refs.editor.editor.renderer.setShowGutter(false)

      var editor = this.$refs.editor.editor
      editor.on("guttermousedown", function(e) {
        var target = e.domEvent.target;        
        if (target.className.indexOf("ace_gutter-cell") == -1) {
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
        console.warn(breakpointsArray)
        if(!(row in breakpointsArray)) {
          e.editor.session.setBreakpoint(row)
        } else {
          e.editor.session.clearBreakpoint(row)
        }
        e.stop()
      });
    },
    resultEditorInit () {
      var resultEditor = this.$refs.resultEditor.editor
      resultEditor.commands.on("exec", function(e) {
        if (e.command.readOnly)
            return;
        var editableRow = resultEditor.session.getLength() - 1;
        var deletesLeft = e.command.name == "backspace" || e.command.name == "removewordleft";
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
        if (e.code == "Enter") {
          this.sendDebugCommand()
          e.preventDefault()
        }
      }
    },
    onRunEvent () {
      loader = this.$loading.show()
      this.result = "Running..."
      socket.emit("run", this.content)
    },
    onCompileEvent () {
      loader = this.$loading.show()
      this.result = "Running..."
      socket.emit("compile", this.content)      
    },
    onDebugEvent () {
      loader = this.$loading.show()
      this.result = ""
      socket.emit("debugStart")
    },
    sendDebugCommand () {
      var resultEditor = this.$refs.resultEditor.editor      
      const lines = resultEditor.getSession().getValue().split("\n")
      const lastCommand = lines[lines.length - 1]
      socket.emit('debug', lastCommand);
    }
  },
  components: {
    editor
  }
}
</script>

<style scoped>
</style>
