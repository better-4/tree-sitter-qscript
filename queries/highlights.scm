["script" "endscript"] @keyword
["if" "elseif" "else" "endif" "switch" "case" "endswitch"] @keyword.conditional
["begin" "repeat"] @keyword.repeat
["random" "randomrange" "randompermute" "randomnorepeat"] @function.builtin

(script_def name: (identifier) @function)

(argument_list . (identifier) @function.call)

(named_arg key: (identifier) @property)

(comment) @comment
(string) @string
(param_string) @string
(number) @number
(placeholder) @variable.parameter
(forced_symbol) @symbol

["=" "," "@"] @operator
["(" ")" "[" "]" "{" "}" "<" ">"] @punctuation.bracket
