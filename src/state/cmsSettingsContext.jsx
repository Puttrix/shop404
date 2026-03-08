import { createContext, useContext, useEffect, useState } from 'react';
import { getNavigation, getSettings } from '../services/cmsService.js';

// Fetches CMS navigation and site settings once at app boot.
// Provides { navigation: [{ title, url }], settings: { footerText, footerLinks, defaultSeoTitle, defaultSeoDescription } | null }
const CmsSettingsContext = createContext({ navigation: [], settings: null });

export function CmsSettingsProvider({ children }) {
  const [navigation, setNavigation] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getNavigation().then(setNavigation);
    getSettings().then(setSettings);
  }, []);

  return (
    <CmsSettingsContext.Provider value={{ navigation, settings }}>
      {children}
    </CmsSettingsContext.Provider>
  );
}

export function useCmsSettings() {
  return useContext(CmsSettingsContext);
}
