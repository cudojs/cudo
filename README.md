# cudo

*Core package for Cudo, a distributed application framework*

## Overview
This package provides the core mechanics of a Cudo app. It enables creating and running of an app, and provides a structure for extending the app's functionality.

## Create and run an app
In the most basic scenario, a new app can be created and run using the following:
```
const cudo = require("cudo");

const app = cudo.init();

app.run();
```

## App configuration
`cudo.init()` method takes an optional `conf` argument, which is an object that can be used for specifying app configuration. The object can be accessed like so:
```
const app = cudo.init({
	myConfSetting: "myConfSettingValue"
});

let myConfSetting = app.conf.myConfSetting;
```

## App context
App context is an object containig data passed between handlers, functions responsible for operations performed by the app (read about handlers below). Context can be pre-set by passing an object to the app's `run()` method like so:
```
app.run({
	contextProperty: "contextPropertyValue"
});
```

## Add handlers
Handlers are functions providing app functionality beyond the creation and running of the app. 

Handlers **must**:
- return a promise
- take a `context` argument
- pass the received `context` variable as an argument to the `resolve()` function
- be always scoped using a module identifier, e.g. `app.handler.myModule.myHandler`

Handlers **should**:
- reject a promise, passing an error message as an argument to the `reject()` function

A basic handler can be added as follows:
```
app.handler.myModule = {
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

## Call handlers
All handlers for the given app object can be accessed within the `handler` property of the app object. Thus, a call to `myModule.myHandler` can be made as follows:
```
app.handler.myModule.myHandler(context);
```

## Modify handlers
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
