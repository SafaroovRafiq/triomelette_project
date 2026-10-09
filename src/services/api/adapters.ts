import type {
  HotspotDto,
  ReportDto,
  TesterInfoDto,
} from '../../types/backendDto';
import type {
  AIDiagnosis,
  HotspotItem,
  SeverityLevel,
  TesterNode,
} from '../../types/telemetry';

const HARDWARE_PRESETS = [
  'RIG-RTX4080 // i9-13900K',
  'LAPTOP-G2 // GTX 1660 Ti',
  'STEAMDECK-OLED // AMD APU',
  'PS5-DEV-KIT // CUSTOM RDNA2',
  'RIG-RX7900XTX // 7800X3D',
];

const SECTOR_PRESETS = [
  'SECTOR_07',
  'ARENA_WAVE_3',
  'OUTPOST_ALPHA',
  'TITLE_LOBBY',
  'FOREST_SECTOR',
];

export function mapTesterDtoToTesterNode(dto: TesterInfoDto, index: number): TesterNode {
  const isJank = dto.lastFps < 25 || dto.spikeCount > 0;
  const frameTimeMs = +(1000 / Math.max(1, dto.lastFps)).toFixed(1);
  const status: SeverityLevel = dto.lastFps < 20 ? 'crit' : dto.lastFps < 45 ? 'high' : 'stable';

  // Generate realistic sparkline around the FPS
  const sparkline = Array.from({ length: 12 }, (_, i) => {
    if (isJank && (i === 5 || i === 6)) return Math.min(95, frameTimeMs);
    const variance = (Math.sin(i) * 1.5);
    return Math.max(12, +(frameTimeMs + variance).toFixed(1));
  });

  return {
    id: dto.tester.toUpperCase(),
    label: dto.tester.toUpperCase(),
    hardware: HARDWARE_PRESETS[index % HARDWARE_PRESETS.length],
    pingMs: Math.max(3, 4 + index * 4),
    fps: dto.lastFps,
    frameTimeMs,
    state: isJank ? `[ENEMY WAVE 03 // ${dto.spikeCount} SPIKES]` : '[COMBAT // STABLE]',
    status,
    hasSpike: dto.spikeCount > 0,
    spikeFrameId: 14208,
    gpuTemp: isJank ? 86 : 58 + index * 3,
    cpuTemp: isJank ? 94 : 62 + index * 4,
    sector: SECTOR_PRESETS[index % SECTOR_PRESETS.length],
    sparkline,
  };
}

export function mapHotspotsDtoToHotspotItems(hotspots: HotspotDto[]): HotspotItem[] {
  return hotspots.map((h, index) => {
    let severity: SeverityLevel = 'stable';
    if (h.avgSelfMs >= 30) severity = 'crit';
    else if (h.avgSelfMs >= 10) severity = 'high';
    else if (h.avgSelfMs >= 5) severity = 'med';
    else if (h.avgSelfMs >= 2) severity = 'low';

    const rankPrefix = index === 0 ? '#01 CRIT' : index === 1 ? '#02 HIGH' : index === 2 ? '#03 MED' : index === 3 ? '#04 LOW' : '#05 STABLE';

    let gcAllocFormatted = '0 B';
    if (h.avgGcBytes >= 1048576) {
      gcAllocFormatted = `${(h.avgGcBytes / 1048576).toFixed(1)} MB`;
    } else if (h.avgGcBytes > 0) {
      gcAllocFormatted = `${(h.avgGcBytes / 1024).toFixed(0)} KB`;
    }

    return {
      id: `hotspot-${index + 1}`,
      rank: rankPrefix,
      severity,
      methodSignature: h.key,
      assembly: h.source ? `${h.source.file} // Line ${h.source.startLine}` : 'UnityEngine.CoreModule.dll',
      nodesAffected: `${h.testers} / 5`,
      selfMs: h.avgSelfMs,
      totalMs: +(h.avgSelfMs * 1.3).toFixed(1),
      callCount: h.avgCalls,
      gcAllocFormatted,
      filePath: h.source?.file || 'Assets/Scripts/EnemyAI.cs',
      line: h.source?.startLine || 31,
      associatedDiagnosisId: 'diag-enemyai',
    };
  });
}

export function mapReportDtoToAIDiagnosis(report: ReportDto, hotspot?: HotspotDto): AIDiagnosis {
  const finding = report.findings?.[0];
  const recoveredMs = finding?.estimatedGainMs ? `${finding.estimatedGainMs.toFixed(1)} ms` : '42.1 ms';

  return {
    id: 'diag-enemyai',
    hotspotId: 'hotspot-1',
    rootCause: finding?.cause ? finding.cause.toUpperCase() : 'REPEATED FINDOBJECTSOFTYPE IN UPDATE()',
    tierBadge: 'CRIT TIER-1',
    description: finding
      ? `${report.summary} ${finding.evidence} ${finding.cause}`
      : 'Active Enemy AI instances execute quadratic O(N) scene traversal every single tick during Wave 03. Generates 1.0 MB garbage collection churn per frame and stalls CPU main thread by 50.8ms.',
    fpsUplift: '+35.2 FPS',
    fpsGainPercent: '+298% Gain',
    timeRecoveredMs: recoveredMs,
    gcScrubbed: '-1.0 MB',
    vulnerableSource: {
      fileName: (finding?.file || hotspot?.source?.file || 'EnemyAI.cs').toUpperCase(),
      label: `VULNERABLE RUNTIME SOURCE (${(finding?.file || 'EnemyAI.cs').toUpperCase()}:${finding?.line || 31})`,
      code: hotspot?.source?.code || `// SLOW: Called 180x / frame
void Update() {
  var players = 
    FindObjectsOfType<Player>
    ();
  foreach (var p in 
    players) {
    if 
      (Vector3.Distance(pos, 
      p.pos) < aggro) {
      Engage(p);
    }
  }
}`,
    },
    proposedRefactor: {
      label: 'PROPOSED REFACTOR (ZERO-ALLOC SPATIAL HASH)',
      summary: finding?.fix || 'Replace per-frame global heap allocation with cached spatial bucket query',
      code: finding?.fixedCode && finding.fixedCode.trim().length > 0
        ? finding.fixedCode
        : `// OPTIMIZED: Zero-alloc cached query
static readonly List<Player> s_Buf = 
  new(8);
void Update() {
  PlayerRegistry.GetNearby(
    pos, aggro, s_Buf);
  for (int i = 0; i < 
    s_Buf.Count; i++) {
    Engage(s_Buf[i]);
  }
}`,
    },
  };
}
