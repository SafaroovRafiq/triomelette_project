import React from 'react';
import { ArrowDownWideNarrow, RefreshCw, Terminal } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Badge } from '../common/Badge';

export const HotspotTable: React.FC = () => {
  const {
    hotspots,
    selectedHotspotId,
    setSelectedHotspot,
    resortHotspots,
  } = useTelemetryStore();

  const maxSelfMs = Math.max(...hotspots.map((h) => h.selfMs), 50);

  return (
    <div className="w-full hud-panel border border-[#1F293D] rounded-sm bg-[#121721]/95 flex flex-col justify-between h-full">
      {/* Table Header Controls */}
      <div>
        <div className="p-3 border-b border-[#1F293D] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF3366] shadow-[0_0_6px_#FF3366]" />
            <h2 className="text-xs md:text-sm font-bold text-[#F0F4FC] tracking-wider font-mono-numbers m-0">
              FUNCTION HOTSPOT MATRIX
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono-numbers">
            <span className="text-[#FF3366] font-semibold flex items-center gap-1">
              <ArrowDownWideNarrow className="w-3 h-3" />
              SORT: SELFMS (DESC)
            </span>
            <span className="text-[#52637A]">|</span>
            <span className="text-[#8899A6]">CAPTURE: 180 FRAMES</span>
            <button
              onClick={resortHotspots}
              title="Re-sort hotspots"
              className="p-1 text-[#8899A6] hover:text-[#00E5FF] hover:bg-[#182030] rounded border border-[#1F293D] transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Hotspot Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-numbers text-xs">
            <thead>
              <tr className="border-b border-[#1F293D] bg-[#0E121A]/60 text-[10px] text-[#52637A] uppercase tracking-wider">
                <th className="py-2 px-3 w-24">RANK</th>
                <th className="py-2 px-3">METHOD SIGNATURE</th>
                <th className="py-2 px-3 w-20 text-center">NODES</th>
                <th className="py-2 px-3 w-36 text-right">SELF (MS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2333]">
              {hotspots.map((item) => {
                const isSelected = selectedHotspotId === item.id;
                const percent = Math.min(100, Math.max(5, (item.selfMs / maxSelfMs) * 100));

                let barColor = 'bg-[#00FFA3]';
                if (item.severity === 'crit') barColor = 'bg-[#FF3366] shadow-[0_0_8px_#FF3366]';
                else if (item.severity === 'high') barColor = 'bg-[#FFB020]';
                else if (item.severity === 'med' || item.severity === 'low')
                  barColor = 'bg-[#00E5FF]';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedHotspot(item.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#0E1724] border-l-2 border-[#00E5FF]'
                        : 'hover:bg-[#161D2B]/80'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-2.5 px-3">
                      <Badge variant={item.severity} size="sm">
                        {item.rank}
                      </Badge>
                    </td>

                    {/* Method Signature & Assembly */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#F0F4FC] group-hover:text-[#00E5FF] transition-colors truncate max-w-[280px] sm:max-w-[340px]">
                        {item.methodSignature}
                      </div>
                      <div className="text-[10px] text-[#8899A6] truncate font-mono mt-0.5">
                        {item.assembly}
                      </div>
                    </td>

                    {/* Nodes Affected */}
                    <td className="py-2.5 px-3 text-center text-[#8899A6]">
                      <span className={item.nodesAffected === '5 / 5' ? 'text-[#FF3366] font-bold' : ''}>
                        {item.nodesAffected}
                      </span>
                    </td>

                    {/* Self Time & Visual Bar */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-[#F0F4FC]">
                          {item.selfMs.toFixed(1)} <span className="text-[10px] font-normal text-[#8899A6]">ms</span>
                        </span>
                        <div className="w-14 h-2 bg-[#0B0E14] border border-[#1F293D] rounded-xs overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Meta & Buffers */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0E121A]/80 text-[10px] font-mono-numbers space-y-1.5">
        <div className="flex items-center justify-between text-[#52637A] flex-wrap gap-2">
          <span>GC ALLOC THRESHOLD: &gt;100 KB = HIGH</span>
          <span>CALL FREQ HAZARD: &gt;100/FRAME</span>
          <span className="text-[#00FFA3]">PROFILER IPC: READY FOR ZERO-OVERHEAD HOOKS</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#182030] text-[#8899A6]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[#00E5FF]" />
            <span>BUFFER MEMORY 1.42 GB / 4.00 GB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00FFA3]" />
            <span className="text-[#F0F4FC] font-semibold">AI WATCHDOG DAEMON V3.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
