import appFetch from "./app-fetch";

type WhereConditions = Record<string, string | number | [string, string | number]>;
type WhereInConditions = Record<string, (string | number)[]>;

export function getEmailInfo(email: string) {
    return appFetch.post<{ is_taken: boolean }>('/auth/email/info', { email });
}

export function logInWithEmail(data: { email: FormDataEntryValue, password: FormDataEntryValue }) {
    return appFetch.post<{
        auth: User,
        token: string,
    }>('/auth/login', data);
}

export function registerUser(data: {
    email: FormDataEntryValue,
    password: FormDataEntryValue,
    password_confirmation: FormDataEntryValue,
    name: string
}) {
    return appFetch.post<{
        auth: User,
        token: string,
    }>('/auth/register', data)
}

export function getAuthUser() {
    return appFetch.get<{ user: User }>('/auth/user/get');
}

export function updateAuthUser(payload: { name?: string, email?: string, password?: string, password_confirmation?: string, current_password?: string }) {
    return appFetch.post<{ user: User }>('/auth/user/update', payload);
}

export function getProducts() {
    return appFetch.get<{ products: Product[] }>('/product/all?with=variants&images');
}

export function getProduct(slug: string) {
    return appFetch.get<{ product: Product }>(`/product/get/${slug}`);
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

export function getCartItems({ where, whereIn }: {
    where?: WhereConditions,
    whereIn?: WhereInConditions
} = {}) {
    // Build "where" clause
    const whereClause = where
        ? Object.entries(where)
            .map(([field, value]) => {
                if (Array.isArray(value)) {
                    const [operator, actualValue] = value;
                    return `${field}${operator}${actualValue}`;
                }
                return `${field}=${value}`;
            })
            .join(',')
        : '';

    // Build "whereIn" clause
    const whereInClause = whereIn
        ? Object.entries(whereIn)
            .map(([field, values]) => `${field}:${values.join('|')}`)
            .join(',')
        : '';

    // Merge both into one query param
    const combined = [whereClause, whereInClause].filter(Boolean).join(',');

    const query = combined ? `?where=${encodeURIComponent(combined)}` : '';

    return appFetch.get<{ cart_items: CartItem[] }>(`/cart/all${query}`);
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

export function createOrder(payload: { cart_item_ids: number[], address_id: number, coupon_id?: number }) {
    return appFetch.post<{ order: Order }>('/order/create', payload);
}

export function getCouponFromCode(code: string) {
    return appFetch.get<{ coupon: Coupon }>(`/coupon/get/${code}`);
}

export function getOrders() {
    return appFetch.get<{ orders: Order[] }>('/order/all?with=cart_items,transactions&order_by=updated_at&direction=DESC');
}

export function getOrder(uuid: string) {
    return appFetch.get<{ order: Order }>(`/order/get/${uuid}?with=cart_items,transactions`);
}

export function createTransaction(data: Pick<Transaction, 'method' | 'order_uuid' | 'amount'>) {
    return appFetch.post<{ transaction: Transaction }>('/transaction/create', data)
}

export function getNotifications() {
    return appFetch.get<{
        notifications: AppNotification[],
        unread: AppNotification[],
        unread_count: number,
    }>('/notifications');
}

export function getUnreadNotifications() {
    return appFetch.get<{
        notifications: AppNotification[],
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

export function searchProducts(keywords: string) {
    return appFetch.get<{ products: Product[] }>(`/product/search/${keywords}?with=category,variants,images`);
}

export function deleteOrder(uuid: string) {
    return appFetch.delete<{ message: string }>(`/order/delete?order_uuids=${uuid}`);
}