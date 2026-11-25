import LoginForm from '../components/LoginForm';
import logo from '../../../assets/pbjr_logo.png';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main */}
      <div className="flex justify-center items-center flex-1 px-4 pt-6 pb-2">
        <div className="w-full max-w-6xl flex bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Kiri: Ilustrasi/brand (hidden di mobile) */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gray-50 px-12 py-12 border-r border-gray-100 w-1/2">
            <div className="max-w-[417px] flex flex-col items-center gap-4">
              <img src={logo} alt="PB Jaya Raya" className="h-[70px] w-auto object-contain" />
              <p className="text-center text-gray-500 leading-7 text-[14px]">
                Selamat datang di website resmi PB Jaya Raya. Silakan masuk untuk mengakses sistem administrasi dan manajemen data atlet.
              </p>
            </div>
          </div>

          {/* Kanan: Form login */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 md:px-[74px] py-10">
          <div className="flex flex-col gap-10 w-full">
            <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl md:text-[27px] font-semibold text-ink text-center">
                  Login ke Akun Anda
                </h1>
                {/* <p className="text-base md:text-[0.9rem] text-muted text-center">
                  Masukkan email dan password untuk masuk ke akun Anda.
                </p> */}
              </div>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-4 px-5 py-6">
        {/* <div className="flex flex-wrap justify-center gap-8">
          <span className="text-sm text-gray-500 cursor-pointer hover:underline">Privacy Policy</span>
          <span className="text-sm text-gray-500 cursor-pointer hover:underline">Terms of Service</span>
          <span className="text-sm text-gray-500 cursor-pointer hover:underline">Security Protocol</span>
        </div> */}
        <p className="text-xs text-gray-400 text-center">
          © 2026 PB JAYA RAYA. All rights reserved. Secure Administrative Gateway.
        </p>
      </div>
    </div>
  );
}
