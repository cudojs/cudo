"use strict";

const cudo = {
    init(conf) {
        conf = (conf) ? conf : {};

        return {
            run(context) {
                context = (context) ? context : {};

                return this.handler.core.run(context)
                    .catch(console.error);
            },
            conf: conf,
            handler: {
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
    }
};

module.exports = cudo;
