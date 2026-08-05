export const getCredentialEmailTemplate = ({ name, email, password }) => {
  return `
<!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                line-height: 1.6; 
                color: #2b2b2b; 
                background-color: #f4f5f7; 
                margin: 0; 
                padding: 20px 0; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff; 
                border-radius: 8px; 
                overflow: hidden; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
            }
            .header { 
                background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%); 
                color: #ffffff; 
                padding: 35px 20px; 
                text-align: center; 
                border-bottom: 4px solid #f59e0b; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 26px; 
                letter-spacing: 1px; 
                font-weight: 800; 
                text-transform: uppercase; 
            }
            .header p { 
                margin: 5px 0 0 0; 
                font-size: 14px; 
                color: #fef3c7; 
                font-weight: 500; 
            }
            .content { 
                padding: 30px; 
            }
            .greeting { 
                font-size: 16px; 
                color: #1e3a8a; 
            }
            .credential-box { 
                background: #fafafa; 
                border: 2px solid #e5e7eb; 
                border-left: 6px solid #dc2626; 
                border-radius: 6px; 
                padding: 20px; 
                margin: 25px 0; 
            }
            .credential-item { 
                margin-bottom: 12px; 
            }
            .credential-item:last-child { 
                margin-bottom: 0; 
            }
            .label { 
                font-size: 12px; 
                font-weight: bold; 
                color: #6b7280; 
                text-transform: uppercase; 
                letter-spacing: 0.5px; 
            }
            .value { 
                font-size: 16px; 
                font-family: 'Courier New', Consolas, monospace; 
                color: #1e3a8a; 
                font-weight: bold; 
                background: #ffffff; 
                padding: 8px 12px; 
                border: 1px solid #d1d5db; 
                border-radius: 4px; 
                display: inline-block; 
                margin-top: 4px; 
                word-break: break-all;
            }
            .warning { 
                background: #fffbe6; 
                border: 1px solid #ffe58f; 
                border-left: 4px solid #f59e0b; 
                padding: 12px 16px; 
                margin: 20px 0; 
                border-radius: 4px; 
                font-size: 14px; 
                color: #856404; 
            }
            .button-container { 
                text-align: center; 
                margin: 30px 0 20px 0; 
            }
            .button { 
                display: inline-block; 
                background-color: #dc2626; 
                color: #ffffff !important; 
                padding: 14px 36px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold; 
                font-size: 15px; 
                letter-spacing: 0.5px; 
                box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25); 
            }
            .footer { 
                background-color: #f8fafc; 
                padding: 20px; 
                text-align: center; 
                border-top: 1px solid #e2e8f0; 
                color: #64748b; 
                font-size: 12px; 
            }
            .footer p { 
                margin: 4px 0; 
            }
            .motto { 
                font-style: italic; 
                color: #1e3a8a; 
                font-weight: 600; 
                margin-bottom: 8px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏸 PB JAYA RAYA</h1>
                <p>Sistem Informasi & Manajemen Atlet</p>
            </div>
            <div class="content">
                <p class="greeting">Halo <strong>${name}</strong>,</p>
                <p>Selamat datang di platform digital PB Jaya Raya! Akun Anda telah berhasil dikonfigurasi. Gunakan rincian kredensial di bawah ini untuk masuk ke dalam sistem:</p>
                
                <div class="credential-box">
                    <div class="credential-item">
                        <div class="label">Username / Email</div>
                        <div class="value">${email}</div>
                    </div>
                    <div class="credential-item" style="margin-top: 15px;">
                        <div class="label">Password Sementara</div>
                        <div class="value">${password}</div>
                    </div>
                </div>

                <div class="warning">
                    <strong>⚠️ Keamanan Akun:</strong> Harap segera melakukan perubahan password setelah Anda berhasil login untuk pertama kali.
                </div>

                <div class="button-container">
                    <a href="" class="button">MASUK KE SISTEM</a>
                </div>

                <p style="font-size: 14px; color: #4b5563;">Jika mengalami hambatan saat mengakses portal, silakan hubungi tim administrasi PB Jaya Raya.</p>
            </div>

            <div class="footer">
                <p class="motto">"Semangat Mencedas, Berprestasi, dan Mendunia"</p>
                <p>Email otomatis ini dikirim oleh Sistem Informasi Manajemen PB Jaya Raya.</p>
                <p>&copy; ${""} PB Jaya Raya. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
