// @flow
import { Token } from "./token";

export interface VisitableStatement {
  +accept: (visitor: Visitor) => void;
}

interface Visitor {
  visitFunctionStatement({
    name: Token,
    params: Token[],
    body: Token[],
  }): void;
  visitLetStatement({
    name: Token,
    initializer: VisitableStatement,
  }): void;
  visitExpressionStatement({ expression: VisitableStatement }): void;
  visitLogStatement({ expression: VisitableStatement }): void;
  visitBlockStatement({ statements: VisitableStatement[] }): void;
  visitIfStatement({
    condition: VisitableStatement,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement,
  }): void;
  visitWhileStatement({
    condition: VisitableStatement,
    body: VisitableStatement,
  }): void;
  visitReturnStatement({ value: VisitableStatement }): void;
}
export default class Statement {
  static Expression(expression: VisitableStatement) {
    return new ExpressionStatement(expression);
  }

  static Log(expression: VisitableStatement) {
    return new LogStatement(expression);
  }

  static Let(name: Token, initializer: VisitableStatement) {
    return new LetStatement(name, initializer);
  }

  static Block(statements: VisitableStatement[]) {
    return new BlockOfStatements(statements);
  }

  static If(
    condition: VisitableStatement,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement
  ) {
    return new IfStatement(condition, thenBranch, elseBranch);
  }

  static While(condition: VisitableStatement, body: VisitableStatement) {
    return new WhileStatement(condition, body);
  }

  static Fn(name: Token, params: Token[], body: Token[]) {
    return new FunctionStatement(name, params, body);
  }

  static Return(value: VisitableStatement) {
    return new ReturnStatement(value);
  }
}

export class ExpressionStatement implements VisitableStatement {
  expression: VisitableStatement;
  constructor(expression: VisitableStatement) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitExpressionStatement({ expression: this.expression });
  }
}

export class LogStatement implements VisitableStatement {
  expression: VisitableStatement;
  constructor(expression: VisitableStatement) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitLogStatement({ expression: this.expression });
  }
}

export class LetStatement implements VisitableStatement {
  name: Token;
  initializer: VisitableStatement;
  constructor(name: Token, initializer: VisitableStatement) {
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor: Visitor) {
    return visitor.visitLetStatement({
      name: this.name,
      initializer: this.initializer,
    });
  }
}

export class BlockOfStatements implements VisitableStatement {
  statements: VisitableStatement[];
  constructor(statements: VisitableStatement[]) {
    this.statements = statements;
  }

  accept(visitor: Visitor) {
    return visitor.visitBlockStatement({ statements: this.statements });
  }
}

export class IfStatement implements VisitableStatement {
  condition: VisitableStatement;
  thenBranch: VisitableStatement;
  elseBranch: VisitableStatement;
  constructor(
    condition: VisitableStatement,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement
  ) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor: Visitor) {
    return visitor.visitIfStatement({
      condition: this.condition,
      thenBranch: this.thenBranch,
      elseBranch: this.elseBranch,
    });
  }
}

export class WhileStatement implements VisitableStatement {
  condition: VisitableStatement;
  body: VisitableStatement;
  constructor(condition: VisitableStatement, body: VisitableStatement) {
    this.condition = condition;
    this.body = body;
  }
  accept(visitor: Visitor) {
    return visitor.visitWhileStatement({
      condition: this.condition,
      body: this.body,
    });
  }
}

export class FunctionStatement implements VisitableStatement {
  name: Token;
  params: Token[];
  body: Token[];
  constructor(name: Token, params: Token[], body: Token[]) {
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept(visitor: Visitor) {
    return visitor.visitFunctionStatement({
      name: this.name,
      params: this.params,
      body: this.body,
    });
  }
}

export class ReturnStatement implements VisitableStatement {
  value: VisitableStatement;
  constructor(value: VisitableStatement) {
    this.value = value;
  }

  accept(visitor: Visitor) {
    return visitor.visitReturnStatement({ value: this.value });
  }
}
