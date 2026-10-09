export interface TesterInfoDto {
  tester: string;
  lastSeen: string;
  lastFps: number;
  spikeCount: number;
}

export interface SourceRefDto {
  file: string;
  startLine: number;
  code: string;
}

export interface HotspotDto {
  key: string;
  testers: number;
  spikeFrames: number;
  avgSelfMs: number;
  maxSelfMs: number;
  avgCalls: number;
  avgGcBytes: number;
  frameShare: number;
  source: SourceRefDto | null;
}

export interface HotspotResponseDto {
  updatedAt: string;
  hotspots: HotspotDto[];
}

export interface FindingDto {
  id: number;
  key: string;
  severity: 'crit' | 'high' | 'med' | 'low' | 'stable' | string;
  file: string;
  line: number;
  evidence: string;
  cause: string;
  fix: string;
  fixedCode: string;
  estimatedGainMs: number;
}

export interface ReportDto {
  generatedAt: string;
  summary: string;
  findings: FindingDto[];
}

export interface SummaryDto {
  frames: number;
  spikeFrames: number;
  avgMs: number;
  p95Ms: number;
  maxMs: number;
}

export interface SampleDto {
  name: string;
  key: string;
  path: string;
  selfMs: number;
  totalMs: number;
  calls: number;
  gcBytes: number;
  isScript: boolean;
}

export interface SourceDto {
  key: string;
  file: string;
  startLine: number;
  code: string;
}

export interface PerfEventDto {
  type: string;
  tester: string;
  sessionId: string;
  label: string;
  capturedAt: string;
  frameIndex: number;
  totalFrameMs: number;
  playerLoopMs: number;
  thresholdMs: number;
  summary?: SummaryDto;
  samples?: SampleDto[];
  sources?: SourceDto[];
}
