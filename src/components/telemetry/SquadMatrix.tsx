import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { StatusBeacon } from '../common/StatusBeacon';

export const SquadMatrix: React.FC = () => {
  const {
    testers,
    selectedTesterId,
    setSelectedTester,
    subsystems,
    jumpToSpike,
  } = useTelemetryStore();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 w-full">
      {/* Subsystem Runtime Strip (Left, 3 cols on xl) */}
      <div className="xl:col-span-3 hud-panel p-3 flex flex-col justify-between border border-[#1F293D] rounded-sm bg-[#121721]/90">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F293D]/80">
            <span className="text-xs font-bold text-[#F0F4FC] tracking-wider font-mono-numbers">
              [SUBSYSTEM RUNTIME]
            </span>
            <div className="flex items-center gap-1.5">
              <StatusBeacon color="emerald" size="sm" />
              <span className="text-[10px] text-[#00FFA3] font-mono-numbers font-semibold">
                ONLINE
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {subsystems.map((sub) => {
              const isCrit = sub.status === 'crit';
              const isWarn = sub.status === 'med';
              const isStable = sub.status === 'stable';

              let barColor = 'bg-[#00FFA3]';
              let textColor = 'text-[#00FFA3]';
              if (isCrit) {
                barColor = 'bg-[#FF3366] shadow-[0_0_8px_#FF3366]';
                textColor = 'text-[#FF3366]';
              } else if (isWarn) {
                barColor = 'bg-[#FFB020]';
                textColor = 'text-[#FFB020]';
              } else if (isStable) {
                barColor = 'bg-[#00FFA3]';
                textColor = 'text-[#00FFA3]';
              } else {
                barColor = 'bg-[#00E5FF]';
                textColor = 'text-[#00E5FF]';
              }

              const fillPercent = Math.min(100, Math.max(10, (sub.numericVal / sub.maxVal) * 100));

              return (
                <div key={sub.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                    <span className="text-[#8899A6] tracking-wide">{sub.name}</span>
                    <span className={`font-bold ${textColor}`}>{sub.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0B0E14] border border-[#1F293D] overflow-hidden rounded-xs">
                    <div
                      className={`h-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1F293D]/60 flex items-center justify-between text-[10px] font-mono-numbers text-[#52637A]">
          <span>BUDGET CEILING: 33.3ms</span>
          <span className="text-[#00E5FF]">DELTA SYNC: OK</span>
        </div>
      </div>

      {/* Squad Telemetry Matrix (Right, 9 cols on xl) */}
      <div className="xl:col-span-9 hud-panel p-3 border border-[#1F293D] rounded-sm bg-[#121721]/90 flex flex-col justify-between">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-[#1F293D]/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00E5FF]" />
            <span className="text-xs font-bold text-[#F0F4FC] tracking-wider font-mono-numbers">
              QUADRANT 01 // SQUAD TELEMETRY MATRIX
            </span>
            <span className="text-[10px] text-[#52637A] font-mono">SYNC_RATE: 120Hz</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono-numbers">
            <span className="text-[#00FFA3]">5/5 ACTIVE TELEMETRY STREAMS</span>
            <span className="text-[#52637A]">|</span>
            <span className="text-[#FF3366] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-ping" />
              1 NODE OVERBUDGET (&gt;33.3ms)
            </span>
          </div>
        </div>

        {/* 5 Tester Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {testers.map((tester) => {
            const isSelected = selectedTesterId === tester.id;
            const isCrit = tester.status === 'crit' || tester.hasSpike;
            const isHigh = tester.status === 'high';
            const isOptimal = tester.status === 'optimal';

            let cardBorder = 'border-[#1F293D] hover:border-[#2D3A52]';
            let fpsColor = 'text-[#00FFA3]';
            let stateColor = 'text-[#00FFA3]';

            if (isCrit) {
              cardBorder = isSelected
                ? 'border-[#FF3366] shadow-[0_0_15px_rgba(255,51,102,0.35)] bg-[#1A0F15]'
                : 'border-[#FF3366]/60 bg-[#160D12] hover:border-[#FF3366]';
              fpsColor = 'text-[#FF3366]';
              stateColor = 'text-[#FF3366]';
            } else if (isHigh) {
              cardBorder = isSelected
                ? 'border-[#FFB020] shadow-[0_0_12px_rgba(255,176,32,0.25)] bg-[#171410]'
                : 'border-[#FFB020]/40 hover:border-[#FFB020] bg-[#121721]';
              fpsColor = 'text-[#FFB020]';
              stateColor = 'text-[#FFB020]';
            } else if (isSelected) {
              cardBorder =
                'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)] bg-[#0E1724]';
            }

            return (
              <div
                key={tester.id}
                onClick={() => setSelectedTester(tester.id)}
                className={`relative p-2.5 rounded-sm border transition-all cursor-pointer flex flex-col justify-between ${cardBorder}`}
              >
                {/* Crit Spike Floating Banner on Tester-02 */}
                {tester.hasSpike && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToSpike(tester.spikeFrameId || 14208);
                    }}
                    className="absolute -top-2 right-1 px-1.5 py-0.2 bg-[#FF3366] text-[#0B0E14] text-[9px] font-bold font-mono-numbers uppercase tracking-wider chamfer-sm animate-pulse shadow-[0_0_8px_#FF3366] hover:brightness-125"
                  >
                    CRIT SPIKE
                  </div>
                )}

                {/* Top Row: Tester Name & Ping */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <div className="flex items-center gap-1 font-bold text-[#F0F4FC]">
                      {isCrit && <AlertOctagon className="w-3.5 h-3.5 text-[#FF3366]" />}
                      <span>{tester.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded border font-mono ${
                        isCrit
                          ? 'border-[#FF3366]/40 text-[#FF3366] bg-[#FF3366]/10'
                          : 'border-[#00FFA3]/40 text-[#00FFA3] bg-[#00FFA3]/10'
                      }`}
                    >
                      {tester.pingMs}ms PING
                    </span>
                  </div>

                  {/* Rig Hardware Details */}
                  <div className="text-[9px] font-mono text-[#52637A] truncate mt-0.5" title={tester.hardware}>
                    {tester.hardware}
                  </div>
                </div>

                {/* Middle: Big FPS & Frame Time */}
                <div className="my-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold font-mono-numbers tracking-tight ${fpsColor}`}>
                      {tester.fps.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-mono-numbers text-[#8899A6]">FPS</span>
                  </div>
                  <div className="text-[10px] font-mono-numbers text-[#8899A6] flex items-center justify-between">
                    <span>// {tester.frameTimeMs.toFixed(1)}ms</span>
                    {isCrit && <span className="text-[#FF3366] font-bold tracking-wider">JANK</span>}
                    {isOptimal && <span className="text-[#00FFA3] font-bold tracking-wider">LOCKED</span>}
                  </div>

                  {/* Play State Pill */}
                  <div className={`text-[10px] font-mono-numbers tracking-wide mt-1 truncate ${stateColor}`}>
                    {tester.state}
                  </div>
                </div>

                {/* Hardware Telemetry & Sector */}
                <div>
                  <div className="text-[9px] font-mono-numbers text-[#8899A6] flex items-center justify-between pt-1 border-t border-[#1F293D]/60">
                    <div className="flex items-center gap-1">
                      <span>
                        {tester.id === 'TESTER-04'
                          ? 'APU'
                          : tester.id === 'TESTER-03'
                          ? 'SOC'
                          : 'GPU'}
                        : {tester.gpuTemp}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>
                        {tester.id === 'TESTER-04'
                          ? `MEM: ${tester.memoryUsage}`
                          : tester.id === 'TESTER-03'
                          ? `FAN: ${tester.fanRpm}`
                          : `CPU: ${tester.cpuTemp}°C`}
                      </span>
                      {isCrit && <span className="text-[#FF3366] font-bold">! !</span>}
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-[#52637A] truncate mt-0.5">
                    {tester.sector}
                  </div>

                  {/* Mini Sparkline SVG */}
                  <div className="h-4 w-full mt-1.5 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={isCrit ? '#FF3366' : isHigh ? '#FFB020' : '#00FFA3'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={tester.sparkline
                          .map((val, idx) => {
                            const x = (idx / (tester.sparkline.length - 1)) * 100;
                            // Map 10ms-90ms to Y 18-2
                            const clamped = Math.max(10, Math.min(90, val));
                            const y = 20 - ((clamped - 10) / 80) * 18;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
