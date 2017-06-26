﻿let chai = require("chai");

let chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const cudo = require("../");

describe("Basic checks", () => {
    let app = cudo.init();

    it("App object can be created", () => {
        chai.assert.ok(app);
    });

    it("Run method exists", () => {
        let runMethodExists = (typeof app.run === "function") ? true : false;

        chai.assert.ok(runMethodExists);
    });
});

describe("Handlers", () => {
    let app = cudo.init();

    it("Run handler can be extended", () => {
        app.handler.core.run = ((existingHandler) => {
            return (context) => {
                return existingHandler(context)
                    .then((context) => {
                        return new Promise((resolve, reject) => {
                            try {
                                context.test = "test";

                                resolve(context);
                            }
                            catch (err) {
                                reject(err);
                            }
                        });
                    });
            }
        })(app.handler.core.run);

        return chai.assert.becomes(app.handler.core.run({}), { test: "test" });
    });
});

describe("Multiple app objects", () => {
    let app1 = cudo.init();

    let app2 = cudo.init();

    it("Handlers are not shared between app objects", () => {
        app1.handler.myModule = {
            myHandler: (context) => { }
        };

        let handlerIsNotShared = (app2.handler.myModule
            && app2.handler.myModule.myHandler) ? false : true;

        chai.assert.ok(handlerIsNotShared);
    });
});
