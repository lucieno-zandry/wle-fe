// hooks/use-auth-dialog.ts
import { useState, useCallback, useEffect } from "react";
import { useAuthDialogStore, type Step } from "~/components/stores/use-auth-dialog-store";
import { useBuyNow } from "~/routes/frontoffice/product-detail/hooks/use-buy-now";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { attemptEmailVerification, getEmailInfo, logInWithEmail, sendEmailVerificationCode, sendPasswordResetLink, updateAuthUser } from "~/api/http-requests";
import { useUserStore } from "./use-user";


export function useAuthDialog() {
    const { step, error, loading, title, description, ...store } = useAuthDialogStore();
    const buyNow = useBuyNow();
    const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

    const { code, email, password } = store.fields;

    const setError = (error: string | null) => store.setState({ error });
    const setLoading = (loading: boolean) => store.setState({ loading });


    const setStep = (step: Step) => {
        // reset any step‑specific state when changing steps
        if (step !== "forgot_password") {
            setForgotPasswordSent(false);
        }
        store.setState({ step, error: null });
    };

    const setEmail = (email: string) => store.updateField('email', email);
    const setCode = (code: string) => store.updateField('code', code);
    const setPassword = (password: string) => store.updateField('password', password);

    const { setUser } = useUserStore();

    // Email step: check if email exists
    const handleEmailInfo = useCallback(async () => {
        setError(null);
        setLoading(true);
        // if i do setStep("verification") here, it successfully updates
        try {
            const response = await getEmailInfo(email);
            const data = response.data!;

            if (data.is_taken) {
                // Go to password step
                setStep("password");
            } else {
                await updateAuthUser({ email });
                await sendEmailVerificationCode();

                setStep("verification");
            }
        } catch (e) {
            if (e instanceof HttpException) {
                setError(e.data?.message || "Something went wrong");
            } else if (e instanceof ValidationException) {
                setError(e.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }, [email]);

    // Password step: login
    const handleLogIn = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await logInWithEmail({ email, password });
            setUser(response.data!.auth);
            // On success, cookies are set, proceed
            handleSubmit();
        } catch (e: any) {
            if (e instanceof HttpException) {
                setError(e.data?.message || "Something went wrong");
            } else if (e instanceof ValidationException) {
                setError(e.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }, [email, password]);

    // Verification step: submit code
    const handleVerify = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await attemptEmailVerification(code);

            if (response.data?.user) {
                setUser(response.data.user)
                await sendPasswordResetLink(response.data.user.email);
            };

            // Verification successful, proceed
            handleSubmit();
        } catch (e: any) {
            if (e instanceof HttpException) {
                setError(e.data?.message || "Something went wrong");
            } else if (e instanceof ValidationException) {
                setError(e.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }, [code]);

    const handleForgotPassword = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            await sendPasswordResetLink(email);
            setForgotPasswordSent(true);
        } catch (e: any) {
            if (e instanceof HttpException) {
                setError(e.data?.message || "Something went wrong");
            } else if (e instanceof ValidationException) {
                setError(e.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }, [email]);

    // Final action after successful auth/verification
    const handleSubmit = useCallback(() => {
        // Execute the deferred action (e.g., BUY_NOW)
        if (store.successAction === "BUY_NOW" && store.onSuccessParams) {
            buyNow(store.onSuccessParams);
        }

        store.closeDialog();
    }, [store, buyNow]);

    return {
        // existing state & handlers
        open: store.open,
        action: store.action,
        step,
        email,
        setEmail,
        password,
        setPassword,
        code,
        title,
        description,
        setCode,
        loading,
        error,
        // navigation
        goToEmail: () => setStep("email"),
        goToPassword: () => setStep("password"),
        goToVerification: () => setStep("verification"),
        goToForgotPassword: () => setStep("forgot_password"),
        // action handlers
        handleEmailInfo,
        handleLogIn,
        handleVerify,
        handleForgotPassword,       // <-- new
        handleSubmit,
        // forgot‑password status
        forgotPasswordSent,
        // close
        close: () => store.closeDialog,
    };
}