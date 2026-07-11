import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, ShieldCheck, Zap, Server, Code, Users, Search, Lightbulb, Image as ImageIcon, ClipboardList } from 'lucide-react';

const InfoPage = () => {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 overflow-x-hidden relative">
        {/* Subtle Liquid Background */}
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["30% 70% 70% 30%", "70% 30% 30% 70%", "30% 70% 70% 30%"]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full z-0 pointer-events-none"
        />

        {/* Navigation Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">About Crop Doc</h1>
        </div>

        <motion.div 
          className="p-6 max-w-5xl mx-auto space-y-12 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section / Aim */}
          <motion.section variants={itemVariants} className="relative text-center space-y-6 pt-10 pb-8">
            {/* Glowing background orb */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-primary/20 blur-[80px] md:blur-[100px] rounded-full" />
            </div>
            
            <div className="relative z-10">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="inline-flex p-5 rounded-3xl bg-primary/10 mb-6 border border-primary/30 shadow-[0_0_40px_rgba(34,197,94,0.3)] backdrop-blur-sm"
              >
                <Target className="w-12 h-12 text-primary" />
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-sm">
                Our <span className="text-primary">Aim</span> & Vision
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium px-4">
                Empowering farmers with AI for instant crop health diagnostics and community support.
              </p>
            </div>
          </motion.section>

          {/* Benefits Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Key Benefits
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Early Disease Detection', desc: 'Catch crop diseases before they spread and destroy your yield.', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
                { title: 'Instant AI Diagnosis', desc: 'Get immediate feedback on crop health just by snapping a photo.', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                { title: 'Task & Note Space', desc: 'Space to take notes like "I am seeding this plant today" and track daily tasks.', icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { title: 'Community Support', desc: 'Connect with thousands of farmers and agricultural experts worldwide.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { title: 'Localized Guidance', desc: 'Receive tailored treatment recommendations based on your specific region.', icon: Search, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-2xl bg-card border border-border shadow-sm flex gap-4"
                >
                  <div className={`p-3 rounded-xl h-fit flex-shrink-0 ${benefit.bg}`}>
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Challenges Addressed */}
          <motion.section variants={itemVariants} className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-destructive">
              <ShieldCheck className="w-5 h-5" />
              Challenges We Address
            </h3>
            <ul className="space-y-3">
              {[
                'Lack of immediate access to agricultural experts in rural areas.',
                'Misdiagnosis of plant diseases leading to incorrect pesticide usage.',
                'Language barriers in accessing high-quality agricultural information.',
                'Delayed treatment resulting in massive crop and financial losses.',
              ].map((challenge, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                  <div className="mt-1 w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                  <span className="leading-relaxed">{challenge}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* How to Use */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
              <Lightbulb className="w-6 h-6 text-orange-500" />
              How to Use Crop Doc
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { step: '1', title: 'Capture or Upload', desc: 'Click the camera button on the home screen to snap a clear photo of your affected crop leaf.' },
                { step: '2', title: 'AI Analysis', desc: 'Our advanced AI instantly analyzes the image to identify any diseases or nutrient deficiencies.' },
                { step: '3', title: 'Get Remedies', desc: 'Receive a detailed diagnosis along with organic and chemical treatment recommendations.' },
                { step: '4', title: 'Track & Share', desc: 'Take task notes on your field and share results with the community forum.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-md mb-1">{step.title}</h4>
                    <p className="text-muted-foreground text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section variants={itemVariants} className="space-y-6 pt-4 border-t border-border">
            <h3 className="text-2xl font-bold flex items-center gap-2 pb-2">
              <Code className="w-6 h-6 text-indigo-500" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'React & Vite', icon: Code, role: 'Frontend UI' },
                { name: 'Node & Express', icon: Server, role: 'Backend API' },
                { name: 'MongoDB', icon: Server, role: 'Database' },
                { name: 'TensorFlow', icon: Lightbulb, role: 'Machine Learning' },
                { name: 'Framer Motion', icon: ImageIcon, role: 'Animations' },
                { name: 'Tailwind CSS', icon: ImageIcon, role: 'Styling' },
                { name: 'AWS S3', icon: Server, role: 'Cloud Storage' },
                { name: 'Google Auth', icon: ShieldCheck, role: 'Authentication' },
                { name: 'Gemini AI', icon: Lightbulb, role: 'Intelligence' },
              ].map((tech, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border text-center space-y-2 hover:border-primary/50 transition-colors shadow-sm">
                  <tech.icon className="w-5 h-5 mx-auto text-primary" />
                  <div className="font-semibold text-sm">{tech.name}</div>
                  <div className="text-xs text-muted-foreground">{tech.role}</div>
                </div>
              ))}
            </div>
          </motion.section>

        </motion.div>
      </div>
    </AppLayout>
  );
};

export default InfoPage;
