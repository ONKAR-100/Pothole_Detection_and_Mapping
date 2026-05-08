"""
PotholeWatch v3 — Email Sender (SendGrid)
Handles report delivery and high-severity alerts.
"""
import io
import base64
from config import SENDGRID_API_KEY, ALERT_FROM_EMAIL, ALERT_FROM_NAME


def _get_sg():
    from sendgrid import SendGridAPIClient
    return SendGridAPIClient(api_key=SENDGRID_API_KEY)


def send_report_email(
    to_emails: list,
    pdf_bytes: io.BytesIO,
    date_range: str,
    stats: dict,
) -> dict:
    """Send PDF report to a list of recipients via SendGrid."""
    try:
        from sendgrid.helpers.mail import (
            Mail, Attachment, FileContent, FileName,
            FileType, Disposition, To
        )

        html_body = f"""
        <html><body>
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2c3e50;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h2>🚧 PotholeWatch — Detection Report</h2>
            <p>Period: {date_range}</p>
          </div>
          <div style="padding:20px;border:1px solid #dee2e6;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="background:#f8f9fa;">
                <td style="padding:10px;border:1px solid #dee2e6;font-weight:bold;">Total Detections</td>
                <td style="padding:10px;border:1px solid #dee2e6;">{stats.get('total', 0)}</td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #dee2e6;font-weight:bold;">High Severity</td>
                <td style="padding:10px;border:1px solid #dee2e6;color:#dc3545;font-weight:bold;">{stats.get('high', 0)}</td>
              </tr>
              <tr style="background:#f8f9fa;">
                <td style="padding:10px;border:1px solid #dee2e6;font-weight:bold;">Medium Severity</td>
                <td style="padding:10px;border:1px solid #dee2e6;color:#fd7e14;">{stats.get('medium', 0)}</td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #dee2e6;font-weight:bold;">Low Severity</td>
                <td style="padding:10px;border:1px solid #dee2e6;color:#28a745;">{stats.get('low', 0)}</td>
              </tr>
              <tr style="background:#f8f9fa;">
                <td style="padding:10px;border:1px solid #dee2e6;font-weight:bold;">Avg Confidence</td>
                <td style="padding:10px;border:1px solid #dee2e6;">{stats.get('avg_confidence', 0)*100:.1f}%</td>
              </tr>
            </table>
            <p style="color:#666;font-size:12px;margin-top:20px;">
              The full PDF report is attached to this email.<br/>
              This is an automated message from PotholeWatch.
            </p>
          </div>
        </div>
        </body></html>
        """

        pdf_b64 = base64.b64encode(pdf_bytes.read()).decode()

        message = Mail(
            from_email=(ALERT_FROM_EMAIL, ALERT_FROM_NAME),
            to_emails=[To(e) for e in to_emails],
            subject=f"PotholeWatch Report: {date_range}",
            html_content=html_body,
        )

        attachment = Attachment()
        attachment.file_content   = FileContent(pdf_b64)
        attachment.file_type      = FileType("application/pdf")
        attachment.file_name      = FileName("pothole_report.pdf")
        attachment.disposition    = Disposition("attachment")
        message.attachment = attachment

        sg = _get_sg()
        sg.client.mail.send.post(request_body=message.get())
        return {"success": True, "sent_to": to_emails}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_high_severity_alert(to_emails: list, detection: dict) -> dict:
    """Send an immediate alert email for a high-severity detection."""
    try:
        from sendgrid.helpers.mail import Mail, To

        lat  = detection.get("latitude")
        lng  = detection.get("longitude")
        gps  = f"{lat:.6f}, {lng:.6f}" if lat and lng else "Not available"
        conf = f"{detection.get('confidence', 0) * 100:.1f}%"
        src  = detection.get("source_name", "unknown")
        img  = detection.get("image_url", "")

        img_html = f'<img src="{img}" style="max-width:400px;border-radius:8px;" /><br/>' if img else ""

        html_body = f"""
        <html><body>
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#dc3545;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h2>🔴 HIGH Severity Pothole Detected</h2>
            <p>Immediate attention required</p>
          </div>
          <div style="padding:20px;border:1px solid #dee2e6;border-radius:0 0 8px 8px;">
            {img_html}
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px;font-weight:bold;">Severity</td>
                  <td style="padding:8px;color:#dc3545;font-weight:bold;">HIGH</td></tr>
              <tr style="background:#f8f9fa;">
                  <td style="padding:8px;font-weight:bold;">Confidence</td>
                  <td style="padding:8px;">{conf}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">GPS Location</td>
                  <td style="padding:8px;">{gps}</td></tr>
              <tr style="background:#f8f9fa;">
                  <td style="padding:8px;font-weight:bold;">Source</td>
                  <td style="padding:8px;">{src}</td></tr>
            </table>
            <p style="color:#666;font-size:12px;margin-top:20px;">
              This is an automated HIGH severity alert from PotholeWatch.
            </p>
          </div>
        </div>
        </body></html>
        """

        message = Mail(
            from_email=(ALERT_FROM_EMAIL, ALERT_FROM_NAME),
            to_emails=[To(e) for e in to_emails],
            subject="🔴 HIGH Severity Pothole Detected — PotholeWatch",
            html_content=html_body,
        )

        sg = _get_sg()
        sg.client.mail.send.post(request_body=message.get())
        return {"success": True, "sent_to": to_emails}
    except Exception as e:
        return {"success": False, "error": str(e)}
