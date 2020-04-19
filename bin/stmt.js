// @flow
import type { TokenReturnType } from "./token";

export type StmtType = {|
  Expression: (
    expression: any
  ) => {|
    accept: (visitor: {
      visitExpressionStatement: (any) => any,
    }) => any,
  |},
  Log: (
    expression: any
  ) => {|
    accept: (visitor: {
      visitLogStatement: (any) => any,
    }) => any,
  |},
  Let: (
    name: any,
    initializer: any
  ) => {|
    accept: (visitor: {
      visitLetStatement: (any) => any,
    }) => any,
  |},
  Block: (
    statements: Array<Object>
  ) => {|
    accept: (visitor: {
      visitBlockStatement: (any) => any,
    }) => any,
  |},
  If: (
    condition: any,
    thenBranch: any,
    elseBranch: any
  ) => {|
    accept: (visitor: { visitIfStatement: (any) => any }) => any,
  |},
  While: (
    condition: any,
    body: any
  ) => {|
    accept: (visitor: {
      visitWhileStatement: (any) => any,
    }) => any,
  |},
  Fn: (
    name: any,
    params: any,
    body: any
  ) => {|
    accept: (visitor: {
      visitFunctionStatement: (any) => any,
    }) => any,
  |},
  Return: (
    keyword: any,
    value: any
  ) => {|
    accept: (visitor: {
      visitReturnStatement: (any) => any,
    }) => any,
  |},
|};
export default function Stmt(): StmtType {
  function Expression(expression: any) {
    const accept = (visitor: { visitExpressionStatement: (Object) => any }) => {
      return visitor.visitExpressionStatement({ expression });
    };

    return { accept };
  }

  function Log(expression: any) {
    const accept = (visitor: { visitLogStatement: (Object) => any }) => {
      return visitor.visitLogStatement({ expression });
    };

    return { accept };
  }

  function Let(name: any, initializer: any) {
    const accept = (visitor: { visitLetStatement: (any) => any }) => {
      return visitor.visitLetStatement({ name, initializer });
    };

    return { accept };
  }

  function Block(statements) {
    const accept = (visitor: { visitBlockStatement: (any) => any }) => {
      return visitor.visitBlockStatement({ statements });
    };

    return { accept };
  }

  function If(condition: any, thenBranch: any, elseBranch: any) {
    const accept = (visitor: { visitIfStatement: (any) => any }) => {
      return visitor.visitIfStatement({ condition, thenBranch, elseBranch });
    };

    return { accept };
  }

  function While(condition: any, body: any) {
    const accept = (visitor: { visitWhileStatement: (any) => any }) => {
      return visitor.visitWhileStatement({ condition, body });
    };

    return { accept };
  }

  function Fn(name: any, params: any, body: any) {
    const accept = (visitor: { visitFunctionStatement: (any) => any }) => {
      return visitor.visitFunctionStatement({ name, params, body });
    };

    return { accept };
  }

  function Return(keyword, value) {
    const accept = (visitor: { visitReturnStatement: (any) => any }) => {
      return visitor.visitReturnStatement({ keyword, value });
    };

    return { accept };
  }

  return { Expression, Log, Let, Block, If, While, Fn, Return };
}
