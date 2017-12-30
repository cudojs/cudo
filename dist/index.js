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
function extractServiceProvidersFromComponents(components, serviceProviders) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < components.length; i++) {
            serviceProviders = serviceProviders.concat(components[i].serviceProviders);
            if (components[i].dependencies) {
                let dependencyServiceProviders = yield extractServiceProvidersFromComponents(components[i].dependencies, serviceProviders);
                serviceProviders = serviceProviders.concat(dependencyServiceProviders);
            }
        }
        return serviceProviders;
    });
}
function filterUniqueServiceProviders(serviceProviders) {
    return __awaiter(this, void 0, void 0, function* () {
        let uniqueServiceProviders = [];
        let existingServiceNames = [];
        for (let i = 0; i < serviceProviders.length; i++) {
            if (existingServiceNames.indexOf(serviceProviders[i].serviceName) == -1) {
                uniqueServiceProviders.push(serviceProviders[i]);
                existingServiceNames.push(serviceProviders[i].serviceName);
            }
        }
        return uniqueServiceProviders;
    });
}
function resolveServices(serviceProviders) {
    return __awaiter(this, void 0, void 0, function* () {
        let servicesByName = {};
        let tmpServiceProviders = Object.assign([], serviceProviders);
        let failCounter = 0;
        while (tmpServiceProviders.length > 0) {
            let tmpServiceProvider = tmpServiceProviders.splice(0, 1)[0];
            if (tmpServiceProvider.serviceDependencyNames == undefined
                || tmpServiceProvider.serviceDependencyNames.length == 0) {
                servicesByName[tmpServiceProvider.serviceName] = yield tmpServiceProvider.createService();
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
                    servicesByName[tmpServiceProvider.serviceName] = yield tmpServiceProvider.createService.apply(null, tmpServiceProvider.serviceDependencies);
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
    });
}
const cudo = {
    run: (app) => __awaiter(this, void 0, void 0, function* () {
        let serviceProviders = [];
        serviceProviders = serviceProviders.concat(app.serviceProviders);
        if (app.dependencies) {
            let dependencyServiceProviders = yield extractServiceProvidersFromComponents(app.dependencies, serviceProviders);
            serviceProviders = serviceProviders.concat(dependencyServiceProviders);
        }
        let uniqueServiceProviders = yield filterUniqueServiceProviders(serviceProviders);
        let servicesByName = yield resolveServices(uniqueServiceProviders);
        let runnableChunks = app.runnable.split(".");
        if (servicesByName[runnableChunks[0]]
            && servicesByName[runnableChunks[0]][runnableChunks[1]]) {
            let runnableArguments = app.runnableArguments || [];
            return servicesByName[runnableChunks[0]][runnableChunks[1]].apply(null, runnableArguments);
        }
        else {
            throw new Error("Runnable `" + app.runnable + "` is not a valid service or function.");
        }
    })
};
exports.default = cudo;
