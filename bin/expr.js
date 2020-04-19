// @flow

import type { TokenReturnType } from "./token";

export type ExprType = {|
  Binary: (left: any, operator: TokenReturnType, right: any) => any,
  Unary: (operator: TokenReturnType, right: any) => any,
  Literal: (value: any) => any,
  Grouping: (expr: any) => any,
  Variable: (
    name: any
  ) => {|
    accept: (visitor: {
      visitVariableExpression: (any) => any,
    }) => any,
    isVariable: true,
    name: any,
  |},
  Assign: (
    name: any,
    value: any
  ) => {|
    accept: (visitor: {
      visitAssignmentExpression: (any) => any,
    }) => any,
  |},
  Logical: (
    left: any,
    operator: any,
    right: any
  ) => {|
    accept: (visitor: {
      visitLogicalExpression: (any) => any,
    }) => any,
  |},
  Call: (
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
  |},
|};
export default function Expr(): ExprType {
  function Binary(left: any, operator: TokenReturnType, right: any) {
    const accept = (visitor: { visitBinaryExpression: (Object) => any }) => {
      return visitor.visitBinaryExpression({ left, operator, right });
    };
    return { accept };
  }

  function Unary(operator: TokenReturnType, right: any) {
    const accept = (visitor: { visitUnaryExpression: (Object) => any }) => {
      return visitor.visitUnaryExpression({ operator, right });
    };

    return { accept };
  }

  function Literal(value: any) {
    const accept = (visitor: { visitLiteralExpression: (Object) => any }) => {
      return visitor.visitLiteralExpression({ value });
    };

    return { accept };
  }

  function Grouping(expression: any) {
    const accept = (visitor: { visitGroupingExpression: (Object) => any }) => {
      return visitor.visitGroupingExpression({ expression });
    };

    return { accept };
  }

  function Variable(name: any) {
    const accept = (visitor: { visitVariableExpression: (Object) => any }) => {
      return visitor.visitVariableExpression({ name });
    };

    return { accept, isVariable: true, name };
  }

  function Assign(name, value) {
    const accept = (visitor: {
      visitAssignmentExpression: (Object) => any,
    }) => {
      return visitor.visitAssignmentExpression({ name, value });
    };

    return { accept };
  }

  function Logical(left: any, operator: any, right: any) {
    const accept = (visitor: { visitLogicalExpression: (Object) => any }) => {
      return visitor.visitLogicalExpression({ left, operator, right });
    };

    return { accept };
  }

  function Call(calle: any, paren: any, args: any) {
    const accept = (visitor: {
      visitCallExpression: (Object) => {
        arity: () => number,
      },
    }) => {
      return visitor.visitCallExpression({ calle, paren, args });
    };

    return { accept };
  }

  return { Binary, Unary, Literal, Grouping, Variable, Assign, Logical, Call };
}
