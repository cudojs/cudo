"use strict";

const camelcase = require("camelcase");

const path = require("path");

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
            handlersAutoLoad() {
                let app = this;

                // Extract handler auto-loader settings.

                let autoLoadDisabled = false;

                let handlerPaths = null;

                if (app.conf.core && app.conf.core.handlers) {
                    if (app.conf.core.handlers.autoLoadDisabled !== true) {
                        if (Array.isArray(app.conf.core.handlers.paths)) {
                            handlerPaths = app.conf.core.handlers.paths;

                            return app.handlersLoad(handlerPaths).then(() => {
                                return new Promise((resolve) => {
                                    resolve(app);
                                });
                            });
                        }
                    }
                }

                // If criteria for auto-load were not met, return promise with app object.
                return new Promise((resolve) => {
                    resolve(app);
                });
            },
            handlersLoad(handlerDirPaths) {
                let readDirPromises = [];

                for (let i = 0; i < handlerDirPaths.length; i++) {
                    let handlerDirPath = handlerDirPaths[i];

                    readDirPromises.push(recursiveReaddir(handlerDirPath)
                        .then((fileSets) => {
                            let files = [];

                            for (let i = 0; i < fileSets.length; i++) {
                                files = files.concat(fileSets[i]);
                            }

                            return new Promise((resolve) => {
                                for (let i = 0; i < files.length; i++) {
                                    let filePath = files[i];

                                    let fileRelativePath = path.relative(handlerDirPath, filePath);

                                    let filePathChunks = fileRelativePath.split(path.sep);

                                    let cursor = app.handlers;

                                    for (let i2 = 0; i2 < filePathChunks.length; i2++) {
                                        let chunkCamelCase = camelcase(filePathChunks[i2]);

                                        if (i2 + 1 < filePathChunks.length) {
                                            if (typeof cursor[chunkCamelCase] === "undefined") {
                                                cursor[chunkCamelCase] = {};
                                            }

                                            cursor = cursor[chunkCamelCase];
                                        }
                                    }

                                    let fileExt = path.extname(filePath);

                                    let basenameCamelCase = camelcase(path.basename(filePath, fileExt))

                                    cursor[basenameCamelCase] = require(filePath);
                                }

                                resolve();
                            });
                        }));
                }

                return Promise.all(readDirPromises);
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

        return app.handlersAutoLoad()
            .catch(console.error);
    }
};

module.exports = cudo;
