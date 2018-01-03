"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const _1 = require("../");
chai.use(chaiAsPromised);
describe("Object `cudo`", () => __awaiter(this, void 0, void 0, function* () {
    it("Can run an app with single own service", () => __awaiter(this, void 0, void 0, function* () {
        let demoAppServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return true;
                    })
                };
                return demoAppService;
            }),
            serviceName: "cudo.demoAppService"
        };
        let app = {
            runnable: "cudo.demoAppService.run",
            serviceProviders: [demoAppServiceProvider]
        };
        return chai.expect(_1.default.run(app)).eventually.equal(true);
    }));
    it("Can run an app with arguments passed to the runnable", () => __awaiter(this, void 0, void 0, function* () {
        let demoAppServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: (x, y) => __awaiter(this, void 0, void 0, function* () {
                        return x + y;
                    })
                };
                return demoAppService;
            }),
            serviceName: "cudo.demoAppService"
        };
        let x = 2;
        let y = 7;
        let app = {
            runnable: "cudo.demoAppService.run",
            runnableArguments: [x, y],
            serviceProviders: [demoAppServiceProvider]
        };
        return chai.expect(_1.default.run(app)).eventually.equal(x + y);
    }));
    it("Can run an app with service dependencies", () => __awaiter(this, void 0, void 0, function* () {
        let newsletterServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let newsletterService = {
                    composeNewsletter: () => __awaiter(this, void 0, void 0, function* () {
                        return {
                            headline: "Lorem ipsum"
                        };
                    })
                };
                return newsletterService;
            }),
            serviceName: "cudo.newsletterService"
        };
        let demoAppServiceProvider = {
            createService: (newsletterService) => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return newsletterService.composeNewsletter();
                    })
                };
                return demoAppService;
            }),
            serviceDependencyNames: ["cudo.newsletterService"],
            serviceName: "cudo.demoAppService"
        };
        let app = {
            runnable: "cudo.demoAppService.run",
            serviceProviders: [demoAppServiceProvider, newsletterServiceProvider]
        };
        return chai.expect(_1.default.run(app)).eventually.property("headline", "Lorem ipsum");
    }));
    it("Can run an app with component and service dependencies", () => __awaiter(this, void 0, void 0, function* () {
        let newsFeedServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let newsFeedService = {
                    fetchNews: () => __awaiter(this, void 0, void 0, function* () {
                        return [
                            {
                                title: "Dolor sit amet"
                            }
                        ];
                    })
                };
                return newsFeedService;
            }),
            serviceName: "cudo.newsFeedService"
        };
        let newsletterServiceProvider = {
            createService: (newsFeedService) => __awaiter(this, void 0, void 0, function* () {
                let newsletterService = {
                    composeNewsletter: () => __awaiter(this, void 0, void 0, function* () {
                        return {
                            headline: "Lorem ipsum",
                            newsFeed: newsFeedService.fetchNews()
                        };
                    })
                };
                return newsletterService;
            }),
            serviceDependencyNames: ["cudo.newsFeedService"],
            serviceName: "cudo.newsletterService"
        };
        let newsletterComponent = {
            serviceProviders: [newsFeedServiceProvider, newsletterServiceProvider]
        };
        let demoAppServiceProvider = {
            createService: (newsletterService) => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return newsletterService.composeNewsletter();
                    })
                };
                return demoAppService;
            }),
            serviceDependencyNames: ["cudo.newsletterService"],
            serviceName: "cudo.demoAppService"
        };
        let app = {
            dependencies: [newsletterComponent],
            runnable: "cudo.demoAppService.run",
            serviceProviders: [demoAppServiceProvider]
        };
        return chai.expect(_1.default.run(app)).eventually.property("newsFeed").property("0").property("title", "Dolor sit amet");
    }));
    it("Can determine which service provider to use when multiple providers exists for the same service", () => __awaiter(this, void 0, void 0, function* () {
        let newsFeedServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let newsFeedService = {
                    fetchNews: () => __awaiter(this, void 0, void 0, function* () {
                        return [
                            {
                                title: "Nunc dolorem"
                            }
                        ];
                    })
                };
                return newsFeedService;
            }),
            serviceName: "cudo.newsFeedService"
        };
        let newsletterServiceProvider = {
            createService: (newsFeedService) => __awaiter(this, void 0, void 0, function* () {
                let newsletterService = {
                    composeNewsletter: () => __awaiter(this, void 0, void 0, function* () {
                        return {
                            headline: "Lorem ipsum",
                            newsFeed: newsFeedService.fetchNews()
                        };
                    })
                };
                return newsletterService;
            }),
            serviceDependencyNames: ["cudo.newsFeedService"],
            serviceName: "cudo.newsletterService"
        };
        let newsletterComponent = {
            serviceProviders: [newsFeedServiceProvider, newsletterServiceProvider]
        };
        let demoAppServiceProvider = {
            createService: (newsletterService) => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return newsletterService.composeNewsletter();
                    })
                };
                return demoAppService;
            }),
            serviceDependencyNames: ["cudo.newsletterService"],
            serviceName: "cudo.demoAppService"
        };
        ;
        let enhancedNewsFeedServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let newsFeedService = {
                    fetchNews: () => __awaiter(this, void 0, void 0, function* () {
                        return [
                            {
                                title: "Dolor sit amet",
                                synopsis: "Dolor sit amet, consectetur adipiscing elit."
                            }
                        ];
                    })
                };
                return newsFeedService;
            }),
            serviceName: "cudo.newsFeedService"
        };
        let app = {
            dependencies: [newsletterComponent],
            runnable: "cudo.demoAppService.run",
            serviceProviders: [demoAppServiceProvider, enhancedNewsFeedServiceProvider]
        };
        return chai.expect(_1.default.run(app)).eventually.property("newsFeed").property("0").property("synopsis", "Dolor sit amet, consectetur adipiscing elit.");
    }));
    it("Throws an error when the runnable is not a valid service or function", () => __awaiter(this, void 0, void 0, function* () {
        let app = {
            runnable: "",
            serviceProviders: []
        };
        return chai.expect(_1.default.run(app)).rejected;
    }));
    it("Throws an error when a service name format is invalid", () => __awaiter(this, void 0, void 0, function* () {
        let demoAppServiceProvider = {
            createService: () => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return true;
                    })
                };
                return demoAppService;
            }),
            serviceName: "demoAppService"
        };
        let app = {
            runnable: "demoAppService.run",
            serviceProviders: [demoAppServiceProvider]
        };
        return chai.expect(_1.default.run(app)).rejected;
    }));
    it("Throws an error when trying to run an app and an impossible to resolve dependency is found", () => __awaiter(this, void 0, void 0, function* () {
        let demoAppServiceProvider = {
            createService: (newsletterService) => __awaiter(this, void 0, void 0, function* () {
                let demoAppService = {
                    run: () => __awaiter(this, void 0, void 0, function* () {
                        return newsletterService.composeNewsletter();
                    })
                };
                return demoAppService;
            }),
            serviceDependencyNames: ["cudo.newsletterService"],
            serviceName: "cudo.demoAppService"
        };
        let app = {
            runnable: "cudo.demoAppService.run",
            serviceProviders: [demoAppServiceProvider]
        };
        return chai.expect(_1.default.run(app)).rejected;
    }));
}));
