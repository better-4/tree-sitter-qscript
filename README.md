# tree-sitter-qscript

QScript grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

## Install (neovim)

```lua
vim.filetype.add({ extension = { q = "qscript" } })
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").qscript = {
    install_info = {
      url = "https://github.com/better-4/tree-sitter-qscript",
      revision = "4129d04c60fa46a23ed2b4e4b6309bf8b0f1f09c",
      queries = "queries",
    },
  }
  end,
})
vim.treesitter.language.register("qscript", { "qscript" })
```
