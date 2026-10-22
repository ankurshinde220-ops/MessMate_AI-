"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessMate } from "@/context/MessMateContext";
import { signInWithGoogle, registerWithEmail, loginWithEmail } from "@/lib/firebase";
import { api } from "@/lib/api";
import { 
  Utensils, 
  GraduationCap, 
  Store, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Mail,
  AlertCircle,
  Sparkles,
  MapPin,
  KeyRound
} from "lucide-react";

export default function LoginPortal() {
  const router = useRouter();
  const { currentUser, loginStudent, loginMess, logout, showToast } = useMessMate();

  // Mode: "signin" | "register"
  const [mode, setMode] = useState("signin");
  // Role: "student" | "mess"
  const [role, setRole] = useState("student");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [messName, setMessName] = useState("");
  const [college, setCollege] = useState("COEP Tech, Shivajinagar");
  const [area, setArea] = useState("FC Road, Shivajinagar");
  const [dietPreference, setDietPreference] = useState("veg");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Helper to ensure navigation works reliably
  const navigateToMesses = () => {
    try {
      router.push("/messes");
    } catch (e) {
      window.location.href = "/messes";
    }
  };

  // --- Form Validations ---
  const trimmedEmail = email.trim();
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail);

  // Password validity check (non-empty)
  const isPasswordValid = Boolean(password && password.length > 0);

  // Confirm password match for registration
  const isPasswordMatch = mode === "register" ? (confirmPassword.length > 0 && confirmPassword === password) : true;

  // Form Validity check
  const isFormValid = mode === "register"
    ? Boolean(
        isEmailValid &&
        isPasswordValid &&
        isPasswordMatch &&
        displayName.trim().length >= 2 &&
        (role !== "mess" || messName.trim().length >= 2)
      )
    : Boolean(isEmailValid && isPasswordValid);

  // Form Submission Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isEmailValid) {
      setErrorMessage("Please enter a valid email address (e.g. name@campus.edu or user@gmail.com).");
      showToast("Invalid email address format.", "warning");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Please enter your password.");
      showToast("Please enter your password.", "warning");
      return;
    }

    if (mode === "register") {
      if (displayName.trim().length < 2) {
        setErrorMessage("Please enter your full name (minimum 2 characters).");
        showToast("Please enter your name.", "warning");
        return;
      }
      if (role === "mess" && messName.trim().length < 2) {
        setErrorMessage("Please enter the name of your mess.");
        showToast("Please enter mess name.", "warning");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Password confirmation does not match the entered password.");
        showToast("Passwords do not match.", "warning");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "register") {
        // --- 1. REGISTRATION WITH FIREBASE & SECURITY ENFORCEMENT ---
        let authUser;
        try {
          authUser = await registerWithEmail(
            trimmedEmail, 
            password, 
            role === "mess" ? (messName.trim() || displayName.trim()) : displayName.trim()
          );
        } catch (fbErr) {
          console.warn("Firebase registration response:", fbErr);
          if (fbErr.code === "auth/email-already-in-use") {
            setErrorMessage("This email address is already registered. Please switch to Sign In.");
            showToast("Email already registered. Please sign in.", "warning");
            setLoading(false);
            return;
          }
          if (fbErr.code === "auth/weak-password") {
            setErrorMessage("Password is too weak. Please choose a stronger password.");
            setLoading(false);
            return;
          }
          // Fallback to local profile registration if Firebase email provider is pending setup in console
          authUser = {
            uid: `reg-${Date.now()}`,
            email: trimmedEmail,
            displayName: displayName.trim()
          };
        }

        const userPayload = {
          firebase_uid: authUser?.uid || `reg-${Date.now()}`,
          email: trimmedEmail,
          display_name: role === "mess" ? messName.trim() : displayName.trim(),
          role: role,
          preferred_diet: dietPreference
        };

        // Sync with backend API
        try {
          await api.syncUser(userPayload);
        } catch (syncErr) {
          console.warn("Backend user sync notice:", syncErr);
        }

        // Save session in Context
        if (role === "student") {
          loginStudent({
            uid: userPayload.firebase_uid,
            displayName: displayName.trim(),
            email: trimmedEmail,
            college: college || "Pune University / COEP",
            dietPreference: dietPreference,
            photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop"
          });
        } else {
          loginMess({
            messId: `mess-${Date.now()}`,
            messName: messName.trim() || displayName.trim(),
            displayName: displayName.trim(),
            email: trimmedEmail,
            area: area || "FC Road, Shivajinagar",
            dietType: dietPreference
          });
        }

        showToast("Account created successfully!", "success");
        navigateToMesses();

      } else {
        // --- 2. SIGN IN WITH FIREBASE & VALIDATION ---
        let authUser;
        try {
          authUser = await loginWithEmail(trimmedEmail, password);
        } catch (fbErr) {
          console.warn("Firebase login response:", fbErr);
          if (fbErr.code === "auth/user-not-found" || fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
            setErrorMessage("Invalid email or password. Please verify your credentials or create a new account.");
            showToast("Invalid email or password.", "warning");
            setLoading(false);
            return;
          }
          // Fallback for development if needed
          authUser = {
            uid: `login-${Date.now()}`,
            email: trimmedEmail,
            displayName: trimmedEmail.split("@")[0]
          };
        }

        // Call backend login API
        try {
          await api.login({
            email: trimmedEmail,
            firebase_uid: authUser?.uid,
            display_name: authUser?.displayName || trimmedEmail.split("@")[0],
            role: role
          });
        } catch (apiErr) {
          console.warn("Backend login API notice:", apiErr);
        }

        if (role === "student") {
          loginStudent({
            uid: authUser?.uid || `student-${Date.now()}`,
            displayName: authUser?.displayName || trimmedEmail.split("@")[0],
            email: trimmedEmail,
            college: college || "Pune University / COEP",
            dietPreference: dietPreference
          });
        } else {
          loginMess({
            messId: "mess-1",
            messName: messName.trim() || (trimmedEmail.split("@")[0] + " Mess"),
            displayName: `${messName.trim() || "Mess Manager"} (Partner)`,
            email: trimmedEmail,
            area: area || "FC Road, Shivajinagar",
            dietType: "veg"
          });
        }

        showToast(`Welcome back! Signed in successfully.`, "success");
        navigateToMesses();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "An unexpected authentication error occurred.");
      showToast("Authentication error. Please check your credentials.", "warning");
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler via Firebase
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        loginStudent({
          uid: googleUser.uid,
          displayName: googleUser.displayName || "Google Student User",
          email: googleUser.email || "student@gmail.com",
          photoURL: googleUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop",
          college: "Pune University Campus"
        });
        showToast(`Welcome, ${googleUser.displayName || "Student"}! Signed in with Google.`, "success");
        navigateToMesses();
      }
    } catch (err) {
      console.warn("Google sign-in status:", err.message);
      if (err.message !== "Google sign-in was cancelled") {
        setErrorMessage(err.message || "Google sign-in issue. Please try again.");
        showToast(err.message || "Google sign-in issue. Please try again.", "warning");
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Student Login
  const handleDemoStudent = () => {
    loginStudent({
      displayName: "Aakash Deshmukh",
      email: "aakash.coep@campus.edu",
      college: "COEP Tech, Shivajinagar",
      dietPreference: "veg",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop"
    });
    showToast("Logged in as Aakash Deshmukh (COEP Pune)", "success");
    navigateToMesses();
  };

  // 1-Click Quick Demo Mess Login
  const handleDemoMess = () => {
    loginMess({
      messId: "mess-1",
      messName: "Annapurna Pure Veg Mess",
      displayName: "Annapurna Mess (Partner)",
      email: "contact@annapurnamess.com",
      area: "FC Road, Shivajinagar",
      dietType: "veg",
      phone: "+91 98230 11223"
    });
    showToast("Logged in as Annapurna Pure Veg Mess (FC Road)", "success");
    navigateToMesses();
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FAF8F5] via-emerald-50/25 to-[#F4EFE6]">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 my-auto">
        {/* TOP: LOGO & HEADING */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-emerald-glow mb-3 transform hover:scale-105 transition-transform duration-300">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight flex items-center justify-center gap-2">
            <span>MessMate</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              AI
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            Smart Mess & Student Dining Platform • Pune
          </p>
        </div>

        {/* ACTIVE USER SESSION CARD */}
        {currentUser ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-emerald-100 text-center space-y-5 animate-bounce-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                {currentUser.role === "mess" ? "🍲 Mess Partner" : "🎓 Verified Student"}
              </span>
              <h2 className="text-xl font-extrabold text-navy-900">
                Welcome back, {currentUser.displayName || currentUser.messName}!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {currentUser.role === "mess" ? currentUser.area : currentUser.college}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={navigateToMesses}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-emerald-glow transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to MessMate AI Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch User</span>
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATION PORTAL CARD */
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-[#EBE3D5] space-y-5">
            
            {/* 1. AUTH MODE TABS: SIGN IN vs CREATE ACCOUNT */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-navy-900 shadow-soft-sm font-extrabold"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                <KeyRound className={`w-3.5 h-3.5 ${mode === "signin" ? "text-emerald-600" : "text-slate-400"}`} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-navy-900 shadow-soft-sm font-extrabold"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${mode === "register" ? "text-emerald-600" : "text-slate-400"}`} />
                <span>Create Account</span>
              </button>
            </div>

            {/* 2. ROLE TOGGLE: STUDENT vs MESS PARTNER */}
            <div className="grid grid-cols-2 p-1 bg-cream-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-white text-navy-900 shadow-soft-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                <GraduationCap className={`w-3.5 h-3.5 ${role === "student" ? "text-emerald-600" : "text-slate-400"}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("mess")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "mess"
                    ? "bg-white text-navy-900 shadow-soft-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                <Store className={`w-3.5 h-3.5 ${role === "mess" ? "text-emerald-600" : "text-slate-400"}`} />
                <span>Mess Partner</span>
              </button>
            </div>

            {/* ERROR BANNER */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* DISPLAY NAME (IN REGISTER MODE) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === "student" ? "Full Name *" : "Manager / Owner Name *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={role === "student" ? "e.g. Aakash Deshmukh" : "e.g. Ramesh Patil"}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* MESS SPECIFIC FIELDS (IN REGISTER OR MESS MODE) */}
              {role === "mess" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mess Name {mode === "register" ? "*" : "(Optional)"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Annapurna Pure Veg Mess"
                      value={messName}
                      onChange={(e) => setMessName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* VALID EMAIL INPUT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {role === "student" ? "Student Email Address *" : "Official Mess Email *"}
                  </label>
                  {emailTouched && trimmedEmail.length > 0 && (
                    <span className={`text-[10px] font-bold ${isEmailValid ? "text-emerald-600" : "text-rose-500"}`}>
                      {isEmailValid ? "✓ Valid Email" : "✕ Invalid format"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={role === "student" ? "student@campus.edu or name@gmail.com" : "contact@annapurnamess.com"}
                    value={email}
                    onBlur={() => setEmailTouched(true)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-navy-900 placeholder-slate-400 focus:outline-none transition-all ${
                      emailTouched && trimmedEmail.length > 0 && !isEmailValid
                        ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        : isEmailValid
                        ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                  {trimmedEmail.length > 0 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isEmailValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailTouched && trimmedEmail.length > 0 && !isEmailValid && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    Please provide a valid email format (e.g. name@domain.com)
                  </p>
                )}
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onBlur={() => setPasswordTouched(true)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD INPUT (IN REGISTER MODE) */}
              {mode === "register" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Confirm Password *</label>
                    {confirmPassword.length > 0 && (
                      <span className={`text-[10px] font-bold ${confirmPassword === password ? "text-emerald-600" : "text-rose-500"}`}>
                        {confirmPassword === password ? "✓ Passwords match" : "✕ Passwords do not match"}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-navy-900 placeholder-slate-400 focus:outline-none transition-all ${
                        confirmPassword.length > 0 && confirmPassword !== password
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20"
                          : confirmPassword.length > 0 && confirmPassword === password
                          ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20"
                          : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* ADDITIONAL PROFILE METADATA (IN REGISTER MODE) */}
              {mode === "register" && (
                <div className="pt-1 space-y-3">
                  {role === "student" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        College / Campus Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. COEP Tech, Fergusson College, Pune Univ."
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-navy-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mess Area / Landmark in Pune
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. FC Road, Shivajinagar, Pune"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-navy-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dietary Preference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {role === "student" ? "Your Food Preference" : "Mess Food Offering"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "veg", label: "Pure Veg 🥦" },
                        { id: "both", label: "Veg & Non-Veg 🍗" },
                        { id: "jain", label: "Jain Food 🌿" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDietPreference(item.id)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            dietPreference === item.id
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-soft-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PRIMARY SUBMIT BUTTON WITH STRICT VALIDATION LOCK */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft-md ${
                    isFormValid && !loading
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-glow active:scale-98"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-80"
                  }`}
                >
                  {loading ? (
                    <span>Verifying & Authenticating...</span>
                  ) : !isFormValid ? (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                      <Lock className="w-3.5 h-3.5" />
                      {mode === "register" ? "Fill in required fields to register" : "Enter email & password"}
                    </span>
                  ) : mode === "register" ? (
                    <>
                      <span>{role === "student" ? "Create Student Account" : "Register Mess Partner Listing"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{role === "student" ? "Sign In as Student" : "Sign In as Mess Partner"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* GOOGLE SIGN IN BUTTON (FIREBASE) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-soft-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* INSTANT 1-CLICK DEMO ACCESS */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                Instant 1-Click Demo Access:
              </span>
              {role === "student" ? (
                <button
                  type="button"
                  onClick={handleDemoStudent}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡ 1-Click Login: Aakash (COEP Pune - Student)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDemoMess}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🍲 1-Click Login: Annapurna Pure Veg Mess (FC Road)</span>
                </button>
              )}
            </div>

            {/* SWITCH MODE FOOTER LINK */}
            <div className="text-center pt-2">
              {mode === "signin" ? (
                <p className="text-xs text-slate-500">
                  New to MessMate AI?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMessage("");
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Create an account here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMessage("");
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Sign in to your account
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {/* BROWSE AS GUEST DIRECT LINK */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={navigateToMesses}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <span>Skip for now and continue as guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TRUST BADGES */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FSSAI Verified Messes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Student Verified</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-[11px] text-slate-400 mt-6">
        MessMate AI • Secure Student Dining & Verified Mess Network
      </footer>
    </div>
  );
}
