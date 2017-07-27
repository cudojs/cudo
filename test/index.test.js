"use strict";

const chai = require("chai");

const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const cudo = require("../");

const fs = require("fs");

const conf = {
    core: {
        handlers: {
            paths: [
                fs.realpathSync(__dirname + "/.aux/handlers")
            ]
        }
    }
};

describe("Basic checks", () => {
    it("App object can be created", () => {
        return chai.assert.isFulfilled(cudo.init());
    });

    it("App object has method run()", () => {
        return chai.expect(cudo.init())
            .eventually.haveOwnProperty("run");
    });

    it("App can be run", () => {
        return cudo.init()
            .then((app) => {
                return chai.expect(app.run())
                    .eventually.property("data")
                    .become({});
            });
    });

    it("Context data can be pre-set", () => {
        return cudo.init()
            .then((app) => {
                return chai.expect(app.run({ test: "test" }))
                    .eventually.property("data")
                    .become({ test: "test" });
            });
    });
});

describe("Handlers", () => {
    it("Run handler can be extended", () => {
        return cudo.init()
            .then((app) => {
                app.handlers.core.run = ((existingHandler) => {
                    return (context) => {
                        return existingHandler(context)
                            .then((context) => {
                                return new Promise((resolve) => {
                                    context.data.test = "test";

                                    resolve(context);
                                });
                            });
                    }
                })(app.handlers.core.run);

                return chai.expect(app.run())
                    .eventually.property("data")
                    .become({ test: "test" });
            });
    });

    it("Handlers can be auto-loaded", () => {
        return chai.expect(cudo.init(conf))
            .eventually.property("handlers")
            .property("test")
            .property("autoLoadTest");
    });

    it("Handlers can be divided into groups", () => {
        return chai.expect(cudo.init(conf))
            .eventually.property("handlers")
            .property("test")
            .property("testGroup")
            .property("autoLoadTest");
    });

    it("Auto-loader can be disabled", () => {
        let confAutoLoadDisabled = conf;

        confAutoLoadDisabled.core.handlers.autoLoadDisabled = true;

        return chai.expect(cudo.init(confAutoLoadDisabled))
            .eventually.property("handlers")
            .not.property("test");
    });
});

describe("Child contexts", () => {
    it("Child context can be created with access to parent and root context data", () => {
        return cudo.init()
            .then((app) => {
                let context = app.contextCreateSync(null, { test: "test" });

                let childContext = context.app.contextCreateSync(context);

                return chai.assert.ok(childContext.parent.data.test == "test"
                    && childContext.root.data.test == "test");
            });
    });

    it("Grandchild context can be created with access to parent and root context data", () => {
        return cudo.init()
            .then((app) => {
                let context = app.contextCreateSync(null, { test: "test" });

                let childContext = context.app.contextCreateSync(context, { test: "test2" });

                let grandchildContext = childContext.app.contextCreateSync(childContext);

                return chai.assert.ok(grandchildContext.parent.data.test == "test2"
                    && grandchildContext.root.data.test == "test");
            });
    });

    it("Child context data is not accessible from parent context", () => {
        return cudo.init()
            .then((app) => {
                let context = app.contextCreateSync();

                let childContext = context.app.contextCreateSync(context, { test: "test" });

                return chai.assert.ok(!context.data.test);
            });
    });
});

describe("Multiple app objects", () => {
    it("Handlers are not shared between app objects", () => {
        return cudo.init(conf)
            .then((app) => {
                app.handlers.core.run = ((existingHandler) => {
                    return (app) => {
                        return existingHandler(app)
                            .then((context) => {
                                return new Promise((resolve, reject) => {
                                    context.data.test = "test";

                                    resolve(context);
                                });
                            });
                    }
                })(app.handlers.core.run);

                return app.run();
            })
            .then(() => {
                return cudo.init(conf).then((app) => {
                    return chai.expect(app.run())
                        .eventually.property("data")
                        .become({});
                });
            })
    });
});
