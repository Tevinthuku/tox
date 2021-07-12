// @flow
import type { TokenReturnType } from "./token";

export type EnvironmentType = {|
  assign: (name: TokenReturnType, value: any) => void,
  define: (name: string, value: any) => void,
  get: (name: TokenReturnType) => void | any,
  environmentMap: { [string]: mixed },
|};

type ReportRunTimeError = (TokenReturnType, string) => void;

type Report = {
  runtimeError: ReportRunTimeError,
};

type Args = {
  report: Report,
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

  function get(name: TokenReturnType) {
    if (environmentMap.hasOwnProperty(name.lexeme)) {
      return environmentMap[name.lexeme];
    }
    if (enclosing != null) return enclosing.get(name);
    report.runtimeError(name, `Undefined variable " ${name.lexeme} " .`);
  }

  function assign(name: TokenReturnType, value: mixed) {
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
