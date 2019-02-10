<template>
    <editor
        v-model="content"
        @init="editorInit"
        lang="c_cpp"
        theme="chrome"
        width="100%"
        height="500px"
        :options="options"
        >
    </editor>
</template>

<script>
import editor from 'vue2-ace-editor'
export default {
  data () {
    return {
      content: `#include<stdio.h>
int main() {
    printf("Something");
}`,
      options: {
        enableBasicAutocompletion: true,
        showGutter: true
      }
    }
  },
  mounted () {

  },
  methods: {
    editorInit () {
        require('brace/ext/language_tools') //language extension prerequsite...
        require('brace/mode/html')                
        require('brace/mode/c_cpp')    //language
        require('brace/mode/less')
        require('brace/theme/chrome')
        require('brace/snippets/c_cpp') //snippet
        require('brace/ext/searchbox')
        require('brace/ext/spellcheck')
        require('brace/ext/error_marker')
        require('brace/keybinding/emacs')
    }
  },
  components: {
    editor,
  }
}
</script>

<style>
.ace_gutter-cell.ace_breakpoint{ 
  border-radius: 20px 0px 0px 20px; 
  box-shadow: 0px 0px 1px 1px red inset; 
}
</style>
