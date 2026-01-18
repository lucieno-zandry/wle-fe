import type { RedirectFunction } from "react-router";
import isCsr from "./is-csr";

type Props = {
    status: number,
    navigate?: ((pathname: string) => void) | RedirectFunction;
}

const defaultNavigate = (pathname: string) => {
    if (isCsr()) {
        location.pathname = pathname;
    }
}

export default function ({ status, navigate = defaultNavigate }: Props) {
    switch (status) {
        case 403:
            return navigate('/403');

        case 404:
            return navigate('/404');

        default:
            return navigate('/500');
    }
}