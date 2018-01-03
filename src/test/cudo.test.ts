import * as chai from "chai";

import * as chaiAsPromised from "chai-as-promised";

import cudo, { App, Component, Service, ServiceProvider } from "../";

chai.use(chaiAsPromised);

describe("Object `cudo`", async () => {
  it("Can run an app with single own service", async () => {
    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: () => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async () => {
        let demoAppService = {
          run: async () => {
            return true;
          }
        };

        return demoAppService;
      },
      serviceName: "cudo.demoAppService"
    }

    let app: App = {
      runnable: "cudo.demoAppService.run",
      serviceProviders: [demoAppServiceProvider]
    };

    return chai.expect(cudo.run(app)).eventually.equal(true);
  });

  it("Can run an app with arguments passed to the runnable", async () => {
    interface DemoAppService extends Service {
      run: (x: number, y: number) => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: () => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async () => {
        let demoAppService = {
          run: async (x, y) => {
            return x + y;
          }
        };

        return demoAppService;
      },
      serviceName: "cudo.demoAppService"
    }

    let x = 2;

    let y = 7;

    let app: App = {
      runnable: "cudo.demoAppService.run",
      runnableArguments: [x, y],
      serviceProviders: [demoAppServiceProvider]
    };

    return chai.expect(cudo.run(app)).eventually.equal(x + y);
  });

  it("Can run an app with service dependencies", async () => {
    interface NewsletterService extends Service {
      composeNewsletter: () => Promise<{}>;
    }

    interface NewsletterServiceProvider extends ServiceProvider {
      createService: () => Promise<NewsletterService>;
    }

    let newsletterServiceProvider: NewsletterServiceProvider = {
      createService: async () => {
        let newsletterService = {
          composeNewsletter: async () => {
            return {
              headline: "Lorem ipsum"
            };
          }
        };

        return newsletterService;
      },
      serviceName: "cudo.newsletterService"
    }

    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: (newsletterService: NewsletterService) => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async (newsletterService) => {
        let demoAppService = {
          run: async () => {
            return newsletterService.composeNewsletter();
          }
        };

        return demoAppService;
      },
      serviceDependencyNames: ["cudo.newsletterService"],
      serviceName: "cudo.demoAppService"
    }

    let app: App = {
      runnable: "cudo.demoAppService.run",
      serviceProviders: [demoAppServiceProvider, newsletterServiceProvider]
    };

    return chai.expect(cudo.run(app)).eventually.property("headline", "Lorem ipsum");
  });

  it("Can run an app with component and service dependencies", async () => {
    interface NewsFeedService extends Service {
      fetchNews: () => Promise<{ title: string; }[]>;
    }

    interface NewsFeedServiceProvider extends ServiceProvider {
      createService: () => Promise<NewsFeedService>;
    }

    let newsFeedServiceProvider: NewsFeedServiceProvider = {
      createService: async () => {
        let newsFeedService = {
          fetchNews: async () => {
            return [
              {
                title: "Dolor sit amet"
              }
            ];
          }
        };

        return newsFeedService;
      },
      serviceName: "cudo.newsFeedService"
    }

    interface NewsletterService extends Service {
      composeNewsletter: () => Promise<{}>;
    }

    interface NewsletterServiceProvider extends ServiceProvider {
      createService: (newsFeedService: NewsFeedService) => Promise<NewsletterService>;
    }

    let newsletterServiceProvider: NewsletterServiceProvider = {
      createService: async (newsFeedService) => {
        let newsletterService = {
          composeNewsletter: async () => {
            return {
              headline: "Lorem ipsum",
              newsFeed: newsFeedService.fetchNews()
            };
          }
        };

        return newsletterService;
      },
      serviceDependencyNames: ["cudo.newsFeedService"],
      serviceName: "cudo.newsletterService"
    }

    let newsletterComponent: Component = {
      serviceProviders: [newsFeedServiceProvider, newsletterServiceProvider]
    };

    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: (newsletterService: NewsletterService) => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async (newsletterService) => {
        let demoAppService = {
          run: async () => {
            return newsletterService.composeNewsletter();
          }
        };

        return demoAppService;
      },
      serviceDependencyNames: ["cudo.newsletterService"],
      serviceName: "cudo.demoAppService"
    }

    let app: App = {
      dependencies: [newsletterComponent],
      runnable: "cudo.demoAppService.run",
      serviceProviders: [demoAppServiceProvider]
    };

    return chai.expect(cudo.run(app)).eventually.property("newsFeed").property("0").property("title", "Dolor sit amet");
  });

  it("Can determine which service provider to use when multiple providers exists for the same service", async () => {
    interface NewsFeedService extends Service {
      fetchNews: () => Promise<{ title: string; }[]>;
    }

    interface NewsFeedServiceProvider extends ServiceProvider {
      createService: () => Promise<NewsFeedService>;
    }

    let newsFeedServiceProvider: NewsFeedServiceProvider = {
      createService: async () => {
        let newsFeedService = {
          fetchNews: async () => {
            return [
              {
                title: "Nunc dolorem"
              }
            ];
          }
        };

        return newsFeedService;
      },
      serviceName: "cudo.newsFeedService"
    }

    interface NewsletterService extends Service {
      composeNewsletter: () => Promise<{}>;
    }

    interface NewsletterServiceProvider extends ServiceProvider {
      createService: (newsFeedService: NewsFeedService) => Promise<NewsletterService>;
    }

    let newsletterServiceProvider: NewsletterServiceProvider = {
      createService: async (newsFeedService) => {
        let newsletterService = {
          composeNewsletter: async () => {
            return {
              headline: "Lorem ipsum",
              newsFeed: newsFeedService.fetchNews()
            };
          }
        };

        return newsletterService;
      },
      serviceDependencyNames: ["cudo.newsFeedService"],
      serviceName: "cudo.newsletterService"
    }

    let newsletterComponent: Component = {
      serviceProviders: [newsFeedServiceProvider, newsletterServiceProvider]
    };

    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: (newsletterService: NewsletterService) => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async (newsletterService) => {
        let demoAppService = {
          run: async () => {
            return newsletterService.composeNewsletter();
          }
        };

        return demoAppService;
      },
      serviceDependencyNames: ["cudo.newsletterService"],
      serviceName: "cudo.demoAppService"
    }

    interface EnhancedNewsFeedServiceProvider extends NewsFeedServiceProvider {
      fetchNews: () => Promise<{ title: string; synopsis: string; }[]>;
    };

    let enhancedNewsFeedServiceProvider: NewsFeedServiceProvider = {
      createService: async () => {
        let newsFeedService = {
          fetchNews: async () => {
            return [
              {
                title: "Dolor sit amet",
                synopsis: "Dolor sit amet, consectetur adipiscing elit."
              }
            ];
          }
        };

        return newsFeedService;
      },
      serviceName: "cudo.newsFeedService"
    }

    let app: App = {
      dependencies: [newsletterComponent],
      runnable: "cudo.demoAppService.run",
      serviceProviders: [demoAppServiceProvider, enhancedNewsFeedServiceProvider]
    };

    return chai.expect(cudo.run(app)).eventually.property("newsFeed").property("0").property("synopsis", "Dolor sit amet, consectetur adipiscing elit.");

  });

  it("Throws an error when the runnable is not a valid service or function", async () => {
    let app: App = {
      runnable: "",
      serviceProviders: []
    }

    return chai.expect(cudo.run(app)).rejected;
  });

  it("Throws an error when a service name format is invalid", async () => {
    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: () => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async () => {
        let demoAppService = {
          run: async () => {
            return true;
          }
        };

        return demoAppService;
      },
      serviceName: "demoAppService"
    }

    let app: App = {
      runnable: "demoAppService.run",
      serviceProviders: [demoAppServiceProvider]
    };

    return chai.expect(cudo.run(app)).rejected;
  });

  it("Throws an error when trying to run an app and an impossible to resolve dependency is found", async () => {
    interface NewsletterService extends Service {
      composeNewsletter: () => Promise<{}>;
    }

    interface DemoAppService extends Service {
      run: () => Promise<{}>;
    }

    interface DemoAppServiceProvider extends ServiceProvider {
      createService: (newsletterService: NewsletterService) => Promise<DemoAppService>;
    }

    let demoAppServiceProvider: DemoAppServiceProvider = {
      createService: async (newsletterService) => {
        let demoAppService = {
          run: async () => {
            return newsletterService.composeNewsletter();
          }
        };

        return demoAppService;
      },
      serviceDependencyNames: ["cudo.newsletterService"],
      serviceName: "cudo.demoAppService"
    }

    let app: App = {
      runnable: "cudo.demoAppService.run",
      serviceProviders: [demoAppServiceProvider]
    };

    return chai.expect(cudo.run(app)).rejected;
  });
});