const static = require("koa-static");
const router = require("koa-router");
const compose = require("koa-compose");

const checkPermission = require("unloop-check-permission");

module.exports = (path, routes, loginPath) => (scheme) => {
    loginPath = loginPath ? loginPath : '/login';
    scheme = scheme ? scheme : 'roles';
    let routeMiddleware;

    if (routes) {
        const authRouter = new router();

        for(let route of routes) {
            if (!route || !route.route) continue;
            if (!route.middleware) route.middleware = [];

            authRouter.all(route.route, compose([...route.middleware, async (ctx, next) =>
                {
                    if (!checkPermission[scheme](ctx, route.permissions)) {
                        ctx.redirect(`${loginPath}?redirect=${encodeURIComponent(ctx.url)}`);
                    } else {
                        await next();
                    }
                }])
            );
        }
        
        routeMiddleware = authRouter.middleware();
    }

    return routeMiddleware ? compose([routeMiddleware, static(path)]) : static(path);
}
