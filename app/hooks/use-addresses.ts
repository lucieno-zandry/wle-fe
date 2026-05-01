import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { createAddress, getAuthAddresses } from "~/api/http-requests";
import useAddressStore from "~/hooks/use-address-store";
import { useUserStore } from "./use-user";

let promise: Promise<any> | null = null;

export function useAddresses() {
    const { authAddresses: addresses, setAuthAddresses: setAddresses, loading, setLoading } = useAddressStore();
    const { user } = useUserStore();

    const [errors, setErrors] = useState<null | Record<string, string[]>>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAddresses = useCallback(() => {
        if (promise) return promise;

        if (!loading) setLoading(true);

        promise = getAuthAddresses()
            .then(response => {
                if (response.data?.addresses) {
                    setAddresses(response.data.addresses);
                } else {
                    throw new HttpException(500, { message: "No Address returned" });
                }
            })
            .catch(e => {
                if (e instanceof HttpException)
                    toast.error(e.data?.message || 'Failed to fetch addresses');

                setAddresses([]);
            })
            .finally(() => {
                setLoading(false);
                promise = null; // reset after completion
            });

        return promise;
    }, [loading]);

    const addAddress = useCallback(async (payload: FormData,
        options?: {
            onSuccess?: () => void
        }) => {
        setSubmitting(true);
        try {
            const response = await createAddress(payload);
            if (response.data?.address) {
                setAddresses((addresses) => addresses ? [...addresses, response.data!.address] : [response.data!.address])
            } else {
                fetchAddresses();
            }
            options?.onSuccess?.();
        } catch (e) {
            if (e instanceof ValidationException)
                return setErrors(e.errors);

            toast.error('Failed to add new address');
        } finally {
            setSubmitting(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id)
            fetchAddresses()
    }, [user?.id]);

    return {
        addresses,
        errors,
        loading,
        submitting,
        addAddress
    }
}