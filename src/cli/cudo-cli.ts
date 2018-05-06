import * as minimist from "minimist";

export interface Handler {
  (parsedArgv: minimist.ParsedArgs): Promise<void>;
}

export interface Actions {
  [action: string]: Handler;
}

const defaultActions: Actions = {

};

export class CudoCli {
  actions: Actions;

  constructor(actions?: Actions) {
    this.actions = actions || defaultActions;
  }

  parseArgv(argv: string[]): minimist.ParsedArgs {
    return minimist(argv.slice(2));
  }

  async run(argv: string[] = process.argv) {
    let parsedArgv = this.parseArgv(argv);

    await this.runAction(parsedArgv);
  }

  async runAction(parsedArgv: minimist.ParsedArgs) {
    if (!parsedArgv._ || parsedArgv._.length < 1) {
      throw new Error("Missing action argument");
    }

    let action = parsedArgv._[0];

    if (!this.actions[action]) {
      throw new Error("Action `" + action + "` does not exist");
    }

    await this.actions[action](parsedArgv);
  }
}