// @flow

import { Token } from "./token";

export type ExpressionReturnType = mixed;
export interface VisitableExpression {
  +accept: (visitor: Visitor) => ExpressionReturnType;
}
interface Visitor {
  visitAssignmentExpression: (Assign) => ExpressionReturnType;
  visitLiteralExpression: (Literal) => ExpressionReturnType;
  visitVariableExpression: (Variable) => ExpressionReturnType;
  visitGroupingExpression: (Grouping) => ExpressionReturnType;
  visitCallExpression: (Call | Object) => ExpressionReturnType;
  visitUnaryExpression: (Unary) => ExpressionReturnType;
  visitBinaryExpression: (Binary) => ExpressionReturnType;
  visitLogicalExpression: (Logical) => ExpressionReturnType;
}

export default class Expression {
  static Binary(
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression
  ) {
    return new Binary(left, operator, right);
  }
  static Grouping(expression: VisitableExpression) {
    return new Grouping(expression);
  }

  static Literal(value: ExpressionReturnType) {
    return new Literal(value);
  }

  static Unary(operator: Token, right: VisitableExpression) {
    return new Unary(operator, right);
  }

  static Variable(name: Token) {
    return new Variable(name);
  }

  static Assign(name: Token, value: any) {
    return new Assign(name, value);
  }

  static Logical(
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression
  ) {
    return new Logical(left, operator, right);
  }

  static Call(
    calle: VisitableExpression,
    paren: Token,
    args: VisitableExpression[]
  ) {
    return new Call(calle, paren, args);
  }
}

export class Binary implements VisitableExpression {
  left: VisitableExpression;
  operator: Token;
  right: VisitableExpression;
  constructor(
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression
  ) {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }

  accept(visitor: Visitor) {
    return visitor.visitBinaryExpression(this);
  }
}

export class Unary implements VisitableExpression {
  operator: Token;
  right: VisitableExpression;
  constructor(operator: Token, right: VisitableExpression) {
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: Visitor) {
    return visitor.visitUnaryExpression(this);
  }
}

export class Literal implements VisitableExpression {
  value: ExpressionReturnType;
  constructor(value: ExpressionReturnType) {
    this.value = value;
  }

  accept(visitor: Visitor) {
    return visitor.visitLiteralExpression(this);
  }
}

export class Grouping implements VisitableExpression {
  expression: VisitableExpression;
  constructor(expression: VisitableExpression) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitGroupingExpression(this);
  }
}

export class Variable implements VisitableExpression {
  name: Token;
  constructor(name: Token) {
    this.name = name;
  }

  accept(visitor: Visitor) {
    return visitor.visitVariableExpression(this);
  }
}

export class Assign implements VisitableExpression {
  name: Token;
  value: VisitableExpression;
  constructor(name: Token, value: VisitableExpression) {
    this.name = name;
    this.value = value;
  }
  accept(visitor: Visitor) {
    return visitor.visitAssignmentExpression(this);
  }
}

export class Logical implements VisitableExpression {
  left: VisitableExpression;
  operator: Token;
  right: VisitableExpression;
  constructor(
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression
  ) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: Visitor) {
    return visitor.visitLogicalExpression(this);
  }
}

export class Call implements VisitableExpression {
  calle: VisitableExpression;
  paren: Token;
  args: VisitableExpression[];
  constructor(
    calle: VisitableExpression,
    paren: Token,
    args: VisitableExpression[]
  ) {
    this.calle = calle;
    this.paren = paren;
    this.args = args;
  }

  accept(visitor: Visitor) {
    return visitor.visitCallExpression(this);
  }
}
