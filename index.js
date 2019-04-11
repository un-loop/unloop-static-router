const static = require("koa-static")
const router = require("koa-router")
const checkPermission = require("unloop-check-permission");

module.exports = (path, routes, loginPath) => (app, scheme) => {
    loginPath = loginPath ? loginPath : '/login';
    scheme = scheme ? scheme : 'roles';


    if (routes) {
        const authRouter = new router();

        for(let route of routes) {
            if (!route || !route.route) continue;

            authRouter.all(route.route, async (ctx, next) =>
            {
                if (!checkPermission[scheme](ctx, route.permissions)) {
                    ctx.redirect(`${loginPath}?redirect=${encodeURIComponent(ctx.url)}`);
                } else {
                    await next();
                }
            });
        }
        app.use(authRouter.middleware());
    }

    return static(path);
}
