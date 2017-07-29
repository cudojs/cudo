"use strict";

const camelcase = require("camelcase");

const path = require("path");

const recursiveReaddir = require("recursive-readdir");

const emptyLogFunction = function (msg) { };

const cudo = {
    init(conf) {
        // Ensure required configuration properties are present.
        conf = conf ? conf : {};

        // Define log functions based on whether quiet mode is on or off.
        let errorLog = console.error;

        if (conf.core && conf.core.quietMode) {
            errorLog = emptyLogFunction;
        }

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

                let lookupConf = null;

                if (app.conf.core && app.conf.core.handlers) {
                    if (app.conf.core.handlers.autoLoadDisabled !== true) {
                        if (Array.isArray(app.conf.core.handlers.paths)) {
                            lookupConf = app.conf.core.handlers.paths;

                            return app.handlersLoad(lookupConf).then(() => {
                                return new Promise((resolve) => {
                                    resolve(app);
                                });
                            });
                        }
                        else {
                            return Promise.reject(new Error("Incorrect handler lookup configuration, missing lookup paths array."));
                        }
                    }
                }

                // If criteria for auto-load were not met, return promise with app object.
                return new Promise((resolve) => {
                    resolve(app);
                });
            },
            handlersLoad(lookupConf) {
                let readDirPromises = [];

                for (let i = 0; i < lookupConf.length; i++) {
                    let lookupPath = null;

                    let containerName = null;

                    if (typeof lookupConf[i] === "string") {
                        // Allow a lookupConf item to be a string defining lookupPath.
                        lookupPath = lookupConf[i];
                    }
                    else if (typeof lookupConf[i] === "object"
                        && lookupConf[i].hasOwnProperty("containerName")
                        && lookupConf[i].hasOwnProperty("path")) {
                        // Allow a lookupConf item to be an object containing definitions of lookupPath and containerName.
                        containerName = lookupConf[i].containerName;

                        app.handlers[containerName] = {};

                        lookupPath = lookupConf[i].path;
                    }

                    if (!lookupPath) {
                        return Promise.reject(new Error("Incorrect handler lookup configuration, expected object or string"));
                    }

                    readDirPromises.push(recursiveReaddir(lookupPath)
                        .then((fileSets) => {
                            let files = [];

                            for (let i = 0; i < fileSets.length; i++) {
                                files = files.concat(fileSets[i]);
                            }

                            return new Promise((resolve) => {
                                for (let i = 0; i < files.length; i++) {
                                    let filePath = files[i];

                                    let fileRelativePath = path.relative(lookupPath, filePath);

                                    let filePathChunks = fileRelativePath.split(path.sep);

                                    let cursor = containerName ? app.handlers[containerName] : app.handlers;

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

                                    cursor[basenameCamelCase] = require(filePath).handler;
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
                    .catch(errorLog);
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
            .catch(errorLog);
    }
};

module.exports = cudo;
