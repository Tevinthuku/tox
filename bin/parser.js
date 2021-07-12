// @flow

import { Token, type TokenType } from "./token";
import Expr from "./expr";
import Stmt from "./stmt";

type Reporter = {
  runtimeError: (token: Token, message: string) => void,
  tokenError: (token: Token, message: string) => void,
};

class Parser {
  current = 0;
  tokens: Token[];
  report: Reporter;
  constructor({ tokens, report }: Args) {
    this.tokens = tokens;
    this.report = report;
  }
  parse() {
    let statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }
  expression() {
    return this.assignment();
  }

  declaration() {
    try {
      if (this.match("FN")) return this.fn();
      if (this.match("LET")) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  fn() {
    const kind = "function";
    const name = this.consume("IDENTIFIER", "Expect " + kind + " name.");
    this.consume("LEFT_PAREN", "Expect '(' after " + kind + " name.");

    let parameters: Token[] = [];
    if (!this.check("RIGHT_PAREN")) {
      do {
        if (parameters.length > 255) {
          throw this.report.runtimeError(
            this.peek(),
            "Cannot have more than 255 parameters"
          );
        }
        parameters.push(this.consume("IDENTIFIER", "Expect parameter name"));
      } while (this.match("COMMA"));
    }

    this.consume("RIGHT_PAREN", "Expect ')' after parameters.");
    this.consume("LEFT_BRACE", "Expect '{' before " + kind + " body.");
    const body = this.block();
    return Stmt.Fn(name, parameters, body);
  }

  statement() {
    if (this.match("FOR")) return this.forStatement();
    if (this.match("IF")) return this.ifStatement();
    if (this.match("LOG")) return this.logStatement();
    if (this.match("RETURN")) return this.returnStatement();
    if (this.match("WHILE")) return this.whileStatement();
    if (this.match("DO")) return this.doStatement();
    if (this.match("LEFT_BRACE")) return new Stmt().Block(this.block());
    return this.expressionStatement();
  }

  doStatement() {
    this.consume("LEFT_BRACE", "Expect '{' after 'do'");
    return new Stmt().Block(this.block());
  }

  forStatement() {
    this.consume("LEFT_PAREN", "Expect '(' after 'for'.");
    let initializer;
    if (this.match("SEMICOLON")) {
      initializer = null;
    } else if (this.match("LET")) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check("SEMICOLON")) {
      condition = this.expression();
    }
    this.consume("SEMICOLON", "Expect ';' after loop condition.");
    let increment = null;
    if (!this.check("RIGHT_PAREN")) {
      increment = this.expression();
    }
    this.consume("RIGHT_PAREN", "Expect ')' after for clauses.");
    let body = this.statement();

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

  ifStatement() {
    this.consume("LEFT_PAREN", "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume("RIGHT_PAREN", "Expect ')' after if condition.");

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match("ELSE")) {
      elseBranch = this.statement();
    }

    return Stmt().If(condition, thenBranch, elseBranch);
  }

  logStatement() {
    const value = this.expression();
    this.consume("SEMICOLON", "Expect ';' after value.");
    return Stmt().Log(value);
  }

  varDeclaration() {
    const name = this.consume("IDENTIFIER", "Expect variable name.");
    let initializer = null;
    if (this.match("EQUAL")) {
      initializer = this.expression();
    }
    this.consume("SEMICOLON", "Expect ';' after variable declaration.");
    return Stmt.Let(name, initializer);
  }

  whileStatement() {
    this.consume("LEFT_PAREN", "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume("RIGHT_PAREN", "Expect ')' after condition.");
    const body = this.statement();
    return Stmt().While(condition, body);
  }

  returnStatement() {
    const keyword = this.previous();
    let value = null;
    if (!this.check("SEMICOLON")) {
      value = this.expression();
    }
    this.consume("SEMICOLON", "Expect ';' after return value.");
    return new Stmt().Return(keyword, value);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume("SEMICOLON", "Expect ';' after expression.");
    return Stmt().Expression(expr);
  }

  block() {
    let statements: Token[] = [];
    while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    this.consume("RIGHT_BRACE", "Expect '}' after block.");

    return statements;
  }

  assignment() {
    const expr = this.or();
    if (this.match("EQUAL")) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr && expr.isVariable) {
        const name = expr.name;
        return Expr().Assign(name, value);
      }

      throw this.report.tokenError(equals, "Invalid assignment target");
    }

    return expr;
  }

  or() {
    let expr = this.and();
    while (this.match("OR")) {
      const operator = this.previous();
      const right = this.and();
      expr = Expr().Logical(expr, operator, right);
    }

    return expr;
  }

  and() {
    let expr = this.equality();

    while (this.match("AND")) {
      const operator = this.previous();
      const right = this.equality();
      expr = Expr().Logical(expr, operator, right);
    }
    return expr;
  }

  equality() {
    let expr = this.comparison();
    while (this.match("BANG_EQUAL", "EQUAL_EQUAL")) {
      const operator = this.previous();
      const right = this.comparison();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.addition();
    while (this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = this.previous();
      const right = this.addition();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  addition() {
    let expr = this.multiplication();

    while (this.match("MINUS", "PLUS")) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  multiplication() {
    let expr = this.unary();
    while (this.match("SLASH", "STAR")) {
      const operator = this.previous();
      const right = this.unary();
      expr = Expr().Binary(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match("BANG", "MINUS")) {
      const operator = this.previous();
      const right = this.unary();
      return Expr().Unary(operator, right);
    }
    return this.call();
  }

  finishCall(calle) {
    let args = [];
    if (!this.check("RIGHT_PAREN")) {
      do {
        if (args.length > 255) {
          console.error("Cannot have more than 255 arguments");
        }
        args.push(this.expression());
      } while (this.match("COMMA"));
    }
    const paren = this.consume("RIGHT_PAREN", "Expect ')' after arguments.");
    return new Expr().Call(calle, paren, args);
  }

  call() {
    let expr = this.primary();

    while (true) {
      if (this.match("LEFT_PAREN")) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }
    return expr;
  }

  primary() {
    if (this.match("FALSE")) return Expr().Literal(false);
    if (this.match("TRUE")) return Expr().Literal(true);
    if (this.match("NIL")) return Expr().Literal(null);
    if (this.match("NUMBER", "STRING")) {
      return Expr().Literal(this.previous().literal);
    }
    if (this.match("IDENTIFIER")) return Expr().Variable(this.previous());

    if (this.match("LEFT_PAREN")) {
      const expr = this.expression();
      this.consume("RIGHT_PAREN", "Expect ')' after expression");
      return Expr().Grouping(expr);
    }

    this.report.tokenError(this.peek(), "Expect expression");
  }

  consume(token: TokenType, message: string) {
    if (this.check(token)) return this.advance();
    throw this.report.tokenError(this.peek(), message);
  }

  match(...types: Array<TokenType>) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === "EOF";
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type == "SEMICOLON") return;

      switch (this.peek().type) {
        case "LET":
        case "IF":
        case "WHILE":
        case "LOG":
        case "FOR":
        case "RETURN":
        case "FN":
          return;
      }

      this.advance();
    }
  }
}

type Args = {
  tokens: Token[],
  report: Reporter,
};

export function NewParser({ tokens, report }: Args) {
  const parser = new Parser({ tokens, report });

  return {
    parseTokens: parser.parse,
  };
}
