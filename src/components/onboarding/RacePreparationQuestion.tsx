import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { RaceEvent } from "@/types";
import { searchRaces, getPopularRaces, raceTypes } from "@/services/raceService";
import RunButton from "@/components/ui/RunButton";
import ProgressHeader from "@/components/layout/ProgressHeader";
import { useSafeAreaInsets } from "@/hooks/utils/useSafeAreaInsets";
import { Search, MapPin, Calendar, Route, X, Target } from "lucide-react";

const RacePreparationQuestion: React.FC = () => {
  const { user, updateUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RaceEvent[]>([]);
  const [selectedRace, setSelectedRace] = useState<RaceEvent | null>(user.targetRace || null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const headerHeight = insets.top + 24 + 32;
  const [popularRaces, setPopularRaces] = useState<RaceEvent[]>([]);

  // Load popular races on component mount
  useEffect(() => {
    const loadPopularRaces = async () => {
      try {
        const races = await getPopularRaces();
        setPopularRaces(races);
      } catch (error) {
        console.error('Error loading popular races:', error);
        // Fallback to empty array if loading fails
        setPopularRaces([]);
      }
    };

    loadPopularRaces();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Add a small delay to avoid too many requests while typing
    setTimeout(async () => {
      try {
        const results = await searchRaces(query);
        setSearchResults(results);
        setShowResults(query.length >= 2);
      } catch (error) {
        console.error('Error searching races:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectRace = (race: RaceEvent) => {
    setSelectedRace(race);
    setSearchQuery(race.name);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    setSelectedRace(null);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleNoSpecificRace = () => {
    setSelectedRace(null);
    setSearchQuery("");
    updateUser({ targetRace: null });
    navigate("/onboarding/weekly-workouts");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ targetRace: selectedRace });
    navigate("/onboarding/weekly-workouts");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isValid = selectedRace !== null;

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-runapp-light-purple/30 to-white"
      style={{ paddingTop: `${headerHeight}px` }}
    >
      <ProgressHeader 
        title="¿Te preparas para alguna carrera específica?"
        subtitle="Personaliza tu entrenamiento para una carrera concreta"
        currentStep={9}
        totalSteps={12}
      />

      <div className="flex-1 px-6 py-8 space-y-8">
        {/* Buscador Principal */}
        <div className="space-y-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-runapp-purple h-5 w-5" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Busca carreras por nombre, ciudad o distancia..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                className="w-full pl-12 pr-12 py-4 border-2 border-runapp-purple/20 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-runapp-purple focus:outline-none text-runapp-dark placeholder-runapp-purple/60 font-medium text-lg transition-all duration-200"
              />
              {(searchQuery || selectedRace) && (
                <button
                  onClick={handleClearSelection}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-runapp-purple/60 hover:text-runapp-purple transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-runapp-purple"></div>
              </div>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {showResults && searchResults.length > 0 && (
            <div 
              ref={resultsRef}
              className="absolute z-50 w-full max-w-lg bg-white/95 backdrop-blur-sm border border-runapp-purple/20 rounded-2xl shadow-xl overflow-hidden"
              style={{ marginLeft: '0px', marginTop: '4px' }}
            >
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => handleSelectRace(race)}
                    className="w-full p-4 text-left hover:bg-runapp-light-purple/20 transition-colors border-b border-runapp-purple/10 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{raceTypes[race.type].icon}</span>
                          <h3 className="font-semibold text-runapp-dark">{race.name}</h3>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-runapp-purple/70">
                            <MapPin className="h-3 w-3" />
                            <span>{race.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-runapp-purple/70">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(race.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              <span>{race.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs text-white ${raceTypes[race.type].color}`}>
                        {raceTypes[race.type].label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
            <div className="absolute z-50 w-full max-w-lg bg-white/95 backdrop-blur-sm border border-runapp-purple/20 rounded-2xl shadow-xl p-6 text-center">
              <div className="text-runapp-purple/60 mb-2">🔍</div>
              <p className="text-runapp-purple/70">No encontramos carreras con ese criterio</p>
              <p className="text-sm text-runapp-purple/50 mt-1">Prueba con el nombre de una ciudad o tipo de carrera</p>
            </div>
          )}
        </div>

        {/* Carrera seleccionada */}
        {selectedRace && (
          <div className="bg-gradient-to-r from-runapp-purple/10 to-runapp-light-purple/20 rounded-2xl p-6 border border-runapp-purple/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-runapp-purple/20 p-2 rounded-full">
                <Target className="h-5 w-5 text-runapp-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-runapp-dark">Carrera seleccionada</h3>
                <p className="text-sm text-runapp-purple/70">Tu entrenamiento se adaptará a esta carrera</p>
              </div>
            </div>

            <div className="bg-white/60 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{raceTypes[selectedRace.type].icon}</span>
                    <h4 className="font-bold text-runapp-dark text-lg">{selectedRace.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-runapp-purple/70">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{selectedRace.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-runapp-purple/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedRace.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        <span className="font-medium">{selectedRace.distance}</span>
                      </div>
                    </div>
                    {selectedRace.description && (
                      <p className="text-sm text-runapp-purple/60 mt-2">{selectedRace.description}</p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm text-white font-medium ${raceTypes[selectedRace.type].color}`}>
                  {raceTypes[selectedRace.type].label}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carreras populares sugeridas */}
        {!selectedRace && searchQuery.length < 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-runapp-dark">Carreras populares en España</h3>
            <div className="grid gap-3">
              {popularRaces.map((race) => (
                <button
                  key={race.id}
                  onClick={() => handleSelectRace(race)}
                  className="bg-white/60 border border-runapp-purple/20 rounded-xl p-4 text-left hover:bg-runapp-light-purple/20 hover:border-runapp-purple/40 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{raceTypes[race.type].icon}</span>
                        <h4 className="font-semibold text-runapp-dark">{race.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-runapp-purple/70">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{race.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          <span>{race.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs text-white ${raceTypes[race.type].color}`}>
                      {raceTypes[race.type].label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón "No me interesa una carrera específica" */}
        <div className="bg-white/40 border border-runapp-purple/20 rounded-xl p-4">
          <button
            onClick={handleNoSpecificRace}
            className="w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-runapp-dark group-hover:text-runapp-purple transition-colors">
                  No me interesa una carrera específica
                </h4>
                <p className="text-sm text-runapp-purple/70">
                  Entrenar para mejorar mi condición física general
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Botón continuar */}
      <div className="px-6 pb-8">
        <form onSubmit={handleSubmit}>
          <RunButton
            type="submit"
            disabled={!isValid}
            className="w-full"
          >
            Continuar
          </RunButton>
        </form>
      </div>
    </div>
  );
};

export default RacePreparationQuestion;