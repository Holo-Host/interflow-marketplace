import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Resend } from "resend"

export default class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"
  protected resendClient: Resend
  protected options: any

  constructor({}, options: any) {
    super()
    this.options = options
    // Initialize the raw Resend SDK using the API key from your config
    this.resendClient = new Resend(options.api_key)
  }

  async send(notification: any): Promise<any> {
    // 1. Silently absorb internal Admin UI "feed" alerts so they don't crash
    if (notification.channel === "feed") {
      return { id: "feed-absorbed" }
    }

    console.log(`📨 Intercepted MercurJS email payload for template: ${notification.template}`)

    // 2. Extract HTML/Subject from the MercurJS payload (with fallbacks)
    const htmlContent = notification.data?.html || `<p>New marketplace alert: <strong>${notification.template}</strong></p>`
    const subjectLine = notification.data?.subject || `Marketplace Update: ${notification.template}`

    try {
      const response = await this.resendClient.emails.send({
        from: this.options.from_email || "onboarding@resend.dev",
        to: notification.to,
        subject: subjectLine,
        html: htmlContent
      })
      console.log("✅ Email successfully handed to Resend API!")
      return { id: response.data?.id || "resend-success" }
    } catch (e: any) {
      console.error("🔴 Resend API rejected the email:", e)
      return { id: "failed" }
    }
  }
}
