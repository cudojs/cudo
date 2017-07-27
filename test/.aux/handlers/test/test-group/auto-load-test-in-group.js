module.exports.scope = {
    component: "test",
    group: "testGroup",
    name: "autoLoadTest"
}

module.exports.handler = (context) => {
    return new Promise((resolve) => {
        resolve(context);
    });
};
