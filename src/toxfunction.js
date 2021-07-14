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

export default class ToxFunction {
  declaration: FunctionStatement;
  report: Report;
  closure: Environment;
  constructor({ declaration, report, closure }: Props) {
    this.declaration = declaration;
    this.report = report;
    this.closure = closure;
  }
  arity() {
    return this.declaration.params.length;
  }
  call(
    interpreter: {
      executeBlock: (Array<VisitableStatement>, Environment) => void,
    },
    args: Array<any>
  ) {
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
