// @flow
import Environment from "./environment";
import type { EnvironmentType } from "./environment";
import { Token } from "./token";
import type { StmtType } from "./stmt";

export type DeclarationType = {
  name: Token,
  params: Array<Token>,
  body: Array<StmtType>,
};

type ReportRunTimeError = (Token, string) => void;

type Report = {
  runtimeError: ReportRunTimeError,
};
type Props = {
  declaration: DeclarationType,
  report: Report,
  closure: EnvironmentType,
};

export default function LoxFunction({ declaration, report, closure }: Props) {
  function arity() {
    return declaration.params.length;
  }
  function call(
    interpreter: {
      executeBlock: (Array<StmtType>, EnvironmentType) => void,
    },
    args: Array<any>
  ) {
    const environment = new Environment({
      report,
      enclosing: closure,
    });
    for (let i = 0; i < declaration.params.length; i++) {
      environment.define(declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(declaration.body, environment);
    } catch (returnVal) {
      return returnVal;
    }
    return null;
  }

  function toString() {
    return "<fn " + declaration.name.lexeme + ">";
  }

  return {
    call,
    arity,
    toString,
  };
}
