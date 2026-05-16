import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon, EyeIcon, EyeOffIcon, SparklesIcon, CheckCircleIcon } from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { signup, isSigningUp } = useAuthStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    checkPasswordStrength(newPassword);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-linear-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Animated dots pattern - hidden on very small screens */}
        <div className="hidden sm:block absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-20 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
        </div>
      </div>

      <div className="relative w-full max-w-6xl animate-fadeIn">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row backdrop-blur-sm bg-slate-900/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center bg-linear-to-br from-slate-900/80 to-slate-800/40">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-linear-to-r from-cyan-400 to-purple-500 p-2 sm:p-3 rounded-full inline-block">
                      <MessageCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-1 sm:mb-2 mt-3 sm:mt-4">
                    Create Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">Join our community today</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* FULL NAME */}
                  <div className="transform transition-all duration-300 hover:translate-x-1">
                    <label className="text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2 block">
                      Full Name
                    </label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'fullName' && !isMobile ? 'transform scale-[1.02]' : ''}`}>
                      <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${focusedField === 'fullName' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <input
                        type="text"
                        value={formData.fullName}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800/50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-cyan-400 transition-all duration-300 text-slate-200 placeholder-slate-500 border-slate-700 text-sm sm:text-base"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div className="transform transition-all duration-300 hover:translate-x-1">
                    <label className="text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2 block">
                      Email Address
                    </label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'email' && !isMobile ? 'transform scale-[1.02]' : ''}`}>
                      <MailIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800/50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-cyan-400 transition-all duration-300 text-slate-200 placeholder-slate-500 border-slate-700 text-sm sm:text-base"
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT with strength meter */}
                  <div className="transform transition-all duration-300 hover:translate-x-1">
                    <label className="text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2 block">
                      Password
                    </label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'password' && !isMobile ? 'transform scale-[1.02]' : ''}`}>
                      <LockIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-slate-800/50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-cyan-400 transition-all duration-300 text-slate-200 placeholder-slate-500 border-slate-700 text-sm sm:text-base"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors duration-300 p-1"
                      >
                        {showPassword ? <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                    
                    {/* Password strength meter */}
                    {formData.password.length > 0 && (
                      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 animate-slideDown">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength
                                  ? getPasswordStrengthColor()
                                  : "bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Password strength:</span>
                          <span className={`font-medium text-xs ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CheckCircleIcon className={`w-3 h-3 ${formData.password.length >= 6 ? 'text-green-500' : 'text-slate-600'}`} />
                            6+ chars
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircleIcon className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-slate-600'}`} />
                            Uppercase
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircleIcon className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-slate-600'}`} />
                            Number
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-0.5 sm:mt-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      required
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-slate-400">
                      I agree to the{" "}
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button 
                    className="relative w-full py-2.5 sm:py-3 bg-linear-to-r from-cyan-500 to-purple-600 rounded-lg sm:rounded-xl font-semibold text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
                    type="submit" 
                    disabled={isSigningUp}
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-cyan-600 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSigningUp ? (
                        <>
                          <LoaderIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Create Account</span>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="mt-4 sm:mt-6 text-center">
                  <Link to="/login" className="text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-all duration-300 inline-flex items-center gap-2 group">
                    <span>Already have an account?</span>
                    <span className="font-semibold bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                      Sign In
                    </span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-transparent text-slate-500">Or sign up with</span>
                  </div>
                </div>

                {/* Social Sign Up Buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button className="py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all duration-300 text-slate-300 hover:text-cyan-400 group">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                    </svg>
                  </button>
                  <button className="py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all duration-300 text-slate-300 hover:text-cyan-400 group">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.23 0H1.77C0.79 0 0 0.78 0 1.77v20.46C0 23.22 0.79 24 1.77 24h20.46c0.98 0 1.77-0.78 1.77-1.77V1.77C24 0.78 23.21 0 22.23 0zM7.08 20.31H3.55V8.97h3.53v11.34zM5.31 7.46c-1.13 0-2.05-0.92-2.05-2.05s0.92-2.05 2.05-2.05 2.05 0.92 2.05 2.05-0.92 2.05-2.05 2.05zM20.46 20.31h-3.53v-5.58c0-1.33-0.47-2.24-1.66-2.24-0.91 0-1.45 0.61-1.69 1.2-0.09 0.21-0.11 0.5-0.11 0.79v5.83h-3.53V8.97h3.53v1.52c0.5-0.78 1.41-1.26 2.55-1.26 1.86 0 3.27 1.22 3.27 3.85v6.23z"/>
                    </svg>
                  </button>
                  <button className="py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all duration-300 text-slate-300 hover:text-cyan-400 group">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE - Hidden on mobile/tablet */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-10 bg-linear-to-br from-slate-800/30 to-purple-900/20 relative overflow-hidden">
              <div className="relative z-10 animate-slideInRight">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                  <img
                    src="/signup.png"
                    alt="People using mobile devices"
                    className="relative w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-6 lg:mt-8 text-center">
                  <h3 className="text-xl lg:text-2xl font-bold bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    Start Your Journey Today
                  </h3>
                  <p className="text-slate-400 text-sm lg:text-base mt-2">Join thousands of satisfied users</p>
                  
                  <div className="mt-4 lg:mt-6 flex justify-center gap-2 lg:gap-3 flex-wrap">
                    <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-linear-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-xs lg:text-sm font-medium border border-cyan-400/30 hover:scale-105 transition-transform duration-300 cursor-default">
                      ✨ Free Forever
                    </span>
                    <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-linear-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-xs lg:text-sm font-medium border border-cyan-400/30 hover:scale-105 transition-transform duration-300 cursor-default">
                      🚀 Easy Setup
                    </span>
                    <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-linear-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-xs lg:text-sm font-medium border border-cyan-400/30 hover:scale-105 transition-transform duration-300 cursor-default">
                      🔒 Secure & Private
                    </span>
                  </div>

                  {/* Stats - Hidden on smaller screens */}
                  <div className="hidden sm:flex mt-6 lg:mt-8 justify-center gap-6 lg:gap-8">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-cyan-400">10K+</div>
                      <div className="text-xs text-slate-500">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-purple-400">99%</div>
                      <div className="text-xs text-slate-500">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-cyan-400">24/7</div>
                      <div className="text-xs text-slate-500">Support</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-linear-to-tr from-cyan-400/10 to-transparent rounded-tr-full"></div>
              <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-linear-to-bl from-purple-400/10 to-transparent rounded-bl-full"></div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default SignUpPage;