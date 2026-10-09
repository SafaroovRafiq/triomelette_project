import React, { useState } from 'react';
import {
  Crosshair,
  Filter,
  Pause,
  Play,
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

export const FrameTimelineChart: React.FC = () => {
  const {
    timelineFrames,
    selectedFrameNumber,
    setSelectedFrame,
    selectedTesterId,
    isLive,
    toggleLive,
    timeWindow,
    setTimeWindow,
    filterSpikesOnly,
    toggleFilterSpikes,
    jumpToSpike,
    isSimulatingBudget,
  } = useTelemetryStore();

  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);

  // Selected frame data or fallback
  const activeFrame =
    timelineFrames.find((f) => f.frameNumber === selectedFrameNumber) ||
    timelineFrames.find((f) => f.isSpike) ||
    timelineFrames[timelineFrames.length - 1];

  // SVG Chart Dimensions
  const svgWidth = 1000;
  const svgHeight = 260;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max scale in ms (100ms ceiling)
  const maxMs = 100;
  const target60Ms = 16.6;
  const target30Ms = 33.3;
  const critCeilingMs = 84.6;

  // Coordinate mapping
  const getY = (ms: number) => {
    const clamped = Math.max(0, Math.min(maxMs, ms));
    return paddingTop + chartHeight - (clamped / maxMs) * chartHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (timelineFrames.length - 1)) * chartWidth;
  };

  const y0 = getY(0);
  const y16 = getY(target60Ms);
  const y33 = getY(target30Ms);
  const y84 = getY(critCeilingMs);
  const y100 = getY(100);

  // Path generator
  const points = timelineFrames.map((f, i) => {
    // If budget simulation is active, show the predicted flattened curve
    const displayMs = isSimulatingBudget && f.isSpike ? 16.8 : f.totalFrameMs;
    return {
      x: getX(i),
      y: getY(displayMs),
      frame: f,
    };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${y0} L ${points[0].x} ${y0} Z`;

  // Find spike point for callout
  const spikePoint = points.find((p) => p.frame.isSpike) || points[Math.floor(points.length / 2)];

  return (
    <div className="w-full hud-panel border border-[#1F293D] rounded-sm bg-[#121721]/95 flex flex-col">
      {/* Top Header / Control Bar */}
      <div className="p-3 border-b border-[#1F293D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
          <span className="text-xs md:text-sm font-bold text-[#F0F4FC] tracking-wider font-mono-numbers">
            OSCILLOGRAPH TELEMETRY TIMELINE
          </span>
          <span className="text-[11px] font-mono text-[#8899A6] border-l border-[#1F293D] pl-2">
            WINDOW: FRAMES #{timelineFrames[0]?.frameNumber || 14150} -&gt; #
            {timelineFrames[timelineFrames.length - 1]?.frameNumber || 14280} // {selectedTesterId} STREAM
          </span>
          {isSimulatingBudget && (
            <span className="px-2 py-0.5 text-[10px] bg-[#00FFA3]/20 border border-[#00FFA3] text-[#00FFA3] rounded-xs font-mono animate-pulse">
              [AI ZERO-ALLOC PREDICTION ACTIVE]
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono-numbers">
          {/* Time Window Tabs */}
          <div className="flex items-center bg-[#0B0E14] border border-[#1F293D] rounded-xs p-0.5">
            {(['60s', '5m', 'session'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition cursor-pointer ${
                  timeWindow === win
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                    : 'text-[#8899A6] hover:text-[#F0F4FC]'
                }`}
              >
                {win === '60s' ? 'LIVE 60s' : win === '5m' ? '5 MIN' : 'FULL SESSION'}
              </button>
            ))}
          </div>

          {/* Freeze / Resume HUD */}
          <button
            onClick={toggleLive}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xs border text-[11px] font-semibold transition cursor-pointer ${
              isLive
                ? 'bg-[#121721] border-[#1F293D] text-[#8899A6] hover:text-[#F0F4FC] hover:border-[#00E5FF]'
                : 'bg-[#FFB020]/20 border-[#FFB020] text-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.3)]'
            }`}
          >
            {isLive ? <Pause className="w-3 h-3 text-[#00E5FF]" /> : <Play className="w-3 h-3" />}
            <span>{isLive ? 'FREEZE HUD' : 'RESUME HUD'}</span>
          </button>

          {/* Jump to Spike #14208 */}
          <button
            onClick={() => jumpToSpike(14208)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xs border border-[#FF3366]/60 bg-[#FF3366]/10 text-[#FF3366] text-[11px] font-semibold hover:bg-[#FF3366]/20 transition cursor-pointer shadow-[0_0_8px_rgba(255,51,102,0.2)]"
          >
            <Crosshair className="w-3 h-3 text-[#FF3366]" />
            <span>JUMP TO SPIKE #14208</span>
          </button>

          {/* Filter Spikes toggle */}
          <button
            onClick={toggleFilterSpikes}
            className={`flex items-center gap-1 px-2 py-1 rounded-xs border text-[10px] font-semibold transition cursor-pointer ${
              filterSpikesOnly
                ? 'bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF]'
                : 'bg-[#121721] border-[#1F293D] text-[#52637A]'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>FILTER: SPIKES &gt;33.3MS [{filterSpikesOnly ? 'ON' : 'OFF'}]</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="relative w-full h-[280px] bg-[#0B0E14] select-none overflow-hidden px-2 py-1">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3366" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00FFA3" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke gradient */}
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3366" />
              <stop offset="45%" stopColor="#FFB020" />
              <stop offset="70%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00FFA3" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {/* 100ms line */}
          <line
            x1={paddingLeft}
            y1={y100}
            x2={svgWidth - paddingRight}
            y2={y100}
            stroke="#1F293D"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x={paddingLeft - 8}
            y={y100 + 4}
            fill="#52637A"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            100ms
          </text>

          {/* 84.6ms Peak Ceiling Line (Glitch Crimson dashed) */}
          <line
            x1={paddingLeft}
            y1={y84}
            x2={svgWidth - paddingRight}
            y2={y84}
            stroke="#FF3366"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <text
            x={paddingLeft - 8}
            y={y84 + 4}
            fill="#FF3366"
            fontSize="10"
            fontWeight="bold"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            84.6ms
          </text>
          <text
            x={paddingLeft + 12}
            y={y84 - 6}
            fill="#FF3366"
            fontSize="9"
            fontFamily="JetBrains Mono"
            letterSpacing="0.05em"
          >
            [CRIT THRESHOLD: 84.6ms PEAK CEILING]
          </text>

          {/* 50ms line */}
          <line
            x1={paddingLeft}
            y1={getY(50)}
            x2={svgWidth - paddingRight}
            y2={getY(50)}
            stroke="#1F293D"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x={paddingLeft - 8}
            y={getY(50) + 4}
            fill="#52637A"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            50.0ms
          </text>

          {/* 33.3ms 30 FPS Budget Line (Amber dashed) */}
          <line
            x1={paddingLeft}
            y1={y33}
            x2={svgWidth - paddingRight}
            y2={y33}
            stroke="#FFB020"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.7"
          />
          <text
            x={paddingLeft - 8}
            y={y33 + 4}
            fill="#FFB020"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            33.3ms
          </text>
          <text
            x={paddingLeft + 12}
            y={y33 - 5}
            fill="#FFB020"
            fontSize="9"
            fontFamily="JetBrains Mono"
            opacity="0.8"
          >
            [30 FPS BUDGET: 33.3ms]
          </text>

          {/* 16.6ms 60 FPS Target Baseline (Emerald solid) */}
          <line
            x1={paddingLeft}
            y1={y16}
            x2={svgWidth - paddingRight}
            y2={y16}
            stroke="#00FFA3"
            strokeWidth="1.2"
            opacity="0.9"
          />
          <text
            x={paddingLeft - 8}
            y={y16 + 4}
            fill="#00FFA3"
            fontSize="10"
            fontWeight="bold"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            16.6ms
          </text>
          <text
            x={paddingLeft + 12}
            y={y16 - 5}
            fill="#00FFA3"
            fontSize="9"
            fontFamily="JetBrains Mono"
          >
            [TARGET 60 FPS: 16.6ms]
          </text>

          {/* 0.0ms line */}
          <line
            x1={paddingLeft}
            y1={y0}
            x2={svgWidth - paddingRight}
            y2={y0}
            stroke="#1F293D"
            strokeWidth="1"
          />
          <text
            x={paddingLeft - 8}
            y={y0 + 4}
            fill="#52637A"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            0.0ms
          </text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* Primary Oscillograph Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2.5"
            filter="url(#neonGlow)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Baseline stable lock indicator */}
          <text
            x={svgWidth - paddingRight - 10}
            y={y16 - 5}
            fill="#00FFA3"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
            opacity="0.9"
          >
            STABLE LOCK 16.6MS
          </text>

          {/* Spike Callout Banner and Connector */}
          {!isSimulatingBudget && spikePoint && (
            <g>
              {/* Vertical connector line */}
              <line
                x1={spikePoint.x}
                y1={spikePoint.y}
                x2={spikePoint.x}
                y2={spikePoint.y - 25}
                stroke="#FF3366"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              {/* Pulsing beacon circle at spike apex */}
              <circle
                cx={spikePoint.x}
                cy={spikePoint.y}
                r="5"
                fill="#FF3366"
                className="animate-ping opacity-75"
              />
              <circle
                cx={spikePoint.x}
                cy={spikePoint.y}
                r="4"
                fill="#FF3366"
                stroke="#F0F4FC"
                strokeWidth="1.5"
              />

              {/* Callout Pill at top of spike */}
              <g
                transform={`translate(${Math.min(
                  spikePoint.x - 140,
                  svgWidth - paddingRight - 280
                )}, ${Math.max(8, spikePoint.y - 48)})`}
                className="cursor-pointer"
                onClick={() => setSelectedFrame(14208)}
              >
                <rect
                  x="0"
                  y="0"
                  width="280"
                  height="22"
                  rx="2"
                  fill="#180C12"
                  stroke="#FF3366"
                  strokeWidth="1"
                  filter="url(#neonGlow)"
                />
                <polygon
                  points="140,22 135,16 145,16"
                  fill="#FF3366"
                />
                <text
                  x="140"
                  y="15"
                  fill="#FF3366"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  letterSpacing="0.05em"
                >
                  ◆ SPIKE: FRAME #14208 // 84.6ms // EXTREME JANK
                </text>
              </g>

              {/* Timestamp at bottom of spike */}
              <text
                x={spikePoint.x}
                y={y0 + 16}
                fill="#F0F4FC"
                fontSize="10"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                t = +47.3s
              </text>
            </g>
          )}

          {/* Interactive clickable node points */}
          {points.map((p, idx) => {
            const isSelected = p.frame.frameNumber === selectedFrameNumber;
            const isHovered = p.frame.frameNumber === hoveredFrame;
            if (!p.frame.isSpike && idx % 4 !== 0 && !isSelected) return null;

            return (
              <g key={p.frame.frameNumber} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : p.frame.isSpike ? 5 : isHovered ? 4 : 2.5}
                  fill={
                    p.frame.isSpike
                      ? '#FF3366'
                      : p.frame.totalFrameMs > 33.3
                      ? '#FFB020'
                      : '#00FFA3'
                  }
                  stroke={isSelected ? '#00E5FF' : '#0B0E14'}
                  strokeWidth="1.5"
                  onClick={() => setSelectedFrame(p.frame.frameNumber)}
                  onMouseEnter={() => setHoveredFrame(p.frame.frameNumber)}
                  onMouseLeave={() => setHoveredFrame(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Frame Tooltip */}
        {activeFrame && (
          <div className="absolute top-2 right-4 bg-[#121721]/95 border border-[#1F293D] px-2.5 py-1.5 rounded-sm text-[10px] font-mono-numbers text-[#8899A6] shadow-xl backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-2 border-b border-[#1F293D] pb-1 mb-1 font-bold">
              <span className="text-[#00E5FF]">FRAME #{activeFrame.frameNumber}</span>
              <span className="text-[#52637A]">//</span>
              <span className={activeFrame.isSpike ? 'text-[#FF3366]' : 'text-[#00FFA3]'}>
                {isSimulatingBudget && activeFrame.isSpike ? '16.8ms' : `${activeFrame.totalFrameMs}ms`}
              </span>
              <span>({activeFrame.timestamp})</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <div>
                CPU Main: <span className="text-[#F0F4FC] font-semibold">{activeFrame.cpuMainMs}ms</span>
              </div>
              <div>
                Render: <span className="text-[#F0F4FC] font-semibold">{activeFrame.renderThreadMs}ms</span>
              </div>
              <div>
                GPU: <span className="text-[#F0F4FC] font-semibold">{activeFrame.gpuMs}ms</span>
              </div>
              <div>
                GC Alloc:{' '}
                <span className={activeFrame.gcBytes > 100000 ? 'text-[#FF3366]' : 'text-[#00FFA3]'}>
                  {(activeFrame.gcBytes / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frame Budget Breakdown Footer Bar */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0E121A]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-numbers">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-[#F0F4FC] tracking-wider">
            FRAME #{activeFrame?.frameNumber || 14208} BUDGET BREAKDOWN:
          </span>

          {/* CPU Main Thread */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#FF3366]" />
            <span className="text-[#8899A6]">CPU MAIN:</span>
            <span className="text-[#FF3366] font-bold">
              {isSimulatingBudget && activeFrame?.isSpike ? '12.2ms (72.6%)' : `${activeFrame?.cpuMainMs || 68.2}ms (80.6%)`}
            </span>
          </div>

          {/* Render Thread */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#00E5FF]" />
            <span className="text-[#8899A6]">RENDER THREAD:</span>
            <span className="text-[#00E5FF] font-semibold">
              {isSimulatingBudget && activeFrame?.isSpike ? '3.1ms (18.5%)' : `${activeFrame?.renderThreadMs || 12.1}ms (14.3%)`}
            </span>
          </div>

          {/* GPU */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#00FFA3]" />
            <span className="text-[#8899A6]">GPU:</span>
            <span className="text-[#00FFA3] font-semibold">
              {isSimulatingBudget && activeFrame?.isSpike ? '1.5ms (8.9%)' : `${activeFrame?.gpuMs || 4.3}ms (5.1%)`}
            </span>
          </div>
        </div>

        {/* Jank Threshold Factor Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[#52637A] text-[11px]">JANK THRESHOLD FACTOR:</span>
          {isSimulatingBudget ? (
            <span className="px-2 py-0.5 bg-[#00FFA3]/20 border border-[#00FFA3] text-[#00FFA3] font-bold text-xs rounded-xs">
              1.0x TARGET [OPTIMAL]
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#FF3366] text-[#0B0E14] font-bold text-xs rounded-xs shadow-[0_0_8px_#FF3366]">
              5.1x TARGET
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
