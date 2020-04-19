// @flow
import Environment from "./environment";

import { type TokenType, type TokenReturnType } from "./token";
import { type ExprType } from "./expr";
import { type ToxReturnType } from "./tox";
import loxFunction from "./toxfunction";

export type InterpreterReturnType = {|
  interpret: (statements: Array<{ accept: (any) => void }>) => void,
|};

export default function Interpreter({
  toxInstance,
}: {
  toxInstance: ToxReturnType,
}): InterpreterReturnType {
  let self = this;
  this.globals = Environment({ toxInstance });
  let environment = this.globals;

  // global functions
  this.globals.define("clock", {
    call: (self, []) => Date.now(),
    arity: () => 0,
    toString: () => "<Native fn>",
  });

  this.visitLiteralExpression = function visitLiteralExpression(expr: {
    value: any,
  }) {
    return expr.value;
  };

  function stringify(object) {
    if (object == null) return "nil";
    return object;
  }

  this.visitUnaryExpression = function visitUnaryExpression(expr: {
    right: any,
    operator: TokenReturnType,
  }) {
    const right = evaluate(expr.right);
    switch (expr.operator.type) {
      case "MINUS":
        return -parseInt(right);
      case "BANG":
        return !isTruthy(right);
    }
    return null;
  };

  this.visitVariableExpression = function visitVariableExpression(expr: {
    name: TokenReturnType,
  }) {
    return environment.get(expr.name);
  };

  function isTruthy(object) {
    if (object === null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  this.visitGroupingExpression = function visitGroupingExpression(expr: {
    expression: { accept: (any) => void },
  }) {
    return evaluate(expr.expression);
  };

  this.visitBinaryExpression = function visitBinaryExpression(expr: {
    left: any,
    right: any,
    operator: TokenReturnType,
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

        toxInstance.runtimeError(
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
  };

  this.visitAssignmentExpression = function visitAssignmentExpression(expr) {
    const value = evaluate(expr.value);
    environment.assign(expr.name, value);
    return value;
  };

  this.visitLogicalExpression = function visitLogicalExpression(expr) {
    const left = evaluate(expr.left);
    if (expr.operator.type === "OR") {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return evaluate(expr.right);
  };

  this.visitCallExpression = function visitCallExpression(expr: {
    calle: {
      accept: (Object) => any,
    },
    paren: TokenReturnType,
    args: Array<{
      accept: (Object) => any,
    }>,
  }) {
    const callee = evaluate(expr.calle);
    let expressionargs = [];
    for (const arg of expr.args) {
      expressionargs.push(evaluate(arg));
    }

    // $FlowFixMe
    if (!callee.arity)
      return toxInstance.runtimeError(expr.paren, "Can only call functions");

    const fn = callee;
    // $FlowFixMe
    if (expressionargs.length !== fn.arity()) {
      return toxInstance.runtimeError(
        expr.paren,
        "Expected " + // $FlowFixMe
          fn.arity() +
          " arguments but got " +
          expressionargs.length +
          "."
      );
    }
    // $FlowFixMe
    return fn.call(self, expressionargs);
  };
  // statements

  this.visitReturnStatement = function visitReturnStatement(stmt) {
    let value = null;
    if (stmt.value) value = evaluate(stmt.value);

    throw value;
  };
  this.visitFunctionStatement = function visitFunctionStatement(stmt) {
    const fn = loxFunction({
      declaration: stmt,
      toxInstance,
      closure: environment,
    });
    environment.define(stmt.name.lexeme, fn);
    return null;
  };

  this.visitExpressionStatement = function visitExpressionStatement(stmt: {
    expression: { accept: (any) => void },
  }) {
    evaluate(stmt.expression);
    return null;
  };

  this.visitLogStatement = function visitLogStatement(stmt: {
    expression: { accept: (any) => void },
  }) {
    const value = evaluate(stmt.expression);
    console.log(stringify(value));
    return null;
  };

  this.visitLetStatement = function visitLetStatement(stmt: {
    name: TokenReturnType,
    initializer: any,
  }) {
    let value = null;
    if (stmt.initializer != null) {
      value = evaluate(stmt.initializer);
    }

    environment.define(stmt.name.lexeme, value);
    return null;
  };

  this.visitBlockStatement = function visitBlockStatement(stmt) {
    this.executeBlock(
      stmt.statements,
      new Environment({ toxInstance, enclosing: environment })
    );
    return null;
  };

  this.visitIfStatement = function (stmt: {
    condition: any,
    thenBranch: any,
    elseBranch: any,
  }) {
    if (isTruthy(stmt.condition)) {
      execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      execute(stmt.elseBranch);
    }

    return null;
  };

  this.visitWhileStatement = function (stmt) {
    while (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.body);
    }

    return null;
  };

  this.executeBlock = function executeBlock(statements, env) {
    const previousEnvironment = environment;
    try {
      environment = env;
      self.environment = env;
      for (const statement of statements) {
        execute(statement);
      }
    } finally {
      environment = previousEnvironment;
      self.environment = previousEnvironment;
    }
  };

  function isEqual(a, b) {
    if (a == null && b == null) return true;
    if (a == null) return false;
    return deepEqual(a, b);
  }

  function deepEqual(x, y) {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y;
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every((key) => deepEqual(x[key], y[key]))
      : x === y;
  }

  function checkNumberOperand(operator: TokenReturnType, operand: any) {
    if (typeof operand === "number") return;
    toxInstance.runtimeError(operator, "Operand must be a number");
  }

  function checkNumberOperands(
    operator: TokenReturnType,
    left: any,
    right: any
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    toxInstance.runtimeError(operator, "Operands must be a number");
  }

  // evaluate expression
  function evaluate(expr) {
    return expr.accept(self);
  }

  // execute statement
  function execute(statement) {
    statement.accept(self);
  }

  function interpret(statements: Array<{ accept: (any) => void }>) {
    try {
      for (const statement of statements) {
        execute(statement);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    interpret,
  };
}
