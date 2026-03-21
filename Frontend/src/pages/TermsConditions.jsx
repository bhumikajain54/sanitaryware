import { motion } from 'framer-motion';
import { MdGavel, MdUpdate, MdCheckCircle, MdInfo } from 'react-icons/md';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600/10 rounded-3xl text-teal-600 mb-4">
            <MdGavel size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Agreement between User and Singhai Traders</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MdInfo className="text-teal-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MdCheckCircle className="text-teal-600" />
              2. Privacy Policy
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Your use of the site is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MdInfo className="text-teal-600" />
              3. Electronic Communications
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Visiting this site or sending emails to Singhai Traders constitutes electronic communications. You consent to receive electronic communications and you agree that all agreements, notices, disclosures and other communications that we provide to you electronically, via email and on the Site, satisfy any legal requirement that such communications be in writing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MdInfo className="text-teal-600" />
              4. Your Account
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              If you use this site, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
              <MdUpdate />
              Last Updated: March 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
