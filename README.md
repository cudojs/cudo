# cudo

*Core package for Cudo, a distributed application framework*

## Overview
This package provides the core mechanics of a Cudo app. It enables creating and running of an app, and provides a structure for extending the app's functionality.

## Creating and running an app
In the most basic scenario, a new app can be created and run using the following:
```
const cudo = require("cudo");

cudo.init()
    .then((app) => {
        return app.run();
    });
```

## Setting configuration
Configuration properties for the given app object can be set by passing a configuration object as an argument to `cudo.init()`. 

Configuration properties *must* be scoped using a component identifier, like so:
```
const conf = {
    myModule: {
        myConfProperty: "myConfPropertyValue"
    }
}
```

Similarly, setting core configuration properties, they *must* be added within `core` scope object.

The following core configuration properties are available:
- myHandlersDirPath - Allows specifying where the auto-loader should look for handlers.

## Setting runtime context
Runtime context is an object containig data passed between handlers, functions responsible for operations performed by the app (read about handlers below). Context can be pre-set by passing an object to the app's `run()` method like so:
```
app.run({
    contextProperty: "contextPropertyValue"
});
```

## Working with handlers
Handlers are functions providing app functionality beyond the creation and running of the app. 

Handlers **must**:
- return a promise
- take a `context` argument
- pass the received `context` variable as an argument to the `resolve()` function
- be always scoped using a component identifier, e.g. `app.handlers.myComponent.myHandler`

Handlers **should**:
- reject a promise, passing an error message as an argument to the `reject()` function

## Auto-loading handlers
Upon running `cudo.init()` an auto-load mechanism will be triggered, which will attempt to load handlers from files in `./handlers` directory. The lookup directory can be modified by setting `conf.core.handlersDirPath` property and passing the configuration in `cudo.init()`. 

For a handler to be properly detected and auto loaded, it must export the following:
```
module.exports.scope = {
    component: "myComponent",
    name: "myHandler"
};

module.exports.handler = (context) => {
    return new Promise(resolve, reject) {
        try {
            resolve(context);
        }
        catch (err) {
            reject(err);
        }
    };
};
```

## Adding handlers manually
A basic handler can be added manually as follows:
```
app.handlers.myComponent = {
    myHandler: (context) => {
        return new Promise(resolve, reject) {
            try {
                resolve(context);
            }
            catch (err) {
                reject(err);
            }
        }
    };
};
```

## Calling handlers
All handlers for the given app object can be accessed within the `handlers` property of the `context` object. Thus, a call to `myComponent.myHandler` can be made as follows:
```
context.handler.myComponent.myHandler(context);
```

## Modifying handlers
Handlers can be overwritten by assigning a different function in place of the existing handler. To reuse the existing handler within the new function, place the new function in a wrapper like so:
```
let myHandler = (context) => {
    return new Promise((resolve, reject) => {
        try {
            resolve(context);
        }
        catch (err) {
            reject(err);
        }
    });
}

app.handler.core.run = ((existingHandler) => {
    return (context) => {
        return existingHandler(context)
            .then(myHandler);
    }
})(app.handler.core.run);
```
In this example we have extended the functionality of the `core.run` handler by appending `myHandler` to the existing promise.
