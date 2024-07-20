import globals from "globals";
import pluginJs from "@eslint/js";
import stylisticJs from '@stylistic/eslint-plugin-js'


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  {
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/indent': ['error', 2]  
    }
  },
  pluginJs.configs.recommended,
];