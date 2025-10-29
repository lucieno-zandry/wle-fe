import { API_URL } from "~/env";

export class AppFetchException {
    data: any;
    status: number;

    constructor(data: any, status: number) {
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

    if (typeof window !== "undefined") {
        const token = localStorage.getItem('token');
        const tokenType = "Bearer";

        if (token && tokenType) {
            headers['Authorization'] = `${tokenType} ${token}`;
        }
    }

    return headers;
};

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
            formatedResponse.error = json;
        } else {
            formatedResponse.data = json as T;
        }
    } catch (e) {
        formatedResponse.error = e;
        formatedResponse.status = 500;
    }

    return formatedResponse;
}

async function get<T>(path: string, init: RequestInit = { headers: defaultHeaders() }): Promise<FormatedResponse<T>> {

    const response = await executeRequest<T>(() => fetch(getEndpointUrl(path), {
        ...init,
        method: "GET",
    }));

    return response;
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

export default {
    get,
    post
}