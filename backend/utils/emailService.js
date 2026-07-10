const nodemailer = require('nodemailer');
require('dotenv').config();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send booking confirmation email to the patient
 * @param {Object} appt - Appointment document from Mongoose
 */
const sendBookingEmail = async (appt) => {
  if (!appt.email) {
    console.warn('❌ Cannot send email: Patient email address is missing.');
    return;
  }

  const isOnline = appt.consultationType === 'ONLINE';
  const portalUrl = `${FRONTEND_URL}/?view=video-room&id=${appt._id}`;
  const meetLinkHtml = isOnline 
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${appt.meetLink || portalUrl}" target="_blank" style="background-color: #064e3b; color: #ffffff; padding: 16px 32px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 14px; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block; box-shadow: 0 10px 20px rgba(6, 78, 59, 0.15);">
          Join Telehealth Consultation
        </a>
        <p style="margin-top: 15px; font-size: 11px; color: #6b7280; font-family: 'Inter', sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
          Please join 5 minutes before your scheduled slot.
        </p>
      </div>
    `
    : '';

  const clinicAddressHtml = !isOnline
    ? `
      <div style="background-color: #fcf8fa; border: 1px solid #f3e8ee; border-radius: 20px; padding: 20px; margin-top: 25px;">
        <h4 style="margin: 0 0 10px 0; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 800; color: #86198f; uppercase; tracking: 0.2em; text-transform: uppercase; letter-spacing: 0.1em;">Clinic Address</h4>
        <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #4b5563; line-height: 1.6;">
          Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010
        </p>
        <p style="margin: 5px 0 0 0; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #064e3b;">
          Helpline: +91 9453238699
        </p>
      </div>
    `
    : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DermElixir Appointment Confirmation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f5f6; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f5f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.04); border: 1px solid #f1f0f2;">
              
              <!-- Header Section -->
              <tr>
                <td style="background-color: #022c22; padding: 40px; text-align: center; position: relative;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">DermElixir</h1>
                  <p style="margin: 5px 0 0 0; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #34d399; uppercase; text-transform: uppercase; letter-spacing: 0.3em;">Aesthetic & Wellness Node</p>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td style="padding: 40px 45px; background-color: #ffffff;">
                  <p style="margin: 0 0 15px 0; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: #374151;">
                    Hello <strong>${appt.patientName}</strong>,
                  </p>
                  <p style="margin: 0 0 25px 0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #4b5563; line-height: 1.6;">
                    Thank you for booking with DermElixir. Your payment has been processed successfully, and your clinical slot with <strong>Dr. Megha Singh</strong> is confirmed.
                  </p>
                  
                  <!-- Appointment Details Ticket Card -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0; border: 1px dashed #e5e7eb; border-radius: 24px; padding: 25px; background-color: #fafaf9;">
                    
                    <tr>
                      <td style="padding-bottom: 15px; border-bottom: 1px solid #f1f1ef;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Treatment Case</span>
                        <div style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #022c22; margin-top: 3px;">${appt.treatment}</div>
                      </td>
                      <td align="right" style="padding-bottom: 15px; border-bottom: 1px solid #f1f1ef; vertical-align: bottom;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Type</span>
                        <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; color: ${isOnline ? '#2563eb' : '#059669'}; background-color: ${isOnline ? '#eff6ff' : '#ecfdf5'}; border: 1px solid ${isOnline ? '#bfdbfe' : '#a7f3d0'}; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; display: inline-block; margin-top: 3px; letter-spacing: 0.05em;">
                          ${isOnline ? 'Online Call' : 'In-Clinic'}
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding-top: 15px;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Appointment Date</span>
                        <div style="font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${appt.date}</div>
                      </td>
                      <td align="right" style="padding-top: 15px;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Session Time</span>
                        <div style="font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${appt.startTime || appt.time}</div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding-top: 15px;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Paid Amount</span>
                        <div style="font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: #022c22; margin-top: 2px;">₹11.00</div>
                      </td>
                      <td align="right" style="padding-top: 15px;">
                        <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; uppercase; text-transform: uppercase; letter-spacing: 0.1em;">Reference ID</span>
                        <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: #6b7280; margin-top: 2px;">${appt.paymentId || 'N/A'}</div>
                      </td>
                    </tr>

                  </table>

                  ${meetLinkHtml}
                  ${clinicAddressHtml}

                  <p style="margin: 25px 0 0 0; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #6b7280; line-height: 1.6;">
                    If you need to reschedule or cancel your visit, please contact the clinic helpline at least 2 hours before your session.
                  </p>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td style="background-color: #fafaf9; border-top: 1px solid #f1f0f2; padding: 30px; text-align: center;">
                  <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #022c22;">DermElixir</p>
                  <p style="margin: 4px 0 0 0; font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.2em;">Varanasi, UP &bull; Private Aesthetics Node</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"DermElixir Clinic" <${process.env.EMAIL_SENDER || 'dggupta614@gmail.com'}>`,
    to: appt.email,
    subject: `DermElixir Appointment Pass - ${appt.patientName}`,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email successfully dispatched! Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Nodemailer Error: Failed to dispatch confirmation email:', err.message);
    throw err;
  }
};

/**
 * Send OTP verification email to the patient
 * @param {string} email - Patient email address
 * @param {string} otpCode - 6-digit verification code
 */
const sendOtpEmail = async (email, otpCode) => {
  if (!email) {
    console.warn('❌ Cannot send OTP email: email address is missing.');
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DermElixir Verification Code</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f5f6; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f5f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.04); border: 1px solid #f1f0f2;">
              
              <!-- Header Section -->
              <tr>
                <td style="background-color: #022c22; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">DermElixir</h1>
                  <p style="margin: 5px 0 0 0; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.3em;">Patient Portal Node</p>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td style="padding: 40px 45px; background-color: #ffffff;">
                  <p style="margin: 0 0 15px 0; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: #374151;">
                    Hello,
                  </p>
                  <p style="margin: 0 0 25px 0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #4b5563; line-height: 1.6;">
                    You requested a verification code to access your DermElixir Patient Portal profile and booking history. Please use the following single-use code to sign in:
                  </p>
                  
                  <!-- OTP Code Display -->
                  <div style="margin: 30px 0; text-align: center;">
                    <div style="background-color: #fcf8fa; border: 1px dashed #e5e7eb; border-radius: 20px; padding: 25px; display: inline-block; min-width: 200px;">
                      <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.15em;">Verification Code</span>
                      <div style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 800; color: #022c22; letter-spacing: 0.25em; margin-top: 10px; margin-left: 0.25em;">${otpCode}</div>
                    </div>
                  </div>

                  <p style="margin: 25px 0 0 0; font-family: 'Inter', sans-serif; font-size: 12px; font-style: italic; color: #9ca3af; line-height: 1.6; text-align: center;">
                    This verification code is valid for 5 minutes. If you did not request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td style="background-color: #fafaf9; border-top: 1px solid #f1f0f2; padding: 30px; text-align: center;">
                  <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #022c22;">DermElixir</p>
                  <p style="margin: 4px 0 0 0; font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.2em;">Varanasi, UP &bull; Private Aesthetics Node</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"DermElixir Clinic" <${process.env.EMAIL_SENDER || 'dggupta614@gmail.com'}>`,
    to: email,
    subject: `DermElixir Patient Portal OTP: ${otpCode}`,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email successfully dispatched! Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Nodemailer Error: Failed to dispatch OTP email:', err.message);
    throw err;
  }
};

/**
 * Send OTP verification email to the admin/owner
 * @param {string} email - Owner email address
 * @param {string} otpCode - 6-digit verification code
 */
const sendAdminOtpEmail = async (email, otpCode) => {
  if (!email) {
    console.warn('❌ Cannot send Admin OTP email: email address is missing.');
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DermElixir Admin Security Code</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f5f6; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f5f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.04); border: 1px solid #f1f0f2;">
              
              <!-- Header Section -->
              <tr>
                <td style="background-color: #022c22; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">DermElixir</h1>
                  <p style="margin: 5px 0 0 0; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.3em;">Administrative Security Node</p>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td style="padding: 40px 45px; background-color: #ffffff;">
                  <p style="margin: 0 0 15px 0; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: #374151;">
                    Hello Owner,
                  </p>
                  <p style="margin: 0 0 25px 0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #4b5563; line-height: 1.6;">
                    You are setting up or resetting the owner password for the DermElixir Admin Panel. Please use the following single-use verification code to authorize this action:
                  </p>
                  
                  <!-- OTP Code Display -->
                  <div style="margin: 30px 0; text-align: center;">
                    <div style="background-color: #fcf8fa; border: 1px dashed #e5e7eb; border-radius: 20px; padding: 25px; display: inline-block; min-width: 200px;">
                      <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.15em;">Security OTP</span>
                      <div style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 800; color: #b91c1c; letter-spacing: 0.25em; margin-top: 10px; margin-left: 0.25em;">${otpCode}</div>
                    </div>
                  </div>

                  <p style="margin: 25px 0 0 0; font-family: 'Inter', sans-serif; font-size: 12px; font-style: italic; color: #9ca3af; line-height: 1.6; text-align: center;">
                    This security OTP is valid for 5 minutes. If you did not initiate this change, please contact your systems administrator immediately.
                  </p>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td style="background-color: #fafaf9; border-top: 1px solid #f1f0f2; padding: 30px; text-align: center;">
                  <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #022c22;">DermElixir</p>
                  <p style="margin: 4px 0 0 0; font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.2em;">Varanasi, UP &bull; Administrative Systems</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"DermElixir Security" <${process.env.EMAIL_SENDER || 'dggupta614@gmail.com'}>`,
    to: email,
    subject: `DermElixir Admin Security Verification: ${otpCode}`,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin OTP email successfully dispatched! Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Nodemailer Error: Failed to dispatch Admin OTP email:', err.message);
    throw err;
  }
};

module.exports = { sendBookingEmail, sendOtpEmail, sendAdminOtpEmail };

