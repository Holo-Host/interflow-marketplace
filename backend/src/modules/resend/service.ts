import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Resend } from "resend"

export default class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"
  protected resendClient: Resend
  protected options: any

  constructor({}, options: any) {
    super()
    this.options = options
    this.resendClient = new Resend(options.api_key)
  }

  async send(notification: any): Promise<any> {
    // 1. Silently absorb internal Admin UI "feed" alerts
    if (notification.channel === "feed") {
      return { id: "feed-absorbed" }
    }

    let htmlContent = "";
    let subjectLine = "";

    // 2. Match the MercurJS template to a beautiful HTML email!
    switch (notification.template) {
      case "sellerAccountSubmissionEmailTemplate":
        subjectLine = "Application Received - Interflow Marketplace";
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333;">Welcome to Interflow Marketplace!</h2>
            <p style="color: #555; line-height: 1.5;">We have successfully received your seller application.</p>
            <p style="color: #555; line-height: 1.5;">Our team will review your details shortly. You will receive another email as soon as your account is approved and ready to use.</p>
            <br/>
            <p style="color: #555;">Best regards,<br/><strong>The Interflow Team</strong></p>
          </div>
        `;
        break;

      case "sellerAccountApprovedEmailTemplate":
        subjectLine = "You are Approved! - Interflow Marketplace";
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2e7d32;">Application Approved! 🎉</h2>
            <p style="color: #555; line-height: 1.5;">Great news! Your seller account has been fully approved.</p>
            <p style="color: #555; line-height: 1.5;">You can now log in to your vendor dashboard, set up your store profile, and start adding products.</p>
            <br/>
            <p style="color: #555;">Welcome aboard,<br/><strong>The Interflow Team</strong></p>
          </div>
        `;
        break;

      default:
        // The fallback for any templates we haven't built yet
        subjectLine = notification.data?.subject || `Marketplace Update: ${notification.template}`;
        htmlContent = notification.data?.html || `<p>System alert: <strong>${notification.template}</strong></p>`;
    }

    try {
      const response = await this.resendClient.emails.send({
        from: this.options.from_email || "onboarding@resend.dev",
        to: notification.to,
        subject: subjectLine,
        html: htmlContent
      })
      console.log(`✅ Sent ${notification.template} to Resend API!`)
      return { id: response.data?.id || "resend-success" }
    } catch (e: any) {
      console.error("🔴 Resend API rejected the email:", e)
      return { id: "failed" }
    }
  }
}
