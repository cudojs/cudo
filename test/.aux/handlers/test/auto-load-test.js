module.exports.scope = {
    component: "test",
    name: "autoLoadTest"
}

module.exports.handler = (context) => {
    return new Promise((resolve) => {
        resolve(context);
    });
};
