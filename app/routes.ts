import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route('/', 'routes/frontoffice/layout.tsx', [
        index('routes/frontoffice/home.tsx'),
        route('products', 'routes/frontoffice/products.tsx'),
        route('product/:slug', 'routes/frontoffice/product.tsx'),
        route('/settings', 'routes/common/settings.tsx'),
    ]),
    route('/auth', 'routes/auth/layout.tsx', [
        index('routes/auth/index.tsx'),
        route('login', 'routes/auth/login.tsx'),
        route('register', 'routes/auth/register.tsx'),
        route('verify-email', 'routes/auth/email-verification.tsx'),
    ]),
] satisfies RouteConfig;
