import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import { MdErrorOutline } from 'react-icons/md';

const TermsConditions = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await customerService.getPageBySlug('terms');
        setPage(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" /></div>;

  if (!page || page.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <MdErrorOutline className="text-6xl text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 uppercase">Terms & Conditions</h2>
        <p className="text-slate-500 mt-2">Content is currently being updated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 lg:p-16 shadow-xl rounded-3xl border border-slate-100">
        {page.imageUrl && (
          <img src={page.imageUrl} alt={page.title} className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-2xl mb-8 shadow-sm" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-8 uppercase tracking-tighter border-b border-slate-100 pb-6">
          {page.title}
        </h1>
        <div 
          className="prose prose-sm sm:prose-base lg:prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-teal-600 hover:prose-a:text-teal-500"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </div>
  );
};

export default TermsConditions;
