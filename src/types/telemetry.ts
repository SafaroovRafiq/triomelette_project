export type SeverityLevel = 'crit' | 'high' | 'med' | 'low' | 'stable' | 'optimal';

export interface TesterNode {
  id: string; // e.g. 'TESTER-01'
  label: string;
  hardware: string;
  pingMs: number;
  fps: number;
  frameTimeMs: number;
  state: string;
  status: SeverityLevel;
  hasSpike: boolean;
  spikeFrameId?: number;
  gpuTemp: number;
  cpuTemp: number;
  fanRpm?: string;
  memoryUsage?: string;
  sector: string;
  sparkline: number[];
}

export interface FrameSample {
  frameNumber: number;
  timestamp: string; // e.g. 't = +47.3s'
  timeOffsetSec: number;
  totalFrameMs: number;
  cpuMainMs: number;
  renderThreadMs: number;
  gpuMs: number;
  gcBytes: number;
  isSpike: boolean;
  spikeLabel?: string;
  jankFactor?: number;
}

export interface HotspotItem {
  id: string;
  rank: string; // '#01 CRIT'
  severity: SeverityLevel;
  methodSignature: string;
  assembly: string;
  nodesAffected: string; // '5 / 5'
  selfMs: number;
  totalMs: number;
  callCount: number;
  gcAllocFormatted: string;
  filePath: string;
  line: number;
  associatedDiagnosisId: string;
}

export interface AIDiagnosis {
  id: string;
  hotspotId: string;
  rootCause: string;
  tierBadge: string;
  description: string;
  fpsUplift: string;
  fpsGainPercent: string;
  timeRecoveredMs: string;
  gcScrubbed: string;
  vulnerableSource: {
    fileName: string;
    label: string;
    code: string;
  };
  proposedRefactor: {
    label: string;
    summary: string;
    code: string;
  };
}

export interface CallTreeNode {
  id: string;
  name: string;
  durationMs: number;
  selfMs?: number;
  percent: number;
  tag?: string;
  tagSeverity?: 'crit' | 'high' | 'info';
  children?: CallTreeNode[];
}

export interface SubsystemMetric {
  name: string;
  value: string;
  numericVal: number;
  maxVal: number;
  status: SeverityLevel;
}
