import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Camera, Leaf, Zap, Wifi, WifiOff, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get deep diagnosis in seconds using advanced AI',
      color: 'bg-yellow-500/10 text-yellow-500'
    },
    {
      icon: Leaf,
      title: 'Natural Remedies',
      description: 'Curated organic treatment options for better yield',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'Complete functionality even without internet',
      color: 'bg-blue-500/10 text-blue-500'
    },
  ];

  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl -z-10" />

        <div className="px-6 py-12">
          {/* Hero section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-10 relative"
          >
            <div className="w-28 h-28 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-background to-muted border border-border shadow-2xl flex items-center justify-center transform rotate-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Leaf className="w-14 h-14 text-primary drop-shadow-md" />
                </motion.div>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
              Heal Your <span className="text-primary bg-primary/10 px-2 rounded-lg">Crops</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
              Identify diseases instantly and get expert treatment advice.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Button
              size="lg"
              className="w-full h-16 text-lg font-bold touch-target rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-green-600 border-0"
              onClick={() => navigate('/scan')}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span>Scan Your Crop</span>
              </div>
            </Button>
          </motion.div>

          {/* Modern Bento Grid Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Power Features
              </h2>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Feature 1: AI Genius (Full Width) */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/scan')}
                className="col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/20 group cursor-pointer min-h-[180px] flex flex-col justify-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 group-hover:bg-white/30 transition-colors">
                    <Zap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">AI Genius</h3>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-[80%]">
                    Generates expert diagnosis & chemical-free remedies in seconds.
                  </p>
                </div>
              </motion.div>

              {/* Feature 2: Community (Now Full Width) */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate('/community')}
                className="col-span-2 rounded-[2rem] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/50 p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 text-foreground">Farmers Community</h3>
                  <p className="text-xs font-medium text-muted-foreground">Join 10,000+ experts helping each other.</p>
                </div>
                <div className="relative z-10 bg-background/50 backdrop-blur-sm p-2 rounded-full border border-border/50 group-hover:scale-110 transition-transform">
                  <span className="text-xl">👥</span>
                </div>
              </motion.div>
            </div>

            {/* Info Link */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 flex justify-center"
            >
              <button 
                onClick={() => navigate('/info')}
                className="group relative flex items-center justify-between w-full max-w-sm mx-auto p-1.5 pr-5 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm">For more guidance, prefer this</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </motion.div>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
              How It Works
            </h2>

            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />

              <div className="space-y-8">
                {[
                  { icon: Camera, title: "Snap a Photo", desc: "Take a clear picture of the affected crop leaf." },
                  { icon: Zap, title: "AI Analysis", desc: "Our Gemini AI scans for 50+ diseases instantly." },
                  { icon: Leaf, title: "Get Cured", desc: "Receive organic & chemical remedies immediately." }
                ].map((step, i) => (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    key={step.title}
                    className="flex items-start gap-6 relative z-10"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center flex-shrink-0 z-20">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="pt-2">
                      <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
