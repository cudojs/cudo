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
        return chai.expect(cudo.init()).to.eventually.haveOwnProperty("run");
    });

    it("App can be run", () => {
        return chai.expect(cudo.init()
            .then((app) => {
                return app.run();
            }))
            .eventually.property("data")
            .become({});
    });

    it("App data can be pre-set", () => {
        return chai.expect(cudo.init()
            .then((app) => {
                return app.run({test: "test"});
            }))
            .eventually.property("data")
            .become({test: "test"});
    });
});

describe("Handlers", () => {
    it("Run handler can be extended", () => {
        return chai.expect(cudo.init()
            .then((app) => {
                app.handlers.core.run = ((existingHandler) => {
                    return (app) => {
                        return existingHandler(app)
                            .then((app) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        app.data.test = "test";

                                        resolve(app);
                                    }
                                    catch (err) {
                                        reject(err);
                                    }
                                });
                            });
                    }
                })(app.handlers.core.run);

                return app.run();
            }))
            .eventually.property("data")
            .become({test: "test"});
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

describe("Multiple app objects", () => {
    it("Handlers are not shared between app objects", () => {
        return chai.expect(cudo.init(conf)
            .then((app) => {
                app.handlers.core.run = ((existingHandler) => {
                    return (app) => {
                        return existingHandler(app)
                            .then((app) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        app.data.test = "test";

                                        resolve(app);
                                    }
                                    catch (err) {
                                        reject(err);
                                    }
                                });
                            });
                    }
                })(app.handlers.core.run);

                return app.run();
            })
            .then(() => {
                return cudo.init(conf);
            })
            .then((app) => {
                return app.run();
            }))
            .eventually.property("data")
            .become({});
    });
});
