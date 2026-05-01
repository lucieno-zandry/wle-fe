import { serializeProductParams, type ProductQueryParams } from "~/lib/serialize-product-params";
import appFetch, { API_URL, HttpException, type FormatedResponse, type PaginatedResponse } from "./app-fetch";
import buildWhereParam, { type WhereConditions, type WhereInConditions } from "~/lib/build-where-param";
import type { NotificationsQueryParams } from "~/components/notifications/types/notifications-query-params";
import type { LandingBlocksRequestParams } from "~/routes/frontoffice/landing/types/landing-blocks-request-types";

export function getEmailInfo(email: string) {
    return appFetch.post<{ is_taken: boolean }>('/auth/email/info', { email });
}

export function logInWithEmail(data: { email: FormDataEntryValue, password: FormDataEntryValue }) {
    return appFetch.post<{
        auth: User,
    }>('/auth/login', data);
}

export function registerUser(data: {
    email: FormDataEntryValue,
    password: FormDataEntryValue,
    password_confirmation: FormDataEntryValue,
    name?: string,
    preferred_language: string,
    preferred_currency: string,
    preferred_timezone: string,
    preferred_theme: string,
}) {
    return appFetch.post<{
        auth: User,
        token: string,
    }>('/auth/register', data);
}

export function getAuthUser() {
    return appFetch.get<{ user: User }>('/auth/user/get?with=client_code');
}

export function updateAuthUser(payload: {
    name?: string,
    email?: string,
    password?: string,
    password_confirmation?: string,
    current_password?: string,
    client_code_id?: number,
} | FormData) {
    return appFetch.post<{ user: User }>('/auth/user/update', payload);
}

export function getProducts(params?: ProductQueryParams, options: RequestInit = {}) {
    return appFetch.get<PaginatedResponse<Product>>('/product/all', {
        params: serializeProductParams({
            with: ['variants', 'images', 'category'],
            ...params,
        }),
        ...options
    });
}


export function getProduct(slug: string, options: RequestInit = {}) {
    return appFetch.get<{ product: Product }>(`/product/get/${slug}?with=cart_items.order,variant_groups.variant_options,variants.variant_options,variants.image,variants.promotions,images,category`, { ...options });
}

export function getPriceRange() {
    return appFetch.get<{ min: number, max: number, step: number }>('/product/price-range');
}

export function sendEmailVerificationCode() {
    return appFetch.post<{ link_sent: boolean }>('/auth/email/send-validation-code', {});
}

export function attemptEmailVerification(code: FormDataEntryValue) {
    return appFetch.post<{ user: User }>('/auth/email/verify', { code });
}

export function addVariantToCart(payload: {
    variant_id: number,
    count: number,
}) {
    return appFetch.post<{ cart_item: CartItem }>(`/cart/create/${payload.variant_id}`, { count: payload.count });
}

export function getCartItems({
    where,
    whereIn,
}: {
    where?: WhereConditions<CartItem>;
    whereIn?: WhereInConditions;
} = {}, init: RequestInit = {}) {
    return appFetch.get<{ cart_items: CartItem[] }>('/cart/all', {
        ...init,
        params: {
            where: buildWhereParam(where, whereIn),
        },
    });
}

export function updateCartItem(cartItemId: number, payload: { count: number }) {
    return appFetch.put<{ cart_item: CartItem }>(`/cart/update/${cartItemId}`, payload);
}

export function removeCartItem(cartItemId: number) {
    return appFetch.delete(`/cart/delete?cart_item_ids=${cartItemId}`);
}

export function sendPasswordResetLink(email: FormDataEntryValue) {
    return appFetch.post<{ link_sent: boolean }>('/auth/password/forgot', { email });
}

export function resetPassword(payload: FormData | { password: FormDataEntryValue, password_confirmation: FormDataEntryValue, token: FormDataEntryValue }) {
    return appFetch.post<{ user: User, token: string }>('/auth/password/reset', payload);
}

export function getAuthAddresses() {
    return appFetch.get<{ addresses: Address[] }>('/address/all');
}

export function createAddress(payload: FormData) {
    return appFetch.post<{ address: Address, user: User }>('/address/create', payload);
}

export function updateAddress(id: number, payload: FormData) {
    return appFetch.post<{ address: Address, user: User }>(`/address/update/${id}`, payload);
}

export function removeAddresses(ids: number[]) {
    return appFetch.delete<{ deleted: number }>(`/address/delete?address_ids=${ids.join(',')}`);
}

export function checkout(payload: {
    cart_items_ids?: CartItem['id'][],
    variants?: { variant_id: number, count: number }[],
    coupon_code?: string,
}) {
    return fetch(API_URL + '/order/checkout', {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: 'include',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
        }
    });
}

export function createOrder(payload: { cart_item_ids: number[], address_id: number, coupon_id?: number, shipping_method_id: number }, init: RequestInit = {}) {
    return appFetch.post<{ order: Order }>('/order/create', payload, init);
}

export function getCouponFromCode(code: string): Promise<FormatedResponse<{
    coupon: Coupon;
}>> {
    if (!code) {
        return new Promise((resolve) => ({ data: undefined }))
    }
    return appFetch.get<{ coupon: Coupon }>(`/coupon/get/${code}`);
}

export function unuseCoupon() {
    return appFetch.delete('/coupon/unuse');
}

export function getOrders() {
    return appFetch.get<PaginatedResponse<Order>>('/order/all?with=cart_items,transactions&order_by=updated_at&direction=DESC');
}

export function getOrder(uuid: string) {
    return appFetch.get<{ order: Order }>(
        `/order/get/${uuid}?with=cart_items,shipments,transactions.refund_requests,transactions.child_transactions`
    );
}

export function createTransaction(data: Pick<Transaction, 'payment_method' | 'order_uuid' | 'amount'>, init: RequestInit = {}) {
    return appFetch.post<{ transaction: Transaction }>('/transactions', data, init)
}

export function getNotifications(params: NotificationsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));

    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    return appFetch.get<{
        notifications: PaginatedResponse<AppNotification>,
        unread_count: number,
    }>('/notifications');
}

export function getUnreadNotifications(params: NotificationsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));

    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    return appFetch.get<{
        notifications: PaginatedResponse<AppNotification>,
        count: number,
    }>('/notifications/unread');
}

export function clearReadNotifications() {
    return appFetch.delete<{ message: string }>('/notifications/clear-read');
}

export function markAllNotificationsAsRead() {
    return appFetch.post<{
        message: string,
    }>('/notifications/mark-all-read', {});
}

export function removeNotification(id: string) {
    return appFetch.delete<{ message: string }>(`/notifications/${id}`);
}

export function markNotificationAsRead(id: string) {
    return appFetch.patch<{
        message: string,
        notification: AppNotification
    }>(`/notifications/${id}/read`, {});
}

export function deleteOrder(uuid: string) {
    return appFetch.delete<{ message: string }>(`/order/delete?order_uuids=${uuid}`);
}

export function getCategories() {
    return appFetch.get<{ categories: Category[] }>('/category/all');
}

export function getClientCode(code: string) {
    return appFetch.get<{ client_code: ClientCode | null }>(`/client-code/get/${code}`);
}

export function requestRefund(transactionUuid: string, data: { amount?: number; reason: string }) {
    return appFetch.post<{ refund_request: RefundRequest }>(
        `/transactions/${transactionUuid}/refund-request`,
        data
    );
}

export function openDispute(transactionUuid: string, data: { reason: string }) {
    return appFetch.post<{ transaction: Transaction }>(
        `/transactions/${transactionUuid}/dispute`,
        data
    );
}

export function cancelDispute(transactionUuid: string) {
    return appFetch.delete<{ transaction: Transaction }>(
        `/transactions/${transactionUuid}/dispute`
    );
}

// user preferences

export function fetchUserPreferences(init: RequestInit) {
    return appFetch.get<UserPreference>('/user/preferences', init);
}

export function updateUserPreferences(data: Partial<UserPreference>) {
    return appFetch.put<UserPreference>('/user/preferences', data);
}

export function fetchAvailableShippingMethods(data: {
    address_id?: number,
    cart_items: ({ weight: number, quantity: number, price: number })[],
    location?: {
        country: string, // CODE : FR, UK, US, ...
        city: string // native name : Paris, London, New York
    }
}) {
    return appFetch.post<{
        available: {
            method: ShippingMethod, cost: number
        }[],
        location: { country: string, city: string }
    }>('/shipping-methods/available', data);
}

export function logout(options?: RequestInit) {
    return appFetch.get<{ message: string }>('/auth/logout', options)
}

/**
 * Public endpoint – returns all active landing blocks ordered by display_order.
 * No authentication required.
 */
export function getLandingBlocksPublic(init: RequestInit & { params?: LandingBlocksRequestParams }) {
    return appFetch.get<LandingBlock[]>('/landing-blocks/public', init);
}

export function getSettings(init: RequestInit) {
    return appFetch.get<Record<string, any>>('/settings/public', init);
}