/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DpiProvider, useDpi } from './context/DpiContext';
import { LandingPage } from './dashboard/LandingPage';
import { TopNav, ViewTab } from './dashboard/TopNav';
import { OverviewView } from './dashboard/OverviewView';
import { TestingDashboardView } from './dashboard/TestingDashboardView';
import { LiveTransactionsView } from './dashboard/LiveTransactionsView';
import { IncidentsView } from './dashboard/IncidentsView';
import { AgentsView } from './dashboard/AgentsView';
import { SchemaDiffView } from './dashboard/SchemaDiffView';
import { VerificationView } from './dashboard/VerificationView';
import { ActiveAdaptersView } from './dashboard/ActiveAdaptersView';
import { SimulationLabView } from './dashboard/SimulationLabView';
import { MttrComparisonView } from './dashboard/MttrComparisonView';
import { SystemLogsView } from './dashboard/SystemLogsView';
import { AiExplanationDrawer } from './dashboard/AiExplanationDrawer';

function DashboardContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const { runJudgeDemo } = useDpi();

  const handleStartLiveSimulation = () => {
    setCurrentView('app');
    setCurrentTab('simulation-lab');
    runJudgeDemo();
  };

  const handleEnterControlCenter = () => {
    setCurrentView('app');
    setCurrentTab('overview');
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterControlCenter={handleEnterControlCenter}
        onRunLiveSimulation={handleStartLiveSimulation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navigation */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAiDrawer={() => setAiDrawerOpen(true)}
        onReturnToLanding={() => setCurrentView('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && <OverviewView onNavigate={setCurrentTab} />}
        {currentTab === 'testing-dashboard' && <TestingDashboardView />}
        {currentTab === 'simulation-lab' && <SimulationLabView />}
        {currentTab === 'transactions' && <LiveTransactionsView />}
        {currentTab === 'incidents' && (
          <IncidentsView
            onNavigate={setCurrentTab}
            onOpenAiDrawer={() => setAiDrawerOpen(true)}
          />
        )}
        {currentTab === 'agents' && <AgentsView />}
        {currentTab === 'schema-diff' && <SchemaDiffView />}
        {currentTab === 'verification' && <VerificationView />}
        {currentTab === 'adapters' && <ActiveAdaptersView />}
        {currentTab === 'mttr' && <MttrComparisonView />}
        {currentTab === 'logs' && <SystemLogsView />}
      </main>

      {/* AI Incident Explanation Drawer */}
      <AiExplanationDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />

      {/* Status Bar Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>DPI Central Gateway: Online (Port 443)</span>
            </span>
            <span>·</span>
            <span>Zero-Downtime Edge Swarm v1.0</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>SMT Invariant Engine: Armed</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Connected</span>
            <span>·</span>
            <button
              onClick={() => setCurrentView('landing')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Landing Overview
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DpiProvider>
      <DashboardContent />
    </DpiProvider>
  );
}
