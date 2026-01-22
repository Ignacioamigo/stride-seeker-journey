
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";

const EmailQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(user.email || '');
  const [skipEmail, setSkipEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Calculate header height: safe area + padding + content
  const headerHeight = insets.top + 24 + 32;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skipEmail && email.trim()) {
      if (!validateEmail(email.trim())) {
        setEmailError('Por favor, introduce un email válido');
        return;
      }
      updateUser({ email: email.trim() });
    } else {
      updateUser({ email: null });
    }
    
    navigate("/onboarding/experience");
  };

  const handleSkipChange = (checked: boolean) => {
    setSkipEmail(checked);
    if (checked) {
      setEmailError('');
    }
  };

  const isValid = skipEmail || (email.trim() !== '' && validateEmail(email.trim()));

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + 80,
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }}
    >
      <ProgressHeader currentStep={10} totalSteps={11} showBackButton={true} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-runapp-light-purple rounded-full flex items-center justify-center">
              <span className="text-3xl">📧</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-runapp-navy mb-3 text-center">
            ¿Quieres recibir tips semanales?
          </h2>
          
          <p className="text-runapp-gray text-center mb-6">
            Recibe tips semanales basados en tu volumen de carrera para entrenar de forma segura.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="tu@email.com"
                disabled={skipEmail}
                className={`w-full p-4 border-2 rounded-xl text-lg transition-all ${
                  skipEmail 
                    ? 'bg-gray-100 border-gray-200 text-gray-400' 
                    : emailError 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-runapp-purple'
                } focus:outline-none`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Skip checkbox */}
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div 
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  skipEmail 
                    ? 'bg-runapp-purple border-runapp-purple' 
                    : 'border-gray-300'
                }`}
                onClick={() => handleSkipChange(!skipEmail)}
              >
                {skipEmail && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-runapp-gray select-none">
                Prefiero no recibir tips por ahora
              </span>
            </label>

            <RunButton type="submit" disabled={!isValid}>
              Continuar
            </RunButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailQuestion;




