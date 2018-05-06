import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as cudoCli from "../../src/cli/cudo-cli";

chai.use(chaiAsPromised);

describe("CudoCli", () => {
  it("can parse arguments", async () => {
    let cli = new cudoCli.CudoCli();

    let mockArgv = ["pathToNode", "pathToScript", "makeBeverage", "tea", "-m", "-l", "--variety=breakfast", "--serveIn", "cup"];

    return chai.expect(cli.parseArgv(mockArgv)).deep.eq({
      "_": [ "makeBeverage", "tea" ],
      "m": true,
      "l": true,
      "serveIn": "cup",
      "variety": "breakfast"
    });
  });

  it("can run", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {
      "makeBeverage": async (parsedArgv) => {
        if (parsedArgv["_"].length >= 2) {
          resultMessage = "Making a beverage: " + parsedArgv._[1];
        }
      }
    };

    let mockArgv = ["pathToNode", "pathToScript", "makeBeverage", "tea"];

    let cli = new cudoCli.CudoCli(mockActions);

    await cli.run(mockArgv);

    return chai.expect(resultMessage).eq("Making a beverage: tea");
  });

  it("can run an action", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {
      "makeBeverage": async (parsedArgv) => {
        if (parsedArgv._.length < 2) {
          throw new Error("Missing beverage kind argument");
        }

        resultMessage = "Making a beverage: " + parsedArgv._[1];
      }
    };

    let mockArgv = ["pathToNode", "pathToScript", "makeBeverage", "tea"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    await cli.runAction(parsedArgv);

    return chai.expect(resultMessage).eq("Making a beverage: tea");
  });

  it("throws an error when action is not specified", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {};

    let mockArgv = ["pathToNode", "pathToScript"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejected;
  });

  it("throws an error when specified action does not exist", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {};

    let mockArgv = ["pathToNode", "pathToScript", "makeCake"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejected;
  });
});