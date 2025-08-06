import { RaceEvent } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Legacy race types for compatibility with existing components
export const raceTypes = {
  'carrera_popular': { label: 'Carrera Popular', icon: '🏃', color: 'bg-blue-500' },
  'media_maraton': { label: 'Media Maratón', icon: '🏃‍♂️', color: 'bg-green-500' },
  'maraton': { label: 'Maratón', icon: '🏅', color: 'bg-red-500' },
  'trail_running': { label: 'Trail Running', icon: '🏔️', color: 'bg-amber-500' },
  'ultra_trail': { label: 'Ultra Trail', icon: '🦾', color: 'bg-purple-500' },
  'cross': { label: 'Cross', icon: '🌱', color: 'bg-emerald-500' },
  'nocturna': { label: 'Nocturna', icon: '🌙', color: 'bg-indigo-500' },
  'solidaria': { label: 'Solidaria', icon: '❤️', color: 'bg-pink-500' },
  'triathlon': { label: 'Triatlón', icon: '🏊‍♂️', color: 'bg-cyan-500' },
  'montaña': { label: 'Montaña', icon: '⛰️', color: 'bg-gray-500' },
  'otros': { label: 'Otros', icon: '🏃‍♀️', color: 'bg-slate-500' },
  // Legacy types for backwards compatibility
  'trail': { label: 'Trail', icon: '🏔️', color: 'bg-amber-500' },
  'ultra': { label: 'Ultra', icon: '🦾', color: 'bg-purple-500' },
};

// Transform database race to legacy RaceEvent format for compatibility
function transformDbRaceToLegacy(dbRace: any): RaceEvent {
  // Map race types to ensure compatibility
  let raceType = dbRace.race_type;
  if (raceType === 'trail_running') raceType = 'trail';
  if (raceType === 'ultra_trail') raceType = 'ultra';

  return {
    id: dbRace.id || dbRace.source_event_id,
    name: dbRace.name,
    location: `${dbRace.city}${dbRace.province ? `, ${dbRace.province}` : ''}`,
    date: dbRace.event_date,
    distance: dbRace.distance_text || (dbRace.distance_km ? `${dbRace.distance_km} km` : ''),
    type: raceType as RaceEvent['type'],
    description: dbRace.description || `Carrera en ${dbRace.city}`,
    // Additional fields from new database
    registrationUrl: dbRace.registration_url,
    organizer: dbRace.organizer,
    price: dbRace.registration_price,
    maxParticipants: dbRace.max_participants,
    imageUrl: dbRace.image_url,
    website: dbRace.website,
  };
}

export const searchRaces = async (query: string): Promise<RaceEvent[]> => {
  if (!query || query.length < 2) return [];

  try {
    const { data: dbRaces, error } = await supabase
      .from('races')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,province.ilike.%${query}%,organizer.ilike.%${query}%`)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date')
      .limit(8);

    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }

    if (dbRaces && dbRaces.length > 0) {
      return dbRaces.map(transformDbRaceToLegacy);
    }
  } catch (error) {
    console.error('Error searching races from database:', error);
  }

  // Fallback to static search if database fails
  return getFallbackRaces().filter(race => {
    const searchTerm = query.toLowerCase();
    return race.name.toLowerCase().includes(searchTerm) ||
           race.location.toLowerCase().includes(searchTerm) ||
           race.distance.toLowerCase().includes(searchTerm) ||
           (raceTypes[race.type]?.label.toLowerCase().includes(searchTerm));
  }).slice(0, 8);
};

export const getPopularRaces = async (): Promise<RaceEvent[]> => {
  try {
    const { data: dbRaces, error } = await supabase
      .from('races')
      .select('*')
      .in('race_type', ['maraton', 'media_maraton'])
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date')
      .limit(6);

    if (error) {
      console.error('Supabase popular races error:', error);
      throw error;
    }

    if (dbRaces && dbRaces.length > 0) {
      return dbRaces.map(transformDbRaceToLegacy);
    }
  } catch (error) {
    console.error('Error getting popular races from database:', error);
  }

  // Fallback to static data
  return getFallbackRaces()
    .filter(race => ['maraton', 'media_maraton'].includes(race.type))
    .slice(0, 6);
};

export const getRacesByLocation = async (location: string): Promise<RaceEvent[]> => {
  try {
    const { data: dbRaces, error } = await supabase
      .from('races')
      .select('*')
      .or(`city.ilike.%${location}%,province.ilike.%${location}%`)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date')
      .limit(20);

    if (error) {
      console.error('Supabase location races error:', error);
      throw error;
    }

    if (dbRaces && dbRaces.length > 0) {
      return dbRaces.map(transformDbRaceToLegacy);
    }
  } catch (error) {
    console.error('Error getting races by location from database:', error);
  }

  // Fallback to static search
  return getFallbackRaces().filter(race => 
    race.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const getRacesByType = async (type: RaceEvent['type']): Promise<RaceEvent[]> => {
  // Map legacy types to new types
  let searchType = type;
  if (type === 'trail') searchType = 'trail_running';
  if (type === 'ultra') searchType = 'ultra_trail';

  try {
    const { data: dbRaces, error } = await supabase
      .from('races')
      .select('*')
      .eq('race_type', searchType)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date')
      .limit(20);

    if (error) {
      console.error('Supabase type races error:', error);
      throw error;
    }

    if (dbRaces && dbRaces.length > 0) {
      return dbRaces.map(transformDbRaceToLegacy);
    }
  } catch (error) {
    console.error(`Error getting races by type ${type} from database:`, error);
  }

  // Fallback to static data
  return getFallbackRaces().filter(race => race.type === type);
};

// Advanced search with multiple filters
export const searchRacesAdvanced = async (filters: {
  query?: string;
  types?: string[];
  provinces?: string[];
  dateFrom?: string;
  dateTo?: string;
  maxDistance?: number;
  limit?: number;
}): Promise<RaceEvent[]> => {
  try {
    let query = supabase
      .from('races')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0]);

    // Apply filters
    if (filters.query) {
      query = query.or(`name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,province.ilike.%${filters.query}%`);
    }

    if (filters.types && filters.types.length > 0) {
      const mappedTypes = filters.types.map(type => {
        if (type === 'trail') return 'trail_running';
        if (type === 'ultra') return 'ultra_trail';
        return type;
      });
      query = query.in('race_type', mappedTypes);
    }

    if (filters.provinces && filters.provinces.length > 0) {
      query = query.in('province', filters.provinces);
    }

    if (filters.dateFrom) {
      query = query.gte('event_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('event_date', filters.dateTo);
    }

    if (filters.maxDistance) {
      query = query.lte('distance_km', filters.maxDistance);
    }

    const { data: dbRaces, error } = await query
      .order('event_date')
      .limit(filters.limit || 50);

    if (error) {
      console.error('Supabase advanced search error:', error);
      throw error;
    }

    return (dbRaces || []).map(transformDbRaceToLegacy);
  } catch (error) {
    console.error('Error in advanced race search:', error);
    return getFallbackRaces(filters.query);
  }
};

// Get race count from database
export const getRaceCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error getting race count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting race count:', error);
    return 0;
  }
};

// Fallback data for when database is unavailable
function getFallbackRaces(query?: string): RaceEvent[] {
  const fallbackRaces: RaceEvent[] = [
    // Madrid
    {
      id: 'madrid-maraton-fallback',
      name: 'Maratón de Madrid',
      location: 'Madrid',
      date: '2025-04-27',
      distance: '42.2 km',
      type: 'maraton',
      description: 'El maratón más importante de España'
    },
    {
      id: 'media-maraton-madrid-fallback',
      name: 'Media Maratón de Madrid',
      location: 'Madrid',
      date: '2025-03-23',
      distance: '21.1 km',
      type: 'media_maraton',
      description: 'Media maratón con más de 20,000 participantes'
    },
    {
      id: 'carrera-empresas-madrid-fallback',
      name: 'Carrera de las Empresas Madrid',
      location: 'Madrid',
      date: '2025-11-16',
      distance: '6.8 km',
      type: 'carrera_popular',
      description: 'Una de las carreras más populares de Madrid'
    },
    
    // Barcelona
    {
      id: 'maraton-barcelona-fallback',
      name: 'Maratón de Barcelona',
      location: 'Barcelona',
      date: '2025-03-09',
      distance: '42.2 km',
      type: 'maraton',
      description: 'Maratón con recorrido junto al mar'
    },
    {
      id: 'media-maraton-barcelona-fallback',
      name: 'Media Maratón de Barcelona',
      location: 'Barcelona',
      date: '2025-02-09',
      distance: '21.1 km',
      type: 'media_maraton',
      description: 'Recorrido espectacular por la Ciudad Condal'
    },
    
    // Valencia
    {
      id: 'maraton-valencia-fallback',
      name: 'Maratón Valencia Trinidad Alfonso',
      location: 'Valencia',
      date: '2025-12-07',
      distance: '42.2 km',
      type: 'maraton',
      description: 'Maratón con récord mundial'
    },
    {
      id: 'media-maraton-valencia-fallback',
      name: 'Media Maratón Valencia',
      location: 'Valencia',
      date: '2025-10-26',
      distance: '21.1 km',
      type: 'media_maraton',
      description: 'Una de las mejores medias maratones del mundo'
    },
    
    // Sevilla
    {
      id: 'maraton-sevilla-fallback',
      name: 'Maratón de Sevilla',
      location: 'Sevilla',
      date: '2025-02-16',
      distance: '42.2 km',
      type: 'maraton',
      description: 'Maratón por el casco histórico de Sevilla'
    },
    
    // Trail examples
    {
      id: 'transgrancanaria-fallback',
      name: 'Transgrancanaria',
      location: 'Las Palmas',
      date: '2025-02-22',
      distance: '125 km',
      type: 'ultra',
      description: 'Ultra trail por la isla de Gran Canaria'
    },
    {
      id: 'trail-peñalara-fallback',
      name: 'Trail Peñalara',
      location: 'Madrid',
      date: '2025-07-12',
      distance: '30 km',
      type: 'trail',
      description: 'Trail de montaña en la Sierra de Guadarrama'
    },
  ];

  if (!query) return fallbackRaces;

  const searchTerm = query.toLowerCase();
  return fallbackRaces.filter(race => 
    race.name.toLowerCase().includes(searchTerm) ||
    race.location.toLowerCase().includes(searchTerm) ||
    race.description.toLowerCase().includes(searchTerm) ||
    race.distance.toLowerCase().includes(searchTerm) ||
    (raceTypes[race.type]?.label.toLowerCase().includes(searchTerm))
  );
}

// Race service now connects directly to Supabase for real-time data