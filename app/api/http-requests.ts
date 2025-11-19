import mockApiRequest from "~/lib/mock-api-request";
import appFetch from "./app-fetch";

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
    return appFetch.get<{ products: Product[] }>('/product/all?limit=9&with=variants&images');
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

export function getCartItems() {
    return appFetch.get<{ cart_items: CartItem[] }>('/cart/all');
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