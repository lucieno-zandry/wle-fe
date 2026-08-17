import { useTranslation } from 'react-i18next';
import { Button } from "wle-ui-package"
import { Field, FieldGroup } from "~/components/ui/field";
import { sendPasswordResetLink } from "~/api/http-requests";
import { Form, useActionData, useLoaderData, useNavigation, type ClientActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import React from "react";
import { AppUI } from "wle-ui-package";
import z from "zod";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import { toast } from "sonner";

export function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || "";
    return { email };
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    try {
        await sendPasswordResetLink(email);
        return { success: true };
    } catch (e) {
        return e;
    }
}

export default function () {
    const { t } = useTranslation('auth');
    const actionData = useActionData<any>();
    const navigation = useNavigation();
    const isLoading = React.useMemo(() => navigation.state === "submitting", [navigation.state]);
    const { email } = useLoaderData<typeof loader>();

    // Show toast when actionData indicates success
    React.useEffect(() => {
        if (actionData?.success) {
            toast.success(t('reset_link_sent'));
        }
    }, [actionData, t]);

    const createEmailSchema = (t: any) =>
        z.string().email(t('validation.email_invalid'));
    const emailSchema = React.useMemo(() => createEmailSchema(t), [t]);

    const [state, setState] = React.useState({
        data: { email: "" },
        formErrors: null as Record<"email", string[]> | null
    });

    const userCanSubmit = React.useMemo(() => !!(state.data.email && !state.formErrors), [state]);

    const handleValidationErrorsChange = React.useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.name as "email";
        setState(s => ({
            ...s,
            formErrors: getUpdatedFormErrors({ formErrors: s.formErrors, name, validationErrors }),
            data: { ...s.data, [name]: e.target.value }
        }));
    }, []);

    return (
        <Form className="p-6 md:p-8" method="post">
            <AppUI.BackButton />
            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">{t('reset_password_title')}</h1>
                    <p className="text-muted-foreground text-balance">{t('reset_password_instruction')}</p>
                </div>

                <AppUI.Field
                    validationErrors={actionData?.errors?.email}
                    label={t('email_label')}
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t('email_placeholder')}
                    dataFormat={emailSchema}
                    onValidationErrorsChange={handleValidationErrorsChange}
                    defaultValue={email}
                    required
                />

                <Field>
                    <Button type="submit" isLoading={isLoading} disabled={!userCanSubmit}>
                        {t('continue_button')}
                    </Button>
                </Field>
            </FieldGroup>
        </Form>
    );
}