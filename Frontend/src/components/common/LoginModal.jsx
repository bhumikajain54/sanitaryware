import { Link } from 'react-router-dom';
import { MdClose, MdAdminPanelSettings, MdPerson, MdShield, MdLock, MdShoppingBag, MdLocalShipping, MdSecurity } from 'react-icons/md';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <MdClose className="text-2xl" />
          </button>

          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Choose Login Type
              </h2>
              <p className="text-xl text-gray-300">
                Select how you want to access the platform
              </p>
            </div>

            {/* Login Options Grid */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Admin Login Card */}
              <Link
                to="/admin/login"
                onClick={onClose}
                className="group relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 border-2 border-slate-600 hover:border-slate-400 transition-all duration-300 overflow-hidden"
              >
                {/* Flashing Border Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 via-gray-400 to-slate-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 animate-pulse-slow"></div>
                
                {/* Flash Sweep Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:animate-flash-sweep"></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-xl group-hover:animate-bounce-slow">
                    <MdAdminPanelSettings className="text-5xl text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-white text-center mb-3 group-hover:scale-105 transition-transform">
                    Admin Login
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-center mb-5 text-sm group-hover:text-gray-300 transition-colors">
                    Secure access to admin dashboard
                  </p>

                  {/* Features */}
                  <div className="space-y-2 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <MdShield className="text-teal-400 flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>Manage Products & Orders</span>
                    </div>
                    <div className="flex items-center gap-2 animation-delay-200">
                      <MdLock className="text-teal-400 flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>View Analytics & Reports</span>
                    </div>
                    <div className="flex items-center gap-2 animation-delay-400">
                      <MdShield className="text-teal-400 flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>Secure Administrator Access</span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-lg font-semibold text-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300 shadow-lg group-hover:shadow-2xl flex items-center justify-center gap-2">
                    <MdAdminPanelSettings className="text-xl" />
                    Continue as Admin
                  </div>
                </div>
              </Link>

              {/* Customer Login Card */}
              <Link
                to="/customer/login"
                onClick={onClose}
                className="group relative bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8 border-2 border-teal-500 hover:border-teal-300 transition-all duration-300 overflow-hidden"
              >
                {/* Flashing Border Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 animate-pulse-slow"></div>
                
                {/* Flash Sweep Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:animate-flash-sweep"></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-xl group-hover:animate-bounce-slow">
                    <MdPerson className="text-5xl text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-white text-center mb-3 group-hover:scale-105 transition-transform">
                    Customer Login
                  </h3>
                  
                  {/* Description */}
                  <p className="text-teal-100 text-center mb-5 text-sm group-hover:text-white transition-colors">
                    Shop premium sanitary ware
                  </p>

                  {/* Features */}
                  <div className="space-y-2 text-sm text-teal-100 mb-6">
                    <div className="flex items-center gap-2">
                      <MdShoppingBag className="text-white flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>Browse Premium Products</span>
                    </div>
                    <div className="flex items-center gap-2 animation-delay-200">
                      <MdLocalShipping className="text-white flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>Track Your Orders</span>
                    </div>
                    <div className="flex items-center gap-2 animation-delay-400">
                      <MdSecurity className="text-white flex-shrink-0 group-hover:animate-ping-slow" />
                      <span>Secure Shopping Experience</span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg font-semibold text-center group-hover:bg-white group-hover:text-teal-600 transition-all duration-300 shadow-lg group-hover:shadow-2xl flex items-center justify-center gap-2">
                    <MdPerson className="text-xl" />
                    Continue as Customer
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
