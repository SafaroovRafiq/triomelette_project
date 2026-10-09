import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import type { NavTab } from '../../store/useTelemetryStore';
import { StatusBeacon } from '../common/StatusBeacon';

export const HeaderHud: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    runAIDiagnosticEngine,
    isEngineScanning,
    pingMs,
    ipcConnected,
    jumpToSpike,
  } = useTelemetryStore();

  const [utcTime, setUtcTime] = useState('');

  // Clock with milliseconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
      setUtcTime(`${hours}:${mins}:${secs}.${ms} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 50);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'telemetry', label: 'TELEMETRY COMMAND & BOTTLENECK MATRIX' },
    { id: 'squad', label: 'SQUAD SESSIONS (5)' },
    { id: 'ai-studio', label: 'AI PATCH DIFF STUDIO' },
    { id: 'calltree', label: 'FRAME CALL-TREE INSPECTOR' },
  ];

  return (
    <header className="w-full bg-[#0B0E14] border-b border-[#1F293D] select-none">
      {/* Top Main Status Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-[#182030]">
        {/* Left: Branding & WebSocket IPC indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded border border-[#00E5FF]/50 bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm md:text-base font-bold tracking-wider">
                <span className="text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
                  PROFILERAI
                </span>
                <span className="text-[#52637A]">//</span>
                <span className="text-[#F0F4FC] tracking-widest text-xs md:text-sm font-semibold">
                  TACTICAL TELEMETRY HUD
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#8899A6] font-mono-numbers mt-0.5">
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[#121721] border border-[#1F293D] rounded-sm">
                  <StatusBeacon
                    color={ipcConnected ? 'cyan' : 'crimson'}
                    size="sm"
                    pulse={ipcConnected}
                  />
                  <span>
                    LIVE WEBSOCKET: {ipcConnected ? 'CONNECTED' : 'STANDBY'} (PORT 8089 - UNITY IPC)
                  </span>
                </div>
                <span className="text-[#00FFA3] font-mono">[{pingMs}ms ping]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Stat Badges from Mockup */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          {/* Target 60 FPS Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FFA3]/5 border border-[#00FFA3]/50 text-[#00FFA3] rounded-sm text-xs font-mono-numbers tracking-wider shadow-[0_0_10px_rgba(0,255,163,0.15)]">
            <span className="w-1.5 h-1.5 bg-[#00FFA3] inline-block shadow-[0_0_4px_#00FFA3]" />
            <span className="font-semibold">TARGET: 60 FPS</span>
            <span className="text-[#00FFA3]/70">// 16.6ms</span>
          </div>

          {/* Crit Spike Alert Badge (Clickable jump to spike) */}
          <button
            onClick={() => jumpToSpike(14208)}
            title="Click to jump to Frame #14208"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FF3366]/15 border border-[#FF3366] text-[#FF3366] rounded-sm text-xs font-mono-numbers tracking-wider shadow-[0_0_12px_rgba(255,51,102,0.3)] animate-pulse hover:bg-[#FF3366]/25 transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-bold">CRIT SPIKE: 11.8 FPS</span>
            <span className="text-[#FF3366]/80">// 84.6ms</span>
          </button>

          {/* Active Nodes Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#121721] border border-[#1F293D] text-[#8899A6] rounded-sm text-xs font-mono-numbers tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#00E5FF] inline-block" />
            <span className="text-[#F0F4FC]">NODES: 5 ACTIVE</span>
          </div>

          {/* Threshold & Profile Mode */}
          <div className="hidden lg:flex flex-col text-[10px] font-mono-numbers text-[#52637A] border-l border-[#1F293D] pl-3 leading-tight">
            <span>
              THRESHOLD: <strong className="text-[#8899A6]">&gt;33.3MS</strong>
            </span>
            <span>
              DEEP PROFILE: <strong className="text-[#00FFA3]">OFF [SAFE]</strong>
            </span>
          </div>
        </div>

        {/* Right: AI Engine CTA & User Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={runAIDiagnosticEngine}
            disabled={isEngineScanning}
            className={`relative group px-4 py-2 font-bold text-xs uppercase tracking-widest text-[#0B0E14] bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] border border-[#00FFA3] chamfer-btn transition duration-200 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,163,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:brightness-110 active:scale-95 cursor-pointer ${
              isEngineScanning ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isEngineScanning ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-[#0B0E14]" />
                <span>ANALYZING FRAME #14208...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#0B0E14] animate-bounce" />
                <span>RUN AI DIAGNOSTIC ENGINE</span>
              </>
            )}
          </button>

          <div className="w-8 h-8 rounded border border-[#1F293D] bg-[#121721] flex items-center justify-center text-[#8899A6] hover:text-[#00E5FF] hover:border-[#00E5FF]/50 transition cursor-pointer relative">
            <User className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_5px_#00FFA3]" />
          </div>
        </div>
      </div>

      {/* Sub-Header Navigation Tabs & Clock */}
      <div className="px-4 flex items-center justify-between gap-4 overflow-x-auto text-xs font-mono-numbers border-b border-[#182030] bg-[#0E121A]/60">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 shrink-0">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#00E5FF] bg-[#00E5FF]/10 shadow-[inset_0_-2px_0_#00E5FF]'
                    : 'text-[#8899A6] hover:text-[#F0F4FC] hover:bg-[#121721]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Metadata: Quadrant Sync & Real-time UTC Milliseconds Clock */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-[#8899A6] shrink-0 py-1.5 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#52637A]">QUADRANT_SYNC:</span>
            <span className="text-[#00FFA3] font-bold">04/04</span>
          </div>
          <div className="w-[1px] h-3 bg-[#1F293D]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#52637A]">SYS_CLOCK:</span>
            <span className="text-[#00E5FF] font-semibold">{utcTime || '14:02:49.082 UTC'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
