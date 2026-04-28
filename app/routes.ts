// routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/config/root-redirect.tsx"),

    route("/:lang", "routes/config/config-boundary.tsx", [
        route("", "routes/frontoffice/layout.tsx", [
            index("routes/frontoffice/landing/index.tsx"),
            route("products", "routes/frontoffice/products.tsx"),
            route("product/:slug", "routes/frontoffice/product-detail/product-detail.tsx"),
            route("settings", "routes/common/settings.tsx"),
            route("addresses", "routes/frontoffice/addresses.tsx"),
            route("checkout", "routes/frontoffice/checkout.tsx"),
            route("orders", "routes/frontoffice/orders.tsx"),
            route("orders/:uuid", "routes/frontoffice/order-details.tsx"),
            route("search/:query", "routes/frontoffice/search.tsx"),
        ]),

        route("auth", "routes/auth/layout.tsx", [
            index("routes/auth/index.tsx"),
            route("login", "routes/auth/login.tsx"),
            route("register", "routes/auth/register.tsx"),
            route("verify-email", "routes/auth/email-verification.tsx"),
            route("password-forgotten", "routes/auth/password-forgotten.tsx"),
            route("reset-password/:token", "routes/auth/reset-password.tsx"),
        ]),

        // error pages
        route("account-blocked", "routes/common/blocked-page.tsx"),
        route("account-suspended", "routes/common/suspended-page.tsx"),
        route("403", "routes/common/forbidden-error-page.tsx"),
        route("500", "routes/common/internal-server-error-page.tsx"),

        // fallback
        route("*", "routes/common/not-found-error-page.tsx"),
    ]),

] satisfies RouteConfig;