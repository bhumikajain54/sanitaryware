import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { checkAdminExists, registerAdmin } from '../services/authService';
import {
  MdEmail,
  MdLock,
  MdPerson,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdPhone,
  MdAdminPanelSettings,
  MdShield
} from 'react-icons/md';

// --- Sub-Components ---

const MagneticButton = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x: springX, y: springY }}>
      {children}
    </motion.div>
  );
};

const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, showPasswordToggle, showPassword, onTogglePassword, accent }) => {
  const isAmber = accent === 'amber';

  return (
    <div className="relative group perspective">
      <div className={`absolute left-2 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-500 z-10 ${isAmber ? 'group-focus-within:text-amber-400' : 'group-focus-within:text-teal-400'
        } group-focus-within:scale-110`}>
        <Icon className="text-[12px] md:text-[22px]" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`w-full pl-6 md:pl-14 pr-6 md:pr-12 py-1.5 md:py-4 bg-white/5 border border-white/5 rounded-lg md:rounded-2xl outline-none transition-all text-white font-bold tracking-wide placeholder:text-gray-700 placeholder:font-medium text-[8px] md:text-sm ${isAmber ? 'focus:border-amber-500/30 focus:bg-amber-500/5' : 'focus:border-teal-500/30 focus:bg-white/10'
          }`}
      />
      {showPasswordToggle && (
        <button type="button" onClick={onTogglePassword} className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all p-0.5 md:p-1 z-10">
          {showPassword ? <MdVisibilityOff className="text-[10px] md:text-[20px]" /> : <MdVisibility className="text-[10px] md:text-[20px]" />}
        </button>
      )}
    </div>
  );
};

const PasswordStrength = ({ strength, rules, currentStrength, password }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="px-2 md:px-4 py-2 md:py-4 bg-white/5 rounded-xl md:rounded-3xl space-y-2 md:space-y-4 border border-white/5 backdrop-blur-md"
  >
    <div className="flex justify-between items-center text-[5px] md:text-[10px] font-black uppercase tracking-[0.2em]">
      <span className="text-gray-500">Security Index</span>
      <span className={`${currentStrength.text} transition-colors duration-500`}>{currentStrength.label}</span>
    </div>
    <div className="h-0.5 md:h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: (strength + 1) * 20 + '%' }} className={`h-full ${currentStrength.color} transition-all duration-700`} />
    </div>
    <div className="grid grid-cols-2 gap-x-2 md:gap-x-4 gap-y-1 md:gap-y-2">
      {rules.map((rule, i) => {
        const passed = rule.test(password);
        return (
          <div key={i} className="flex items-center gap-1 md:gap-3">
            <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full transition-all duration-500 ${passed ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" : "bg-white/10"}`} />
            <span className={`text-[5px] md:text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${passed ? "text-teal-300" : "text-gray-600"}`}>{rule.label}</span>
          </div>
        );
      })}
    </div>
  </motion.div>
);

const SocialLogins = () => {
  const { loginWithGoogle, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/customer/dashboard';

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google login success, token received:', tokenResponse.access_token ? 'Extracted' : 'Missing');

      console.log('Navigate From:', from);

      if (!tokenResponse?.access_token) {
        toast.error('Google failed to provide an access token');
        console.error('Missing access token in tokenResponse:', tokenResponse);
        return;
      }

      const toastId = toast.loading('Authenticating with Google...');
      try {
        const result = await loginWithGoogle(tokenResponse.access_token);
        console.log('Backend Google Login Result:', result);

        if (result.success) {
          toast.success('Logged in with Google!', { id: toastId });

          // Determine destination using the same logic as standard login
          if (checkIsAdmin(result.user?.role)) {
            console.log('Social Admin detected, navigating to /admin');
            navigate('/admin', { replace: true });
          } else {
            // Ensure we don't redirect back to login page
            const destination = (from === '/customer/login' || from === '/login') 
              ? '/customer/dashboard' 
              : from;
            
            console.log('Social Customer detected, navigating to:', destination);
            navigate(destination, { replace: true });
          }
        } else {
          console.error('Backend Google auth failed:', result.message);
          toast.error(result.message || 'Google authentication failed', { id: toastId });
        }
      } catch (err) {
        console.error('Google login connection error:', err);
        toast.error('Connection failed', { id: toastId });
      }
    },
    onError: (error) => {
      console.error('Google Login Hook Error:', error);
      toast.error('Google Sign-In failed');
    },
    scope: 'email profile openid',
  });

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('123456789012');

  return (
    <div className="mt-2 md:mt-4 w-full">
      <div className="flex items-center gap-2 md:gap-6 mb-1 md:mb-2 group">
        <div className="flex-grow h-[1px] bg-white/5 group-hover:bg-teal-500/30 transition-colors duration-700"></div>
        <span className="text-[6px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Quick Auth</span>
        <div className="flex-grow h-[1px] bg-white/5 group-hover:bg-teal-500/30 transition-colors duration-700"></div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (!isGoogleConfigured) {
              toast.error('Google Client ID not configured');
              return;
            }
            loginGoogle();
          }}
          type="button"
          className={`w-full max-w-xs flex items-center justify-center gap-2 md:gap-3 py-2 md:py-3.5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[7px] md:text-[11px] font-black text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group overflow-hidden relative shadow-lg shadow-black/20 ${!isGoogleConfigured ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
          title={!isGoogleConfigured ? "Google ID not configured" : "Sign in with Google"}
        >
          <div className="w-3.5 h-3.5 md:w-5 md:h-5 z-10 bg-white rounded-full flex items-center justify-center p-0.5 md:p-1 flex-shrink-0">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-full h-full" alt="G" />
          </div>
          <span className="z-10 tracking-[0.2em] font-black uppercase">CONTINUE WITH GOOGLE</span>
          {!isGoogleConfigured && <span className="absolute top-0 right-0 bg-red-500 text-[5px] px-1 rounded-bl-lg z-20">PENDING</span>}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
        </button>
      </div>
      <p className="text-center mt-4 flex items-center justify-center gap-2">
        <Link
          to="/terms"
          className="text-[9px] font-bold text-gray-500 hover:text-white transition-all tracking-[0.2em] underline underline-offset-4 decoration-gray-800 hover:decoration-teal-500"
        >
          TERMS OF SERVICE
        </Link>
        <span className="text-[9px] font-bold text-gray-700">&</span>
        <Link
          to="/privacy"
          className="text-[9px] font-bold text-gray-500 hover:text-white transition-all tracking-[0.2em] underline underline-offset-4 decoration-gray-800 hover:decoration-teal-500"
        >
          PRIVACY POLICY
        </Link>
      </p>
    </div>
  );
};

// --- Main Page Component ---

const CustomerLogin = () => {

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'adminSetup'
  const [adminExists, setAdminExists] = useState(null); // null = checking, true/false
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef(null);

  // Check if admin already exists on mount
  useEffect(() => {
    checkAdminExists()
      .then((res) => {
        // Backend returns e.g. { exists: true } or just a boolean
        const exists = res?.exists ?? res?.adminExists ?? res === true;
        setAdminExists(exists);
      })
      .catch((err) => {
        console.error('Failed to check if admin exists:', err);
        // If the endpoint fails, don't assume admin exists. Let the user see the login page.
        setAdminExists(true);
      });
  }, []);

  // Keep backward-compat helpers
  const isLogin = mode === 'login';
  const isAdminSetup = mode === 'adminSetup';

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-10, 10]), { stiffness: 150, damping: 20 });

  // Parallax Background Logic
  const bgX = useSpring(useTransform(mouseX, [0, 1920], [-20, 20]), { stiffness: 30, damping: 10 });
  const bgY = useSpring(useTransform(mouseY, [0, 1080], [-20, 20]), { stiffness: 30, damping: 10 });

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const from = location.state?.from?.pathname || '/customer/dashboard';

  // Password Strength Logic
  const rules = [
    {
      label: "Lowercase & Uppercase",
      test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    },
    {
      label: "Number (0–9)",
      test: (v) => /\d/.test(v),
    },
    {
      label: "Special character",
      test: (v) => /[@$!%*?&]/.test(v),
    },
    {
      label: "Minimum 6 characters",
      test: (v) => v.length >= 6,
    },
  ];

  const strength = rules.filter((r) => r.test(formData.password)).length;

  const strengthConfig = {
    0: { label: "Weak", color: "bg-red-500", width: "w-[10%]", text: "text-red-500" },
    1: { label: "Weak", color: "bg-red-500", width: "w-[25%]", text: "text-red-500" },
    2: { label: "Medium", color: "bg-yellow-400", width: "w-[50%]", text: "text-yellow-500" },
    3: { label: "Good", color: "bg-blue-500", width: "w-[75%]", text: "text-blue-500" },
    4: { label: "Strong", color: "bg-green-500", width: "w-full", text: "text-green-600" },
  };

  const currentStrength = strengthConfig[strength];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    if (name === 'email') {
      const cleaned = value.replace(/\s/g, '');
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (mode === 'adminSetup') {
      if (formData.password !== formData.confirmPassword) { alert('Passwords do not match!'); return; }
      if (strength < 3) { alert('Admin password must be Strong (at least 3 criteria)'); return; }
      try {
        await registerAdmin({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
        alert('✅ Admin account created! Please log in.');
        setAdminExists(true);
        setMode('login');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
      } catch (err) {
        alert(err.message || 'Admin registration failed');
      }
      return;
    }

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on role
        if (checkIsAdmin(result.user?.role)) {
          console.log('Admin detected, navigating to /admin');
          navigate('/admin', { replace: true });
        } else {
          // If they were trying to reach a specific page, go there; otherwise go to customer dashboard
          const destination = from === '/customer/login' || from === '/login' ? '/customer/dashboard' : from;
          console.log('Customer detected, navigating to:', destination);
          navigate(destination, { replace: true });
        }
      } else {
        alert(result.message || 'Login failed');
      }
    } else {
      if (formData.password !== formData.confirmPassword) { alert('Passwords do not match!'); return; }
      if (strength < 2) { alert('Please use a stronger password'); return; }
      const result = await register(formData.firstName, formData.lastName, formData.email, formData.password, formData.phone);
      if (result.success) {
        alert('Registration successful! Please login.');
        setMode('login');
      } else {
        alert(result.message || 'Registration failed');
      }
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
      {/* Dynamic Parallax Background */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-[-40px] z-0 pointer-events-none"
      >
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
              style={{
                backgroundImage: isLogin
                  ? `url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80')`
                  : `url('https://images.unsplash.com/photo-1620626011761-9963d7b59675?w=1920&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#0a0f16]/70 to-teal-900/40" />
            <div className="absolute inset-0 backdrop-grayscale-[0.3]" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating Interactive Elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-[120px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-[120px]" />
      </div>

      <nav className="absolute top-0 left-0 right-0 z-50 p-6 md:p-8 flex justify-between items-center">
        <Link to="/" className="group flex items-center gap-1 md:gap-2">
          <div className="w-6 h-6 md:w-12 md:h-12 bg-white/5 backdrop-blur-xl rounded-lg md:rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:rotate-[-8deg]">
            <MdArrowBack className="text-white text-[12px] md:text-2xl group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-white/60 font-medium tracking-wide text-[5px] md:text-xs">EXIT PORTAL</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-white font-black tracking-tighter text-[12px] md:text-2xl italic leading-none">SINGHAI Traders</span>
            <span className="text-[5px] md:text-[10px] text-teal-400 font-bold tracking-[0.3em] uppercase">Est. 2019</span>
          </div>
          {/* <img src="/Logo2.png" alt="Logo" className="h-4 md:h-10 w-auto brightness-200 contrast-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" /> */}
          <div className="w-5 h-5 md:w-10 md:h-10 bg-slate-950 rounded md:rounded-lg p-0.5 md:p-1 flex-shrink-0">
            <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 gap-4">

        {/* One-Time Admin Setup Banner */}
        <AnimatePresence>
          {adminExists === false && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl"
            >
              <button
                onClick={() => {
                  setMode('adminSetup');
                  setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
                }}
                className={`w-full flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border ${isAdminSetup
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : 'bg-amber-900/20 border-amber-600/30 text-amber-400 hover:bg-amber-900/30 hover:border-amber-500/50'
                  } transition-all duration-300 group`}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                  <MdShield className="text-amber-400 text-sm md:text-base" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-[9px] md:text-xs uppercase tracking-widest">⚡ First-Time System Setup</p>
                  <p className="text-[7px] md:text-[10px] text-amber-500/70 font-medium">No admin account detected — click to create the System Administrator</p>
                </div>
                <div className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  {isAdminSetup ? '● ACTIVE' : 'SETUP →'}
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={cardRef}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, perspective: 1000 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl h-[400px] md:h-[700px] bg-[#111827]/30 backdrop-blur-[40px] rounded-3xl md:rounded-[48px] shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex relative"
        >
          {/* Visual Flare Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
          {isAdminSetup && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent z-30" />
          )}

          <div className="flex w-full h-full relative z-10">
            {/* LOGIN Form */}
            <div className={`w-1/2 h-full flex items-center justify-center p-3 md:p-10 transition-all duration-1000 ease-in-out ${mode !== 'login' ? 'opacity-0 pointer-events-none translate-x-20 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="w-full max-w-sm">
                <header className="mb-2 md:mb-6 text-center md:text-left">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-[16px] md:text-5xl font-extrabold text-white mb-1 md:mb-3 tracking-tight leading-tight">
                      Log <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">In.</span>
                    </h2>
                    <p className="text-[6px] md:text-xs text-gray-400 font-medium tracking-wide border-l-2 border-teal-500/50 pl-2 md:pl-4">Digital Concierge Access</p>
                  </motion.div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
                  <div className="space-y-1.5 md:space-y-3">
                    <InputField icon={MdEmail} type="email" name="email" placeholder="Identifier (Email)" value={formData.email} onChange={handleChange} />
                    <div className="space-y-1.5 md:space-y-3">
                      <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Access Key" value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />

                      {formData.password && (
                        <PasswordStrength
                          strength={strength}
                          rules={rules}
                          currentStrength={currentStrength}
                          password={formData.password}
                        />
                      )}

                      <div className="flex justify-end pt-0.5 md:pt-1">
                        <button
                          type="button"
                          onClick={() => alert('Password reset link sent to your email!')}
                          className="text-[6px] md:text-[10px] font-bold text-gray-500 hover:text-teal-400 transition-all uppercase tracking-widest flex items-center gap-1 md:gap-2 group"
                        >
                          FORGOT?
                          <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-teal-500 rounded-full group-hover:animate-ping" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <MagneticButton>
                    <button type="submit" className="w-full group relative flex items-center justify-center gap-1 md:gap-3 bg-white text-[#0a0f16] py-1.5 md:py-2 rounded-md md:rounded-lg font-black text-[8px] md:text-xs overflow-hidden transition-transform active:scale-95 shadow-xl">
                      <span className="relative z-10 uppercase">Authorize</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </MagneticButton>
                </form>
                <SocialLogins />
              </div>
            </div>

            {/* REGISTER Form */}
            <div className={`w-1/2 h-full flex items-center justify-center p-3 md:p-10 absolute right-0 transition-all duration-1000 ease-in-out ${mode !== 'register' ? 'opacity-0 pointer-events-none -translate-x-20 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="w-full max-w-sm">
                <header className="mb-2 md:mb-4 text-center md:text-left">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-[16px] md:text-5xl font-extrabold text-white mb-1 md:mb-2 tracking-tight leading-tight">
                      Register <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">New.</span>
                    </h2>
                    <p className="text-[6px] md:text-xs text-gray-400 font-medium tracking-wide border-l-2 border-cyan-500/50 pl-2 md:pl-4">Create Luxury Identity</p>
                  </motion.div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-3 overflow-y-auto max-h-[220px] md:max-h-[360px] pr-1 md:pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-2">
                    <InputField icon={MdPerson} type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                    <InputField icon={MdPerson} type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                  </div>
                  <InputField icon={MdEmail} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                  <InputField icon={MdPhone} type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} />

                  <div className="space-y-2 md:space-y-4">
                    <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Passphrase" value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                    {formData.password && <PasswordStrength strength={strength} rules={rules} currentStrength={currentStrength} password={formData.password} />}
                    <InputField icon={MdLock} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Validate Passphrase" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} />
                  </div>

                  <MagneticButton>
                    <button type="submit" className="w-full relative overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-1.5 md:py-2 rounded-md md:rounded-lg font-black text-[8px] md:text-xs group shadow-[0_20px_40px_rgba(20,184,166,0.3)] active:scale-95 transition-all">
                      <span className="relative z-10 capitalize">Initialize</span>
                      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="absolute inset-0 flex items-center justify-center text-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">CONFIRM</span>
                    </button>
                  </MagneticButton>
                </form>
                <SocialLogins />
              </div>
            </div>

            {/* ADMIN SETUP Form — only when no admin exists */}
            <div className={`w-1/2 h-full flex items-center justify-center p-3 md:p-10 absolute right-0 transition-all duration-1000 ease-in-out ${mode !== 'adminSetup' ? 'opacity-0 pointer-events-none -translate-x-20 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="w-full max-w-sm">
                <header className="mb-2 md:mb-4 text-center md:text-left">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-2 mb-1 md:mb-3">
                      <MdAdminPanelSettings className="text-amber-400 text-lg md:text-3xl" />
                      <h2 className="text-[14px] md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Setup.</span>
                      </h2>
                    </div>
                    <p className="text-[6px] md:text-xs text-amber-400/60 font-medium tracking-wide border-l-2 border-amber-500/50 pl-2 md:pl-4">One-time system initialization</p>
                  </motion.div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-3 overflow-y-auto max-h-[220px] md:max-h-[380px] pr-1 md:pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-2">
                    <InputField icon={MdPerson} type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} accent="amber" />
                    <InputField icon={MdPerson} type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} accent="amber" />
                  </div>
                  <InputField icon={MdEmail} type="email" name="email" placeholder="Admin Email" value={formData.email} onChange={handleChange} accent="amber" />
                  <InputField icon={MdPhone} type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} accent="amber" />

                  <div className="space-y-2 md:space-y-3">
                    <InputField icon={MdLock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Admin Passphrase" value={formData.password} onChange={handleChange} showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} accent="amber" />
                    {formData.password && <PasswordStrength strength={strength} rules={rules} currentStrength={currentStrength} password={formData.password} />}
                    <InputField icon={MdLock} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Passphrase" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} accent="amber" />
                  </div>

                  <MagneticButton>
                    <button type="submit" className="w-full relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0a0f16] py-1.5 md:py-2 rounded-md md:rounded-lg font-black text-[8px] md:text-xs group shadow-[0_20px_40px_rgba(245,158,11,0.3)] active:scale-95 transition-all">
                      <span className="relative z-10 uppercase flex items-center justify-center gap-1">
                        <MdShield className="text-[10px] md:text-sm" /> Create Admin
                      </span>
                      <div className="absolute inset-0 bg-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="absolute inset-0 flex items-center justify-center text-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black text-[8px] md:text-xs uppercase">INITIALIZE SYSTEM</span>
                    </button>
                  </MagneticButton>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-[7px] md:text-[10px] text-gray-600 hover:text-gray-400 transition-colors pt-1 uppercase tracking-widest"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sliding Decorative Overlay — hidden in adminSetup mode */}
          {mode !== 'adminSetup' && (
            <motion.div
              animate={{
                x: isLogin ? '100.5%' : '0%',
                borderRadius: isLogin ? '100px 24px 24px 100px' : '24px 100px 100px 24px'
              }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="flex absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-teal-600/60 to-cyan-800/60 backdrop-blur-3xl z-20 items-center justify-center p-4 md:p-12 text-white border-x border-white/10 group"
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
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-12 md:w-32 md:h-32 bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-[40px] flex items-center justify-center mx-auto mb-4 md:mb-12 shadow-2xl p-2 md:p-6 border border-white/20 transform-gpu"
                    >
                      <div className="w-5 h-5 md:w-10 md:h-10 bg-slate-950 rounded md:rounded-lg p-0.5 md:p-1 flex-shrink-0 ">
                        <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
                      </div>
                    </motion.div>

                    {isLogin ? (
                      <>
                        <h3 className="text-[18px] md:text-5xl font-black mb-2 md:mb-6 leading-tight tracking-tighter">NEW <br className="hidden md:block" />DISCOVERY.</h3>
                        <p className="text-teal-50/70 mb-4 md:mb-12 text-[8px] md:text-lg font-medium tracking-wide max-w-[80px] md:max-w-xs mx-auto italic">Crafting luxury environments.</p>
                        <button onClick={toggleMode} className="group relative px-4 md:px-12 py-2 md:py-5 rounded-full font-black text-[7px] md:text-sm uppercase tracking-[0.2em] border-2 border-white/20 overflow-hidden transition-all hover:border-white">
                          <span className="relative z-10">Sign Up</span>
                          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                          <span className="absolute inset-0 flex items-center justify-center text-[#0a0f16] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">START</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-[18px] md:text-5xl font-black mb-2 md:mb-6 leading-tight tracking-tighter">RETURN <br className="hidden md:block" />CUSTOMER.</h3>
                        <p className="text-teal-50/70 mb-4 md:mb-12 text-[8px] md:text-lg font-medium tracking-wide max-w-[80px] md:max-w-xs mx-auto italic">Resume premium management.</p>
                        <button onClick={toggleMode} className="group relative px-4 md:px-12 py-2 md:py-5 rounded-full font-black text-[7px] md:text-sm uppercase tracking-[0.2em] border-2 border-white/20 overflow-hidden transition-all hover:border-white">
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
          )}
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


// --- Wrap the main component with the Provider ---
const WrappedCustomerLogin = (props) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <CustomerLogin {...props} />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CustomerLogin {...props} />
    </GoogleOAuthProvider>
  );
};

export default WrappedCustomerLogin;


