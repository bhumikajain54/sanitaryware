import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { checkAdminExists, registerAdmin } from '../services/authService';
import {
  MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff,
  MdArrowBack, MdPhone, MdAdminPanelSettings, MdShield
} from 'react-icons/md';

// ─── Magnetic Button ─────────────────────────────────────────────────────────
const MagneticButton = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * 0.2);
    y.set((clientY - (top + height / 2)) * 0.2);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

// ─── Input Field ─────────────────────────────────────────────────────────────
const InputField = ({
  icon: Icon, type, name, placeholder, value, onChange,
  showPasswordToggle, showPassword, onTogglePassword, accent
}) => {
  const isAmber = accent === 'amber';
  return (
    <div className="relative group">
      <div className={`absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-500 z-10 ${isAmber ? 'group-focus-within:text-amber-400' : 'group-focus-within:text-teal-400'} group-focus-within:scale-110`}>
        <Icon className="text-sm md:text-base lg:text-[22px]" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`w-full pl-9 md:pl-11 lg:pl-14 pr-9 md:pr-10 lg:pr-12 py-2.5 md:py-3 lg:py-4 bg-white/5 border border-white/5 rounded-xl md:rounded-xl lg:rounded-2xl outline-none transition-all text-white font-bold tracking-wide placeholder:text-gray-700 placeholder:font-medium text-xs md:text-sm ${isAmber ? 'focus:border-amber-500/30 focus:bg-amber-500/5' : 'focus:border-teal-500/30 focus:bg-white/10'}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all p-0.5 z-10"
        >
          {showPassword
            ? <MdVisibilityOff className="text-sm md:text-base lg:text-[20px]" />
            : <MdVisibility className="text-sm md:text-base lg:text-[20px]" />
          }
        </button>
      )}
    </div>
  );
};

// ─── Password Strength ───────────────────────────────────────────────────────
const PasswordStrength = ({ strength, rules, currentStrength, password }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="px-3 md:px-3 lg:px-4 py-2.5 md:py-3 lg:py-4 bg-white/5 rounded-xl lg:rounded-3xl space-y-2 md:space-y-2.5 lg:space-y-4 border border-white/5 backdrop-blur-md"
  >
    <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
      <span className="text-gray-500">Security Index</span>
      <span className={`${currentStrength.text} transition-colors duration-500`}>{currentStrength.label}</span>
    </div>
    <div className="h-1 md:h-1 lg:h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: (strength + 1) * 20 + '%' }}
        className={`h-full ${currentStrength.color} transition-all duration-700`}
      />
    </div>
    <div className="grid grid-cols-2 gap-x-2 md:gap-x-3 lg:gap-x-4 gap-y-1 md:gap-y-1.5 lg:gap-y-2">
      {rules.map((rule, i) => {
        const passed = rule.test(password);
        return (
          <div key={i} className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
            <div className={`w-1 h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-500 ${passed ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]' : 'bg-white/10'}`} />
            <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${passed ? 'text-teal-300' : 'text-gray-600'}`}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  </motion.div>
);

// ─── Social Logins ───────────────────────────────────────────────────────────
const SocialLogins = () => {
  const { loginWithGoogle, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/customer/dashboard';

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token) { toast.error('Google didn\'t provide a valid session.'); return; }
      const toastId = toast.loading('Synchronizing with Singhai accounts...');
      try {
        const result = await loginWithGoogle(tokenResponse.access_token);
        if (result.success) {
          toast.success('Access Granted!', { id: toastId });
          if (checkIsAdmin(result.user?.role)) navigate('/admin', { replace: true });
          else {
            const dest = (from === '/customer/login' || from === '/login') ? '/customer/dashboard' : from;
            navigate(dest, { replace: true });
          }
        } else {
          toast.error(result.message || 'Authentication rejected', { id: toastId });
        }
      } catch (err) {
        toast.error('Server connection failed.', { id: toastId });
      }
    },
    onError: () => toast.error('Google Sign-In failed'),
    scope: 'email profile openid',
  });

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('123456789012');

  return (
    <div className="mt-3 md:mt-4 w-full">
      <div className="flex items-center gap-2 md:gap-3 lg:gap-6 mb-2 md:mb-3 group">
        <div className="flex-grow h-[1px] bg-white/5 group-hover:bg-teal-500/30 transition-colors duration-700" />
        <span className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] whitespace-nowrap">Quick Auth</span>
        <div className="flex-grow h-[1px] bg-white/5 group-hover:bg-teal-500/30 transition-colors duration-700" />
      </div>
      <button
        onClick={() => { if (!isGoogleConfigured) { toast.error('Google Client ID not configured'); return; } loginGoogle(); }}
        type="button"
        className={`w-full flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-xl md:rounded-xl lg:rounded-2xl text-[10px] md:text-[11px] font-black text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group overflow-hidden relative shadow-lg shadow-black/20 ${!isGoogleConfigured ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
      >
        <div className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 z-10 bg-white rounded-full flex items-center justify-center p-0.5 flex-shrink-0">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-full h-full" alt="G" />
        </div>
        <span className="z-10 tracking-[0.15em] md:tracking-[0.2em] font-black uppercase">Continue with Google</span>
        {!isGoogleConfigured && <span className="absolute top-0 right-0 bg-red-500 text-[6px] px-1 rounded-bl-lg z-20">PENDING</span>}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
      </button>
      <p className="text-center mt-3 md:mt-4 flex items-center justify-center gap-2">
        <Link to="/terms" className="text-[9px] font-bold text-gray-500 hover:text-white transition-all tracking-[0.2em] underline underline-offset-4 decoration-gray-800 hover:decoration-teal-500">TERMS</Link>
        <span className="text-[9px] font-bold text-gray-700">&</span>
        <Link to="/privacy" className="text-[9px] font-bold text-gray-500 hover:text-white transition-all tracking-[0.2em] underline underline-offset-4 decoration-gray-800 hover:decoration-teal-500">PRIVACY</Link>
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerLogin = () => {
  const [mode, setMode] = useState('login');
  const [adminExists, setAdminExists] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const { login, register, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef(null);

  useEffect(() => {
    checkAdminExists()
      .then((res) => {
        const exists = res?.exists ?? res?.adminExists ?? res === true;
        setAdminExists(exists);
      })
      .catch(() => setAdminExists(true));
  }, []);

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';

  // 3D tilt (desktop only)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-300, 300], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-10, 10]), { stiffness: 150, damping: 20 });
  const bgX = useSpring(useTransform(mouseX, [0, 1920], [-20, 20]), { stiffness: 30, damping: 10 });
  const bgY = useSpring(useTransform(mouseY, [0, 1080], [-20, 20]), { stiffness: 30, damping: 10 });

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      x.set(e.clientX - (rect.left + rect.width / 2));
      y.set(e.clientY - (rect.top + rect.height / 2));
    }
  };

  const from = location.state?.from?.pathname || '/customer/dashboard';

  const rules = [
    { label: "Lower & Upper", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { label: "Number (0–9)", test: (v) => /\d/.test(v) },
    { label: "Special char", test: (v) => /[@$!%*?&]/.test(v) },
    { label: "Min 6 chars", test: (v) => v.length >= 6 },
  ];

  const strength = rules.filter(r => r.test(formData.password)).length;
  const strengthConfig = {
    0: { label: "Weak", color: "bg-red-500", text: "text-red-500" },
    1: { label: "Weak", color: "bg-red-500", text: "text-red-500" },
    2: { label: "Medium", color: "bg-yellow-400", text: "text-yellow-500" },
    3: { label: "Good", color: "bg-blue-500", text: "text-blue-500" },
    4: { label: "Strong", color: "bg-green-500", text: "text-green-600" },
  };
  const currentStrength = strengthConfig[strength];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') { setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) }); return; }
    if (name === 'email') { setFormData({ ...formData, [name]: value.replace(/\s/g, '') }); return; }
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) =>
    String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) { alert('Please enter a valid email address'); return; }

    if (isRegister && adminExists === false) {
      if (formData.password !== formData.confirmPassword) { alert('Passwords do not match!'); return; }
      if (strength < 3) { alert('Admin password must be Strong'); return; }
      try {
        await registerAdmin({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, phone: formData.phone });
        alert('✅ System Administrator created! Please log in.');
        setAdminExists(true);
        setMode('login');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
      } catch (err) { alert(err.message || 'Admin registration failed'); }
      return;
    }

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (checkIsAdmin(result.user?.role)) navigate('/admin', { replace: true });
        else {
          const dest = from === '/customer/login' || from === '/login' ? '/customer/dashboard' : from;
          navigate(dest, { replace: true });
        }
      } else { alert(result.message || 'Login failed'); }
    } else {
      if (formData.password !== formData.confirmPassword) { alert('Passwords do not match!'); return; }
      if (strength < 2) { alert('Please use a stronger password'); return; }
      const result = await register(formData.firstName, formData.lastName, formData.email, formData.password, formData.phone);
      if (result.success) { alert('Registration successful! Please login.'); setMode('login'); }
      else { alert(result.message || 'Registration failed'); }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-[#0a0f16] font-sans selection:bg-teal-500/30"
    >
      {/* ── Parallax BG ── */}
      <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-[-40px] z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login-bg' : 'signup-bg'}
            initial={{ opacity: 0, filter: 'blur(10px) brightness(0.5)' }}
            animate={{ opacity: 1, filter: 'blur(0px) brightness(1)' }}
            exit={{ opacity: 0, filter: 'blur(10px) brightness(0.5)' }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: isLogin ? `url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80')` : `url('https://images.unsplash.com/photo-1620626011761-9963d7b59675?w=1920&q=80')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#0a0f16]/70 to-teal-900/40" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Glow orbs ── */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -top-40 -left-40 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-[120px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-40 -right-40 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex justify-between items-center">
        <Link to="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:rotate-[-8deg]">
            <MdArrowBack className="text-white text-sm sm:text-base md:text-xl lg:text-2xl group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-white/60 font-medium tracking-wide text-[9px] sm:text-[10px] md:text-xs hidden sm:block">EXIT PORTAL</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-col items-end">
            <span className="text-white font-black tracking-tighter text-sm sm:text-base md:text-lg lg:text-2xl italic leading-none">SINGHAI Traders</span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] text-teal-400 font-bold tracking-[0.3em] uppercase">Est. 2019</span>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-slate-950 rounded-lg p-1 flex-shrink-0">
            <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-20 sm:py-24 gap-3 sm:gap-4">

        {/* ── Main Card ── */}
        <motion.div
          ref={cardRef}
          onMouseLeave={() => { x.set(0); y.set(0); }}
          style={{
            rotateX: typeof window !== 'undefined' && window.innerWidth > 768 ? rotateX : 0,
            rotateY: typeof window !== 'undefined' && window.innerWidth > 768 ? rotateY : 0,
            perspective: 1000
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-5xl bg-[#111827]/30 backdrop-blur-[40px] rounded-3xl md:rounded-[40px] lg:rounded-[48px] shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden relative"
        >
          {/* Flare lines */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent z-30" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent z-30" />
          {isRegister && adminExists === false && <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent z-30" />}

          {/* ── Mobile: Single pane, tabs at top ── */}
          <div className="md:hidden flex flex-col min-h-[500px]">
            {/* Tab switcher */}
            <div className="flex border-b border-white/5 bg-white/5">
              <button
                onClick={() => { setMode('login'); setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' }); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' }); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${isRegister ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500'}`}
              >
                {adminExists === false ? 'System Setup' : 'Register'}
              </button>
            </div>

            {/* Form area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <header className="mb-4">
                    {isLogin ? (
                      <>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight leading-tight">
                          Log <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">In.</span>
                        </h2>
                        <p className="text-[9px] text-gray-400 font-medium tracking-wide border-l-2 border-teal-500/50 pl-3">Digital Concierge Access</p>
                      </>
                    ) : (
                      adminExists === false ? (
                        <div className="flex items-center gap-2 mb-1">
                          <MdAdminPanelSettings className="text-amber-400 text-2xl" />
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Setup.</span>
                          </h2>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight leading-tight">
                            Register <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">New.</span>
                          </h2>
                          <p className="text-[9px] text-gray-400 font-medium tracking-wide border-l-2 border-teal-500/50 pl-3">Create Luxury Identity</p>
                        </>
                      )
                    )}
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    {isRegister && (
                      <div className="grid grid-cols-2 gap-2">
                        <InputField icon={MdPerson} type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                        <InputField icon={MdPerson} type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                      </div>
                    )}
                    <InputField icon={MdEmail} type="email" name="email" placeholder={isRegister && adminExists === false ? 'Admin Email' : 'Email Address'} value={formData.email} onChange={handleChange} accent={isRegister && adminExists === false ? 'amber' : undefined} />
                    {isRegister && (
                      <InputField icon={MdPhone} type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                    )}
                    <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder={isRegister && adminExists === false ? 'Admin Passphrase' : 'Password'} value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} accent={isRegister && adminExists === false ? 'amber' : undefined} />
                    {formData.password && <PasswordStrength strength={strength} rules={rules} currentStrength={currentStrength} password={formData.password} />}
                    {isRegister && (
                      <InputField icon={MdLock} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} accent={adminExists === false ? 'amber' : undefined} />
                    )}
                    {isLogin && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => alert('Password reset link sent!')} className="text-[9px] font-bold text-gray-500 hover:text-teal-400 transition-all uppercase tracking-widest">FORGOT?</button>
                      </div>
                    )}
                    <div className="pt-1">
                      <button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl ${isRegister && adminExists === false
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0a0f16] shadow-amber-500/20'
                          : isLogin
                            ? 'bg-white text-[#0a0f16]'
                            : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-teal-500/20'
                          }`}
                      >
                        {isRegister && adminExists === false ? 'Create Admin' : isLogin ? 'Authorize' : 'Initialize'}
                      </button>
                    </div>
                  </form>
                  {adminExists !== false && <SocialLogins />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Desktop: Side-by-side panels ── */}
          <div className="hidden md:flex w-full h-[660px] lg:h-[700px] relative z-10">

            {/* Login Section */}
            <div className={`w-1/2 h-full flex items-center justify-center p-8 lg:p-10 transition-all duration-1000 ease-in-out ${!isLogin ? 'opacity-0 pointer-events-none translate-x-20 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="w-full max-w-sm">
                <header className="mb-5 lg:mb-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 lg:mb-3 tracking-tight leading-tight">
                      Log <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">In.</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide border-l-2 border-teal-500/50 pl-4">Digital Concierge Access</p>
                  </motion.div>
                </header>
                <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                  <InputField icon={MdEmail} type="email" name="email" placeholder="Identifier (Email)" value={formData.email} onChange={handleChange} />
                  <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Access Key" value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                  {formData.password && <PasswordStrength strength={strength} rules={rules} currentStrength={currentStrength} password={formData.password} />}
                  <div className="flex justify-end">
                    <button type="button" onClick={() => alert('Password reset link sent!')} className="text-[9px] lg:text-[10px] font-bold text-gray-500 hover:text-teal-400 transition-all uppercase tracking-widest">FORGOT?</button>
                  </div>
                  <MagneticButton>
                    <button type="submit" className="w-full relative overflow-hidden bg-white text-[#0a0f16] py-3 lg:py-3.5 rounded-xl font-black text-xs group active:scale-95 transition-all shadow-xl">
                      <span className="relative z-10 uppercase tracking-widest">Authorize</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </MagneticButton>
                </form>
                <SocialLogins />
              </div>
            </div>

            {/* Register Section */}
            <div className={`w-1/2 h-full flex items-center justify-center p-8 lg:p-10 transition-all duration-1000 ease-in-out absolute right-0 top-0 ${!isRegister ? 'opacity-0 pointer-events-none -translate-x-20 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="w-full max-w-sm">
                <header className="mb-4">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    {adminExists === false ? (
                      <div className="flex items-center gap-2 mb-2 justify-start">
                        <MdAdminPanelSettings className="text-amber-400 text-2xl lg:text-3xl" />
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Setup.</span>
                        </h2>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight leading-tight">
                          Register <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">New.</span>
                        </h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide border-l-2 border-cyan-500/50 pl-4">Create Luxury Identity</p>
                      </>
                    )}
                  </motion.div>
                </header>
                <form onSubmit={handleSubmit} className="space-y-2.5 lg:space-y-3">
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    <InputField icon={MdPerson} type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                    <InputField icon={MdPerson} type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                  </div>
                  <InputField icon={MdEmail} type="email" name="email" placeholder={adminExists === false ? 'Admin Email' : 'Email Address'} value={formData.email} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                  <InputField icon={MdPhone} type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} accent={adminExists === false ? 'amber' : undefined} />
                  <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder={adminExists === false ? 'Admin passphrase' : 'Password'} value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} accent={adminExists === false ? 'amber' : undefined} />
                  {formData.password && <PasswordStrength strength={strength} rules={rules} currentStrength={currentStrength} password={formData.password} />}
                  <InputField icon={MdLock} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} accent={adminExists === false ? 'amber' : undefined} />
                  <MagneticButton>
                    <button type="submit" className={`w-full relative overflow-hidden py-3 lg:py-3.5 rounded-xl font-black text-xs group active:scale-95 transition-all shadow-xl ${adminExists === false ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0a0f16]' : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'}`}>
                      <span className="relative z-10 uppercase tracking-widest">{adminExists === false ? 'Create Admin' : 'Confirm'}</span>
                      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="absolute inset-0 flex items-center justify-center text-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black uppercase tracking-widest">START</span>
                    </button>
                  </MagneticButton>
                </form>
                {adminExists !== false && <SocialLogins />}
              </div>
            </div>

            {/* Sliding Overlay */}
            <motion.div
              animate={{
                x: isLogin ? '100.5%' : '0%',
                borderRadius: isLogin ? '100px 24px 24px 100px' : '24px 100px 100px 24px'
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-teal-600/60 to-cyan-800/60 backdrop-blur-3xl z-20 flex items-center justify-center p-8 lg:p-12 text-white border-x border-white/10 group"
            >
              <div className="text-center relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'info-login' : 'info-signup'}
                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ rotate: isLogin ? 3 : -3, y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white/10 backdrop-blur-2xl rounded-[2rem] lg:rounded-[40px] flex items-center justify-center mx-auto mb-6 lg:mb-12 shadow-2xl p-4 lg:p-6 border border-white/20"
                    >
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-950 rounded-lg p-1 flex-shrink-0">
                        <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
                      </div>
                    </motion.div>
                    {isLogin ? (
                      <>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 lg:mb-6 leading-tight tracking-tighter">NEW <br />DISCOVERY.</h3>
                        <p className="text-teal-50/70 mb-6 lg:mb-12 text-sm lg:text-lg font-medium tracking-wide max-w-xs mx-auto italic">Crafting luxury environments.</p>
                        <button onClick={toggleMode} className="group relative px-8 lg:px-12 py-3 lg:py-5 rounded-full font-black text-xs lg:text-sm uppercase tracking-[0.2em] border-2 border-white/20 overflow-hidden transition-all hover:border-white">
                          <span className="relative z-10">Sign Up</span>
                          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                          <span className="absolute inset-0 flex items-center justify-center text-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">START</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 lg:mb-6 leading-tight tracking-tighter">RETURN <br />CUSTOMER.</h3>
                        <p className="text-teal-50/70 mb-6 lg:mb-12 text-sm lg:text-lg font-medium tracking-wide max-w-xs mx-auto italic">Resume premium management.</p>
                        <button onClick={toggleMode} className="group relative px-8 lg:px-12 py-3 lg:py-5 rounded-full font-black text-xs lg:text-sm uppercase tracking-[0.2em] border-2 border-white/20 overflow-hidden transition-all hover:border-white">
                          <span className="relative z-10">Sign In</span>
                          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                          <span className="absolute inset-0 flex items-center justify-center text-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">WELCOME</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20,184,166,0.3); border-radius: 20px; }
      `}} />
    </div>
  );
};

// ─── Wrapper ─────────────────────────────────────────────────────────────────
const WrappedCustomerLogin = (props) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return <CustomerLogin {...props} />;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CustomerLogin {...props} />
    </GoogleOAuthProvider>
  );
};

export default WrappedCustomerLogin;