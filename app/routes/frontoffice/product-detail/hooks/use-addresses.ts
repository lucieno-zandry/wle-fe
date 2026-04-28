import { useEffect } from "react";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";
import { getAuthAddresses } from "~/api/http-requests";
import useAddressStore from "~/hooks/use-address-store";

export function useAddresses() {
    const { authAddresses: addresses, setAuthAddresses: setAddresses } = useAddressStore();

    useEffect(() => {
        if (!addresses)
            getAuthAddresses()
                .then(response => {
                    if (response.data?.addresses)
                        return setAddresses(response.data.addresses);

                    throw new HttpException(500, { message: "No Address returned" });
                })
                .catch(e => {
                    if (e instanceof HttpException)
                        toast.error(e.data?.message || 'Failed to fetch addresses');

                    setAddresses([]);
                })

    }, [addresses]);

    return {
        addresses
    }
}