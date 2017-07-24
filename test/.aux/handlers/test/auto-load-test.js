module.exports.scope = {
    component: "test",
    name: "autoLoadTest"
}

module.exports.handler = (app) => {
    return new Promise((resolve) => {
        resolve(app);
    });
};
