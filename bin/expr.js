// @flow

import { Token } from "./token";

type VariableExpression = (name: any) => {|
  accept: (visitor: {
    visitVariableExpression: (any) => any,
  }) => any,
  isVariable: true,
  name: any,
|};

type AssignmentExpression = (
  name: any,
  value: any
) => {|
  accept: (visitor: {
    visitAssignmentExpression: (any) => any,
  }) => any,
|};

type LogicalExpression = (
  left: any,
  operator: any,
  right: any
) => {|
  accept: (visitor: {
    visitLogicalExpression: (any) => any,
  }) => any,
|};

type CallExpression = (
  calle: any,
  paren: any,
  args: any
) => {|
  accept: (visitor: {
    visitCallExpression: (any) => {
      arity: () => number,
    },
  }) => {
    arity: () => number,
  },
|};
export type ExprType = {|
  Binary: (left: any, operator: Token, right: any) => any,
  Unary: (operator: Token, right: any) => any,
  Literal: (value: any) => any,
  Grouping: (expr: any) => any,
  Variable: VariableExpression,
  Assign: AssignmentExpression,
  Logical: LogicalExpression,
  Call: CallExpression,
|};

type LiteralValueType = boolean | string | null | number | void;
export interface VisitableExpression {
  +accept: (visitor: Visitor) => void;
}
interface Visitor {
  visitAssignmentExpression: ({ name: Token, value: any }) => void;
  visitLiteralExpression: ({ value: LiteralValueType }) => void;
  visitVariableExpression: ({ name: Token }) => void;
  visitGroupingExpression: ({ expression: VisitableExpression }) => void;
  visitCallExpression: ({
    calle: VisitableExpression,
    paren: Token,
    args: VisitableExpression[],
  }) => void;
  visitUnaryExpression: ({
    operator: Token,
    right: VisitableExpression,
  }) => void;
  visitBinaryExpression: ({
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression,
  }) => void;
  visitLogicalExpression: ({
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression,
  }) => void;
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
    return visitor.visitBinaryExpression({
      left: this.left,
      operator: this.operator,
      right: this.right,
    });
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
    return visitor.visitUnaryExpression({
      operator: this.operator,
      right: this.right,
    });
  }
}

export class Literal implements VisitableExpression {
  value: LiteralValueType;
  constructor(value: LiteralValueType) {
    this.value = value;
  }

  accept(visitor: Visitor) {
    return visitor.visitLiteralExpression({ value: this.value });
  }
}

export class Grouping implements VisitableExpression {
  expression: VisitableExpression;
  constructor(expression: VisitableExpression) {
    this.expression = expression;
  }
  accept(visitor: Visitor) {
    return visitor.visitGroupingExpression({ expression: this.expression });
  }
}

export class Variable implements VisitableExpression {
  name: Token;
  constructor(name: Token) {
    this.name = name;
  }

  accept(visitor: Visitor) {
    return visitor.visitVariableExpression({ name: this.name });
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
    return visitor.visitAssignmentExpression({
      name: this.name,
      value: this.value,
    });
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
    return visitor.visitLogicalExpression({
      left: this.left,
      operator: this.operator,
      right: this.right,
    });
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
    return visitor.visitCallExpression({
      calle: this.calle,
      paren: this.paren,
      args: this.args,
    });
  }
}
