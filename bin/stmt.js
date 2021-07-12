// @flow
import { Token } from "./token";

type ExpressionStatement = (expression: any) => {|
  accept: (visitor: {
    visitExpressionStatement: (any) => any,
  }) => any,
|};

type LogStatement = (expression: any) => {|
  accept: (visitor: {
    visitLogStatement: (any) => any,
  }) => any,
|};

type LetStatement = (
  name: any,
  initializer: any
) => {|
  accept: (visitor: {
    visitLetStatement: (any) => any,
  }) => any,
|};

type BlockStatement = (statements: Array<Object>) => {|
  accept: (visitor: {
    visitBlockStatement: (any) => any,
  }) => any,
|};

type IfStatement = (
  condition: any,
  thenBranch: any,
  elseBranch: any
) => {|
  accept: (visitor: { visitIfStatement: (any) => any }) => any,
|};

type WhileStatement = (
  condition: any,
  body: any
) => {|
  accept: (visitor: {
    visitWhileStatement: (any) => any,
  }) => any,
|};

type FnStatement = (
  name: any,
  params: any,
  body: any
) => {|
  accept: (visitor: {
    visitFunctionStatement: (any) => any,
  }) => any,
|};

type ReturnStatement = (
  keyword: any,
  value: any
) => {|
  accept: (visitor: {
    visitReturnStatement: (any) => any,
  }) => any,
|};
export type StmtType = {|
  Expression: ExpressionStatement,
  Log: LogStatement,
  Let: LetStatement,
  Block: BlockStatement,
  If: IfStatement,
  While: WhileStatement,
  Fn: FnStatement,
  Return: ReturnStatement,
|};

interface Visitor {
  visitFunctionStatement({
    name: Token,
    params: Token[],
    body: Token[],
  }): void;
}
export default class Stmt {
  static Expression(expression: any) {
    const accept = (visitor: { visitExpressionStatement: (Object) => any }) => {
      return visitor.visitExpressionStatement({ expression });
    };

    return { accept };
  }

  static Log(expression: any) {
    const accept = (visitor: { visitLogStatement: (Object) => any }) => {
      return visitor.visitLogStatement({ expression });
    };

    return { accept };
  }

  static Let(name: any, initializer: any) {
    const accept = (visitor: { visitLetStatement: (any) => any }) => {
      return visitor.visitLetStatement({ name, initializer });
    };

    return { accept };
  }

  static Block(statements: Token[]) {
    const accept = (visitor: { visitBlockStatement: (any) => any }) => {
      return visitor.visitBlockStatement({ statements });
    };

    return { accept };
  }

  static If(condition: any, thenBranch: any, elseBranch: any) {
    const accept = (visitor: { visitIfStatement: (any) => any }) => {
      return visitor.visitIfStatement({ condition, thenBranch, elseBranch });
    };

    return { accept };
  }

  static While(condition: any, body: any) {
    const accept = (visitor: { visitWhileStatement: (any) => any }) => {
      return visitor.visitWhileStatement({ condition, body });
    };

    return { accept };
  }

  static Fn(name: Token, params: Token[], body: Token[]) {
    const accept = (visitor: Visitor) => {
      return visitor.visitFunctionStatement({ name, params, body });
    };

    return { accept };
  }

  static Return(keyword, value) {
    const accept = (visitor: { visitReturnStatement: (any) => any }) => {
      return visitor.visitReturnStatement({ keyword, value });
    };

    return { accept };
  }
}
