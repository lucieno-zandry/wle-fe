// email-verification-otp.tsx
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Form, useNavigation } from "react-router";
import { Mail, LogOut } from "lucide-react";
import { Button } from "wle-ui-package";

export type EmailVerificationOtpProps = {
    email: string;
    onSendEmailVerificationCode: () => void;
    onLogout: () => void;
    errorMessages: string[] | null;
}

const RESEND_TIMEOUT = 30;

export function EmailVerificationOtp({
    email,
    onSendEmailVerificationCode,
    onLogout,
    errorMessages
}: EmailVerificationOtpProps) {
    const { t } = useTranslation('auth');
    const [otp, setOtp] = React.useState("");
    const codeLength = 6;

    const [secondsLeft, setSecondsLeft] = React.useState(RESEND_TIMEOUT);
    const [canResend, setCanResend] = React.useState(false);

    const navigation = useNavigation();
    const isLoading = React.useMemo(() => navigation.state === "submitting", [navigation.state]);

    // countdown effect
    React.useEffect(() => {
        if (secondsLeft === 0) {
            setCanResend(true);
            return;
        }

        const timer = setTimeout(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const handleResend = () => {
        onSendEmailVerificationCode();
        setCanResend(false);
        setSecondsLeft(RESEND_TIMEOUT);
    };

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold flex justify-center items-center gap-2">
                    <Mail /> {t('verify_email_title')}
                </CardTitle>
                <CardDescription>
                    {t('verify_email_description', { codeLength })}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Show email and logout option */}
                <div className="mb-4 text-center text-sm text-muted-foreground">
                    <p>{t('verification_email_sent_to', { email })}</p>
                    <button
                        onClick={onLogout}
                        className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
                    >
                        <LogOut className="h-3 w-3" />
                        {t('logout_button')}
                    </button>
                </div>

                <Form className="space-y-6" method="post">
                    <div className="flex flex-col items-center gap-3">
                        <InputOTP
                            maxLength={codeLength}
                            value={otp}
                            onChange={setOtp}
                            name="otp">
                            <InputOTPGroup>
                                {Array.from({ length: codeLength }).map((_, index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>

                        {errorMessages && (
                            <p className="text-destructive text-sm">
                                {errorMessages.join(', ')}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={otp.length !== codeLength}
                        isLoading={isLoading}>
                        {t('verify_account_button')}
                    </Button>
                </Form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('did_not_receive_code')}
                    {canResend ? (
                        <Button
                            variant="link"
                            onClick={handleResend}
                            className="p-1 h-auto"
                        >
                            {t('resend_code')}
                        </Button>
                    ) : (
                        <span className="ml-1">
                            {t('resend_available_in', { seconds: secondsLeft })}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}