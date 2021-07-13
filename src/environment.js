// @flow
import type { Token } from "./token";

export type EnvironmentType = {|
  assign: (name: Token, value: any) => void,
  define: (name: string, value: any) => void,
  get: (name: Token) => void | any,
  environmentMap: { [string]: mixed },
|};

type ReportRunTimeError = (Token, string) => void;

type Reporter = {
  runtimeError: ReportRunTimeError,
};

type Args = {
  report: Reporter,
  enclosing?: EnvironmentType,
};
export default function Environment({
  report,
  enclosing,
}: Args): EnvironmentType {
  let environmentMap: { [string]: mixed } = {};

  function define(name: string, value: mixed) {
    environmentMap[name] = value;
  }

  function get(name: Token) {
    if (environmentMap.hasOwnProperty(name.lexeme)) {
      return environmentMap[name.lexeme];
    }
    if (enclosing != null) return enclosing.get(name);
    report.runtimeError(name, `Undefined variable " ${name.lexeme} " .`);
  }

  function assign(name: Token, value: mixed) {
    if (environmentMap.hasOwnProperty(name.lexeme)) {
      environmentMap[name.lexeme] = value;
      return;
    }

    if (enclosing != null) {
      enclosing.assign(name, value);
      return;
    }

    report.runtimeError(name, `Undefined variable " ${name.lexeme} " .`);
  }

  return { define, get, assign, environmentMap };
}
