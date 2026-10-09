import React, { useEffect } from 'react';
import { CallTreeDrawer } from './components/telemetry/CallTreeDrawer';
import { CallTreeInspector } from './components/telemetry/CallTreeInspector';
import { DiagnosisCard } from './components/ai/DiagnosisCard';
import { FrameTimelineChart } from './components/telemetry/FrameTimelineChart';
import { HeaderHud } from './components/layout/HeaderHud';
import { HotspotTable } from './components/telemetry/HotspotTable';
import { SquadMatrix } from './components/telemetry/SquadMatrix';
import { Container } from './components/layout/Container';
import { useTelemetryStore } from './store/useTelemetryStore';

export const App: React.FC = () => {
  const { activeTab, tickLiveData, isEngineScanning, fetchLiveTelemetry } = useTelemetryStore();

  // Initial fetch and live simulation loop
  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(() => {
      tickLiveData();
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry, tickLiveData]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F4FC] flex flex-col relative overflow-x-hidden selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      {/* AI Engine Full Scan Animation Overlay */}
      {isEngineScanning && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-[#00E5FF]/5 backdrop-blur-[1px] flex flex-col items-center justify-center">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent animate-scan-pass" />
          <div className="absolute top-1/2 transform -translate-y-1/2 px-6 py-3 bg-[#0E1522] border border-[#00E5FF] rounded-sm text-center shadow-[0_0_30px_rgba(0,229,255,0.4)]">
            <span className="text-[#00E5FF] font-mono-numbers text-xs font-bold tracking-widest block animate-pulse">
              [AI DIAGNOSTIC ENGINE: PARSING MEMORY &amp; SYMBOL DUMPS]
            </span>
            <span className="text-[10px] text-[#8899A6] font-mono mt-1 block">
              IDENTIFYING RUNTIME ANOMALY IN ENEMYAI.CS...
            </span>
          </div>
        </div>
      )}

      {/* Top Tactical HUD Header */}
      <HeaderHud />

      {/* Main Dashboard Layout */}
      <main className="flex-1 w-full">
        <Container className="space-y-4">
          {/* Section 1: Subsystem Runtime & Squad Telemetry Matrix */}
          <section aria-label="Squad Telemetry and Subsystems">
            <SquadMatrix />
          </section>

          {/* Section 2: Oscillograph Telemetry Timeline */}
          {(activeTab === 'telemetry' || activeTab === 'squad') && (
            <section aria-label="Oscillograph Telemetry Timeline">
              <FrameTimelineChart />
            </section>
          )}

          {/* Section 3: Two-Column Lower HUD (Function Hotspots & AI Diagnosis) */}
          {(activeTab === 'telemetry' || activeTab === 'ai-studio') && (
            <section aria-label="Hotspots and AI Patch Studio" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Function Hotspot Matrix (7 cols on lg) */}
              <div className="lg:col-span-7 h-full">
                <HotspotTable />
              </div>

              {/* Right Column: AI Diagnosis & Code Patch Studio (5 cols on lg) */}
              <div className="lg:col-span-5 h-full">
                <DiagnosisCard />
              </div>
            </section>
          )}

          {/* Section 4: Frame Call-Tree Inspector */}
          {(activeTab === 'telemetry' || activeTab === 'calltree') && (
            <section aria-label="Frame Call-Tree Inspector">
              <CallTreeInspector />
            </section>
          )}
        </Container>
      </main>

      {/* Deep Call-Tree Slide-over Drawer */}
      <CallTreeDrawer />
    </div>
  );
};

export default App;
