import { Link } from 'react-router-dom';
import {
  MdLocationOn,
  MdPhone,
  MdEmail
} from 'react-icons/md';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="contact" className="bg-white border-t border-slate-200 pt-8 md:pt-24 pb-6 md:pb-12">
      <div className="max-w-7xl mx-auto px-1 md:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-1 md:gap-16 mb-8 md:mb-20">
          {/* Company Info */}
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="flex items-center justify-center gap-1 md:gap-3 mb-2 md:mb-8 w-full">
              <div className="w-5 h-5 md:w-10 md:h-10 bg-slate-950 rounded md:rounded-lg p-0.5 md:p-1 flex-shrink-0">
                <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
              </div>
              <h1 className="text-[9px] md:text-2xl font-black tracking-tighter uppercase leading-tight">Singhai Traders</h1>
            </Link>
            <p className="text-slate-500 leading-relaxed mb-3 md:mb-8 text-[8px] md:text-base">
              Leading provider of premium sanitary ware since 2019.
            </p>
            <div className="flex justify-center gap-1.5 md:gap-4">
              {[FaFacebookF, FaInstagram].map((Icon, idx) => (
                <a key={idx} href="#" className="w-6 h-6 md:w-10 md:h-10 bg-slate-100 rounded md:rounded-lg flex items-center justify-center text-slate-600 hover:bg-teal-600 hover:text-white transition-all">
                  <Icon className="text-[10px] md:text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="flex flex-col items-center">
            <div className="w-fit mx-auto">
              <h4 className="font-black uppercase tracking-widest text-[7px] md:text-xs mb-3 md:mb-8 text-slate-400 text-left">Support</h4>
              <ul className="space-y-1.5 md:space-y-4 font-bold text-slate-600 text-left text-[8px] md:text-base">
                <li><Link to="/help" className="hover:text-teal-600 transition-colors">Help & FAQ</Link></li>
                <li><Link to="/shipping-info" className="hover:text-teal-600 transition-colors">Shipping Info</Link></li>
                <li><Link to="/return-policy" className="hover:text-teal-600 transition-colors">Return Policy</Link></li>
                <li><Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy Shield</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col items-center">
            <div className="w-fit mx-auto">
              <h4 className="font-black uppercase tracking-widest text-[7px] md:text-xs mb-3 md:mb-8 text-slate-400 text-left">Contact</h4>
              <div className="space-y-3 md:space-y-6 flex flex-col items-start text-[8px] md:text-base">
                <a href="#" className="flex items-start gap-1 md:gap-4 group">
                  <MdLocationOn className="text-teal-600 mt-0.5 flex-shrink-0 w-3 h-3 md:w-6 md:h-6" />
                  <span className="text-slate-600 font-bold group-hover:text-teal-600 transition-all text-left">
                    Main Road, Balaghat
                  </span>
                </a>
                <a href="tel:+917974047116" className="flex items-center gap-1 md:gap-4 group">
                  <MdPhone className="text-teal-600 flex-shrink-0 w-3 h-3 md:w-6 md:h-6" />
                  <span className="text-slate-600 font-bold group-hover:text-teal-600 transition-all">+91 79740 47116</span>
                </a>
                <a href="mailto:sajaljn0@gmail.com" className="flex items-center gap-1 md:gap-4 group">
                  <MdEmail className="text-teal-600 flex-shrink-0 w-3 h-3 md:w-6 md:h-6" />
                  <span className="text-slate-600 font-bold group-hover:text-teal-600 transition-all truncate">sajaljn0@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-12 text-center text-slate-400 text-sm font-medium">
          <p>&copy; 2026 Singhai Traders. All rights reserved. | Architectural Solutions for Modern Living.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
