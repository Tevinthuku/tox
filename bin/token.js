// @flow

export type TokenType =
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
  | "LEFT_BRACE"
  | "RIGHT_BRACE"
  | "COMMA"
  | "DOT"
  | "MINUS"
  | "PLUS"
  | "SEMICOLON"
  | "SLASH"
  | "STAR"
  | "BANG"
  | "BANG_EQUAL"
  | "EQUAL"
  | "EQUAL_EQUAL"
  | "GREATER"
  | "GREATER_EQUAL"
  | "LESS"
  | "LESS_EQUAL"
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"
  | "AND"
  | "ELSE"
  | "FALSE"
  | "FN"
  | "FOR"
  | "IF"
  | "NIL"
  | "OR"
  | "LOG"
  | "RETURN"
  | "THIS"
  | "TRUE"
  | "LET"
  | "WHILE"
  | "DO"
  | "EOF";

export type TokenReturnType = {|
  lexeme: string,
  line: number,
  literal: ?(string | number),
  toString: () => string,
  type: TokenType,
|};

export function Token(
  type: TokenType,
  lexeme: string,
  literal: null | string | number | void,
  line: number
): TokenReturnType {
  function toString() {
    return type + " " + lexeme + " " + (literal || "");
  }

  return {
    type,
    lexeme,
    literal,
    line,
    toString,
  };
}
