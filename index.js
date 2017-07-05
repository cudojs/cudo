"use strict";

const recursiveReaddir = require("recursive-readdir");

const cudo = {
    init(conf) {
        // Ensure required configuration properties are present.
        conf = (typeof conf === "object") ? conf : {};

        conf.core = (typeof conf.core === "object") ? conf.core : {};

        conf.core.handlersAutoLoad = (typeof conf.core.handlersAutoLoad !== "undefined") ? conf.core.handlersAutoLoad : true;

        conf.core.handlersDirPath = (typeof conf.core.handlersDirPath === "string") ? conf.core.handlersDirPath : "./handlers";

        // Define app object.
        let app = {
            run(data) {
                let context = this;

                context.data = (typeof data === "object") ? data : {};

                return context.handlers.core.run(context)
                    .catch(console.error);
            },
            conf: conf,
            handlers: {
                core: {
                    run: (context) => {
                        return new Promise((resolve, reject) => {
                            try {
                                resolve(context);
                            }
                            catch (err) {
                                reject(err);
                            }
                        });
                    }
                }
            }
        };

        // Auto-load handlers and return app object.
        if (conf.core.handlersAutoLoad) {
            return recursiveReaddir(conf.core.handlersDirPath)
                .then((files) => {
                    return new Promise((resolve, reject) => {
                        for (let i = 0; i < files.length; i++) {
                            let handlerWrapper = require("./" + files[i]);

                            if (handlerWrapper.scope.component
                                && handlerWrapper.scope.name
                                && handlerWrapper.handler
                                && handlerWrapper.scope.component !== "core") {
                                if (typeof app.handlers[handlerWrapper.scope.component] !== "object") {
                                    app.handlers[handlerWrapper.scope.component] = {};
                                }

                                app.handlers[handlerWrapper.scope.component][handlerWrapper.scope.name] = handlerWrapper.handler;
                            }
                        }

                        resolve();
                    });
                })
                .then(() => {
                    return new Promise((resolve) => {
                        resolve(app);
                    });
                });
        }
        else {
            return new Promise((resolve) => {
                resolve(app);
            }); 
        }
    }
};

module.exports = cudo;
