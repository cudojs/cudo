import * as camelcase from "camelcase";

import * as minimist from "minimist";

export interface Actions {
  [scope: string]: { [action: string]: Handler; };
}

export interface Handler {
  (parsedArgv: minimist.ParsedArgs): Promise<void>;
}

const defaultActions: Actions = {

};

export class CudoCli {
  actions: Actions;

  constructor(actions?: Actions) {
    this.actions = actions || defaultActions;
  }

  parseArgv(argv: string[]): minimist.ParsedArgs {
    let parsedArgvOrigCase = minimist(argv.slice(2));

    let parsedArgv: minimist.ParsedArgs = {
      _: []
    };

    for (let key in parsedArgvOrigCase) {
      parsedArgv[camelcase(key)] = parsedArgvOrigCase[key];
    }

    parsedArgv._ = parsedArgvOrigCase._.map((value) => camelcase(value));

    return parsedArgv;
  }

  async run(argv: string[] = process.argv) {
    let parsedArgv = this.parseArgv(argv);

    await this.runAction(parsedArgv);
  }

  async runAction(parsedArgv: minimist.ParsedArgs) {
    if (!parsedArgv._ || parsedArgv._.length < 1) {
      throw new Error("Missing scope argument");
    }

    let scope = parsedArgv._[0];

    if (!this.actions[scope]) {
      throw new Error("Scope `" + scope + "` does not exist");
    }

    if (!parsedArgv._ || parsedArgv._.length < 2) {
      throw new Error("Missing action argument");
    }

    let action = parsedArgv._[1];

    if (!this.actions[scope][action]) {
      throw new Error("Action `" + action + "` does not exist in scope `" + scope + "`");
    }

    await this.actions[scope][action](parsedArgv);
  }
}