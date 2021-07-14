// @flow
import Environment from "./environment";
import {
  type VisitableStatement,
  BlockOfStatements,
  ExpressionStatement,
  FunctionStatement,
  IfStatement,
  LetStatement,
  LogStatement,
  ReturnStatement,
  WhileStatement,
} from "./stmt";
import {
  Literal,
  type ExpressionReturnType,
  type VisitableExpression,
  Unary,
  Assign,
  Binary,
  Variable,
  Grouping,
  Logical,
  Call,
} from "./expr";
import { type TokenType, Token } from "./token";
import ToxFunction, {
  type ToxCallable,
  BaseToxFunction,
  GlobalToxFunction,
} from "./toxfunction";

type InterPreterFunctions = {
  visitLiteralExpression: (Literal) => ExpressionReturnType,
  visitUnaryExpression: (expr: Unary) => ExpressionReturnType,
  visitVariableExpression: (expr: Variable) => ExpressionReturnType,
  visitGroupingExpression: (expr: Grouping) => ExpressionReturnType,
  visitBinaryExpression: (expr: Binary) => ExpressionReturnType,
  visitAssignmentExpression: (expr: Assign) => ExpressionReturnType,
  visitLogicalExpression: (expr: Logical) => ExpressionReturnType,
  visitCallExpression: (expr: Call) => void | any,
  visitReturnStatement: (stmt: ReturnStatement) => empty,
  visitFunctionStatement: (stmt: FunctionStatement) => null,
  visitExpressionStatement: (stmt: ExpressionStatement) => null,
  visitLogStatement: (stmt: LogStatement) => null,
  visitLetStatement: (stmt: LetStatement) => null,
  visitBlockStatement: (stmt: BlockOfStatements) => null,
  visitIfStatement: (stmt: IfStatement) => null,
  visitWhileStatement: (stmt: WhileStatement) => null,
  executeBlock: (statements: VisitableStatement[], env: Environment) => null,
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
  logger?: (mixed) => void,
};
export default function Interpreter({ report, logger = console.log }: Args) {
  const globals: Environment = new Environment({ report });
  let environment: Environment = globals;

  function visitLiteralExpression(expr) {
    return expr.value;
  }

  function stringify(object) {
    if (object == null) return "nil";
    return object;
  }

  function visitUnaryExpression(expr: Unary) {
    const right = evaluate(expr.right);
    switch (expr.operator.type) {
      case "MINUS":
        return -parseInt(right);
      case "BANG":
        return !isTruthy(right);
    }
    return null;
  }

  function visitVariableExpression(expr: Variable) {
    return environment.get(expr.name);
  }

  function isTruthy(object) {
    if (object === null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  function visitGroupingExpression(expr: Grouping) {
    return evaluate(expr.expression);
  }

  function visitBinaryExpression(expr: Binary) {
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

        throw report.runtimeError(
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

  function visitAssignmentExpression(expr: Assign) {
    const value = evaluate(expr.value);
    environment.assign(expr.name, value);
    return value;
  }

  function visitLogicalExpression(expr: Logical) {
    const left = evaluate(expr.left);
    if (expr.operator.type === "OR") {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return evaluate(expr.right);
  }

  function visitCallExpression(expr: Call) {
    const callee = evaluate(expr.calle);
    let expressionargs = [];
    for (const arg of expr.args) {
      expressionargs.push(evaluate(arg));
    }

    if (callee instanceof BaseToxFunction) {
      if (expressionargs.length !== callee.arity()) {
        return report.runtimeError(
          expr.paren,
          "Expected " +
            callee.arity() +
            " arguments but got " +
            expressionargs.length +
            "."
        );
      }
      return callee.call(interpreterFunctions, expressionargs);
    }
    throw report.runtimeError(expr.paren, "Can only call functions");
  }

  // statements

  function visitReturnStatement(stmt: ReturnStatement) {
    let value = null;
    if (stmt.value) value = evaluate(stmt.value);

    throw value;
  }
  function visitFunctionStatement(stmt: FunctionStatement) {
    const fn = new ToxFunction({
      declaration: stmt,
      report,
      closure: environment,
    });
    environment.define(stmt.name.lexeme, fn);
    return null;
  }

  function visitExpressionStatement(stmt: ExpressionStatement) {
    evaluate(stmt.expression);
    return null;
  }

  function visitLogStatement(stmt: LogStatement) {
    const value = evaluate(stmt.expression);
    logger(stringify(value));
    return null;
  }

  function visitLetStatement(stmt: LetStatement) {
    let value = null;
    if (stmt.initializer != null) {
      value = evaluate(stmt.initializer);
    }

    environment.define(stmt.name.lexeme, value);
    return null;
  }

  function visitBlockStatement(stmt: BlockOfStatements) {
    executeBlock(
      stmt.statements,
      new Environment({ report, enclosing: environment })
    );
    return null;
  }

  function visitIfStatement(stmt: IfStatement) {
    if (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      execute(stmt.elseBranch);
    }

    return null;
  }

  function visitWhileStatement(stmt: WhileStatement) {
    while (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.body);
    }

    return null;
  }

  function executeBlock(statements: VisitableStatement[], env: Environment) {
    const previousEnvironment = environment;
    try {
      environment = env;
      for (const statement of statements) {
        execute(statement);
      }
    } finally {
      environment = previousEnvironment;
    }
    return null;
  }

  function isEqual(a, b) {
    if (a == null && b == null) return true;
    if (a == null) return false;
    return a === b;
  }

  function checkNumberOperand(operator: Token, operand: ExpressionReturnType) {
    if (typeof operand === "number") return;
    throw report.runtimeError(operator, "Operand must be a number");
  }

  function checkNumberOperands(
    operator: Token,
    left: ExpressionReturnType,
    right: ExpressionReturnType
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    throw report.runtimeError(operator, "Operands must be a number");
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

  // TODO: Fix definition of this inbuilt clock function

  globals.define("clock", new GlobalToxFunction(() => Date.now(), 0));

  // evaluate expression
  function evaluate(expr: VisitableExpression) {
    return expr.accept(interpreterFunctions);
  }

  // execute statement
  function execute(statement: VisitableStatement) {
    statement.accept(interpreterFunctions);
  }

  function interpret(statements: Array<VisitableStatement>) {
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
