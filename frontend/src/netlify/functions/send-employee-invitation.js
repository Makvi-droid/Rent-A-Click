// netlify/functions/send-employee-invitation.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const {
      email,
      employeeId,
      firstName,
      lastName,
      roleName,
      startDate,
      invitedBy,
    } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !employeeId || !firstName || !lastName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: "https://rent-a-click.netlify.app/", // Update this with your verified domain
      to: [email],
      subject: `Welcome to the Team - Employee Account Setup`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Our Team</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Team! 🎉</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${firstName} ${lastName},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                We're excited to have you join our team! Your employee account has been created successfully.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Your Account Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Employee ID:</td>
                    <td style="padding: 8px 0;">${employeeId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 8px 0;">${email}</td>
                  </tr>
                  ${
                    roleName
                      ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Role:</td>
                    <td style="padding: 8px 0;">${roleName}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    startDate
                      ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Start Date:</td>
                    <td style="padding: 8px 0;">${new Date(
                      startDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
                <h3 style="margin-top: 0; color: #856404; font-size: 16px;">📋 Next Steps</h3>
                <ol style="margin: 10px 0; padding-left: 20px; color: #856404;">
                  <li style="margin-bottom: 8px;">Check your email for login credentials (sent separately)</li>
                  <li style="margin-bottom: 8px;">Complete your employee profile</li>
                  <li style="margin-bottom: 8px;">Review company policies and handbook</li>
                  <li style="margin-bottom: 8px;">Set up your workspace and equipment</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.URL || "https://rent-a-click.netlify.app/"
                }/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Access Your Account
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you have any questions or need assistance, please don't hesitate to reach out to HR or your manager.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                This invitation was sent by ${invitedBy || "HR Department"}<br>
                This email was sent on ${new Date().toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Invitation email sent successfully",
        emailId: data.id,
      }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send email",
        details: error.message,
      }),
    };
  }
};
