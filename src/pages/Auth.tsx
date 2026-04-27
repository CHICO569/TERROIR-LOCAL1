import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, ArrowRight, Loader2, CheckCircle2, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import emailjs from '@emailjs/browser';
import { useAuth } from '../context/AuthContext';

const EMAILJS_CONFIG = {
  serviceId: 'service_z8okin2',
  templateId: 'template_8xpkxwo',
  publicKey: 'mNqgrWOCI2ShdsB7e',
};

export function AuthPage() {
  const { setMockUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);


  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setMessage(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      
      console.log("%c--- RESEND OTP CODE ---", "background: #222; color: #FFAA00; font-size: 16px; padding: 5px;");
      console.log(`%cCode: ${code}`, "font-weight: bold; font-size: 20px; color: #FFAA00;");

      const emailSent = await sendEmailOtp(email, code);
      
      setMessage({ 
        type: 'success', 
        text: emailSent 
          ? "Un nouveau code a été envoyé sur votre Gmail." 
          : "Erreur d'envoi EmailJS. Le nouveau code est en console." 
      });
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Erreur lors du renvoi du code." });
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async (targetEmail: string, code: string) => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      console.warn("EmailJS n'est pas configuré dans les variables d'environnement. Le code s'affiche en console (F12).");
      return false;
    }

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          subject: 'Votre code de vérification - Terroir Local',
          to_email: targetEmail,
          to_name: fullName || targetEmail.split('@')[0],
          otp_code: code,
          app_name: 'Terroir Local Sénégal',
          is_otp: true,
          is_order: false
        },
        EMAILJS_CONFIG.publicKey
      );
      console.log("EmailJS Success:", response);
      return response.status === 200;
    } catch (error: any) {
      console.error("EmailJS Error:", error);
      // provide more detail if possible
      if (error?.text?.includes("user_id") || error?.status === 403) {
        console.error("L'ID utilisateur (Public Key) EmailJS est incorrect.");
      }
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Veuillez entrer votre adresse e-mail d'abord." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      setMessage({ type: 'success', text: "Lien de réinitialisation envoyé ! Vérifiez vos spams." });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Erreur lors de la réinitialisation." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // Bypass pour l'administrateur local
      if (!isSignUp && cleanEmail === 'admin@terroir.sn' && cleanPassword === 'admin123') {
        setMessage({ type: 'success', text: "Connexion administrateur réussie ! Redirection..." });
        setMockUser('admin@terroir.sn');
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1000);
        return;
      }

      if (showOtpInput) {
        const cleanToken = otpToken.trim();
        const cleanGenerated = generatedOtp?.trim();
        
        console.log("Validating Token:", cleanToken, "Target:", cleanGenerated);
        
        if (cleanGenerated && cleanToken === cleanGenerated) {
          setMessage({ type: 'success', text: "Code validé ! Bienvenue sur Terroir Local." });
          
          // Fallback to Mock User for immediate access if Supabase is still pending confirmation
          setMockUser(cleanEmail);
          
          setTimeout(() => {
            window.location.href = '/'; 
          }, 1000);
        } else {
          console.error("OTP Mismatch. Entered:", cleanToken, "Expected:", cleanGenerated);
          throw new Error("Code incorrect. Veuillez vérifier votre e-mail Gmail ou la console.");
        }
        return;
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.");
        }

        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { 
              data: { 
                full_name: fullName,
                role: 'buyer'
              },
              emailRedirectTo: window.location.origin 
            }
          });

          if (signUpError) {
            if (signUpError.message.includes("User already registered")) {
              setIsSignUp(false);
              throw new Error("Cet e-mail est déjà utilisé. Veuillez vous connecter.");
            } else {
              throw signUpError;
            }
          }
        } catch (err: any) {
          throw err;
        }

        // Proceed to OTP flow (either real or demo)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        
        console.log("%c--- GMAIL OTP CODE (Signup) ---", "background: #222; color: #bada55; font-size: 20px; padding: 10px;");
        console.log(`Code: ${code}`);

        try {
          const emailSent = await sendEmailOtp(email, code);
          setShowOtpInput(true);
          
          if (emailSent) {
            setMessage({ type: 'success', text: "Inscription initiée ! Un code de validation a été envoyé sur votre Gmail." });
          } else {
            setMessage({ type: 'success', text: "Inscription en cours ! Veuillez noter votre code s'affichant en console F12 (Gmail indisponible)." });
          }
        } catch (emailErr) {
          console.error("Email OTP send failed, falling back to console:", emailErr);
          setShowOtpInput(true);
          setMessage({ type: 'success', text: "Inscription en cours ! Le code est disponible en console F12." });
        }
      } else {
        console.log("Attempting password login for:", email);
        try {
          const { error: loginError, data } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (loginError) {
            console.error("Supabase Login Error:", loginError);
            if (loginError.message.toLowerCase().includes("email not confirmed")) {
               // Re-trigger OTP flow for unconfirmed users
               console.log("User exists but not confirmed. Sending Gmail OTP...");
               const code = Math.floor(100000 + Math.random() * 900000).toString();
               setGeneratedOtp(code);
               const emailSent = await sendEmailOtp(email, code);
               setShowOtpInput(true);
               setMessage({ 
                 type: 'success', 
                 text: emailSent 
                   ? "Compte existant mais non validé. Un code a été envoyé sur Gmail." 
                   : "Compte non validé. Veuillez entrer le code reçu par Gmail pour continuer." 
               });
               return;
            }
            if (loginError.message.toLowerCase().includes("invalid login credentials")) {
              throw new Error("E-mail ou mot de passe incorrect.");
            }
            throw loginError;
          }

          if (data.user) {
            setMessage({ type: 'success', text: "Connexion réussie ! Redirection..." });
          }
        } catch (err: any) {
          throw err;
        }
      }
    } catch (error: any) {
      console.error("Auth process error:", error);
      setMessage({ type: 'error', text: error.message || "Une erreur est survenue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-natural-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-natural-border p-10 md:p-14 rounded-[56px] shadow-2xl shadow-natural-primary/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-natural-accent" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-natural-accent/10 text-natural-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-black font-serif text-natural-primary mb-2">
            {showOtpInput ? "Vérification" : isSignUp ? "Nouveau Compte" : "Connexion"}
          </h2>
          <p className="text-natural-secondary text-sm font-medium px-4">
            {showOtpInput 
              ? `Saisissez le code envoyé à ${email}` 
              : isSignUp 
                ? "Rejoignez le réseau des producteurs locaux." 
                : "Entrez vos identifiants pour accéder à votre terroir."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest leading-relaxed",
                  message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {!showOtpInput ? (
            <>
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                    <input required type="text" placeholder="Babacar Sy" 
                      className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                      value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Adresse E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                  <input required type="email" placeholder="votre@email.com" 
                    className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Mot de passe</label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[9px] font-black uppercase text-natural-accent hover:underline tracking-widest"
                    >
                      Oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                  <input required type="password" placeholder="••••••••" 
                    className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                    value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Confirmer mot de passe</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                    <input required type="password" placeholder="••••••••" 
                      className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary text-center block">Code de vérification (6 chiffres)</label>
                <input required type="text" placeholder="123456" maxLength={6}
                  className="w-full bg-natural-bg border-4 border-natural-border px-6 py-6 rounded-3xl text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-natural-accent transition-all"
                  value={otpToken} onChange={e => setOtpToken(e.target.value)} />
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  disabled={!canResend || loading}
                  onClick={handleResend}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-all",
                    canResend ? "text-natural-accent hover:underline" : "text-natural-secondary"
                  )}
                >
                  {resendTimer > 0 
                    ? `Renvoyer le code dans ${resendTimer}s` 
                    : "Je n'ai pas reçu le code ? Renvoyer"}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-natural-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-natural-primary/20 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {showOtpInput 
                  ? "Confirmer le code" 
                  : isSignUp 
                    ? "S'inscrire et recevoir le code" 
                    : "Se connecter"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-natural-border flex flex-col items-center gap-4">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setShowOtpInput(false);
              setMessage(null);
            }}
            className="text-[10px] font-black uppercase tracking-[0.15em] text-natural-secondary hover:text-natural-primary transition-colors"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Nouveau ici ? Créer un compte"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
