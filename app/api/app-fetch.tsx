import useRedirectAction from "~/hooks/use-redirect-action";
import useRouterStore from "~/hooks/use-router-store";
import buildQuery from "~/lib/build-query";
import isCsr from "~/lib/is-csr";
import redirectPathnames from "~/lib/redirect-pathnames";

const API_URL = import.meta.env.VITE_API_URL;

export class ValidationException {
    errors: Record<string, string[]>;
    status: number;

    constructor(errors: Record<string, string[]>, status: number) {
        this.errors = errors;
        this.status = status;
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

const defaultHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Accept': 'application/json',
    }

    if (isCsr()) {
        const token = localStorage.getItem('token');
        const tokenType = "Bearer";

        if (token && tokenType) {
            headers['Authorization'] = `${tokenType} ${token}`;
        }
    }

    return headers;
};

const handleActionRedirection = (json: any, request: () => Promise<Response>) => {
    const redirectPathname = redirectPathnames[json.action as keyof typeof redirectPathnames];
    const { redirect } = useRedirectAction.getState();

    if (redirectPathname) {
        redirect(redirectPathname);
    }
}

const getEndpointUrl = (path: string) => API_URL + path;

async function executeRequest<T>(request: () => Promise<Response>) {
    const formatedResponse: FormatedResponse<T> = {
        status: 200
    };

    try {
        const response = await request();
        formatedResponse.status = response.status;

        const json = await response.json();
        if (json.status) delete json.status;

        if (response.status >= 400) {
            // if backend wants to redirect the user
            if (response.status === 403 && json.action) {
                handleActionRedirection(json, request);
            }
            formatedResponse.error = json;
        } else {
            formatedResponse.data = json as T;
        }
    } catch (e) {
        formatedResponse.error = e;
        formatedResponse.status = 500;
    }

    if (formatedResponse.error) {
        if (formatedResponse.error.errors && formatedResponse.status === 422) {
            throw new ValidationException(formatedResponse.error.errors, formatedResponse.status);
        } else {
            throw new HttpException(formatedResponse.status, formatedResponse.error);
        }
    }

    return formatedResponse;
}

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
    }));

    return response;
}

async function destroy<T>(path: string, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {
    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        method: "DELETE",
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