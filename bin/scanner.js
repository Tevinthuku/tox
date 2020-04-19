// @flow

import { Token, type TokenType } from "./token";
import { type ToxReturnType } from "./tox";

export function Scanner({
  source,
  toxInstance,
}: {
  source: string,
  toxInstance: ToxReturnType,
}): {|
  scanTokens: () => Array<
    | any
    | {|
        lexeme: string,
        line: number,
        literal: null | string,
        toString: () => string,
        type: TokenType,
      |}
  >,
|} {
  let tokens = [];
  let start = 0;
  let current = 0;
  let line = 1;

  const keywords: { [string]: TokenType } = {
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
  };

  function scanTokens() {
    while (!isAtEnd()) {
      start = current;
      scanToken();
    }

    tokens.push(Token("EOF", "", null, line));
    return tokens;
  }

  function scanToken() {
    const c = advance();
    switch (c) {
      case "(":
        addToken("LEFT_PAREN");
        break;
      case ")":
        addToken("RIGHT_PAREN");
        break;
      case "{":
        addToken("LEFT_BRACE");
        break;
      case "}":
        addToken("RIGHT_BRACE");
        break;
      case ",":
        addToken("COMMA");
        break;
      case ".":
        addToken("DOT");
        break;
      case "-":
        addToken("MINUS");
        break;
      case "+":
        addToken("PLUS");
        break;
      case ";":
        addToken("SEMICOLON");
        break;
      case "*":
        addToken("STAR");
        break;
      case "!":
        addToken(match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        addToken(match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case "<":
        addToken(match("=") ? "LESS_EQUAL" : "LESS");
        break;
      case ">":
        addToken(match("=") ? "GREATER_EQUAL" : "GREATER");
        break;
      case "/":
        if (match("/")) {
          while (peek() !== "\n" && !isAtEnd()) advance();
        } else if (match("*")) {
          while ((peek() != "*" || peekNext() != "/") && !isAtEnd()) {
            if (peek() == "\n") line++;
            advance();
          }
          current += 2;
        } else {
          addToken("SLASH");
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        line++;
        break;
      case '"':
        string();
        break;
      default: {
        if (isDigit(c)) {
          number();
        } else if (isAlpha(c)) {
          identifier();
        } else {
          toxInstance.error(line, "Unexpected character");
        }
      }
    }
  }

  function identifier() {
    while (isAlphaNumeric(peek())) advance();
    const text = source.substring(start, current);
    const trimmedText = text.trim();
    let type = keywords[text] || keywords[trimmedText];
    if (!type) type = "IDENTIFIER";
    addToken(type);
  }

  function isAlpha(c: string) {
    return c === "_" || Boolean(c.match(/^[A-Za-z]+$/));
  }

  function isAlphaNumeric(c) {
    return isDigit(c) || isAlpha(c);
  }

  function isDigit(c) {
    return !isNaN(parseInt(c, 10));
  }

  function number() {
    while (isDigit(peek())) advance();

    if (peek() == "." && isDigit(peekNext())) {
      advance();

      while (isDigit(peek())) advance();
    }

    addToken("NUMBER", parseInt(source.substring(start, current)));
  }

  function string() {
    while (peek() !== `"` && !isAtEnd()) {
      if (peek() === "\n") line++;
      advance();
    }

    if (isAtEnd()) {
      toxInstance.error(line, "Unterminated string.");
      return;
    }

    advance();

    const strValue = source.substring(start + 1, current - 1);
    addToken("STRING", strValue);
  }

  function peek() {
    if (isAtEnd()) return "\0";
    return source.charAt(current);
  }

  function peekNext() {
    if (isAtEnd()) return "\0";
    return source.charAt(current + 1);
  }

  function advance() {
    current++;
    return source[current - 1];
  }

  function addToken(type: TokenType, literal) {
    const text = source.substring(start, current);
    tokens.push(Token(type, text, literal, line));
  }

  function isAtEnd() {
    return current >= source.length;
  }

  function match(c) {
    if (isAtEnd()) return false;
    if (source.charAt(current) != c) return false;

    current++;
    return true;
  }

  return {
    scanTokens,
  };
}
