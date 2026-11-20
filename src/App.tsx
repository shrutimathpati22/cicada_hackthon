/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardShell } from './components/DashboardShell';
import { LandingPage } from './components/LandingPage';
import { VeilWatchProvider, useVeilWatch } from './context/VeilWatchContext';
import { AuditReportsPage } from './pages/AuditReportsPage';
import { IncidentFingerprintPage } from './pages/IncidentFingerprintPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { OverviewPage } from './pages/OverviewPage';
import { PredictiveHealthPage } from './pages/PredictiveHealthPage';
import { PrivacyRadarPage } from './pages/PrivacyRadarPage';
import { SettingsPage } from './pages/SettingsPage';
import { SmartAlertsPage } from './pages/SmartAlertsPage';

const VeilWatchAppContent: React.FC = () => {
  const { viewMode, activePage } = useVeilWatch();

  if (viewMode === 'landing') {
    return <LandingPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'infrastructure':
        return <InfrastructurePage />;
      case 'privacy-radar':
        return <PrivacyRadarPage />;
      case 'smart-alerts':
        return <SmartAlertsPage />;
      case 'predictive-health':
        return <PredictiveHealthPage />;
      case 'fingerprints':
        return <IncidentFingerprintPage />;
      case 'audit-reports':
        return <AuditReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return <DashboardShell>{renderPage()}</DashboardShell>;
};

export default function App() {
  return (
    <VeilWatchProvider>
      <VeilWatchAppContent />
    </VeilWatchProvider>
  );
}
