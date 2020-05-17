// @flow
import type { ToxReturnType } from "./tox";
import type { TokenReturnType } from "./token";

export type EnvironmentType = {|
  assign: (name: TokenReturnType, value: any) => void,
  define: (name: string, value: any) => void,
  get: (name: TokenReturnType) => void | any,
  environmentMap: { [string]: mixed },
|};
export default function Environment({
  toxInstance,
  enclosing,
}: {
  toxInstance: ToxReturnType,
  enclosing?: EnvironmentType,
}): EnvironmentType {
  let environmentMap: { [string]: mixed } = {};

  function define(name: string, value: mixed) {
    environmentMap[name] = value;
  }

  function get(name: TokenReturnType) {
    if (environmentMap.hasOwnProperty(name.lexeme)) {
      return environmentMap[name.lexeme];
    }
    if (enclosing != null) return enclosing.get(name);
    toxInstance.runtimeError(name, `Undefined variable " ${name.lexeme} " .`);
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

    toxInstance.runtimeError(name, `Undefined variable " ${name.lexeme} " .`);
  }

  return { define, get, assign, environmentMap };
}
