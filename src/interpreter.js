// @flow
import Environment, { type EnvironmentType } from "./environment";

import { type TokenType, Token } from "./token";
import loxFunction, { type DeclarationType } from "./toxfunction";

export type InterpreterReturnType = {|
  interpret: (statements: Array<{ +accept: (any) => void }>) => void,
|};

type SupportedTypes = string | boolean | number;

type InterPreterFunctions = {
  visitLiteralExpression: (expr: { value: mixed }) => any,
  visitUnaryExpression: (expr: {
    operator: Token,
    right: GenericAcceptObject<mixed>,
  }) => null | number | boolean,
  visitVariableExpression: (expr: { name: Token }) => any | void,
  visitGroupingExpression: (expr: {
    expression: GenericAcceptObject<mixed>,
  }) => any | void,
  visitBinaryExpression: (expr: {
    left: GenericAcceptObject<string | number>,
    operator: Token,
    right: GenericAcceptObject<string | number>,
  }) => null | number | string | boolean,
  visitAssignmentExpression: (expr: {
    value: GenericAcceptObject<SupportedTypes>,
    name: Token,
  }) => any | void,
  visitLogicalExpression: (expr: {
    left: GenericAcceptObject<SupportedTypes>,
    operator: Token,
    right: GenericAcceptObject<SupportedTypes>,
  }) => any | void,
  visitCallExpression: (expr: {
    args: Array<GenericAcceptObject<SupportedTypes>>,
    calle: {
      accept: (any) => {
        arity: () => number,
        call: (InterPreterFunctions, Array<SupportedTypes>) => void,
      },
    },
    paren: Token,
  }) => void | any,
  visitReturnStatement: (stmt: {
    value: GenericAcceptObject<mixed>,
  }) => empty,
  visitFunctionStatement: (stmt: DeclarationType) => null,
  visitExpressionStatement: (stmt: {
    expression: GenericAcceptObject<mixed>,
  }) => null,
  visitLogStatement: (stmt: {
    expression: GenericAcceptObject<mixed>,
  }) => null,
  visitLetStatement: (stmt: {
    initializer: GenericAcceptObject<mixed>,
    name: Token,
  }) => null,
  visitBlockStatement: (stmt: {
    statements: Array<GenericAcceptObject<mixed>>,
  }) => null,
  visitIfStatement: (stmt: {
    condition: GenericAcceptObject<mixed>,
    elseBranch: GenericAcceptObject<mixed>,
    thenBranch: GenericAcceptObject<mixed>,
  }) => null,
  visitWhileStatement: (stmt: {
    body: GenericAcceptObject<mixed>,
    condition: GenericAcceptObject<mixed>,
  }) => null,
  executeBlock: (
    statements: Array<GenericAcceptObject<mixed>>,
    env: EnvironmentType
  ) => void,
};

type GenericAcceptObject<T> = {
  accept: (InterPreterFunctions) => T,
};

type ReportRunTimeError = (Token, string) => void;

type Report = {
  runtimeError: ReportRunTimeError,
};

type Args = {
  report: Report,
  logger?: (any) => void,
};
export default function Interpreter({
  report,
  logger = console.log,
}: Args): InterpreterReturnType {
  const globals: EnvironmentType = Environment({ report });
  let environment: EnvironmentType = globals;

  function visitLiteralExpression(expr) {
    return expr.value;
  }

  function stringify(object) {
    if (object == null) return "nil";
    return object;
  }

  function visitUnaryExpression(expr: {
    right: GenericAcceptObject<mixed>,
    operator: Token,
  }) {
    const right = evaluate(expr.right);
    switch (expr.operator.type) {
      case "MINUS":
        return -parseInt(right);
      case "BANG":
        return !isTruthy(right);
    }
    return null;
  }

  function visitVariableExpression(expr: { name: Token }) {
    return environment.get(expr.name);
  }

  function isTruthy(object) {
    if (object === null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  function visitGroupingExpression(expr: {
    expression: GenericAcceptObject<mixed>,
  }) {
    return evaluate(expr.expression);
  }

  function visitBinaryExpression(expr: {
    left: GenericAcceptObject<string | number>,
    right: GenericAcceptObject<string | number>,
    operator: Token,
  }) {
    const left = evaluate(expr.left);
    const right = evaluate(expr.right);
    switch (expr.operator.type) {
      case "MINUS":
        checkNumberOperand(expr.operator, right);
        return parseInt(left) - parseInt(right);
      case "SLASH":
        checkNumberOperands(expr.operator, left, right);
        return parseInt(left) / parseInt(right);
      case "STAR":
        return parseInt(left) * parseInt(right);
      case "PLUS": {
        if (typeof right === "number" && typeof left === "number") {
          return parseInt(left) + parseInt(right);
        }
        if (typeof right === "string" && typeof left === "string") {
          return String(left) + String(right);
        }

        report.runtimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      }
      case "GREATER":
        checkNumberOperands(expr.operator, left, right);
        return parseInt(left) > parseInt(right);
      case "GREATER_EQUAL":
        checkNumberOperands(expr.operator, left, right);
        return parseInt(left) >= parseInt(right);
      case "LESS":
        checkNumberOperands(expr.operator, left, right);
        return parseInt(left) < parseInt(right);
      case "LESS_EQUAL":
        checkNumberOperands(expr.operator, left, right);
        return parseInt(left) <= parseInt(right);

      case "BANG_EQUAL":
        return !isEqual(left, right);
      case "EQUAL_EQUAL":
        return isEqual(left, right);
    }

    return null;
  }

  function visitAssignmentExpression(expr: {
    value: GenericAcceptObject<SupportedTypes>,
    name: Token,
  }) {
    const value = evaluate(expr.value);
    environment.assign(expr.name, value);
    return value;
  }

  function visitLogicalExpression(expr: {
    left: GenericAcceptObject<SupportedTypes>,
    operator: Token,
    right: GenericAcceptObject<SupportedTypes>,
  }) {
    const left = evaluate(expr.left);
    if (expr.operator.type === "OR") {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return evaluate(expr.right);
  }

  function visitCallExpression(expr: {
    calle: {
      accept: (Object) => {
        call: (InterPreterFunctions, Array<SupportedTypes>) => void,
        arity: () => number,
      },
    },
    paren: Token,
    args: Array<GenericAcceptObject<SupportedTypes>>,
  }) {
    const callee = evaluate(expr.calle);
    let expressionargs = [];
    for (const arg of expr.args) {
      expressionargs.push(evaluate(arg));
    }

    if (!callee.arity)
      return report.runtimeError(expr.paren, "Can only call functions");

    const fn = callee;
    if (expressionargs.length !== fn.arity()) {
      return report.runtimeError(
        expr.paren,
        "Expected " + // $FlowFixMe
          fn.arity() +
          " arguments but got " +
          expressionargs.length +
          "."
      );
    }
    return fn.call(interpreterFunctions, expressionargs);
  }

  // statements

  function visitReturnStatement(stmt: { value: GenericAcceptObject<mixed> }) {
    let value = null;
    if (stmt.value) value = evaluate(stmt.value);

    throw value;
  }
  function visitFunctionStatement(stmt: DeclarationType) {
    const fn = loxFunction({
      declaration: stmt,
      report,
      closure: environment,
    });
    environment.define(stmt.name.lexeme, fn);
    return null;
  }

  function visitExpressionStatement(stmt: {
    expression: GenericAcceptObject<mixed>,
  }) {
    evaluate(stmt.expression);
    return null;
  }

  function visitLogStatement(stmt: { expression: GenericAcceptObject<mixed> }) {
    const value = evaluate(stmt.expression);
    logger(stringify(value));
    return null;
  }

  function visitLetStatement(stmt: {
    name: Token,
    initializer: GenericAcceptObject<mixed>,
  }) {
    let value = null;
    if (stmt.initializer != null) {
      value = evaluate(stmt.initializer);
    }

    environment.define(stmt.name.lexeme, value);
    return null;
  }

  function visitBlockStatement(stmt: {
    statements: Array<GenericAcceptObject<mixed>>,
  }) {
    executeBlock(
      stmt.statements,
      new Environment({ report, enclosing: environment })
    );
    return null;
  }

  function visitIfStatement(stmt: {
    condition: GenericAcceptObject<mixed>,
    thenBranch: GenericAcceptObject<mixed>,
    elseBranch: GenericAcceptObject<mixed>,
  }) {
    if (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      execute(stmt.elseBranch);
    }

    return null;
  }

  function visitWhileStatement(stmt: {
    condition: GenericAcceptObject<mixed>,
    body: GenericAcceptObject<mixed>,
  }) {
    while (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.body);
    }

    return null;
  }

  function executeBlock(
    statements: Array<GenericAcceptObject<mixed>>,
    env: EnvironmentType
  ) {
    const previousEnvironment = environment;
    try {
      environment = env;
      for (const statement of statements) {
        execute(statement);
      }
    } finally {
      environment = previousEnvironment;
    }
  }

  function isEqual(a, b) {
    if (a == null && b == null) return true;
    if (a == null) return false;
    return a === b;
  }

  function checkNumberOperand(operator: Token, operand: number | string) {
    if (typeof operand === "number") return;
    report.runtimeError(operator, "Operand must be a number");
  }

  function checkNumberOperands(
    operator: Token,
    left: number | string,
    right: number | string
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    report.runtimeError(operator, "Operands must be a number");
  }

  const interpreterFunctions: InterPreterFunctions = {
    visitAssignmentExpression,
    visitBinaryExpression,
    visitBlockStatement,
    visitCallExpression,
    visitExpressionStatement,
    visitFunctionStatement,
    visitGroupingExpression,
    visitIfStatement,
    visitLetStatement,
    visitLiteralExpression,
    visitLogStatement,
    visitLogicalExpression,
    visitReturnStatement,
    visitUnaryExpression,
    visitVariableExpression,
    visitWhileStatement,
    executeBlock,
  };

  // global functions

  globals.define("clock", {
    call: (interpreterFunctions: InterPreterFunctions, []) => Date.now(),
    arity: () => 0,
    toString: () => "<Native fn>",
  });

  // evaluate expression

  function evaluate<T>(expr: { +accept: (InterPreterFunctions) => T }): T {
    return expr.accept(interpreterFunctions);
  }

  // execute statement
  function execute<T>(statement: { +accept: (InterPreterFunctions) => T }) {
    statement.accept(interpreterFunctions);
  }

  function interpret(
    statements: Array<{ +accept: (InterPreterFunctions) => void }>
  ) {
    try {
      for (const statement of statements) {
        execute(statement);
      }
    } catch (error) {
      throw error;
    }
  }

  return {
    interpret,
  };
}