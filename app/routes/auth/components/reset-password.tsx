import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { resetPassword } from "~/api/http-requests";
import Button from "~/components/custom-components/button";
import Field from "~/components/custom-components/field";
import { FieldGroup } from "~/components/ui/field";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";

export const loader = ({ params }: LoaderFunctionArgs) => params.token;

export const clientAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const password = formData.get('password');
    const passwordConfirmation = formData.get('password_confirmation');
    if (password?.toString() !== passwordConfirmation?.toString()) {
        // We'll use a key that can be translated later
        return new ValidationException({ password_confirmation: ["password_match"] }, 422, "password_match");
    }
    try {
        const response = await resetPassword(formData);
        if (response.data?.token) localStorage.setItem('token', response.data.token);
        return redirect('/');
    } catch (error) {
        if (error instanceof HttpException && error.status === 403) {
            // Toast will be shown in component after error is caught
            return error;
        }
        return error;
    }
}

export default function () {
    const { t } = useTranslation('auth');
    const [formValidationErrors, setFormValidationErrors] = useState<{ password?: string[], password_confirmation?: string[] } | null>(null);
    const navigation = useNavigation();
    const token = useLoaderData<string>();
    const canSubmit = useMemo(() => !formValidationErrors, [formValidationErrors]);
    const isLoading = useMemo(() => navigation.state !== 'idle', [navigation]);
    const error = useActionData();

    const createPasswordSchema = (t: any) =>
        z.string().min(4, t('validation.password_min'));
    const passwordSchema = useMemo(() => createPasswordSchema(t), [t]);

    useEffect(() => {
        if (!error) return;
        if (error instanceof ValidationException) {
            if (error.errors.token) toast.error(error.errors.token);
            const translated: any = {};
            for (const [field, msgs] of Object.entries(error.errors)) {
                translated[field] = msgs.map(msg => {
                    if (msg === 'password_match') return t('validation.password_match');
                    if (msg.includes('password')) return t('validation.password_min');
                    return msg;
                });
            }
            setFormValidationErrors(translated);
        } else if (error instanceof HttpException && error.status === 403) {
            toast.error(t('password_reset_permission_denied'));
        } else if (error) {
            toast.error(t('failed_to_reset_password', { status: error.status || '' }));
        }
    }, [error, t]);

    const handleValidationErrorsChange = useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement>) => {
        setFormValidationErrors(prev => getUpdatedFormErrors({
            formErrors: prev,
            name: e.target.name as "password" | "password_confirmation",
            validationErrors
        }));
    }, []);

    return (
        <Form className="p-6 md:p-8" method="post">
            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">{t('new_password_title')}</h1>
                    <p className="text-muted-foreground text-balance">{t('new_password_instruction')}</p>
                </div>

                <input type="hidden" name="token" value={token} readOnly />

                <Field
                    id="password"
                    type="password"
                    name="password"
                    dataFormat={passwordSchema}
                    onValidationErrorsChange={handleValidationErrorsChange}
                    validationErrors={formValidationErrors?.password}
                    label={t('password_label')}
                    required
                />

                <Field
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    dataFormat={passwordSchema}
                    onValidationErrorsChange={handleValidationErrorsChange}
                    validationErrors={formValidationErrors?.password_confirmation}
                    label={t('confirm_password_label')}
                    required
                />

                <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>
                    {t('reset_password_button')}
                </Button>
            </FieldGroup>
        </Form>
    );
}