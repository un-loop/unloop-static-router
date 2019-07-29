const static = require("koa-static");
const router = require("koa-router");
const compose = require("koa-compose");

const checkPermission = require("unloop-check-permission");

 module.exports = function({root, routes, loginPath, scheme}) {
    loginPath = loginPath ? loginPath : '/login';
    scheme = scheme ? scheme : 'roles';

    const used = [];
    this.use = (middleware) => {
        if (typeof middleware !== "function") {
            throw new Error("middleware must be a function");
        }

        used.push(middleware);
    }

    this.middleware = () => {
        let routeMiddleware;

        if (routes) {
            const authRouter = new router();

            for(let route of routes) {
                if (!route || !route.route) continue;
                if (!route.middleware) route.middleware = [];

                authRouter.all(route.route, compose([...route.middleware, async (ctx, next) =>
                    {
                        if (checkPermission[scheme](ctx, route.permissions)) {
                            return await next();
                        }

                        if (!ctx.isAuthenticated()) {
                            ctx.redirect(`${loginPath}?redirect=${encodeURIComponent(ctx.url)}`);
                        } else {
                            ctx.body = "Forbidden";
                            ctx.status = 403;
                        }
                    }])
                );
            }

            routeMiddleware = authRouter.middleware();
        }

        return routeMiddleware ? compose([...used, routeMiddleware, static(root)]) : static(root);
    }
}
