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

export class Token {
  type: TokenType;
  lexeme: string;
  literal: null | string | number | void;
  line: number;
  constructor(
    type: TokenType,
    lexeme: string,
    literal: null | string | number | void,
    line: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return this.type + " " + this.lexeme + " " + (this.literal || "");
  }
}
