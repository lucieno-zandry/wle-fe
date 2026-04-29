import { HttpException, ValidationException, type FormatedResponse } from "~/api/app-fetch";
import handleActionRedirection from "./handle-action-redirection";
import handleNotFound from "./handle-not-found";
import isCsr from "./is-csr";

const STATUS_NO_CONTENT = 204;
const STATUS_OK = 200;
const STATUS_INTERNAL_SERVER_ERROR = 500;
const STATUS_UNPROCESSABLE_CONTENT = 422;
const STATUS_FORBIDDEN = 403;
const STATUS_NOT_FOUND = 404;
const STATUS_REDIRECT = 302;


async function executeRequest<T>(request: () => Promise<Response>) {
    const formatedResponse: FormatedResponse<T> = {
        status: STATUS_OK
    };

    try {
        const response = await request();
        formatedResponse.status = response.status;

        const json = response.status !== STATUS_NO_CONTENT && await response.json();

        if (json) {
            if (json.status) delete json.status;

            if (response.status === STATUS_REDIRECT) {
                if (isCsr())
                    location.href = response.headers.get('Location') || '';

            } else if (response.status >= 400) {
                // if backend wants to redirect the user
                if (response.status === STATUS_FORBIDDEN && json.action) {
                    handleActionRedirection(json);
                } else if (response.status === STATUS_NOT_FOUND) {
                    handleNotFound();
                }

                formatedResponse.error = json;
            } else {
                formatedResponse.data = json as T;
            }
        }
    } catch (e) {
        formatedResponse.error = e;
        formatedResponse.status = STATUS_INTERNAL_SERVER_ERROR;
    }

    if (formatedResponse.error) {
        if (formatedResponse.error.errors && formatedResponse.status === STATUS_UNPROCESSABLE_CONTENT) {
            throw new ValidationException(formatedResponse.error.errors, formatedResponse.status, formatedResponse.error.message || "");
        } else {
            throw new HttpException(formatedResponse.status, formatedResponse.error);
        }
    }

    return formatedResponse;
}

export default executeRequest;