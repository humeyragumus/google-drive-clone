import nodemailer from "nodemailer";

export const sendShareEmail = async ({
  to,
  fileName,
  fileUrl,
  senderName,
  password,
  expiryDate,
  permission
}: {
  to: string;
  fileName: string;
  fileUrl: string;
  senderName: string;
  password?: string;
  expiryDate?: string;
  permission?: string;
}) => {
  try {
    console.log('Setting up email transport with:', {
      user: process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format expiry date if exists
    const formattedExpiryDate = expiryDate 
      ? new Date(expiryDate).toLocaleString('tr-TR', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })
      : null;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Dosya Paylaşımı</h2>
        <p>${senderName} sizinle bir dosya paylaştı!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Dosya Adı:</strong> ${fileName}</p>
          ${password ? '<p><strong>Şifre:</strong> ' + password + '</p>' : ''}
          ${formattedExpiryDate ? '<p><strong>Son Kullanma Tarihi:</strong> ' + formattedExpiryDate + '</p>' : ''}
          <p><strong>İzinler:</strong> ${permission === 'write' ? 'Okuma ve Yazma' : 'Sadece Okuma'}</p>
        </div>

        <a href="${fileUrl}" style="display: inline-block; background-color: #ac93b9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Dosyaya Git
        </a>

        <p style="color: #666; margin-top: 20px; font-size: 0.9em;">
          Bu dosya size özel olarak paylaşılmıştır. Lütfen güvenli bir şekilde kullanın.
        </p>
      </div>
    `;

    console.log('Attempting to send email to:', to);

    const info = await transporter.sendMail({
      from: `"Google Drive" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${senderName} sizinle bir dosya paylaştı: ${fileName}`,
      html: emailContent,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
