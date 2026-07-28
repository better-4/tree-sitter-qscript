module.exports = grammar({
  name: 'qscript',

  word: $ => $.identifier,

  extras: $ => [
    /[ \t\r]/,
    $.comment,
  ],

  conflicts: $ => [
    [$._expr, $.index_expr],
    [$._argument, $.paren_expr],
  ],

  rules: {
    source_file: $ => optional($._block_body),

    // A trailing statement need not end in its own newline when a reserved
    // closing keyword (endif/endscript/endswitch/case/elseif/else/repeat)
    // immediately follows it on the same line. Must not itself match the
    // empty string (tree-sitter forbids that for non-start rules), so
    // callers wrap it in `optional(...)`.
    _block_body: $ => choice(
      seq(repeat1($._statement), optional($.argument_list)),
      $.argument_list,
    ),

    comment: $ => token(choice(
      seq(';', /[^\n]*/),
      seq('//', /[^\n]*/),
    )),

    _newline: $ => /\n+/,

    _statement: $ => choice(
      $._newline,
      $.script_def,
      $.if_stmt,
      $.loop_stmt,
      $.switch_stmt,
      seq($.argument_list, $._newline),
    ),

    switch_stmt: $ => seq(
      'switch', field('subject', $.argument_list), $._newline,
      repeat($.case_clause),
      'endswitch',
    ),

    case_clause: $ => seq(
      'case', field('value', $.argument_list), $._newline,
      optional($._block_body),
    ),

    loop_stmt: $ => seq(
      'begin', $._newline,
      optional($._block_body),
      'repeat', optional(field('count', $.argument_list)), $._newline,
    ),

    script_def: $ => seq(
      'script', field('name', $.identifier), optional(field('params', $.argument_list)), $._newline,
      optional($._block_body),
      'endscript',
    ),

    if_stmt: $ => seq(
      'if', field('condition', $.argument_list), $._newline,
      optional($._block_body),
      repeat($.elseif_clause),
      optional($.else_clause),
      'endif',
    ),

    elseif_clause: $ => seq(
      'elseif', field('condition', $.argument_list), $._newline,
      optional($._block_body),
    ),

    else_clause: $ => seq(
      'else', $._newline,
      optional($._block_body),
    ),

    argument_list: $ => repeat1($._argument),

    _argument: $ => choice(
      $.named_arg,
      $._expr,
    ),

    named_arg: $ => seq(
      field('key', $._expr),
      '=', optional($._newline),
      field('value', $._expr),
    ),

    _expr: $ => choice(
      $.qualified_identifier,
      $.identifier,
      $.number,
      $.string,
      $.param_string,
      $.forced_symbol,
      $.vector,
      $.paren_expr,
      $.array,
      $.struct,
      $.placeholder,
      $.random_expr,
      $.index_expr,
    ),

    placeholder: $ => seq('<', /[^<>\n]*/, '>'),

    index_expr: $ => seq(
      field('array', choice($.identifier, $.placeholder)),
      '[', field('index', $._expr), ']',
    ),

    random_expr: $ => seq(
      choice('random', 'randomrange', 'randompermute', 'randomnorepeat'),
      '(',
      choice(
        seq($.number, ',', $.number),
        seq(repeat($._newline), repeat1($.random_option)),
      ),
      ')',
    ),

    // A single @-prefixed option can continue across several lines, may be
    // empty (`@ )`), and may contain full nested statements (e.g. if/endif),
    // not just bare arguments. It only ends at the next '@' or the ')'.
    random_option: $ => seq('@', optional($._block_body)),

    vector: $ => seq(
      '(', $.number, ',', $.number, optional(seq(',', $.number)), ')',
    ),

    paren_expr: $ => seq(
      '(',
      choice(
        seq($._expr, repeat1(seq($.op, $._expr))),
        $.argument_list,
      ),
      ')',
    ),

    op: $ => choice('+', '-', '*', '/', '<=', '>=', '<', '>', 'or', 'and', '.'),

    qualified_identifier: $ => seq(
      field('scope', choice($.identifier, $.placeholder)),
      ':', field('name', $.identifier),
    ),

    array: $ => seq('[', repeat(choice($._argument, $._newline)), ']'),

    struct: $ => seq('{', repeat(choice($._argument, $._newline)), '}'),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    number: $ => /-?[0-9]+(\.[0-9]+)?/,

    string: $ => token(seq('"', repeat(choice(/[^"\\]/, seq('\\', /./))), '"')),

    param_string: $ => token(seq("'", repeat(choice(/[^'\\]/, seq('\\', /./))), "'")),

    forced_symbol: $ => seq('#', choice($.identifier, $.string)),
  }
});
