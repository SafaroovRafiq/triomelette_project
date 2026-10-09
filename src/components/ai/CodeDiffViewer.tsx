import React from 'react';
import { AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import type { AIDiagnosis } from '../../types/telemetry';

interface CodeDiffViewerProps {
  diagnosis: AIDiagnosis;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diagnosis }) => {
  const [copiedSide, setCopiedSide] = React.useState<'vuln' | 'patch' | null>(null);

  const handleCopy = (text: string, side: 'vuln' | 'patch') => {
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 1500);
  };

  const vulnLines = diagnosis.vulnerableSource.code.trim().split('\n');
  const patchLines = diagnosis.proposedRefactor.code.trim().split('\n');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full font-mono-numbers text-[11px]">
      {/* Vulnerable Code (Red Side) */}
      <div className="bg-[#180D12] border border-[#FF3366]/40 rounded-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#241119] px-2.5 py-1.5 border-b border-[#FF3366]/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-[#FF3366] font-bold tracking-wider">
            <AlertTriangle className="w-3 h-3" />
            <span className="truncate">{diagnosis.vulnerableSource.label}</span>
          </div>
          <button
            onClick={() => handleCopy(diagnosis.vulnerableSource.code, 'vuln')}
            className="text-[#8899A6] hover:text-[#FF3366] transition cursor-pointer p-0.5"
            title="Copy snippet"
          >
            {copiedSide === 'vuln' ? (
              <span className="text-[#00FFA3] text-[9px]">COPIED</span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-2 overflow-x-auto text-[#FF99B0] leading-relaxed">
          <pre className="font-mono text-[11px] leading-5">
            {vulnLines.map((line, i) => (
              <div key={i} className="flex gap-2 hover:bg-[#FF3366]/10 px-1 rounded-xs">
                <span className="text-[#FF3366]/40 select-none w-5 text-right font-mono text-[10px]">
                  {i + 49}
                </span>
                <span className={line.includes('FindObjectsOfType') ? 'text-[#FF3366] font-bold bg-[#FF3366]/20 px-1 rounded' : ''}>
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Proposed Refactor (Green Side) */}
      <div className="bg-[#0C1A14] border border-[#00FFA3]/40 rounded-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#12241C] px-2.5 py-1.5 border-b border-[#00FFA3]/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-[#00FFA3] font-bold tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span className="truncate">{diagnosis.proposedRefactor.label}</span>
          </div>
          <button
            onClick={() => handleCopy(diagnosis.proposedRefactor.code, 'patch')}
            className="text-[#8899A6] hover:text-[#00FFA3] transition cursor-pointer p-0.5"
            title="Copy refactor"
          >
            {copiedSide === 'patch' ? (
              <span className="text-[#00FFA3] text-[9px]">COPIED</span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-2 overflow-x-auto text-[#99FFE0] leading-relaxed">
          <pre className="font-mono text-[11px] leading-5">
            {patchLines.map((line, i) => (
              <div key={i} className="flex gap-2 hover:bg-[#00FFA3]/10 px-1 rounded-xs">
                <span className="text-[#00FFA3]/40 select-none w-5 text-right font-mono text-[10px]">
                  {i + 49}
                </span>
                <span className={line.includes('PlayerRegistry') || line.includes('s_Buf') ? 'text-[#00FFA3] font-bold bg-[#00FFA3]/20 px-1 rounded' : ''}>
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
