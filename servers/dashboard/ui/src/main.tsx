import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { PinnedSessionsProvider } from './contexts/PinnedSessionsContext';
import { FilterProvider } from './contexts/FilterContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <PinnedSessionsProvider>
        <FilterProvider>
          <App />
        </FilterProvider>
      </PinnedSessionsProvider>
    </SettingsProvider>
  </React.StrictMode>
);
