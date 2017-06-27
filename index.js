"use strict";

const cudo = {
    init() {
        return {
            run() {
                let context = this;

                this.handler.core.run(context)
                    .catch(console.error);
            },
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
