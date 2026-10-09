import React from 'react';
import {
  Check,
  GitCompare,
  Loader2,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Badge } from '../common/Badge';
import { CodeDiffViewer } from './CodeDiffViewer';

export const DiagnosisCard: React.FC = () => {
  const {
    diagnoses,
    selectedHotspotId,
    pushPatchToUnity,
    patchPushed,
    patchPushing,
    isSimulatingBudget,
    toggleSimulateBudget,
    isABBenchmarking,
    toggleABBenchmark,
  } = useTelemetryStore();

  // Pick diagnosis matching selected hotspot, or default to enemyai
  const diagnosis =
    selectedHotspotId === 'hotspot-2'
      ? diagnoses['diag-physics']
      : selectedHotspotId === 'hotspot-3'
      ? diagnoses['diag-combat']
      : diagnoses['diag-enemyai'] || diagnoses['diag-enemyai'];

  return (
    <div className="w-full hud-panel border border-[#1F293D] rounded-sm bg-[#121721]/95 flex flex-col justify-between h-full">
      {/* Panel Header */}
      <div>
        <div className="p-3 border-b border-[#1F293D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]" />
            <h2 className="text-xs md:text-sm font-bold text-[#F0F4FC] tracking-wider font-mono-numbers m-0">
              AI DIAGNOSIS & CODE PATCH STUDIO
            </h2>
          </div>
          <Badge variant="active" size="sm" pulsing>
            AGENT: ACTIVE
          </Badge>
        </div>

        <div className="p-3 space-y-3">
          {/* Identified Root Cause Box */}
          <div className="p-2.5 rounded-sm bg-[#171017] border border-[#FF3366]/40 shadow-[0_0_12px_rgba(255,51,102,0.1)]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF3366] font-mono-numbers tracking-wide">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>IDENTIFIED ROOT CAUSE: {diagnosis.rootCause}</span>
              </div>
              <Badge variant="crit" size="sm" className="shrink-0">
                {diagnosis.tierBadge}
              </Badge>
            </div>
            <p className="text-[11px] text-[#AAB8C2] mt-1.5 leading-relaxed font-mono">
              {diagnosis.description}
            </p>
          </div>

          {/* Uplift Metrics 3-Col Grid */}
          <div className="grid grid-cols-3 gap-2 font-mono-numbers">
            {/* FPS Uplift */}
            <div className="p-2 bg-[#0C1A14] border border-[#00FFA3]/30 rounded-sm">
              <div className="text-[10px] text-[#8899A6] tracking-wider uppercase">FPS UPLIFT</div>
              <div className="text-lg md:text-xl font-bold text-[#00FFA3] leading-tight">
                {diagnosis.fpsUplift}
              </div>
              <div className="text-[10px] text-[#00FFA3]/80 font-semibold">
                {diagnosis.fpsGainPercent}
              </div>
            </div>

            {/* Time Recovered */}
            <div className="p-2 bg-[#0A1824] border border-[#00E5FF]/30 rounded-sm">
              <div className="text-[10px] text-[#8899A6] tracking-wider uppercase">
                TIME RECOVERED
              </div>
              <div className="text-lg md:text-xl font-bold text-[#00E5FF] leading-tight">
                {diagnosis.timeRecoveredMs}
              </div>
              <div className="text-[10px] text-[#00E5FF]/80">CPU Main Budget</div>
            </div>

            {/* GC Scrubbed */}
            <div className="p-2 bg-[#1A1810] border border-[#FFB020]/30 rounded-sm">
              <div className="text-[10px] text-[#8899A6] tracking-wider uppercase">GC SCRUBBED</div>
              <div className="text-lg md:text-xl font-bold text-[#FFB020] leading-tight">
                {diagnosis.gcScrubbed}
              </div>
              <div className="text-[10px] text-[#FFB020]/80">Per Tick (Zero Alloc)</div>
            </div>
          </div>

          {/* Code Diff Viewer */}
          <CodeDiffViewer diagnosis={diagnosis} />

          {/* A/B Benchmark Inline Drawer/Comparison if toggled */}
          {isABBenchmarking && (
            <div className="p-2.5 bg-[#0E1522] border border-[#00E5FF]/50 rounded-sm text-xs font-mono-numbers space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-[#00E5FF] font-bold">
                <span className="flex items-center gap-1.5">
                  <GitCompare className="w-3.5 h-3.5" />
                  A/B RUNTIME BENCHMARK TELEMETRY
                </span>
                <span className="text-[10px] text-[#8899A6]">DELTA PROJECTION</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-[#1F293D]">
                <div className="space-y-1">
                  <span className="text-[#FF3366] font-bold">[A] VULNERABLE RUNTIME</span>
                  <div>Frame Latency: <span className="text-[#F0F4FC] font-semibold">84.6 ms</span></div>
                  <div>Main Thread: <span className="text-[#FF3366]">68.2 ms (80.6%)</span></div>
                  <div>GC Allocation: <span className="text-[#FF3366]">1.0 MB / tick</span></div>
                </div>
                <div className="space-y-1 border-l border-[#1F293D] pl-3">
                  <span className="text-[#00FFA3] font-bold">[B] COMPILED REFACTOR</span>
                  <div>Frame Latency: <span className="text-[#00FFA3] font-semibold">16.6 ms (Target Met)</span></div>
                  <div>Main Thread: <span className="text-[#00FFA3]">12.2 ms (-56.0 ms)</span></div>
                  <div>GC Allocation: <span className="text-[#00FFA3]">0 KB (Zero-Alloc)</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0E121A]/80 space-y-2 font-mono-numbers">
        {/* Big Push Patch CTA */}
        <button
          onClick={pushPatchToUnity}
          disabled={patchPushing}
          className={`w-full py-2.5 px-4 font-bold text-xs uppercase tracking-widest chamfer-btn transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            patchPushed
              ? 'bg-[#00FFA3] text-[#0B0E14] shadow-[0_0_20px_#00FFA3]'
              : patchPushing
              ? 'bg-[#00E5FF]/80 text-[#0B0E14] cursor-wait'
              : 'bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] text-[#0B0E14] hover:shadow-[0_0_20px_rgba(0,255,163,0.6)] hover:brightness-110 active:scale-[0.99]'
          }`}
        >
          {patchPushing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#0B0E14]" />
              <span>DISPATCHING IPC PACKET TO UNITY ENGINE...</span>
            </>
          ) : patchPushed ? (
            <>
              <Check className="w-4 h-4 text-[#0B0E14] stroke-[3]" />
              <span>PATCH DEPLOYED TO UNITY EDITOR (PORT 8089 - HOT RELOAD OK)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#0B0E14] fill-[#0B0E14]" />
              <span>PUSH PATCH TO UNITY EDITOR (IPC PORT 8089)</span>
            </>
          )}
        </button>

        {/* Secondary simulation & benchmark buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={toggleSimulateBudget}
            className={`py-1.5 px-2 border rounded-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isSimulatingBudget
                ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                : 'bg-[#121721] border-[#1F293D] text-[#8899A6] hover:text-[#F0F4FC] hover:border-[#2D3A52]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isSimulatingBudget ? 'EXIT SIMULATION' : 'SIMULATE BUDGET'}</span>
          </button>

          <button
            onClick={toggleABBenchmark}
            className={`py-1.5 px-2 border rounded-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isABBenchmarking
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : 'bg-[#121721] border-[#1F293D] text-[#8899A6] hover:text-[#F0F4FC] hover:border-[#2D3A52]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isABBenchmarking ? 'HIDE BENCHMARK' : 'A/B BENCHMARK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
