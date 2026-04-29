// components/auth-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuthDialog } from "~/hooks/use-auth-dialog";
import { sendEmailVerificationCode } from "~/api/http-requests";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react"; // Make sure to install lucide-react

export function AuthDialog() {
  const auth = useAuthDialog();
  if (!auth.open) return null;

  return (
    <Dialog
      open={auth.open}
      onOpenChange={(open) => {
        if (!open) auth.close();
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {/* Prioritize dynamic title, fallback to default step names */}
            {auth.title || (
              auth.action === "VERIFY_EMAIL"
                ? "Verify your email"
                : auth.step === "email"
                  ? "Welcome back"
                  : auth.step === "password"
                    ? "Enter your password"
                    : auth.step === "verification"
                      ? "Check your email"
                      : "Reset password"
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
  const { email, setEmail, loading, error, handleEmailInfo } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailInfo();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label htmlFor="email" className="sr-only">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
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
        {loading ? "Checking..." : "Continue with Email"}
      </Button>

      {/* OAuth buttons */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
          Change
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" size="sm" type="button" className="h-auto p-0 text-xs font-normal" onClick={goToForgotPassword} disabled={loading}>
            Forgot password?
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
        {loading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}

// ---------- Forgot Password Step ----------
function ForgotPasswordStep() {
  const { email, loading, error, forgotPasswordSent, handleForgotPassword, goToPassword } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleForgotPassword();
  };

  if (forgotPasswordSent) {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
          If an account with <strong>{email}</strong> exists, a reset link has been sent. Check your inbox.
        </div>
        <Button variant="ghost" onClick={goToPassword} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <Label htmlFor="reset-email">We’ll send a reset link to:</Label>
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
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <Button variant="ghost" type="button" className="w-full" onClick={goToPassword} disabled={loading}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
      </Button>
    </form>
  );
}

// ---------- Verification Step ----------
function VerificationStep() {
  const { email, code, setCode, loading, error, handleVerify, goToEmail } = useAuthDialog();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const resendCode = async () => {
    try {
      await sendEmailVerificationCode();
      toast.success('A new verification code was sent!');
    } catch (e) {
      toast.error('Failed to send email verification code');
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
          Wrong email?
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Verification code</Label>
        {/* For even better UX here, consider replacing this with shadcn's InputOTP component */}
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="Enter 6-digit code"
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
        {loading ? "Verifying..." : "Verify account"}
      </Button>
      <div className="text-center mt-4">
        <span className="text-sm text-muted-foreground">Didn't receive the code? </span>
        <Button variant="link" type="button" className="h-auto p-0 text-sm font-normal" onClick={resendCode}>
          Click to resend
        </Button>
      </div>
    </form>
  );
}