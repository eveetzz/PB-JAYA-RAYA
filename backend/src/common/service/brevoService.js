import { brevoClient } from "../../config/brevo.js";

export const sendCredentialEmail = async (
  toEmail,
  namaAtlet,
  passwordDefault,
) => {
  try {
    // 2. Gunakan namespaced service .transactionalEmails untuk mengirim email
    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      // PENTING: Email sender harus sudah di-verify di dashboard Brevo Anda!
      sender: {
        name: "PBSI Manajemen",
        email: "admin@domainpbsi-anda.com",
      },
      to: [
        {
          email: toEmail,
          name: namaAtlet,
        },
      ],
      subject: "Aktivasi Akun Atlet - Kredensial Login Anda",
      // Isi konten email (Bisa pakai HTML agar tampilannya rapi)
      htmlContent: `
        <h3>Halo, ${namaAtlet}!</h3>
        <p>Akun Anda telah berhasil didaftarkan oleh Manajemen Sistem PBSI.</p>
        <p>Berikut adalah kredensial login sementara Anda:</p>
        <table style="border: 1px solid #ccc; padding: 10px;">
          <tr><td><b>Email Login</b></td><td>: ${toEmail}</td></tr>
          <tr><td><b>Password Sementara</b></td><td>: <code>${passwordDefault}</code></td></tr>
        </table>
        <br/>
        <p>Silakan login ke aplikasi dan <b>segera ubah password Anda</b> demi keamanan data.</p>
        <br/>
        <p>Salam,<br/><b>Tim Manajemen PBSI</b></p>
      `,
    });

    return response;
  } catch (error) {
    // Melempar error agar ditangkap oleh 'catch (emailError)' di file service utama Anda
    throw new Error(error.message || "Gagal mengirim email via Brevo");
  }
};
