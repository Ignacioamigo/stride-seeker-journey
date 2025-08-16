import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { App as CapacitorApp } from '@capacitor/app'

// Import Watch Connectivity Service
import './services/watchConnectivityService'

// Handle iOS deep links for Strava (stride://strava-callback?code=...)
CapacitorApp.addListener('appUrlOpen', ({ url }) => {
  try {
    if (url && url.startsWith('stride://strava-callback')) {
      const query = url.split('?')[1] || ''
      window.location.href = `/settings?${query}`
    }
  } catch {}
})

createRoot(document.getElementById("root")!).render(<App />);
