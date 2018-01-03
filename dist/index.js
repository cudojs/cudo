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
function filterValidUniqueServiceProviders(serviceProviders) {
    return __awaiter(this, void 0, void 0, function* () {
        let serviceNamePattern = /^[a-zA-Z0-9_\$]+\.[a-zA-Z0-9_\$]+$/;
        let uniqueServiceProviders = [];
        let existingServiceNames = [];
        for (let i = 0; i < serviceProviders.length; i++) {
            if (!serviceNamePattern.test(serviceProviders[i].serviceName)) {
                throw new Error("Service name `" + serviceProviders[i].serviceName + "` is invalid.");
            }
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
        let servicesByPackageByName = {};
        let tmpServiceProviders = Object.assign([], serviceProviders);
        let failCounter = 0;
        while (tmpServiceProviders.length > 0) {
            let tmpServiceProvider = tmpServiceProviders.splice(0, 1)[0];
            if (tmpServiceProvider.serviceDependencyNames == undefined
                || tmpServiceProvider.serviceDependencyNames.length == 0) {
                let serviceNameChunks = tmpServiceProvider.serviceName.split(".");
                if (servicesByPackageByName[serviceNameChunks[0]] === undefined) {
                    servicesByPackageByName[serviceNameChunks[0]] = {};
                }
                servicesByPackageByName[serviceNameChunks[0]][serviceNameChunks[1]] = yield tmpServiceProvider.createService();
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
                    let serviceDependencyNameChunks = tmpServiceProvider.serviceDependencyNames[i].split(".");
                    if (tmpServiceProvider.serviceDependencies[i] == undefined
                        && servicesByPackageByName[serviceDependencyNameChunks[0]]
                        && servicesByPackageByName[serviceDependencyNameChunks[0]][serviceDependencyNameChunks[1]]) {
                        tmpServiceProvider.serviceDependencies[i] = servicesByPackageByName[serviceDependencyNameChunks[0]][serviceDependencyNameChunks[1]];
                        tmpServiceProvider.resolvedServiceDependenciesCount++;
                    }
                }
                if (tmpServiceProvider.serviceDependencies.length == tmpServiceProvider.resolvedServiceDependenciesCount) {
                    let serviceNameChunks = tmpServiceProvider.serviceName.split(".");
                    if (servicesByPackageByName[serviceNameChunks[0]] === undefined) {
                        servicesByPackageByName[serviceNameChunks[0]] = {};
                    }
                    servicesByPackageByName[serviceNameChunks[0]][serviceNameChunks[1]] = yield tmpServiceProvider.createService.apply(null, tmpServiceProvider.serviceDependencies);
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
                throw new Error("Dependencies for the following services cannot be resolved: `" + remainingProvidersNames.join("`, `") + "`.");
            }
        }
        return servicesByPackageByName;
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
        let uniqueServiceProviders = yield filterValidUniqueServiceProviders(serviceProviders);
        let servicesByPackageByName = yield resolveServices(uniqueServiceProviders);
        let runnableChunks = app.runnable.split(".");
        if (servicesByPackageByName[runnableChunks[0]]
            && servicesByPackageByName[runnableChunks[0]][runnableChunks[1]]
            && servicesByPackageByName[runnableChunks[0]][runnableChunks[1]][runnableChunks[2]]) {
            let runnableArguments = app.runnableArguments || [];
            return servicesByPackageByName[runnableChunks[0]][runnableChunks[1]][runnableChunks[2]].apply(null, runnableArguments);
        }
        else {
            throw new Error("Runnable `" + app.runnable + "` is not a valid service or function.");
        }
    })
};
exports.default = cudo;
