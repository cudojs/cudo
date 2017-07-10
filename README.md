# cudo

*Core package for Cudo, a distributed application framework*

## Overview
This package provides the core mechanics of a Cudo app. It enables creating and running of an app, and provides a structure for extending the app's functionality.

## Creating and running an app
In the most basic scenario, a new app can be created and run using the following:
```
const cudo = require("cudo");

// Initialise and run an app.
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
    myComponent: {
        myConfProperty: "myConfPropertyValue"
    }
}
```

The `core` component allows specifying the following:
- `core.handlers.autoLoadDisabled` - boolean - if true, auto-loading handlers is disabled, regardless of `core.handlers.paths`
- `core.handlers.paths` - array - specifies directories where auto-loader looks for handlers

A path for auto-loader lookup can be added like so:
```
// Define configuration.
const conf = {
    core: {
        handlers: {
            paths: [
                fs.realpathSync(__dirname + "/handlers")
            ]
        }
    }
};

// Initialise and run an app.
cudo.init(conf)
    .then((app) => {
        return app.run();
    });
```

## Setting runtime context
Runtime context is an object containig data passed between handlers. Context can be pre-set by passing an object to the app's `run()` method like so:
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

Optionally, the scope object can also have a `group` property. Adding it will result in the handler being available within `myComponent.myGroup.myHandler`.

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
context.handlers.myComponent.myHandler(context);
```

Alternatively, if app object is available, handlers can be accessed from this object, like so:
```
app.handlers.myComponent.myHandler(context);
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

app.handlers.core.run = ((existingHandler) => {
    return (context) => {
        return existingHandler(context)
            .then(myHandler);
    }
})(app.handlers.core.run);
```
In this example we have extended the functionality of the `core.run` handler by appending `myHandler` to the existing promise.
