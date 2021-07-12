// @flow

import { Token, type TokenType } from "./token";
import Expr from "./expr";
import Stmt from "./stmt";

type Reporter = {
  runtimeError: (token: Token, message: string) => void,
  tokenError: (token: Token, message: string) => void,
};

type Args = {
  tokens: Array<Token> | Array<any>,
  report: Reporter,
};

export default function Parser({ tokens, report }: Args) {
  let current = 0;
  function parse() {
    let statements = [];
    while (!isAtEnd()) {
      statements.push(declaration());
    }

    return statements;
  }
  function expression() {
    return assignment();
  }

  function declaration() {
    try {
      if (match("FN")) return fn();
      if (match("LET")) return varDeclaration();
      return statement();
    } catch (error) {
      synchronize();
      return null;
    }
  }

  function fn() {
    const kind = "function";
    const name = consume("IDENTIFIER", "Expect " + kind + " name.");
    consume("LEFT_PAREN", "Expect '(' after " + kind + " name.");

    let parameters = [];
    if (!check("RIGHT_PAREN")) {
      do {
        if (parameters.length > 255) {
          report.runtimeError(peek(), "Cannot have more than 255 parameters");
        }
        parameters.push(consume("IDENTIFIER", "Expect parameter name"));
      } while (match("COMMA"));
    }

    consume("RIGHT_PAREN", "Expect ')' after parameters.");
    consume("LEFT_BRACE", "Expect '{' before " + kind + " body.");
    const body = block();
    return Stmt().Fn(name, parameters, body);
  }

  function statement() {
    if (match("FOR")) return forStatement();
    if (match("IF")) return ifStatement();
    if (match("LOG")) return logStatement();
    if (match("RETURN")) return returnStatement();
    if (match("WHILE")) return whileStatement();
    if (match("DO")) return doStatement();
    if (match("LEFT_BRACE")) return new Stmt().Block(block());
    return expressionStatement();
  }

  function doStatement() {
    consume("LEFT_BRACE", "Expect '{' after 'do'");
    return new Stmt().Block(block());
  }

  function forStatement() {
    consume("LEFT_PAREN", "Expect '(' after 'for'.");
    let initializer;
    if (match("SEMICOLON")) {
      initializer = null;
    } else if (match("LET")) {
      initializer = varDeclaration();
    } else {
      initializer = expressionStatement();
    }

    let condition = null;
    if (!check("SEMICOLON")) {
      condition = expression();
    }
    consume("SEMICOLON", "Expect ';' after loop condition.");
    let increment = null;
    if (!check("RIGHT_PAREN")) {
      increment = expression();
    }
    consume("RIGHT_PAREN", "Expect ')' after for clauses.");
    let body = statement();

    if (increment !== null) {
      body = Stmt().Block([body, new Stmt().Expression(increment)]);
    }

    if (condition == null) condition = new Expr().Literal(true);

    body = new Stmt().While(condition, body);

    if (initializer != null) {
      body = new Stmt().Block([initializer, body]);
    }
    return body;
  }

  function ifStatement() {
    consume("LEFT_PAREN", "Expect '(' after 'if'.");
    const condition = expression();
    consume("RIGHT_PAREN", "Expect ')' after if condition.");

    const thenBranch = statement();
    let elseBranch = null;
    if (match("ELSE")) {
      elseBranch = statement();
    }

    return Stmt().If(condition, thenBranch, elseBranch);
  }

  function logStatement() {
    const value = expression();
    consume("SEMICOLON", "Expect ';' after value.");
    return Stmt().Log(value);
  }

  function varDeclaration() {
    const name = consume("IDENTIFIER", "Expect variable name.");
    let initializer = null;
    if (match("EQUAL")) {
      initializer = expression();
    }
    consume("SEMICOLON", "Expect ';' after variable declaration.");
    return new Stmt().Let(name, initializer);
  }

  function whileStatement() {
    consume("LEFT_PAREN", "Expect '(' after 'while'.");
    const condition = expression();
    consume("RIGHT_PAREN", "Expect ')' after condition.");
    const body = statement();
    return Stmt().While(condition, body);
  }

  function returnStatement() {
    const keyword = previous();
    let value = null;
    if (!check("SEMICOLON")) {
      value = expression();
    }
    consume("SEMICOLON", "Expect ';' after return value.");
    return new Stmt().Return(keyword, value);
  }

  function expressionStatement() {
    const expr = expression();
    consume("SEMICOLON", "Expect ';' after expression.");
    return Stmt().Expression(expr);
  }

  function block() {
    let statements = [];
    while (!check("RIGHT_BRACE") && !isAtEnd()) {
      statements.push(declaration());
    }

    consume("RIGHT_BRACE", "Expect '}' after block.");

    return statements;
  }

  function assignment() {
    const expr = or();
    if (match("EQUAL")) {
      const equals = previous();
      const value = assignment();

      if (expr && expr.isVariable) {
        const name = expr.name;
        return Expr().Assign(name, value);
      }

      report.tokenError(equals, "Invalid assignment target");
    }

    return expr;
  }

  function or() {
    let expr = and();
    while (match("OR")) {
      const operator = previous();
      const right = and();
      expr = Expr().Logical(expr, operator, right);
    }

    return expr;
  }

  function and() {
    let expr = equality();

    while (match("AND")) {
      const operator = previous();
      const right = equality();
      expr = Expr().Logical(expr, operator, right);
    }
    return expr;
  }

  function equality() {
    let expr = comparison();
    while (match("BANG_EQUAL", "EQUAL_EQUAL")) {
      const operator = previous();
      const right = comparison();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  function comparison() {
    let expr = addition();
    while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = previous();
      const right = addition();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  function addition() {
    let expr = multiplication();

    while (match("MINUS", "PLUS")) {
      const operator = previous();
      const right = multiplication();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  function multiplication() {
    let expr = unary();
    while (match("SLASH", "STAR")) {
      const operator = previous();
      const right = unary();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  function unary() {
    if (match("BANG", "MINUS")) {
      const operator = previous();
      const right = unary();
      return Expr().Unary(operator, right);
    }
    return call();
  }

  function finishCall(calle) {
    let args = [];
    if (!check("RIGHT_PAREN")) {
      do {
        if (args.length > 255) {
          console.error("Cannot have more than 255 arguments");
        }
        args.push(expression());
      } while (match("COMMA"));
    }
    const paren = consume("RIGHT_PAREN", "Expect ')' after arguments.");
    return new Expr().Call(calle, paren, args);
  }

  function call() {
    let expr = primary();

    while (true) {
      if (match("LEFT_PAREN")) {
        expr = finishCall(expr);
      } else {
        break;
      }
    }
    return expr;
  }

  function primary() {
    if (match("FALSE")) return Expr().Literal(false);
    if (match("TRUE")) return Expr().Literal(true);
    if (match("NIL")) return Expr().Literal(null);
    if (match("NUMBER", "STRING")) {
      return Expr().Literal(previous().literal);
    }
    if (match("IDENTIFIER")) return Expr().Variable(previous());

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", "Expect ')' after expression");
      return Expr().Grouping(expr);
    }

    report.tokenError(peek(), "Expect expression");
  }

  function consume(token: TokenType, message: string) {
    if (check(token)) return advance();
    report.tokenError(peek(), message);
  }

  function match(...types: Array<TokenType>) {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }
    return false;
  }

  function check(type) {
    if (isAtEnd()) return false;
    return peek().type === type;
  }

  function advance() {
    if (!isAtEnd()) current++;
    return previous();
  }

  function isAtEnd() {
    return peek().type === "EOF";
  }

  function peek() {
    return tokens[current];
  }

  function previous() {
    return tokens[current - 1];
  }

  function synchronize() {
    advance();
    while (!isAtEnd()) {
      if (previous().type == "SEMICOLON") return;

      switch (peek().type) {
        case "LET":
        case "IF":
        case "WHILE":
        case "LOG":
        case "FOR":
        case "RETURN":
        case "FN":
          return;
      }

      advance();
    }
  }

  return {
    parse,
  };
}
