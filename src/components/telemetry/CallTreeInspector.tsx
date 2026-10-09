import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Maximize2,
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import type { CallTreeNode } from '../../types/telemetry';
import { Badge } from '../common/Badge';

export const CallTreeInspector: React.FC = () => {
  const {
    callTree,
    selectedFrameNumber,
    selectedTesterId,
    exportTracyTrace,
    generateLLMFixLog,
    setCallTreeDrawerOpen,
  } = useTelemetryStore();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'node-root': true,
    'node-scripts': true,
    'node-enemy-update': true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: CallTreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const isRootBottleneck = node.tag?.includes('ROOT BOTTLENECK');
    const isHotPath = node.tag?.includes('HOT PATH');

    return (
      <div key={node.id} className="select-none font-mono-numbers text-xs">
        {/* Node Row */}
        <div
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center justify-between py-1.5 px-3 rounded-xs transition-colors cursor-pointer group ${
            isRootBottleneck
              ? 'bg-[#261017] border-l-2 border-[#FF3366] text-[#FF99B0]'
              : 'hover:bg-[#161D2B]/80 text-[#F0F4FC]'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 24 + 12)}px` }}
        >
          {/* Left: Tree line, Expand button & Method Name */}
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              <span className="w-4 h-4 flex items-center justify-center text-[#8899A6] group-hover:text-[#00E5FF]">
                {isExpanded ? (
                  <span className="text-[11px] font-mono text-[#00E5FF]">[-]</span>
                ) : (
                  <span className="text-[11px] font-mono text-[#8899A6]">[+]</span>
                )}
              </span>
            ) : (
              <span className="w-4 h-4 text-[#52637A] text-center font-mono">•</span>
            )}

            <span
              className={`font-mono text-xs ${
                isRootBottleneck
                  ? 'text-[#FF3366] font-bold'
                  : isHotPath
                  ? 'text-[#F0F4FC] font-semibold'
                  : 'text-[#C9D6E2]'
              }`}
            >
              {node.name}
            </span>

            {/* Tag Badges */}
            {node.tag && (
              <span
                className={`ml-2 px-1.5 py-0.2 rounded-xs text-[9px] font-bold tracking-wider uppercase font-mono ${
                  node.tagSeverity === 'crit' || isRootBottleneck
                    ? 'bg-[#FF3366] text-[#0B0E14]'
                    : node.tagSeverity === 'high'
                    ? 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40'
                    : 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                }`}
              >
                {node.tag}
              </span>
            )}
          </div>

          {/* Right: Duration & Percentage */}
          <div className="flex items-center gap-4 shrink-0 pl-2">
            <span
              className={`font-mono font-bold ${
                node.durationMs > 30
                  ? 'text-[#FF3366]'
                  : node.durationMs > 10
                  ? 'text-[#FFB020]'
                  : 'text-[#00FFA3]'
              }`}
            >
              {node.durationMs.toFixed(2)} ms
            </span>
            <span className="w-12 text-right text-[11px] text-[#8899A6] font-mono">
              {node.percent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="border-l border-[#1F293D]/50 ml-4">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full hud-panel border border-[#1F293D] rounded-sm bg-[#121721]/95 flex flex-col">
      {/* Header Bar */}
      <div className="p-3 border-b border-[#1F293D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF3366] shadow-[0_0_6px_#FF3366]" />
            <h2 className="text-xs md:text-sm font-bold text-[#F0F4FC] tracking-wider font-mono-numbers m-0">
              FRAME CALL-TREE INSPECTOR
            </h2>
          </div>

          <Badge variant="crit" size="sm" pulsing>
            SELECTED SPIKE: FRAME #{selectedFrameNumber} (84.6MS)
          </Badge>

          {/* Breadcrumb Path */}
          <div className="text-[10px] text-[#8899A6] font-mono hidden md:flex items-center gap-1.5 border-l border-[#1F293D] pl-3">
            <span>SESSION #002</span>
            <span className="text-[#52637A]">&gt;</span>
            <span className="text-[#00E5FF]">{selectedTesterId}</span>
            <span className="text-[#52637A]">&gt;</span>
            <span className="text-[#FF3366]">FRAME #{selectedFrameNumber}</span>
            <span className="text-[#52637A]">&gt;</span>
            <span className="text-[#F0F4FC]">ENEMYAI.UPDATE()</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 font-mono-numbers text-xs">
          <button
            onClick={exportTracyTrace}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121721] border border-[#1F293D] hover:border-[#00E5FF] text-[#8899A6] hover:text-[#00E5FF] rounded-xs text-[11px] transition cursor-pointer"
            title="Export raw Tracy Profiler capture stream"
          >
            <Download className="w-3 h-3 text-[#00E5FF]" />
            <span>EXPORT TRACY TRACE (.TRACY)</span>
          </button>

          <button
            onClick={generateLLMFixLog}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121721] border border-[#1F293D] hover:border-[#00FFA3] text-[#8899A6] hover:text-[#00FFA3] rounded-xs text-[11px] transition cursor-pointer"
            title="Download automated LLM fix report"
          >
            <FileCode className="w-3 h-3 text-[#00FFA3]" />
            <span>GENERATE LLM FIX LOG</span>
          </button>

          <button
            onClick={() => setCallTreeDrawerOpen(true)}
            className="p-1 text-[#8899A6] hover:text-[#00E5FF] hover:bg-[#182030] rounded border border-[#1F293D] transition cursor-pointer"
            title="Open Fullscreen Call-Tree Drawer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Hierarchical Tree Body */}
      <div className="p-3 bg-[#0B0E14] overflow-x-auto min-h-[160px] divide-y divide-transparent">
        {renderNode(callTree)}
      </div>

      {/* Inspector Technical Metadata Footer */}
      <div className="p-2.5 border-t border-[#1F293D] bg-[#0E121A]/90 flex flex-wrap items-center justify-between text-[10px] font-mono-numbers text-[#52637A] gap-2">
        <div className="flex items-center gap-4">
          <span>SAMPLING FREQUENCY: 1,201,000 SAMPLES/SEC</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">SYMBOL RESOLUTION: PDB / DWARF EMBEDDED</span>
        </div>
        <div className="text-[#00FFA3] font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_5px_#00FFA3]" />
          <span>DAEMON STATE: READY FOR ZERO-OVERHEAD LIVE PROFILE INJECTION</span>
        </div>
      </div>
    </div>
  );
};
