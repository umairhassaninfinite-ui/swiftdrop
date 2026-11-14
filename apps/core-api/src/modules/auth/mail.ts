import nodemailer from "nodemailer";

export function createAuthMailer(url: string) {
  const transport = nodemailer.createTransport({
    url,
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
  });
  return {
    sendVerification(email: string, url: string) {
      return transport.sendMail({
        from: "SwiftDrop <no-reply@swiftdrop.test>",
        to: email,
        subject: "Verify your SwiftDrop email",
        text: `Confirm your email address: ${url}\n\nThis link expires in 24 hours. If you did not create this account, ignore this message.`,
      });
    },
    sendPasswordReset(email: string, url: string) {
      return transport.sendMail({
        from: "SwiftDrop <no-reply@swiftdrop.test>",
        to: email,
        subject: "Reset your SwiftDrop password",
        text: `Choose a new SwiftDrop password: ${url}

This link expires in 30 minutes and works once. Resetting signs you out everywhere. If you did not ask for this, ignore this message; your password has not changed.`,
      });
    },
    sendPasswordResetUnavailable(email: string, url: string) {
      return transport.sendMail({
        from: "SwiftDrop <no-reply@swiftdrop.test>",
        to: email,
        subject: "Sign in to SwiftDrop with Google",
        text: `Someone asked to reset the password for this SwiftDrop account, but it signs in with Google and has no password to reset. Sign in with Google here: ${url}

If you did not ask for this, ignore this message.`,
      });
    },
    sendInvitation(email: string, url: string) {
      return transport.sendMail({
        from: "SwiftDrop <no-reply@swiftdrop.test>",
        to: email,
        subject: "Your SwiftDrop staff invitation",
        text: `Set your private SwiftDrop password: ${url}\n\nThis invitation expires in 24 hours. If you did not expect it, ignore this message.`,
      });
    },
  };
}

export type AuthMailer = {
  sendVerification(email: string, url: string): Promise<unknown>;
  sendInvitation?(email: string, url: string): Promise<unknown>;
  sendPasswordReset?(email: string, url: string): Promise<unknown>;
  /** Google-only accounts get sign-in guidance instead of an unsolicited local password. */
  sendPasswordResetUnavailable?(email: string, url: string): Promise<unknown>;
};
