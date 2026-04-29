import i18next from "i18next";
import buildQuery from "~/lib/build-query";
import executeRequest from "~/lib/execute-request";

export const API_URL = import.meta.env.VITE_API_URL;

export class ValidationException {
    errors: Record<string, string[]>;
    status: number;
    message: string;

    constructor(errors: Record<string, string[]>, status: number, message: string) {
        this.errors = errors;
        this.status = status;
        this.message = message;
    }
}

export class HttpException {
    data?: any;
    status: number;

    constructor(status: number, data: any = undefined) {
        this.data = data;
        this.status = status;
    }
}

export interface FormatedResponse<T> {
    data?: T,
    error?: any,
    status: number
}

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedResponse<T> = {
    current_page: number;
    data: T[];

    first_page_url: string;
    from: number | null;

    last_page: number;
    last_page_url: string;

    links: PaginationLink[];

    next_page_url: string | null;
    path: string;

    per_page: number;
    prev_page_url: string | null;

    to: number | null;
    total: number;
};

const defaultHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Accept': 'application/json',
        'Accept-Language': i18next.language || 'en',
    }

    return headers;
};

const getEndpointUrl = (path: string) => API_URL + path;

async function get<T>(
    path: string,
    options: RequestInit & { params?: Record<string, any> } = {}
): Promise<FormatedResponse<T>> {
    const { params, ...init } = options;

    if (!options.headers) {
        init.headers = defaultHeaders();
    }
    const url = buildQuery(path, params);

    return executeRequest<T>(() =>
        fetch(getEndpointUrl(url), {
            ...init,
            method: "GET",
            credentials: 'include',
        })
    );
}

async function post<T>(path: string, payload: FormData | Object, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {
    let body: BodyInit;

    if (payload instanceof FormData) {
        body = payload
    } else {
        body = JSON.stringify(payload);
        init.headers = {
            ...init.headers,
            'Content-Type': 'application/json',
        };
    }

    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        body,
        method: "POST",
        credentials: 'include'
    }));

    return response;
}

async function put<T>(path: string, payload: FormData | Object, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {
    let body: BodyInit;

    if (payload instanceof FormData) {
        body = payload
    } else {
        body = JSON.stringify(payload);
        init.headers = {
            ...init.headers,
            'Content-Type': 'application/json',
        };
    }

    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        body,
        method: "PUT",
        credentials: 'include',
    }));

    return response;
}

async function patch<T>(path: string, payload: FormData | Object, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {
    let body: BodyInit;

    if (payload instanceof FormData) {
        body = payload
    } else {
        body = JSON.stringify(payload);
        init.headers = {
            ...init.headers,
            'Content-Type': 'application/json',
        };
    }

    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        body,
        method: "PATCH",
        credentials: 'include',
    }));

    return response;
}

async function destroy<T>(path: string, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {
    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        method: "DELETE",
        credentials: 'include',
    }));

    return response;
}

export default {
    get,
    post,
    put,
    delete: destroy,
    patch
}