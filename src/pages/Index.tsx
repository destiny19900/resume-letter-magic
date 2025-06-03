import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Zap, Download, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from 'framer-motion';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Generation",
      description: "Generate professional cover letters in seconds using advanced AI technology"
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Smart Templates",
      description: "Your experience and skills are automatically formatted into compelling narratives"
    },
    {
      icon: <Download className="w-8 h-8 text-blue-600" />,
      title: "Instant Download",
      description: "Export your cover letters as PDF with one click, ready to send"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure & Private",
      description: "Your personal information and documents are encrypted and protected"
    }
  ];

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-3xl text-center mb-12">
        <div className="mx-auto w-64 h-64 mb-6 flex items-center justify-center bg-blue-100 rounded-full overflow-hidden">
          <img src="https://www.svgrepo.com/show/528343/letter-unread.svg" alt="Cover Letter Hero" className="w-64 h-64 object-cover" onError={e => e.currentTarget.style.display='none'} />
        </div>
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">Craft the Perfect Cover Letter</h1>
        <p className="text-xl text-gray-700 mb-6">AI-powered, beautiful, and tailored for your dream job. Make your application stand out with CoverCraft!</p>
        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-all duration-200 flex items-center gap-2 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Get Started
        </motion.button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="w-full max-w-4xl">
        {/* How It Works Section with icons and animation */}
        <section className="bg-white rounded-xl shadow-lg p-8 grid md:grid-cols-3 gap-8">
          <div className="text-center flex flex-col items-center">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=128&q=80" alt="Upload Resume" className="w-20 h-20 mb-4 rounded-lg object-cover" onError={e => e.currentTarget.style.display='none'} />
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Upload Your Resume</h3>
            <p className="text-gray-600">Upload your CV or enter your experience. We'll extract your skills and achievements.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=128&q=80" alt="Paste Job Description" className="w-20 h-20 mb-4 rounded-lg object-cover" onError={e => e.currentTarget.style.display='none'} />
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Paste Job Description</h3>
            <p className="text-gray-600">Paste the job description. Our AI will analyze and match your profile to the role.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=128&q=80" alt="Download PDF" className="w-20 h-20 mb-4 rounded-lg object-cover" onError={e => e.currentTarget.style.display='none'} />
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Download & Apply</h3>
            <p className="text-gray-600">Get a beautiful, ready-to-send PDF cover letter. Download and apply with confidence!</p>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Index;
