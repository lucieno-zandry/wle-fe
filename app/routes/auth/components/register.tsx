import { useTranslation } from 'react-i18next';
import { Field, FieldGroup } from "~/components/ui/field"
import { AppUI, Button, BackButton } from "wle-ui-package";
import z from "zod";
import { redirect, useLoaderData, useNavigate, useParams, type LoaderFunctionArgs } from "react-router";
import { getEmailInfo, registerUser } from "~/api/http-requests";
import React, { useMemo, useState, type FormEventHandler } from "react";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import { toast } from "sonner";
import { ValidationException } from "~/api/app-fetch";
import { usePreferencesStore } from "~/stores/use-user-preference-store";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const response = email && await getEmailInfo(email);
  const { lang } = params;
  if (response && response.data?.is_taken === false) return email;
  return redirect(`/${lang}/auth`);
}

export default function () {
  const { t } = useTranslation('auth');
  const email = useLoaderData<string>();
  const [formValidationErrors, setFormValidationErrors] = useState<{ password?: string[], password_confirmation?: string[] } | null>(null);
  const [data, setData] = useState({ password: '', password_confirmation: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();
  const { currency, language, theme, timezone } = usePreferencesStore((state) => state.preferences);

  const createPasswordSchema = (t: any) =>
    z.string().min(4, t('validation.password_min'));
  const passwordSchema = useMemo(() => createPasswordSchema(t), [t]);

  const canSubmit = useMemo(() =>
    !formValidationErrors && data.password && data.password === data.password_confirmation,
    [formValidationErrors, data]
  );

  const handleValidationErrorsChange = React.useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as "password" | "password_confirmation";
    setFormValidationErrors(prev => getUpdatedFormErrors({ formErrors: prev, name, validationErrors }));
    setData(d => ({ ...d, [name]: e.target.value }));
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    registerUser({
      email: formData.get("email")!,
      password: formData.get("password")!,
      password_confirmation: formData.get("password_confirmation")!,
      preferred_currency: currency,
      preferred_language: language,
      preferred_timezone: timezone,
      preferred_theme: theme,
    })
      .then(response => {
        toast.success(t('register_success'));
        if (response.data?.token) localStorage.setItem("token", response.data.token);
        navigate(`/${lang}/auth/verify-email`);
      })
      .catch(error => {
        if (error instanceof ValidationException) {
          const translated: any = {};
          for (const [field, messages] of Object.entries(error.errors)) {
            translated[field] = messages.map(msg => {
              if (msg.includes('password')) return t('validation.password_min');
              if (msg.includes('confirmation')) return t('validation.password_match');
              return msg;
            });
          }
          return setFormValidationErrors(translated);
        }
        toast.error(t('failed_to_register', { status: error.status }), { description: error.data?.message });
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form className="p-6 md:p-8" method="post" onSubmit={handleSubmit}>
      <BackButton />
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('welcome_title')}</h1>
          <p className="text-muted-foreground text-balance">{t('create_account_free')}</p>
        </div>

        <AppUI.Field
          label={t('email_label')}
          id="email"
          type="email"
          name="email"
          value={email}
          readOnly
          required
        />

        <AppUI.Field
          id="password"
          type="password"
          name="password"
          dataFormat={passwordSchema}
          onValidationErrorsChange={handleValidationErrorsChange}
          validationErrors={formValidationErrors?.password}
          label={t('password_label')}
          required
        />

        <AppUI.Field
          id="password_confirmation"
          type="password"
          name="password_confirmation"
          dataFormat={passwordSchema}
          onValidationErrorsChange={handleValidationErrorsChange}
          validationErrors={formValidationErrors?.password_confirmation}
          label={t('confirm_password_label')}
          required
        />

        <Field>
          <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>
            {t('register_button')}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}