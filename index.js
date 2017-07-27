"use strict";

const recursiveReaddir = require("recursive-readdir");

const cudo = {
    init(conf) {
        // Ensure required configuration properties are present.
        conf = conf ? conf : {};

        // Define app object.
        let app = {
            contextCreateSync(parent, data) {
                data = data ? data : {};

                let context = {
                    app: this,
                    data: data,
                    parent: parent
                };

                context.root = parent && parent.root ? parent.root : context;

                return context;
            },
            run(data) {
                let context = this.contextCreateSync(null, data);

                return this.handlers.core.run(context)
                    .catch(console.error);
            },
            conf: conf,
            handlers: {
                core: {
                    run: (context) => {
                        return new Promise((resolve) => {
                            resolve(context);
                        });
                    }
                }
            }
        };

        // Extract handler auto-loader settings.
        let autoLoadDisabled = false;

        let handlerPaths = null;

        if (typeof conf.core === "object"
            && typeof conf.core.handlers === "object") {
            if (conf.core.handlers.autoLoadDisabled === true) {
                autoLoadDisabled = true;
            }

            if (Array.isArray(conf.core.handlers.paths)) {
                handlerPaths = conf.core.handlers.paths;
            }
        }

        // Auto-load handlers and return app object.
        if (handlerPaths
            && !autoLoadDisabled) {
            let readDirPromises = [];

            for (let i = 0; i < handlerPaths.length; i++) {
                readDirPromises.push(recursiveReaddir(handlerPaths[i]));
            }

            return Promise.all(readDirPromises)
                .then((fileSets) => {
                    let files = [];

                    for (let i = 0; i < fileSets.length; i++) {
                        files = files.concat(fileSets[i]);
                    }

                    return new Promise((resolve) => {
                        for (let i = 0; i < files.length; i++) {
                            let handlerWrapper = require(files[i]);

                            if (handlerWrapper.scope.component
                                && handlerWrapper.scope.name
                                && handlerWrapper.handler
                                && handlerWrapper.scope.component !== "core") {
                                if (typeof app.handlers[handlerWrapper.scope.component] !== "object") {
                                    app.handlers[handlerWrapper.scope.component] = {};
                                }

                                if (typeof handlerWrapper.scope.group === "string") {
                                    if (typeof app.handlers[handlerWrapper.scope.component][handlerWrapper.scope.group] !== "object") {
                                        app.handlers[handlerWrapper.scope.component][handlerWrapper.scope.group] = {};
                                    }

                                    app.handlers[handlerWrapper.scope.component][handlerWrapper.scope.group][handlerWrapper.scope.name] = handlerWrapper.handler;
                                }
                                else {
                                    app.handlers[handlerWrapper.scope.component][handlerWrapper.scope.name] = handlerWrapper.handler;
                                }
                            }
                        }

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
