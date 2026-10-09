import React from 'react';
import {
  AlertTriangle,
  Download,
  Layers,
  X,
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Badge } from '../common/Badge';

export const CallTreeDrawer: React.FC = () => {
  const {
    isCallTreeDrawerOpen,
    setCallTreeDrawerOpen,
    selectedFrameNumber,
    selectedTesterId,
    exportTracyTrace,
  } = useTelemetryStore();

  if (!isCallTreeDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      {/* Slide-over Container */}
      <div className="w-full max-w-2xl bg-[#0E131C] border-l border-[#1F293D] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1F293D] flex items-center justify-between bg-[#121721]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#00E5FF]/40 bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider font-mono-numbers text-[#F0F4FC]">
                  DEEP CALL-STACK INSPECTOR
                </span>
                <Badge variant="crit" size="sm">
                  FRAME #{selectedFrameNumber}
                </Badge>
              </div>
              <div className="text-[11px] font-mono text-[#8899A6] mt-0.5">
                {selectedTesterId} // 84.60ms (48.0ms over budget)
              </div>
            </div>
          </div>

          <button
            onClick={() => setCallTreeDrawerOpen(false)}
            className="p-1.5 text-[#8899A6] hover:text-[#FF3366] hover:bg-[#1A1620] rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deep Stack Summary Stats */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-[#0B0E14] border-b border-[#1F293D] font-mono-numbers text-xs">
          <div className="p-2 bg-[#121721] border border-[#1F293D] rounded-xs">
            <span className="text-[10px] text-[#8899A6] block">THREAD</span>
            <span className="text-[#FF3366] font-bold">MainThread (Unity)</span>
          </div>
          <div className="p-2 bg-[#121721] border border-[#1F293D] rounded-xs">
            <span className="text-[10px] text-[#8899A6] block">GC REALLOC</span>
            <span className="text-[#FF3366] font-bold">1,048,576 B (1.0MB)</span>
          </div>
          <div className="p-2 bg-[#121721] border border-[#1F293D] rounded-xs">
            <span className="text-[10px] text-[#8899A6] block">TOTAL SAMPLES</span>
            <span className="text-[#00E5FF] font-bold">1,420 Samples</span>
          </div>
        </div>

        {/* Detailed Flame Graph Blocks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono-numbers text-xs">
          <div className="text-[11px] text-[#8899A6] flex items-center justify-between pb-1 border-b border-[#1F293D]">
            <span>CALL HIERARCHY WITH EXECUTION TIMERS</span>
            <span className="text-[#00FFA3]">PROFILER HOOKS: INJECTED</span>
          </div>

          {/* Level 1: UnityPlayerLoop */}
          <div className="p-2.5 bg-[#121721] border border-[#1F293D] rounded-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F0F4FC]">1. UnityPlayerLoop</span>
              <span className="text-[#8899A6]">84.60 ms (100%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#0B0E14] rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#00E5FF]" />
            </div>
          </div>

          {/* Level 2: ScriptRunBehaviourUpdate */}
          <div className="ml-4 p-2.5 bg-[#161D2B] border border-[#1F293D] rounded-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F0F4FC]">
                2. Update.ScriptRunBehaviourUpdate
              </span>
              <span className="text-[#FFB020] font-bold">67.40 ms (79.6%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#0B0E14] rounded-full overflow-hidden">
              <div className="w-[79%] h-full bg-[#FFB020]" />
            </div>
          </div>

          {/* Level 3: EnemyAI.Update() - ROOT BOTTLENECK */}
          <div className="ml-8 p-3 bg-[#241119] border-2 border-[#FF3366] rounded-xs space-y-2 shadow-[0_0_15px_rgba(255,51,102,0.2)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF3366]" />
                <span className="font-bold text-[#FF3366]">3. EnemyAI.Update()</span>
              </div>
              <Badge variant="crit" size="sm">
                46.20 ms SELF
              </Badge>
            </div>
            <p className="text-[11px] text-[#E0B2BE] leading-relaxed">
              Iterates all active enemies and calls <code>FindObjectsOfType&lt;Player&gt;()</code> inside a tight loop.
            </p>
            <div className="w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden">
              <div className="w-[54%] h-full bg-[#FF3366]" />
            </div>
          </div>

          {/* Level 4: FindObjectsOfType<Player>() */}
          <div className="ml-12 p-2.5 bg-[#1C141E] border border-[#FF3366]/40 rounded-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#FF99B0]">
                4. UnityEngine.Object::FindObjectsOfType&lt;Player&gt;()
              </span>
              <span className="text-[#FF3366]">41.80 ms</span>
            </div>
            <div className="text-[10px] text-[#8899A6]">
              Called 180 times in this single frame // 1.0 MB heap churn
            </div>
          </div>

          {/* Level 3b: CombatManager.Update() */}
          <div className="ml-8 p-2.5 bg-[#121721] border border-[#1F293D] rounded-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#F0F4FC]">3b. CombatManager.Update()</span>
              <span className="text-[#8899A6]">11.00 ms (13.0%)</span>
            </div>
            <div className="w-full h-1 bg-[#0B0E14] rounded-full overflow-hidden">
              <div className="w-[13%] h-full bg-[#00FFA3]" />
            </div>
          </div>

          {/* Level 2b: Render.WaitForGPUTarget */}
          <div className="ml-4 p-2.5 bg-[#121721] border border-[#1F293D] rounded-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#F0F4FC]">2b. Render.WaitForGPUTarget</span>
              <span className="text-[#8899A6]">12.40 ms (14.6%)</span>
            </div>
            <div className="w-full h-1 bg-[#0B0E14] rounded-full overflow-hidden">
              <div className="w-[15%] h-full bg-[#00E5FF]" />
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#1F293D] bg-[#121721] flex items-center justify-between gap-3">
          <button
            onClick={exportTracyTrace}
            className="flex items-center gap-2 px-3 py-2 bg-[#0B0E14] border border-[#1F293D] hover:border-[#00E5FF] text-[#00E5FF] text-xs font-mono rounded-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CAPTURE STREAM</span>
          </button>

          <button
            onClick={() => setCallTreeDrawerOpen(false)}
            className="px-4 py-2 bg-[#1F293D] hover:bg-[#2B3A55] text-[#F0F4FC] text-xs font-mono rounded-xs transition cursor-pointer"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
