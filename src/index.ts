export interface App extends Component {
    runnable: string;

    runnableArguments?: any[];
}

export interface Component {
    dependencies?: Component[];

    serviceProviders: ServiceProvider[];
}

export interface Cudo {
    run: (app: App) => Promise<void>;
}

export interface Service { }

export interface ServiceProvider {
    createService: (...serviceDependencies: Service[]) => Promise<Service>;

    serviceDependencyNames?: string[];

    serviceName: string;
}

async function extractServiceProvidersFromComponents(components: Component[], serviceProviders: ServiceProvider[]) {
    for (let i = 0; i < components.length; i++) {
        serviceProviders = serviceProviders.concat(components[i].serviceProviders);

        if (components[i].dependencies) {
            let dependencyServiceProviders = await extractServiceProvidersFromComponents(components[i].dependencies, serviceProviders);

            serviceProviders = serviceProviders.concat(dependencyServiceProviders);
        }
    }

    return serviceProviders;
}

async function filterUniqueServiceProviders(serviceProviders: ServiceProvider[]) {
    let uniqueServiceProviders: ServiceProvider[] = [];

    let existingServiceNames = [];

    for (let i = 0; i < serviceProviders.length; i++) {
        if (existingServiceNames.indexOf(serviceProviders[i].serviceName) == -1) {
            uniqueServiceProviders.push(serviceProviders[i]);

            existingServiceNames.push(serviceProviders[i].serviceName);
        }
    }

    return uniqueServiceProviders;
}

async function resolveServices(serviceProviders: ServiceProvider[]) {
    interface ServicesByName {
        [name: string]: Service;
    }

    interface TmpServiceProvider extends ServiceProvider {
        resolvedServiceDependenciesCount: number;

        serviceDependencies: Service[];
    }

    let servicesByName: ServicesByName = {};

    let tmpServiceProviders: TmpServiceProvider[] = Object.assign([], serviceProviders);

    let failCounter: number = 0;

    while (tmpServiceProviders.length > 0) {
        let tmpServiceProvider: TmpServiceProvider = tmpServiceProviders.splice(0, 1)[0];

        if (tmpServiceProvider.serviceDependencyNames == undefined
            || tmpServiceProvider.serviceDependencyNames.length == 0) {
            servicesByName[tmpServiceProvider.serviceName] = await tmpServiceProvider.createService();
        }
        else {
            if (tmpServiceProvider.serviceDependencies == undefined) {
                tmpServiceProvider.resolvedServiceDependenciesCount = 0;

                tmpServiceProvider.serviceDependencies = [];

                for (let i = 0; i < tmpServiceProvider.serviceDependencyNames.length; i++) {
                    tmpServiceProvider.serviceDependencies.push(undefined);
                }
            }

            let resolvedServiceDependenciesCountBeforeCheck = tmpServiceProvider.resolvedServiceDependenciesCount;

            for (let i = 0; i < tmpServiceProvider.serviceDependencies.length; i++) {
                if (tmpServiceProvider.serviceDependencies[i] == undefined
                    && servicesByName[tmpServiceProvider.serviceDependencyNames[i]]) {
                    tmpServiceProvider.serviceDependencies[i] = servicesByName[tmpServiceProvider.serviceDependencyNames[i]];

                    tmpServiceProvider.resolvedServiceDependenciesCount++;
                }
            }

            if (tmpServiceProvider.serviceDependencies.length == tmpServiceProvider.resolvedServiceDependenciesCount) {
                servicesByName[tmpServiceProvider.serviceName] = await tmpServiceProvider.createService.apply(null, tmpServiceProvider.serviceDependencies);
            }
            else {
                tmpServiceProviders.push(tmpServiceProvider);
            }

            if (resolvedServiceDependenciesCountBeforeCheck == tmpServiceProvider.resolvedServiceDependenciesCount) {
                failCounter++;
            }
        }

        if (failCounter > tmpServiceProviders.length + 1) {
            let remainingProvidersNames = [];

            for (let i = 0; i < tmpServiceProviders.length; i++) {
                remainingProvidersNames.push(tmpServiceProvider.serviceName);
            }

            throw new Error("Dependencies for the following services cannot be resolved: " + remainingProvidersNames.join(", "));
        }
    }

    return servicesByName;
}

const cudo: Cudo = {
    run: async (app) => {
        let serviceProviders: ServiceProvider[] = [];

        serviceProviders = serviceProviders.concat(app.serviceProviders);

        if (app.dependencies) {
            let dependencyServiceProviders = await extractServiceProvidersFromComponents(app.dependencies, serviceProviders);

            serviceProviders = serviceProviders.concat(dependencyServiceProviders);
        }

        let uniqueServiceProviders = await filterUniqueServiceProviders(serviceProviders);

        let servicesByName = await resolveServices(uniqueServiceProviders);

        let runnableChunks = app.runnable.split(".");

        if (servicesByName[runnableChunks[0]]
            && servicesByName[runnableChunks[0]][runnableChunks[1]]) {
            let runnableArguments = app.runnableArguments || [];

            return servicesByName[runnableChunks[0]][runnableChunks[1]].apply(null, runnableArguments);
        }
        else {
            throw new Error("Runnable `" + app.runnable + "` is not a valid service or function.");
        }
    }
}

export default cudo;