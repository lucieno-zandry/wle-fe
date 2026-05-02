// components/auth-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuthDialog } from "~/hooks/use-auth-dialog";
import { sendEmailVerificationCode } from "~/api/http-requests";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react"; // Make sure to install lucide-react
import { useTranslation } from "react-i18next";

export function AuthDialog() {
  const auth = useAuthDialog();
  const { t } = useTranslation();
  if (!auth.open) return null;

  return (
    <Dialog
      open={auth.open}
      onOpenChange={auth.close}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {/* Prioritize dynamic title, fallback to default step names */}
            {auth.title || (
              auth.action === "VERIFY_EMAIL"
                ? t("common:verifyYourEmail")
                : auth.step === "email"
                  ? t("common:welcomeBack")
                  : auth.step === "password"
                    ? t("common:enterYourPassword")
                    : auth.step === "verification"
                      ? t("common:checkYourEmail")
                      : t("common:resetPassword")
            )}
          </DialogTitle>

          {/* Render description if it exists */}
          {auth.description && (
            <DialogDescription className="text-center">
              {auth.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4">
          {auth.step === "email" && <EmailStep />}
          {auth.step === "password" && <PasswordStep />}
          {auth.step === "verification" && <VerificationStep />}
          {auth.step === "forgot_password" && <ForgotPasswordStep />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Shared Error Component ----------
function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2.5 rounded-md animate-in fade-in zoom-in-95">
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}

// ---------- Email Step ----------
function EmailStep() {
  const { t } = useTranslation();
  const { email, setEmail, loading, error, handleEmailInfo } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailInfo();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label htmlFor="email" className="sr-only">{t("common:email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("common:emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="h-11"
        />
      </div>
      <ErrorMessage message={error || ""} />
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("common:checking") : t("common:continueWithEmail")}
      </Button>

      {/* OAuth buttons */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("common:orContinueWith")}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" className="h-11" disabled>
          Google
        </Button>
        <Button variant="outline" type="button" className="h-11" disabled>
          Facebook
        </Button>
      </div>
    </form>
  );
}

// ---------- Password Step ----------
function PasswordStep() {
  const { t } = useTranslation();
  const { email, password, setPassword, loading, error, handleLogIn, goToEmail, goToForgotPassword } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogIn();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-sm font-medium text-muted-foreground truncate mr-2">
          {email}
        </p>
        <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:bg-transparent hover:underline" onClick={goToEmail} type="button">
          {t("common:change")}
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("common:password")}</Label>
          <Button variant="link" size="sm" type="button" className="h-auto p-0 text-xs font-normal" onClick={goToForgotPassword} disabled={loading}>
            {t("common:forgotPassword")}
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="h-11"
        />
      </div>
      <ErrorMessage message={error || ""} />
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("common:loggingIn") : t("common:logIn")}
      </Button>
    </form>
  );
}

// ---------- Forgot Password Step ----------
function ForgotPasswordStep() {
  const { t } = useTranslation();
  const { email, loading, error, forgotPasswordSent, handleForgotPassword, goToPassword } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleForgotPassword();
  };

  if (forgotPasswordSent) {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
          {t("common:forgotPasswordSentMessage", { email })}
        </div>
        <Button variant="ghost" onClick={goToPassword} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("common:backToLogin")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label htmlFor="reset-email">{t("common:sendResetLinkTo")}</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          disabled
          className="opacity-70 h-11 bg-muted"
        />
      </div>
      <ErrorMessage message={error || ""} />
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("common:sending") : t("common:sendResetLink")}
      </Button>
      <Button variant="ghost" type="button" className="w-full" onClick={goToPassword} disabled={loading}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("common:backToLogin")}
      </Button>
    </form>
  );
}

// ---------- Verification Step ----------
function VerificationStep() {
  const { t } = useTranslation();
  const { email, code, setCode, loading, error, handleVerify, goToEmail } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const resendCode = async () => {
    try {
      await sendEmailVerificationCode();
      toast.success(t("common:newVerificationCodeSent"));
    } catch (e) {
      toast.error(t("common:failedToSendVerificationCode"));
      console.log(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-sm font-medium text-muted-foreground truncate mr-2">
          {email}
        </p>
        <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:bg-transparent hover:underline" onClick={goToEmail} type="button">
          {t("common:wrongEmail")}
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">{t("common:verificationCode")}</Label>
        {/* For even better UX here, consider replacing this with shadcn's InputOTP component */}
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder={t("common:enterSixDigitCode")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow digits
          required
          autoFocus
          className="h-11 text-center tracking-widest text-lg font-mono"
        />
      </div>
      <ErrorMessage message={error || ""} />
      <Button type="submit" className="w-full h-11" disabled={loading || code.length < 6}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("common:verifying") : t("common:verifyAccount")}
      </Button>
      <div className="text-center mt-4">
        <span className="text-sm text-muted-foreground">{t("common:didntReceiveCode")} </span>
        <Button variant="link" type="button" className="h-auto p-0 text-sm font-normal" onClick={resendCode}>
          {t("common:clickToResend")}
        </Button>
      </div>
    </form>
  );
}