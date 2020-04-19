// @flow
import Environment from "./environment";
import type { EnvironmentType } from "./environment";
import type { TokenReturnType } from "./token";
import type { StmtType } from "./stmt";
import type { ToxReturnType } from "./tox";

type Props = {
  declaration: {
    name: TokenReturnType,
    params: Array<TokenReturnType>,
    body: Array<StmtType>,
  },
  toxInstance: ToxReturnType,
  closure: EnvironmentType,
};

export default function LoxFunction({
  declaration,
  toxInstance,
  closure,
}: Props) {
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
      toxInstance,
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
