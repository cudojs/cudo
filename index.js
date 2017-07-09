"use strict";

const recursiveReaddir = require("recursive-readdir");

const cudo = {
    init(conf) {
        // Ensure required configuration properties are present.
        conf = (typeof conf === "object") ? conf : {};

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

                    return new Promise((resolve, reject) => {
                        for (let i = 0; i < files.length; i++) {
                            let handlerWrapper = require(files[i]);

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
