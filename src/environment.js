// @flow
import type { Token } from "./token";

type ReportRunTimeError = (Token, string) => void;

type Reporter = {
  runtimeError: ReportRunTimeError,
};

type Args = {
  report: Reporter,
  enclosing?: Environment,
};
export default class Environment {
  enclosing: ?Environment;
  report: Reporter;
  environmentMap: { [string]: mixed } = {};
  constructor({ report, enclosing }: Args) {
    this.enclosing = enclosing;
    this.report = report;
  }

  define(name: string, value: mixed) {
    this.environmentMap[name] = value;
  }

  get(name: Token) {
    if (this.environmentMap[name.lexeme]) {
      return this.environmentMap[name.lexeme];
    }
    if (this.enclosing != null) return this.enclosing.get(name);
    throw this.report.runtimeError(
      name,
      `Undefined variable " ${name.lexeme} " .`
    );
  }

  assign(name: Token, value: any) {
    if (this.environmentMap.hasOwnProperty(name.lexeme)) {
      this.environmentMap[name.lexeme] = value;
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw this.report.runtimeError(
      name,
      `Undefined variable " ${name.lexeme} " .`
    );
  }
}
