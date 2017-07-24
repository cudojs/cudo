module.exports.scope = {
    component: "test",
    group: "testGroup",
    name: "autoLoadTest"
}

module.exports.handler = (app) => {
    return new Promise((resolve) => {
        resolve(app);
    });
};
