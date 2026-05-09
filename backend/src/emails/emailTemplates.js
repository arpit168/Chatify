export function createWelcomeEmailTemplate(name, clientURL){
    return`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Chatify — Welcome to the conversation (dark mode)</title>
    <!-- Dark theme email template – fully optimized for email clients, Resend-ready -->
</head>
<body style="margin: 0; padding: 0; background-color: #0A0C10; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; -webkit-font-smoothing: antialiased;">
    <!-- Main email container: deep dark background with subtle gradient overlay -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#0A0C10" style="background-color: #0A0C10; width: 100%;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Outer card container - elegant dark elevated surface -->
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #12141C; border-radius: 32px; box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 255, 255, 0.03); overflow: hidden; font-family: inherit; border: 1px solid rgba(255,255,255,0.05);">
                    
                    <!-- HERO: vibrant dark gradient (cyber / purple vibe) -->
                    <tr>
                        <td style="background: radial-gradient(ellipse at 30% 40%, #1A102F, #0B0E17); padding: 42px 28px 38px 28px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                            <!-- Chatify logo / brand icon - modern glowing element -->
                            <div style="margin-bottom: 20px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); width: 72px; height: 72px; border-radius: 28px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px -8px rgba(139, 92, 246, 0.4);">
                                    <span style="font-size: 40px; line-height: 1;">💬</span>
                                </div>
                            </div>
                            <h1 style="font-size: 36px; font-weight: 700; margin: 0 0 8px 0; background: linear-gradient(120deg, #C084FC, #F472B6); -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: -0.3px;">Welcome to Chatify</h1>
                            <p style="font-size: 16px; color: #A1A9C0; margin: 12px 0 0 0; font-weight: 400;">Your encrypted universe of conversations</p>
                        </td>
                    </tr>
                    
                    <!-- MAIN CONTENT: dark mode readable + colorful accents -->
                    <tr>
                        <td style="padding: 36px 32px 40px 32px; background: #12141C;">
                            <!-- Dynamic greeting with glowing name -->
                            <p style="font-size: 24px; font-weight: 700; color: #F1F5F9; margin: 0 0 10px 0; letter-spacing: -0.2px;">Hey {{name}},</p>
                            <p style="font-size: 16px; color: #B4C0E0; margin: 0 0 28px 0; line-height: 1.5;">Welcome to the <strong style="color: #C084FC;">dark side</strong> of messaging — we built Chatify to be fast, private, and beautiful day or night. Connect with friends, share moments, and vibe in real-time. ✨</p>
                            
                            <!-- Feature grid: cards with dark elevated bg -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
                                <!-- row 1 -->
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <div style="background: #1E202A; border-radius: 24px; padding: 18px 20px; border: 1px solid rgba(139, 92, 246, 0.25); transition: all 0.1s;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 48px; vertical-align: top; padding-right: 16px;">
                                                        <span style="font-size: 30px;">⚡</span>
                                                    </td>
                                                    <td style="vertical-align: top;">
                                                        <p style="margin: 0 0 6px 0; font-weight: 700; color: #E2E8F0; font-size: 16px;">Real‑time velocity</p>
                                                        <p style="margin: 0; color: #949FBF; font-size: 14px;">Messages fly instantly with typing indicators and read receipts.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <div style="background: #1E202A; border-radius: 24px; padding: 18px 20px; border: 1px solid rgba(217, 70, 239, 0.2);">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 48px; vertical-align: top; padding-right: 16px;">
                                                        <span style="font-size: 30px;">🔒</span>
                                                    </td>
                                                    <td style="vertical-align: top;">
                                                        <p style="margin: 0 0 6px 0; font-weight: 700; color: #E2E8F0; font-size: 16px;">End‑to‑end encrypted</p>
                                                        <p style="margin: 0; color: #949FBF; font-size: 14px;">Only you and your recipient can read what’s sent — total privacy.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 0px;">
                                        <div style="background: #1E202A; border-radius: 24px; padding: 18px 20px; border: 1px solid rgba(139, 92, 246, 0.25);">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 48px; vertical-align: top; padding-right: 16px;">
                                                        <span style="font-size: 30px;">🌙</span>
                                                    </td>
                                                    <td style="vertical-align: top;">
                                                        <p style="margin: 0 0 6px 0; font-weight: 700; color: #E2E8F0; font-size: 16px;">Dark theme first</p>
                                                        <p style="margin: 0; color: #949FBF; font-size: 14px;">Sleek AMOLED-ready UI + custom chat bubbles & emoji reactions.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            }</td>
                            </table>
                            
                            <!-- subtle divider with neon effect -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #8B5CF6, #D946EF, #8B5CF6, transparent); margin: 16px 0 32px 0;"></div>
                            
                            <!-- primary CTA: Glowing action button linking to clientURL -->
                            <div style="text-align: center; margin-bottom: 36px;">
                                <a href="{{clientURL}}" style="display: inline-block; background: linear-gradient(105deg, #8B5CF6, #D946EF); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 36px; border-radius: 60px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.5); letter-spacing: -0.2px; transition: 0.2s;">🚀 Launch Chatify →</a>
                                <p style="font-size: 12px; color: #6F78A0; margin-top: 16px; margin-bottom: 0;">Access your dashboard instantly – no friction, pure chat</p>
                            </div>
                            
                            <!-- pro tip: stylish card -->
                            <div style="background: rgba(139, 92, 246, 0.08); border-left: 3px solid #C084FC; border-radius: 20px; padding: 16px 20px; margin-bottom: 32px; backdrop-filter: blur(2px);">
                                <p style="margin: 0 0 6px 0; font-weight: 600; color: #D9B4FF; font-size: 13px; letter-spacing: 0.3px;">✨ PRO TIP</p>
                                <p style="margin: 0; color: #BDC7E6; font-size: 14px;">Customize your dark theme with accent colors (neon purple, cyan or pink) — go to Settings → Appearance → Dark Mode + themes.</p>
                            </div>
                            
                            <!-- helpful support section -->
                            <p style="font-size: 14px; color: #9AA5C6; line-height: 1.5; margin: 0 0 4px 0;">💬 Questions? We’re around the clock — <a href="#" style="color: #C084FC; text-decoration: none; font-weight: 500;">Chatify Support</a> or simply reply to this email.</p>
                        </td>
                    </tr>
                    
                    <!-- FOOTER: dark cohesive ending -->
                    <tr>
                        <td style="background-color: #0F1119; padding: 28px 32px 32px 32px; border-top: 1px solid rgba(255,255,255,0.06);">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 20px;">
                                        <span style="font-weight: 800; font-size: 20px; background: linear-gradient(120deg, #C084FC, #F472B6); -webkit-background-clip: text; background-clip: text; color: transparent;">Chatify</span>
                                        <span style="color: #4B556B; margin: 0 6px;">✦</span>
                                        <span style="color: #8F9BB5; font-size: 13px;">Connect in the dark</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding-bottom: 24px;">
                                        <div style="display: inline-block; margin: 0 5px;">
                                            <a href="#" style="text-decoration: none; background: #1A1C26; padding: 6px 16px; border-radius: 40px; font-size: 12px; font-weight: 500; color: #C084FC; border: 0.5px solid #2D2F3E;">📱 iOS App</a>
                                        </div>
                                        <div style="display: inline-block; margin: 0 5px;">
                                            <a href="#" style="text-decoration: none; background: #1A1C26; padding: 6px 16px; border-radius: 40px; font-size: 12px; font-weight: 500; color: #C084FC; border: 0.5px solid #2D2F3E;">🤖 Android</a>
                                        </div>
                                        <div style="display: inline-block; margin: 0 5px;">
                                            <a href="#" style="text-decoration: none; background: #1A1C26; padding: 6px 16px; border-radius: 40px; font-size: 12px; font-weight: 500; color: #C084FC; border: 0.5px solid #2D2F3E;">💻 Web App</a>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; font-size: 12px; color: #6E7A99; line-height: 1.5;">
                                        <p style="margin: 0 0 8px 0;">© 2025 Chatify — encrypted messaging, built for night owls 🌙</p>
                                        <p style="margin: 0 0 8px 0;">548 Messenger Boulevard, Suite 200, Austin, TX 78701</p>
                                        <p style="margin: 8px 0 0 0;">
                                            <a href="#" style="color: #8794B8; text-decoration: none; margin: 0 6px;">Privacy policy</a> 
                                            <span style="color: #2D3748;">●</span> 
                                            <a href="#" style="color: #8794B8; text-decoration: none; margin: 0 6px;">Terms of service</a>
                                            <span style="color: #2D3748;">●</span>
                                            <a href="#" style="color: #8794B8; text-decoration: none; margin: 0 6px;">Unsubscribe</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- dark micro footer for email clients -->
                <p style="font-size: 11px; color: #3B4259; text-align: center; margin-top: 24px;">Sent from Chatify • You’re receiving this welcome email because you joined our community.</p>
            </td>
        </tr>
    </table>
</body>
</html>`
}