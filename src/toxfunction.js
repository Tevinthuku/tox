// @flow
import Environment from "./environment";
import { Token } from "./token";
import type { FunctionStatement, VisitableStatement } from "./stmt";

type ReportRunTimeError = (Token, string) => void;

type Report = {
  runtimeError: ReportRunTimeError,
};
type Props = {
  declaration: FunctionStatement,
  report: Report,
  closure: Environment,
};

type Interpreter = {
  executeBlock: (Array<VisitableStatement>, Environment) => null,
};

export interface ToxCallable {
  arity(): number;
  call(Interpreter, mixed[]): mixed;
  toString(): string;
}

export class BaseToxFunction implements ToxCallable {
  arity() {
    return 0;
  }
  call(interpreter: Interpreter, args: Array<mixed>) {
    return null;
  }

  toString() {
    return "<baseToxFn />";
  }
}

export default class ToxFunction extends BaseToxFunction {
  declaration: FunctionStatement;
  report: Report;
  closure: Environment;
  constructor({ declaration, report, closure }: Props) {
    super();
    this.declaration = declaration;
    this.report = report;
    this.closure = closure;
  }
  arity() {
    return this.declaration.params.length;
  }
  call(interpreter: Interpreter, args: Array<mixed>) {
    const environment = new Environment({
      report: this.report,
      enclosing: this.closure,
    });
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnVal) {
      return returnVal;
    }
    return null;
  }

  toString() {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}

export class GlobalToxFunction extends BaseToxFunction {
  functionToCall: Function;
  expectedArguments: number;
  constructor(functionToCall: Function, expectedArguments: number) {
    super();
    this.functionToCall = functionToCall;
    this.expectedArguments = expectedArguments;
  }
  call(interpreter: Interpreter, args: Array<mixed>) {
    return this.functionToCall();
  }

  toString() {
    return `<NativeFn />`;
  }
}
