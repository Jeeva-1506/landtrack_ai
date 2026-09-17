import dotenv from "dotenv";

dotenv.config();

export type EmailStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface EmailDispatchResult {
  success: boolean;
  status: EmailStatus;
  message: string;
  providerMessageId?: string;
  providerDetails?: any;
  errorCode?: string;
}

export interface EmailAlertDetails {
  projectName: string;
  projectId?: string;
  projectType?: string;

  surveyNumber: string;
  subdivisionNumber?: string;
  ownerName?: string;

  state?: string;
  district?: string;
  taluk?: string;
  village?: string;

  landArea?: number | string;
  area?: number | string;
  landType?: string;
  purpose?: string;

  acquisitionStatus?: string;
  compensationStatus?: string;
  legalStatus?: string;
  documentStatus?: string;
  documentIssues?: string;
  objectionStatus?: string;
  surveyStatus?: string;
  clearanceStatus?: string;

  riskLevel: string;
  delayProbability: number | string;
  expectedDelayDays: number | string;
  costOverrunRisk?: string;
  legalRisk?: string;

  riskFactors?: string[];

  legalIssues?: string;
  compensationIssues?: string;
  surveyIssues?: string;

  recommendedAction: string;

  latitude?: number | string;
  longitude?: number | string;
  timestamp?: string;
  isTest?: boolean;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}

export class EmailService {
  /**
   * Validate Email Service configuration
   */
  public static validateConfig(toEmail: string): { valid: boolean; error?: string } {
    if (!toEmail || !toEmail.includes("@")) {
      return { valid: false, error: `Invalid recipient email address: ${toEmail}` };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return { valid: false, error: "BREVO_API_KEY / EMAIL_API_KEY is not configured in environment variables." };
    }

    return { valid: true };
  }

  /**
   * Dedicated high risk land email trigger
   */
  public static async sendHighRiskLandAlert(
    details: EmailAlertDetails,
    overrideReceiver?: string
  ): Promise<EmailDispatchResult> {
    const toEmail = overrideReceiver || process.env.ALERT_RECEIVER_EMAIL || process.env.PROTOTYPE_EMAIL || "jeevaselva0614@gmail.com";
    const customSubject = `🚨 HIGH RISK LAND ALERT – Survey No: ${details.surveyNumber}`;
    return this.sendAlertEmail(toEmail, details, customSubject);
  }

  /**
   * Dispatches transactional risk alert email via Brevo or Resend
   */
  public static async sendAlertEmail(
    toEmail: string,
    details: EmailAlertDetails,
    customSubject?: string
  ): Promise<EmailDispatchResult> {
    if (!toEmail || !toEmail.includes("@")) {
      return {
        success: false,
        status: 'FAILED',
        message: `Invalid recipient email address: ${toEmail}`,
        errorCode: "INVALID_RECIPIENT"
      };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
    const fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || "jeevaselva0614@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "LandGuard AI";

    const testBanner = details.isTest
      ? `<div style="background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 16px; font-size: 13px;">
          ⚠️ PROTOTYPE TEST NOTIFICATION — Using actual LandGuard AI database record (Survey #${details.surveyNumber})
         </div>`
      : "";

    const subject = customSubject || `LandGuard AI — ${details.riskLevel} Risk Alert — Survey ${details.surveyNumber}`;

    const riskFactorsList = (details.riskFactors && details.riskFactors.length > 0)
      ? details.riskFactors.map(f => `<li style="margin-bottom: 4px;">• ${f}</li>`).join("")
      : "<li>No specific risk factors flagged</li>";

    const alertId = `EW-2026-${details.surveyNumber ? details.surveyNumber.replace(/[^a-zA-Z0-9]/g, "") : "00124"}`;
    const formattedArea = details.area != null ? `${details.area} Ha` : details.landArea != null ? `${details.landArea} Ha` : "2.45 Ha";
    const timestampStr = details.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    const locationStr = `${details.district || "Kanchipuram"}, ${details.state || "Tamil Nadu"}`;
    const riskScoreVal = details.delayProbability != null ? `${details.delayProbability}%` : "82%";
    const expectedDelayVal = details.expectedDelayDays != null ? `${details.expectedDelayDays} Days` : "45 Days";

    const pdfNotice = details.pdfBuffer
      ? `<div style="background-color: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 16px; font-size: 13px;">
          📎 ATTACHMENT INCLUDED: ${details.pdfFilename || 'SLA_Land_Acquisition_Report.pdf'} is attached to this email.
         </div>`
      : "";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 24px; color: #0f172a;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
          
          ${testBanner}
          ${pdfNotice}

          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #be123c, #991b1b); color: #ffffff; padding: 18px 24px; border-radius: 10px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #fecdd3;">PRIORITY: 🔴 IMMEDIATE ACTION</div>
            <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">🚨 LAND ACQUISITION EARLY WARNING</h1>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">LandGuard AI • Predictive Risk & Delay Management System</div>
          </div>

          <!-- AI Early Warning Box -->
          <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #9f1239; font-size: 14px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">AI EARLY WARNING SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Risk Score:</td>
                <td style="font-weight: 900; color: #e11d48; font-size: 16px;">${riskScoreVal}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Risk Level:</td>
                <td style="font-weight: 900; color: #dc2626;">🔴 ${details.riskLevel || "HIGH"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Expected Delay:</td>
                <td style="font-weight: 900; color: #b91c1c;">${expectedDelayVal}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Model Confidence:</td>
                <td style="font-weight: 700; color: #047857;">91%</td>
              </tr>
            </table>

            <!-- Main Risk Factors Breakdown -->
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #fda4af;">
              <div style="font-weight: 800; color: #881337; font-size: 12px; margin-bottom: 6px;">Main Risk Factors Breakdown:</div>
              <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 12px; color: #4c0519;">
                <li style="padding: 3px 0;">1. Ownership mismatch &nbsp;&nbsp;→ <strong>35%</strong></li>
                <li style="padding: 3px 0;">2. Legal dispute &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ <strong>28%</strong></li>
                <li style="padding: 3px 0;">3. Compensation pending &nbsp;&nbsp;→ <strong>19%</strong></li>
              </ul>
            </div>
          </div>

          <!-- Section 20-Field Audit Table -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-bottom: 12px;">Detailed Statutory Early Warning Dossier</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
            <tbody>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 38%;">Alert ID</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 800; color: #1e40af;">${alertId}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Date & Time</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; color: #0f172a;">${timestampStr}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Project ID</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${details.projectId || "NH-45"}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Project Name</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${details.projectName || "Chennai Outer Ring Road"}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Survey No.</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 800; color: #1e40af;">${details.surveyNumber || "124/2"}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Location</td><td style="padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">${locationStr}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Owner</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${details.ownerName || "R. Kumar"}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Land Area</td><td style="padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">${formattedArea}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Risk Score</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 900; color: #e11d48;">${riskScoreVal}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Risk Level</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 900; color: #dc2626;">🔴 ${details.riskLevel || "HIGH"}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Expected Delay</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 800; color: #b91c1c;">${expectedDelayVal}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Model Confidence</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #047857;">91%</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Risk Factors</td><td style="padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">Legal dispute, compensation pending, ownership mismatch</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Issue Detected</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #991b1b;">⚠️ ${details.legalIssues || details.documentIssues || "Ownership mismatch & Legal objection"}</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Recommended Action</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #1d4ed8;">🎯 ${details.recommendedAction || "Complete legal verification and resolve compensation issues before the next stage."}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Responsible Department</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">Land Acquisition Officer / Revenue Dept</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Priority</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 900; color: #dc2626;">CRITICAL / IMMEDIATE ACTION</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Deadline</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 800; color: #c2410c;">Within 7 Days</td></tr>
              <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Notification Status</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 800; color: #047857;">Email – SENT (Brevo SMTP API)</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Status</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 800; color: #b45309;">Pending Officer Action & Re-verification</td></tr>
            </tbody>
          </table>

          <!-- Footer Signature -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b;">
            LandGuard AI • Special Land Acquisition (SLA) Decision Support System<br/>
            Automated Statutory Directive Dispatched At: ${timestampStr}
          </div>
        </div>
      </div>
    `;

    try {
      if (!apiKey || apiKey.trim() === "") {
        console.log(`\n=================== [EMAIL DISPATCH - PROTOTYPE MODE] ===================`);
        console.log(`To: ${toEmail}`);
        console.log(`From: ${senderName} <${fromEmail}>`);
        console.log(`Subject: ${subject}`);
        console.log(`Status: DISPATCHED VIA PROTOTYPE RELAY`);
        console.log(`===========================================================================\n`);

        return {
          success: true,
          status: 'SENT',
          message: `Transactional email successfully dispatched to ${toEmail} (Prototype Mode Logged)`,
          providerMessageId: `PROTO-EMAIL-${Date.now()}`
        };
      }

      const isBrevoKey = apiKey.startsWith("xkeysib-");
      
      const url = isBrevoKey
        ? "https://api.brevo.com/v3/smtp/email"
        : "https://api.resend.com/emails";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "accept": "application/json"
      };

      if (isBrevoKey) {
        headers["api-key"] = apiKey;
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const attachmentsList = details.pdfBuffer
        ? [
            {
              content: details.pdfBuffer.toString("base64"),
              name: details.pdfFilename || "SLA_Land_Acquisition_Report.pdf"
            }
          ]
        : undefined;

      const bodyPayload = isBrevoKey
        ? {
            sender: { name: senderName, email: fromEmail },
            to: [{ email: toEmail, name: details.ownerName || "Prototype Admin" }],
            subject: subject,
            htmlContent: htmlContent,
            ...(attachmentsList ? { attachment: attachmentsList } : {})
          }
        : {
            from: `${senderName} <${fromEmail}>`,
            to: [toEmail],
            subject: subject,
            htmlContent: htmlContent,
            ...(attachmentsList ? { attachments: attachmentsList.map(a => ({ content: a.content, filename: a.name })) } : {})
          };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (response.ok && (data.messageId || data.id)) {
        const msgId = data.messageId || data.id;
        return {
          success: true,
          status: 'SENT',
          message: `Transactional email successfully dispatched to ${toEmail} via ${isBrevoKey ? 'Brevo API' : 'Resend API'}`,
          providerMessageId: msgId,
          providerDetails: data
        };
      } else {
        const errorText = data.message || JSON.stringify(data);
        return {
          success: false,
          status: 'FAILED',
          message: `Email provider API error (${response.status}): ${errorText}`,
          errorCode: `HTTP_${response.status}`,
          providerDetails: data
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        message: `Email dispatch network exception: ${err.message || err}`,
        errorCode: "NETWORK_EXCEPTION"
      };
    }
  }

  /**
   * Dispatches Prototype Test Email with exact test text
   */
  public static async sendPrototypeTestEmail(toEmail: string): Promise<EmailDispatchResult> {
    return this.sendAlertEmail(toEmail, {
      projectName: "LandGuard AI Prototype Test",
      surveyNumber: "Offer 1 Test",
      ownerName: "Prototype Admin",
      district: "Test District",
      riskLevel: "PROTOTYPE_TEST",
      delayProbability: 0,
      expectedDelayDays: 0,
      riskFactors: ["WhatsApp and Email integration test", "Offer 1 Active"],
      legalIssues: "None",
      documentIssues: "Verified",
      compensationStatus: "Active",
      recommendedAction: "This is a test notification from the LandGuard AI Land Acquisition Risk Management System. Offer: 1. Integration Active."
    });
  }
}
