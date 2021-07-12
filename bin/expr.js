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
export type VisitableExpression = { accept: (visitor: Visitor) => void };
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
    const accept = (visitor: Visitor) => {
      return visitor.visitBinaryExpression({ left, operator, right });
    };
    return { accept };
  }

  static Unary(operator: Token, right: VisitableExpression) {
    const accept = (visitor: Visitor) => {
      return visitor.visitUnaryExpression({ operator, right });
    };

    return { accept };
  }

  static Literal(value: LiteralValueType) {
    const accept = (visitor: Visitor) => {
      return visitor.visitLiteralExpression({ value });
    };

    return { accept };
  }

  static Grouping(expression: VisitableExpression) {
    const accept = (visitor: Visitor) => {
      return visitor.visitGroupingExpression({ expression });
    };

    return { accept };
  }

  static Variable(name: Token) {
    const accept = (visitor: Visitor) => {
      return visitor.visitVariableExpression({ name });
    };

    return { accept, isVariable: true, name };
  }

  static Assign(name: Token, value: any) {
    const accept = (visitor: Visitor) => {
      return visitor.visitAssignmentExpression({ name, value });
    };

    return { accept };
  }

  static Logical(
    left: VisitableExpression,
    operator: Token,
    right: VisitableExpression
  ) {
    const accept = (visitor: Visitor) => {
      return visitor.visitLogicalExpression({ left, operator, right });
    };

    return { accept };
  }

  static Call(
    calle: VisitableExpression,
    paren: Token,
    args: VisitableExpression[]
  ) {
    const accept = (visitor: Visitor) => {
      return visitor.visitCallExpression({ calle, paren, args });
    };

    return { accept };
  }
}
