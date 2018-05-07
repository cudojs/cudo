import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import * as cudoCli from "../../src/cli/cudo-cli";

chai.use(chaiAsPromised);

describe("CudoCli", () => {
  it("can parse arguments", async () => {
    let cli = new cudoCli.CudoCli();

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage", "make", "-m", "-l", "--type=breakfast-tea", "--serve-in", "cup"];

    return chai.expect(cli.parseArgv(mockArgv)).deep.eq({
      _: ["hotBeverage", "make"],
      m: true,
      l: true,
      serveIn: "cup",
      type: "breakfast-tea"
    });
  });

  it("can run", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {
      hotBeverage: {
        make: async (parsedArgv) => {
          if (!parsedArgv.type) {
            throw new Error("Missing hot beverage type argument");
          }

          resultMessage = "Making a hot beverage: " + parsedArgv.type;
        }
      }
    };

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage", "make", "--type=breakfast-tea"];

    let cli = new cudoCli.CudoCli(mockActions);

    await cli.run(mockArgv);

    return chai.expect(resultMessage).eq("Making a hot beverage: breakfast-tea");
  });

  it("can run an action", async () => {
    let resultMessage = "";

    let mockActions: cudoCli.Actions = {
      hotBeverage: {
        make: async (parsedArgv) => {
          if (!parsedArgv.type) {
            throw new Error("Missing hot beverage type argument");
          }

          resultMessage = "Making a hot beverage: " + parsedArgv.type;
        }
      }
    };

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage", "make", "--type=breakfast-tea"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    await cli.runAction(parsedArgv);

    return chai.expect(resultMessage).eq("Making a hot beverage: breakfast-tea");
  });

  it("throws an error on running an action when scope is not specified", async () => {
    let mockActions: cudoCli.Actions = {
      hotBeverage: {}
    };

    let mockArgv = ["path-to-node", "path-to-script"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejectedWith("Missing scope argument");
  });

  it("throws an error on running an action when action is not specified", async () => {
    let mockActions: cudoCli.Actions = {
      hotBeverage: {}
    };

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejectedWith("Missing action argument");
  });

  it("throws an error on running an action when specified scope does not exist", async () => {
    let mockActions: cudoCli.Actions = {};

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejectedWith("Scope `hotBeverage` does not exist");
  });

  it("throws an error on running an action when specified action does not exist", async () => {
    let mockActions: cudoCli.Actions = {
      hotBeverage: {}
    };

    let mockArgv = ["path-to-node", "path-to-script", "hot-beverage", "prepare"];

    let cli = new cudoCli.CudoCli(mockActions);

    let parsedArgv = cli.parseArgv(mockArgv);

    return chai.expect(cli.runAction(parsedArgv)).eventually.rejectedWith("Action `prepare` does not exist in scope `hotBeverage`");
  });
});