export interface ResetPasswordEmailParams {
  name: string;
  email: string;
  resetUrl: string;
}

export const getResetPasswordTemplate = ({
  name,
  email,
  resetUrl,
}: ResetPasswordEmailParams): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Mark - Password Reset Email</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, h1, h2, h3, a {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">

  <!-- Outer wrapper -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Top Branding Strip -->
          <tr>
            <td style="background: linear-gradient(to right, #4f46e5, #4338ca, #3730a3); background-color: #4f46e5; padding: 28px 32px; color: #ffffff;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <!-- Logo Icon & Text -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                          <img src="https://api.iconify.design/lucide:shield-check.svg?color=%23ffffff" alt="Shield" width="24" height="24" style="display: inline-block; vertical-align: middle; margin-top: 8px;">
                        </td>
                        <td style="padding-left: 12px; vertical-align: middle;">
                          <span style="font-size: 20px; font-weight: 800; tracking: -0.5px; color: #ffffff; display: block; line-height: 1;">Social Mark</span>
                          <span style="font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 4px;">Account & Escrow Security</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; color: #ffffff;">
                      <span style="display: inline-block; width: 8px; height: 8px; background-color: #34d399; border-radius: 50%; margin-right: 6px;"></span>
                      Security Notice
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Body Content -->
          <tr>
            <td style="padding: 40px 32px;">
              
              <!-- Greeting & Overview -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 50px; margin-bottom: 12px;">
                      Password Reset Request
                    </div>
                    <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3;">
                      Reset your password for Social Mark
                    </h1>
                    <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 0;">
                      Hello <strong>${name}</strong>, we received a verified request to reset the password for your Social Mark creator & merchant account (<span style="color: #4f46e5; font-family: monospace; font-size: 12px; background-color: #eef2ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e0e7ff;">${email}</span>).
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Primary Action CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 28px; background-color: #eef2ff; border-radius: 16px; border: 1px solid #e0e7ff;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #3730a3; margin: 0 0 16px 0;">Click the button below to choose a new password</p>
                    
                    <div>
                      <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 32px; border-radius: 12px;">
                        Reset Password Securely &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Assurance Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" style="vertical-align: top;">
                          <div style="background-color: #d1fae5; color: #065f46; padding: 8px; border-radius: 8px; display: inline-block;">
                            <img src="https://api.iconify.design/lucide:lock.svg?color=%23059669" alt="Lock" width="20" height="20">
                          </div>
                        </td>
                        <td style="padding-left: 12px; vertical-align: top;">
                          <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Your Marketplace Balances & Escrow are Safe</h3>
                          <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">
                            Social Mark automated circuit breakers are active. In-flight store payouts, creator affiliate balances, and active shoppable listings remain fully protected while this credentials reset is processed.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Plain URL -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td>
                    <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; color: #4338ca; word-break: break-all; margin: 0;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- If You Didn't Request This -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <tr>
                  <td width="20" style="vertical-align: top;">
                    <img src="https://api.iconify.design/lucide:alert-circle.svg?color=%23f43f5e" alt="Alert" width="16" height="16" style="margin-top: 2px;">
                  </td>
                  <td style="padding-left: 8px; vertical-align: top; font-size: 12px; color: #64748b; line-height: 1.5;">
                    <strong style="color: #475569;">Didn't request this change?</strong> You can safely ignore this email; your current password remains active. However, if you suspect an unauthorized attempt, please <a href="#" style="color: #4f46e5; font-weight: 600; text-decoration: none;">lock your Social Mark storefront immediately</a> or contact Trust & Safety.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Email Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 12px 0;">
                <a href="#" style="color: #475569; text-decoration: none;">Marketplace Hub</a> &bull; 
                <a href="#" style="color: #475569; text-decoration: none;">Seller Protection</a> &bull; 
                <a href="#" style="color: #475569; text-decoration: none;">Security Policy</a> &bull; 
                <a href="#" style="color: #475569; text-decoration: none;">Help & Support</a>
              </p>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
                &copy; ${new Date().getFullYear()} Social Mark Inc., 450 Mission Street, Suite 800, San Francisco, CA 94105.<br>
                This is an automated operational notification regarding your account credentials.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};