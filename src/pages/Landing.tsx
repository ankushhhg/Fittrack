/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dumbbell, Sparkles, LineChart, Shield, ArrowRight, CheckCircle } from "lucide-react";

interface LandingProps {
  onJoin: () => void;
}

export default function Landing({ onJoin }: LandingProps) {
  return (
    <div className="min-h-screen text-[var(--text-primary)] relative overflow-hidden bg-[#050505] page-enter">
      {/* Aesthetic geometric ambient bubbles */}
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-[#CBFF2E]/8 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-50px] w-96 h-96 bg-[#CBFF2E]/4 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#CBFF2E] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(203,255,46,0.3)]">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center font-black text-[9px] text-[#CBFF2E]">FT</div>
            </div>
            <span className="text-xl font-light italic font-serif leading-none tracking-tight text-[#F5F5F5]">
              FitTrack <span className="text-[#CBFF2E] not-italic font-bold tracking-tighter">PRO</span>
            </span>
          </div>
          <button
            onClick={onJoin}
            className="text-xs font-bold px-4 py-2 border border-white/10 rounded-full bg-white/5 hover:bg-[#CBFF2E] hover:text-black hover:border-[#CBFF2E] cursor-pointer transition-all duration-200"
          >
            Sign In
          </button>
        </div>

        {/* Hero Segment */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#CBFF2E]/10 border border-[#CBFF2E]/20 text-[#CBFF2E] font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            <span>Introducing Gemini 3.5 AI Fitness Generation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light italic font-serif tracking-tight leading-[1.08] text-[#F5F5F5] text-pretty">
            Track Your Fitness.<br />
            <span className="not-italic font-sans font-black text-[#CBFF2E] tracking-tight">
              Transform Your Body.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto text-white/50 leading-relaxed font-medium">
            AI-powered workout plans and precision nutrition guidance — completely customized to your equipment, physical markers, and personal targets.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onJoin}
              className="w-full sm:w-auto px-8 py-4 bg-[#CBFF2E] hover:bg-[#bce628] text-black font-extrabold text-sm rounded-2xl shadow-[0_4px_20px_rgba(203,255,46,0.25)] hover:shadow-[0_4px_30px_rgba(203,255,46,0.4)] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <a
              href="#how-it-works"
              className="text-xs font-extrabold text-white/40 hover:text-[#CBFF2E] flex items-center space-x-1 py-3 transition-colors"
            >
              <span>Explore Custom Features</span>
            </a>
          </div>
        </div>

        {/* Features Block */}
        <div className="mt-24 lg:mt-32">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Engineered for Complete Transformation
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              No generic templates. Built around your variables to secure sustainable outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-[#CBFF2E]/10 text-[#CBFF2E] inline-block">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                AI Coach Workouts
              </h3>
              <p className="mt-2.5 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Deep target training sequences tailored precisely to your weights, pull-up rods, or home floor configurations. Dynamically adjusts structure via on-demand AI coaches.
              </p>
            </div>

            {/* Box 2 */}
            <div className="card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-[#CBFF2E]/10 text-[#CBFF2E] inline-block">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                Smart Meal Journal
              </h3>
              <p className="mt-2.5 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Five simple, high-protein daily meals created from affordable kitchen staples. Calorie models balance carbs, proteins, and healthy fats instantly.
              </p>
            </div>

            {/* Box 3 */}
            <div className="card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-[#CBFF2E]/10 text-[#CBFF2E] inline-block">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                Real-time Progress Matrix
              </h3>
              <p className="mt-2.5 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Dynamic tracking records, weight timelines, personal peaks, water cups, and streak multipliers to keep you motivated and accountable.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Segment */}
        <div id="how-it-works" className="mt-24 lg:mt-32 border-t border-white/10 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-light italic font-serif tracking-tight text-white/90">
              Three Simple Steps to <span className="text-[#CBFF2E] not-italic font-sans font-extrabold">Begin</span>
            </h2>
            <p className="mt-3 text-sm text-white/40">We optimize the hard part, you supply the physical effort</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center px-4">
              <div className="w-10 h-10 rounded-full bg-[#CBFF2E] text-black font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(203,255,46,0.3)]">1</div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Tell Us Your Equipment</h3>
              <p className="mt-2 text-xs text-white/45 leading-relaxed">
                Log what dumbbells, barbell plates, or bands you own. We adjust prompts to only use existing weights.
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-10 h-10 rounded-full bg-[#CBFF2E] text-black font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(203,255,46,0.3)]">2</div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Review Your Generated Blueprint</h3>
              <p className="mt-2 text-xs text-white/45 leading-relaxed">
                Gemini constructs robust daily routines (50-min target) and customized macros based on your BMI and goal dates.
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-10 h-10 rounded-full bg-[#CBFF2E] text-black font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(203,255,46,0.3)]">3</div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Log Sessions & Evolve</h3>
              <p className="mt-2 text-xs text-white/45 leading-relaxed">
                Track exact training metrics, complete sets countdowns, evaluate macronutrient bars, and adapt individual exercises if you need to.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="card mt-24 bg-gradient-to-r from-white/5 to-[#CBFF2E]/5 text-white text-center p-8 sm:p-12 relative overflow-hidden flex flex-col items-center justify-center shadow-xl border border-[#CBFF2E]/10">
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#CBFF2E]/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative max-w-xl">
            <h3 className="text-2xl font-light italic font-serif mb-3 text-white/90">Begin Your Transformation <span className="text-[#CBFF2E] not-italic font-sans font-bold">Journey Today</span></h3>
            <p className="text-xs text-white/50 leading-relaxed mb-8">
              Generate fully personalized training plans utilizing high-performance Gemini 3.5 instructions in seconds.
            </p>
            <button
              onClick={onJoin}
              className="px-8 py-3.5 bg-[#CBFF2E] hover:bg-[#bce628] text-black rounded-xl shadow-[0_4px_20px_rgba(203,255,46,0.25)] font-black text-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <span>Build My AI Plan Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
