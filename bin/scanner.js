// @flow

import { Token, type TokenType } from "./token";

type ReportError = (line: number, message: string) => void;

class ScannerImpl {
  tokens: Token[] = [];
  start = 0;
  current = 0;
  line = 1;
  reportError: ReportError;
  source: string;

  keywords: { [string]: TokenType } = {
    and: "AND",
    or: "OR",
    else: "ELSE",
    false: "FALSE",
    for: "FOR",
    fn: "FN",
    nil: "NIL",
    log: "LOG",
    return: "RETURN",
    this: "THIS",
    true: "TRUE",
    while: "WHILE",
    let: "LET",
    if: "IF",
    do: "DO",
  };

  constructor(source: string, reportError: ReportError) {
    this.reportError = reportError;
    this.source = source;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token("EOF", "", null, this.line));
    return this.tokens;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken("LEFT_PAREN");
        break;
      case ")":
        this.addToken("RIGHT_PAREN");
        break;
      case "{":
        this.addToken("LEFT_BRACE");
        break;
      case "}":
        this.addToken("RIGHT_BRACE");
        break;
      case ",":
        this.addToken("COMMA");
        break;
      case ".":
        this.addToken("DOT");
        break;
      case "-":
        this.addToken("MINUS");
        break;
      case "+":
        this.addToken("PLUS");
        break;
      case ";":
        this.addToken("SEMICOLON");
        break;
      case "*":
        this.addToken("STAR");
        break;
      case "!":
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case "<":
        this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
        break;
      case ">":
        this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
        break;
      case "/":
        if (this.match("/")) {
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          while (this.stillInMultilineComment()) {
            if (this.peek() == "\n") this.line++;
            this.advance();
          }

          if (this.isUnterminatedMultilineComment()) {
            this.reportError(this.line, "Unterminated multiline comment.");
            break;
          }
          this.current += 2;
        } else {
          this.addToken("SLASH");
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default: {
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.reportError(this.line, "Unexpected character");
        }
      }
    }
  }

  isUnterminatedMultilineComment() {
    return this.isAtEnd();
  }

  stillInMultilineComment() {
    return (this.peek() != "*" || this.peekNext() != "/") && !this.isAtEnd();
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.substring(this.start, this.current);
    const trimmedText = text.trim();
    let type = this.keywords[text] || this.keywords[trimmedText];
    if (!type) type = "IDENTIFIER";
    this.addToken(type);
  }

  isAlpha(c: string) {
    return c === "_" || Boolean(c.match(/^[A-Za-z]+$/));
  }

  isAlphaNumeric(c) {
    return this.isDigit(c) || this.isAlpha(c);
  }

  isDigit(c) {
    return !isNaN(parseInt(c, 10));
  }

  number() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      "NUMBER",
      parseInt(this.source.substring(this.start, this.current))
    );
  }

  string() {
    while (this.peek() !== `"` && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.reportError(this.line, "Unterminated string.");
      return;
    }

    this.advance();

    const strValue = this.source.substring(this.start + 1, this.current - 1);
    this.addToken("STRING", strValue);
  }

  peek() {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  peekNext() {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current + 1);
  }

  advance() {
    this.current++;
    return this.source[this.current - 1];
  }

  addToken(type: TokenType, literal) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  match(c) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != c) return false;

    this.current++;
    return true;
  }
}

type Args = {
  source: string,
  reportError: ReportError,
};
export function NewScanner({ source, reportError }: Args) {
  const scanner = new ScannerImpl(source, reportError);

  return {
    scanTokens: scanner.scanTokens,
  };
}
