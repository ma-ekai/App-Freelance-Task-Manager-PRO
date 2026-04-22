import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
    // Si no hay configuración SMTP, logueamos el enlace en consola (útil para dev)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 ENLACE DE RESET DE CONTRASEÑA (modo dev):');
        console.log(resetUrl);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Recupera tu contraseña — Task Manager',
        html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
                <h2 style="color: #2d2d2d; font-weight: 300; font-size: 24px;">Recupera tu contraseña</h2>
                <p style="color: #666; line-height: 1.6;">Has solicitado un enlace para restablecer tu contraseña. Haz clic en el botón de abajo para continuar. El enlace caduca en <strong>1 hora</strong>.</p>
                <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #2d2d2d; color: white; text-decoration: none; border-radius: 8px; font-size: 14px;">
                    Restablecer contraseña
                </a>
                <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, ignora este email. Tu contraseña no cambiará.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #bbb; font-size: 11px;">Task Manager · ${process.env.APP_URL || ''}</p>
            </div>
        `,
    });
};
