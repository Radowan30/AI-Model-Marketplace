import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Box, Cpu, ShieldCheck, Users } from "lucide-react";
import generatedImage from '@assets/generated_images/mimos_ai_marketplace_hero_background.png';

export default function Landing() {
  return (
    <Layout type="public">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={generatedImage}
            alt="MIMOS AI Marketplace" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Malaysia's National AI Hub
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold leading-tight mb-6 text-foreground">
              Accelerate Innovation with <span className="text-primary">MIMOS AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Discover, access, and integrate sovereign AI models tailored for Malaysia's unique ecosystem. Powered by MIMOS, the national applied R&D centre.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Get Started
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                  Browse Models
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block relative"
          >
            {/* Visual Abstract Elements */}
            <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-xl border border-border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">MySejahtera Analytics</h4>
                      <p className="text-xs text-muted-foreground">Version 2.1.0 • Healthcare</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-green-600 font-bold">98.5% Acc</p>
                    <p className="text-[10px] text-muted-foreground">Updated 2h ago</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/80 rounded-xl border border-border shadow-sm opacity-80 scale-95 origin-top">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Box className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Bahasa Sentiment v1</h4>
                      <p className="text-xs text-muted-foreground">NLP • Social Media</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-green-600 font-bold">94.2% Acc</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl z-0" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl z-0" />
          </motion.div>
        </div>
      </section>

      {/* Powered by MIMOS */}
      <section className="py-12 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            Powered by
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-primary-foreground font-bold text-2xl tracking-tighter">M</span>
                </div>
                <span className="font-heading font-bold text-3xl text-foreground">MIMOS</span>
             </div>
             <p className="max-w-2xl text-muted-foreground text-sm mt-2">
               MIMOS is Malaysia's national Applied Research and Development Centre that contributes to socio-economic growth through innovative technology platforms.
             </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-4xl font-bold font-heading mb-2">50+</h3>
              <p className="text-muted-foreground">Sovereign Models</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-4xl font-bold font-heading mb-2">2.5k</h3>
              <p className="text-muted-foreground">Active Researchers</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-4xl font-bold font-heading mb-2">99.9%</h3>
              <p className="text-muted-foreground">Platform Uptime</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 MIMOS Berhad. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
