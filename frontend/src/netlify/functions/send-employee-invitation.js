// netlify/functions/send-employee-invitation.js
import nodemailer from "nodemailer";

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email, employeeId, roleName, invitedBy, temporaryPassword } =
      JSON.parse(event.body);

    // Validate required fields
    if (!email || !employeeId || !temporaryPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email HTML content with login credentials
    const htmlContent = `
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
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We're excited to have you join our team! Your employee account has been created successfully.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">🔐 Your Login Credentials</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Employee ID:</td>
                  <td style="padding: 8px 0;">${employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Temporary Password:</td>
                  <td style="padding: 8px 0; background: #fff3cd; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: bold; color: #856404;">${temporaryPassword}</td>
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
              </table>
            </div>
            
            <div style="background: #ffe6e6; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;">
              <h3 style="margin-top: 0; color: #721c24; font-size: 16px;">⚠️ Important Security Information</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #721c24;">
                <li style="margin-bottom: 8px;">This is a <strong>temporary password</strong></li>
                <li style="margin-bottom: 8px;">You will be required to change it on your first login</li>
                <li style="margin-bottom: 8px;">Do not share your credentials with anyone</li>
                <li style="margin-bottom: 8px;">Keep this email secure or delete it after changing your password</li>
              </ul>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #17a2b8;">
              <h3 style="margin-top: 0; color: #0c5460; font-size: 16px;">📋 Getting Started</h3>
              <ol style="margin: 10px 0; padding-left: 20px; color: #0c5460;">
                <li style="margin-bottom: 8px;">Click the button below to access the admin portal</li>
                <li style="margin-bottom: 8px;">Log in using your email and temporary password</li>
                <li style="margin-bottom: 8px;">Create a new secure password when prompted</li>
                <li style="margin-bottom: 8px;">Complete your employee profile</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.URL || "https://rent-a-click.netlify.app/"
              }/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Access Admin Portal
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions or need assistance, please don't hesitate to reach out to HR or your manager.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              This invitation was sent by ${invitedBy || "HR Department"}<br>
              This email was sent on ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Company HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to the Team - Your Login Credentials",
      html: htmlContent,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Invitation email sent successfully",
        emailId: info.messageId,
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
