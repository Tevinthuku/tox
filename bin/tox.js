// @flow
import { Scanner } from "./scanner";
import Parser from "./parser";
import Interpreter from "./interpreter";
import { type TokenReturnType } from "./token";
const readline = require("readline");
var fs = require("fs");

export type ToxReturnType = {
  run: (source: string) => void,
  error: (line: number, message: string) => void,
  hadError: boolean,
  readFile: (file: string, toxInstance: ToxReturnType) => void,
  readPrompt: (toxInstance: any) => void,
  setHadError: (val: boolean) => void,
  tokenError: (token: TokenReturnType, message: string) => void,
  runtimeError: (token: TokenReturnType, message: string) => void,
};
export function Tox() {
  let hadError: boolean = false;
  let hadRuntimeError: boolean = false;
  function run(source: string) {}
  function readPrompt(toxInstance: ToxReturnType) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "λ >  ",
    });
    rl.prompt();
    rl.on("line", (line: string) => {
      if (line.trim() === "exit") process.exit(0);
      const scanner = new Scanner({ source: line.trim(), toxInstance });
      const interpreter = new Interpreter({ toxInstance });
      const tokens = scanner.scanTokens();
      const parser = new Parser({ tokens, toxInstance });
      const statements = parser.parse();
      if (hadError) return;
      interpreter.interpret(statements);

      rl.prompt();
    }).on("close", () => {
      console.log("Exiting Tox REPL!");
      process.exit(0);
    });
  }
  function readFile(file: string, toxInstance) {
    fs.readFile(file, "utf8", function (err, data) {
      if (err) throw err;

      const scanner = new Scanner({ source: data.trim(), toxInstance });
      const interpreter = new Interpreter({ toxInstance });
      const tokens = scanner.scanTokens();
      const parser = new Parser({ tokens, toxInstance });
      const statements = parser.parse();

      if (hadError) return;
      interpreter.interpret(statements);
    });
  }

  function setHadError(val: boolean) {
    hadError = val;
  }

  function error(line: number, message: string) {
    report(line, "", message);
  }

  function report(line: number, where: string, message: string) {
    console.error("[line " + line + "] Error" + where + ": " + message);
    setHadError(true);
  }

  function tokenError(token: TokenReturnType, message: string) {
    if (token.type === "EOF") {
      report(token.line, " at end", message);
    } else {
      report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  function runtimeError(token: TokenReturnType, message: string) {
    console.error(message + "\n[line " + token.line + "]");
    hadRuntimeError = true;
  }

  return {
    run,
    error,
    hadError,
    readFile,
    tokenError,
    readPrompt,
    setHadError,
    runtimeError,
  };
}

const myArgs = process.argv.slice(2);
(function (args) {
  const toxInstance = Tox();
  switch (args[0]) {
    case "repl":
      console.log("To exit type 'exit'");
      toxInstance.readPrompt(toxInstance);
      break;
    case "file": {
      toxInstance.readFile(args[1], toxInstance);
      break;
    }
    default:
      console.log("Sorry, that is not something I know how to do.");
      process.exit(0);
  }
})(myArgs);
