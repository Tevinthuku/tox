// @flow

import { Token } from "./token";

type LiteralValueType = boolean | string | null | number | void;
export interface VisitableExpression {
  +accept: (visitor: Visitor) => void;
}
interface Visitor {
  visitAssignmentExpression: (Assign) => void;
  visitLiteralExpression: (Literal) => void;
  visitVariableExpression: (Variable) => void;
  visitGroupingExpression: (Grouping) => void;
  visitCallExpression: (Call) => void;
  visitUnaryExpression: (Unary) => void;
  visitBinaryExpression: (Binary) => void;
  visitLogicalExpression: (Logical) => void;
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

  static Literal(value: LiteralValueType) {
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
  value: LiteralValueType;
  constructor(value: LiteralValueType) {
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
  value: any;
  constructor(name: Token, value: any) {
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
