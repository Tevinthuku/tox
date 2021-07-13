// @flow
import Scanner from "./scanner";
import Parser from "./parser";
import Interpreter from "./interpreter";
import { Token } from "./token";
const readline = require("readline");
var fs = require("fs");

export class Tox {
  hadError: boolean = false;
  hadRuntimeError: boolean = false;

  exitToxRepl() {
    console.log("Exiting Tox REPL!");
    process.exit(0);
  }
  readPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "λ >  ",
    });
    rl.prompt();
    rl.on("line", (line: string) => {
      if (line.trim() === "exit") this.exitToxRepl();
      this.run(line.trim());
      rl.prompt();
    }).on("close", () => {
      this.exitToxRepl();
    });
  }
  readFile(file: string) {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) throw err;
      this.run(data.trim());
    });
  }

  run(source: string) {
    const report = {
      scannerError: this.error,
      runtimeError: this.runtimeError,
      tokenError: this.tokenError,
    };
    const scanner = new Scanner(source, report.scannerError);
    const tokens = scanner.scanTokens();
    const parser = new Parser({ tokens, report: report });
    const statements = parser.parse();

    if (this.hadError) return;
    const interpreter = new Interpreter({ report });
    interpreter.interpret(statements);
  }

  setHadError(val: boolean) {
    this.hadError = val;
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  report(line: number, where: string, message: string) {
    console.error("[line " + line + "] Error" + where + ": " + message);
    this.setHadError(true);
  }

  tokenError(token: Token, message: string) {
    if (token.type === "EOF") {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  runtimeError(token: Token, message: string) {
    console.error(message + "\n[line " + token.line + "]");
    this.hadRuntimeError = true;
  }
}

function getCommandLineArguments() {
  return process.argv.slice(2);
}

const args = getCommandLineArguments();
(function (args) {
  const toxInstance = new Tox();
  switch (args[0]) {
    case "repl":
      console.log("To exit type 'exit'");
      toxInstance.readPrompt();
      break;
    case "file": {
      toxInstance.readFile(args[1]);
      break;
    }
    default:
      console.log("Sorry, that is not something I know how to do.");
      process.exit(0);
  }
})(args);
