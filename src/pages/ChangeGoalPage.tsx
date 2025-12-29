import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { generateTrainingPlan } from "@/services/planService";
import RunButton from "@/components/ui/RunButton";
import GoalSliderInput from "@/components/ui/GoalSliderInput";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const HEADER_HEIGHT = 44;
const DAYS_BETWEEN_CHANGES = 30;

const ChangeGoalPage: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'distance' | 'timeframe' | 'blocked'>('distance');
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  const [targetDistance, setTargetDistance] = useState<string>(
    user.targetDistance?.toString() || "5"
  );
  const [months, setMonths] = useState<string>("3");
  const [days, setDays] = useState<string>("0");

  // Verificar si puede cambiar la meta al cargar (desde Supabase)
  useEffect(() => {
    const checkCanChangeGoal = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 [ChangeGoal] Verificando si puede cambiar la meta...');
        
        // Obtener el usuario autenticado
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('🔍 [ChangeGoal] Usuario autenticado:', authUser?.id);
        
        if (!authUser) {
          console.log('⚠️ [ChangeGoal] No hay usuario autenticado, permitiendo cambio');
          setIsLoading(false);
          return;
        }
        
        // Buscar el perfil del usuario para obtener last_goal_change_date
        console.log('🔍 [ChangeGoal] Buscando perfil con user_auth_id:', authUser.id);
        const { data: userProfile, error } = await supabase
          .from('user_profiles')
          .select('id, user_auth_id, last_goal_change_date')
          .eq('user_auth_id', authUser.id)
          .single();
        
        console.log('🔍 [ChangeGoal] Resultado consulta perfil:', userProfile);
        if (error) {
          console.error('❌ [ChangeGoal] Error consultando perfil:', error);
        }
        
        if (error || !userProfile?.last_goal_change_date) {
          console.log('ℹ️ [ChangeGoal] No hay fecha registrada o error, permitiendo cambio');
          setIsLoading(false);
          return;
        }
        
        // Calcular días transcurridos
        const lastChange = new Date(userProfile.last_goal_change_date);
        const now = new Date();
        const diffTime = now.getTime() - lastChange.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('📅 [ChangeGoal] Última fecha de cambio:', lastChange.toISOString());
        console.log('📅 [ChangeGoal] Días transcurridos:', diffDays);
        
        if (diffDays < DAYS_BETWEEN_CHANGES) {
          console.log('🚫 [ChangeGoal] Bloqueado, faltan', DAYS_BETWEEN_CHANGES - diffDays, 'días');
          setStep('blocked');
          setDaysRemaining(DAYS_BETWEEN_CHANGES - diffDays);
        } else {
          console.log('✅ [ChangeGoal] Permitido cambiar meta');
        }
      } catch (error) {
        console.error("❌ [ChangeGoal] Error verificando fecha de cambio de meta:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCanChangeGoal();
  }, []);

  const handleDistanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('timeframe');
  };

  const handleTimeframeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Convertir tiempo a días
      const totalDays = (parseInt(months) * 30) + parseInt(days);
      
      // Crear texto del tiempo para el goal
      let timeframeText = "";
      if (parseInt(months) > 0 && parseInt(days) > 0) {
        timeframeText = `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'} y ${days} ${parseInt(days) === 1 ? 'día' : 'días'}`;
      } else if (parseInt(months) > 0) {
        timeframeText = `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'}`;
      } else {
        timeframeText = `${days} ${parseInt(days) === 1 ? 'día' : 'días'}`;
      }
      
      // Formatear el ritmo objetivo si existe
      const paceText = user.targetPace 
        ? `${Math.floor(user.targetPace)}:${Math.round((user.targetPace % 1) * 60).toString().padStart(2, '0')} min/km`
        : user.pace || '';
      
      const goalDescription = paceText 
        ? `Correr ${targetDistance} km a un ritmo de ${paceText} en ${timeframeText}`
        : `Correr ${targetDistance} km en ${timeframeText}`;
      
      // Actualizar perfil del usuario manteniendo todos los datos existentes
      const updatedUser = {
        ...user,
        targetDistance: Number(targetDistance),
        targetTimeframe: totalDays,
        targetTimeframeUnit: 'days' as const,
        goal: goalDescription
      };
      
      // Actualizar el contexto del usuario
      updateUser({
        targetDistance: Number(targetDistance),
        targetTimeframe: totalDays,
        targetTimeframeUnit: 'days' as const,
        goal: goalDescription
      });
      
      // Regenerar el plan con todos los datos del usuario
      await generateTrainingPlan({
        userProfile: updatedUser
      });
      
      // Guardar la fecha del cambio en Supabase para limitar a una vez al mes
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('🔄 [ChangeGoal] Usuario autenticado:', authUser?.id);
      
      if (authUser) {
        const updateDate = new Date().toISOString();
        console.log('🔄 [ChangeGoal] Actualizando last_goal_change_date a:', updateDate);
        console.log('🔄 [ChangeGoal] user_auth_id:', authUser.id);
        
        const { data: updateData, error: updateError } = await supabase
          .from('user_profiles')
          .update({ last_goal_change_date: updateDate })
          .eq('user_auth_id', authUser.id)
          .select();
        
        if (updateError) {
          console.error('❌ [ChangeGoal] Error actualizando last_goal_change_date:', updateError);
          console.error('❌ [ChangeGoal] Error code:', updateError.code);
          console.error('❌ [ChangeGoal] Error message:', updateError.message);
          console.error('❌ [ChangeGoal] Error details:', updateError.details);
        } else {
          console.log('✅ [ChangeGoal] Actualización exitosa:', updateData);
          if (!updateData || updateData.length === 0) {
            console.warn('⚠️ [ChangeGoal] No se encontró ningún registro para actualizar');
            
            // Verificar si existe el perfil
            const { data: existingProfile, error: selectError } = await supabase
              .from('user_profiles')
              .select('id, user_auth_id')
              .eq('user_auth_id', authUser.id)
              .single();
            
            console.log('🔍 [ChangeGoal] Perfil existente:', existingProfile);
            if (selectError) {
              console.error('❌ [ChangeGoal] Error buscando perfil:', selectError);
            }
          }
        }
      } else {
        console.warn('⚠️ [ChangeGoal] No hay usuario autenticado para guardar la fecha');
      }
      
      toast({
        title: "¡Plan actualizado!",
        description: "Tu nuevo plan de entrenamiento ha sido generado",
      });
      
      // Navegar al plan para ver el nuevo plan generado
      navigate('/plan');
    } catch (error: any) {
      console.error("Error regenerando plan:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el nuevo plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isValidDistance = targetDistance && Number(targetDistance) > 0;
  const isValidTimeframe = (months !== "" && parseInt(months) > 0) || (days !== "" && parseInt(days) > 0);

  // Mostrar loader mientras verifica
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-runapp-light-purple/30 to-white"
      >
        <Loader2 className="w-8 h-8 animate-spin text-runapp-purple" />
        <p className="mt-4 text-runapp-gray">Verificando...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{
        paddingBottom: insets.bottom + 24,
      }}
    >
      {/* Header con botón de volver */}
      <header 
        className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm"
        style={{ paddingTop: insets.top }}
      >
        <div className="px-4 py-3 flex items-center">
          <button 
            onClick={() => step === 'timeframe' ? setStep('distance') : navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-runapp-navy pr-10">
            Cambiar meta
          </h1>
        </div>
      </header>

      {/* Content */}
      <div 
        className="flex-1 flex flex-col justify-center px-4"
        style={{
          paddingTop: insets.top + HEADER_HEIGHT + 24,
        }}
      >
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {step === 'blocked' ? (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
                    Cambio no disponible
                  </h2>
                  <p className="text-runapp-gray mb-6">
                    Solo puedes cambiar tu meta una vez al mes para mantener la consistencia en tu entrenamiento.
                  </p>
                  
                  <div className="bg-amber-50 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 font-medium">
                      Podrás cambiar tu meta en <span className="font-bold">{daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</span>
                    </p>
                  </div>
                  
                  <RunButton onClick={() => navigate(-1)}>
                    Volver al perfil
                  </RunButton>
                </div>
              </>
            ) : step === 'distance' ? (
              <>
                <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
                  ¿Qué distancia quieres alcanzar?
                </h2>
                <p className="text-runapp-gray mb-6">
                  Selecciona tu nueva distancia objetivo
                </p>
                
                <form onSubmit={handleDistanceSubmit} className="space-y-8">
                  <GoalSliderInput
                    value={targetDistance}
                    onChange={setTargetDistance}
                    min={1}
                    max={42}
                    step={1}
                    unit="km"
                    placeholder="5"
                    type="distance"
                    label="Distancia objetivo"
                    description="¿Qué distancia quieres correr?"
                  />

                  <div className="bg-runapp-light-purple/20 rounded-lg p-4 mt-6">
                    <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo de distancia:</h3>
                    <p className="text-sm text-runapp-gray">
                      {targetDistance} kilómetros
                    </p>
                  </div>
                  
                  <RunButton type="submit" disabled={!isValidDistance}>
                    Continuar
                  </RunButton>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-runapp-navy mb-2">
                  ¿En cuánto tiempo quieres lograrlo?
                </h2>
                <p className="text-runapp-gray mb-6">
                  Introduce el tiempo para alcanzar tu objetivo
                </p>
                
                <form onSubmit={handleTimeframeSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-runapp-gray mb-3">
                        Meses
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={months}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 12)) {
                              setMonths(value);
                            }
                          }}
                          placeholder="3"
                          min="0"
                          max="12"
                          className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                          autoFocus
                        />
                        <span className="text-lg font-medium text-runapp-gray min-w-[60px]">meses</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-runapp-gray mb-3">
                        Días adicionales
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={days}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 90)) {
                              setDays(value);
                            }
                          }}
                          placeholder="0"
                          min="0"
                          max="89"
                          className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent text-center text-2xl font-semibold"
                        />
                        <span className="text-lg font-medium text-runapp-gray min-w-[60px]">días</span>
                      </div>
                    </div>
                  </div>

                  {isValidTimeframe && (
                    <div className="bg-runapp-light-purple/20 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-runapp-navy mb-2">Tu objetivo completo:</h3>
                      <p className="text-sm text-runapp-gray">
                        Correr {targetDistance} km en{' '}
                        {parseInt(months) > 0 && parseInt(days) > 0 
                          ? `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'} y ${days} ${parseInt(days) === 1 ? 'día' : 'días'}`
                          : parseInt(months) > 0 
                          ? `${months} ${parseInt(months) === 1 ? 'mes' : 'meses'}`
                          : `${days} ${parseInt(days) === 1 ? 'día' : 'días'}`
                        }
                      </p>
                    </div>
                  )}
                  
                  <RunButton 
                    type="submit" 
                    disabled={!isValidTimeframe || isGenerating}
                  >
                    {isGenerating ? "Generando plan..." : "Actualizar plan"}
                  </RunButton>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeGoalPage;

