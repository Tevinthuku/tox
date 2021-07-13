// @flow
import { Token } from "./token";

import { type VisitableExpression } from "./expr";

export interface VisitableStatement {
  +accept: (visitor: Visitor) => void;
}

interface Visitor {
  visitFunctionStatement({
    name: Token,
    params: Token[],
    body: VisitableStatement[],
  }): void;
  visitLetStatement({
    name: Token,
    initializer: VisitableExpression | null,
  }): void;
  visitExpressionStatement({ expression: VisitableExpression }): void;
  visitLogStatement({ expression: VisitableExpression }): void;
  visitBlockStatement({ statements: VisitableStatement[] }): void;
  visitIfStatement({
    condition: VisitableExpression,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement | null,
  }): void;
  visitWhileStatement({
    condition: VisitableExpression,
    body: VisitableStatement,
  }): void;
  visitReturnStatement({ value: VisitableExpression }): void;
}
export default class Statement {
  static Expression(expression: VisitableExpression) {
    return new ExpressionStatement(expression);
  }

  static Log(expression: VisitableExpression) {
    return new LogStatement(expression);
  }

  static Let(name: Token, initializer: VisitableExpression | null) {
    return new LetStatement(name, initializer);
  }

  static Block(statements: VisitableStatement[]) {
    return new BlockOfStatements(statements);
  }

  static If(
    condition: VisitableExpression,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement | null
  ) {
    return new IfStatement(condition, thenBranch, elseBranch);
  }

  static While(condition: VisitableExpression, body: VisitableStatement) {
    return new WhileStatement(condition, body);
  }

  static Fn(name: Token, params: Token[], body: VisitableStatement[]) {
    return new FunctionStatement(name, params, body);
  }

  static Return(value: VisitableExpression) {
    return new ReturnStatement(value);
  }
}

export class ExpressionStatement implements VisitableStatement {
  expression: VisitableExpression;
  constructor(expression: VisitableExpression) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitExpressionStatement({ expression: this.expression });
  }
}

export class LogStatement implements VisitableStatement {
  expression: VisitableExpression;
  constructor(expression: VisitableExpression) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitLogStatement({ expression: this.expression });
  }
}

export class LetStatement implements VisitableStatement {
  name: Token;
  initializer: VisitableExpression | null;
  constructor(name: Token, initializer: VisitableExpression | null) {
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
  condition: VisitableExpression;
  thenBranch: VisitableStatement;
  elseBranch: VisitableStatement | null;
  constructor(
    condition: VisitableExpression,
    thenBranch: VisitableStatement,
    elseBranch: VisitableStatement | null
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
  condition: VisitableExpression;
  body: VisitableStatement;
  constructor(condition: VisitableExpression, body: VisitableStatement) {
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
  body: VisitableStatement[];
  constructor(name: Token, params: Token[], body: VisitableStatement[]) {
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
  value: VisitableExpression;
  constructor(value: VisitableExpression) {
    this.value = value;
  }

  accept(visitor: Visitor) {
    return visitor.visitReturnStatement({ value: this.value });
  }
}
