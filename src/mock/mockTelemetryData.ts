import type { AIDiagnosis, CallTreeNode, FrameSample, HotspotItem, SubsystemMetric, TesterNode } from '../types/telemetry';

export const initialTesters: TesterNode[] = [
  {
    id: 'TESTER-01',
    label: 'TESTER-01',
    hardware: 'RIG-RTX4080 // i9-13900K',
    pingMs: 4,
    fps: 59.8,
    frameTimeMs: 16.7,
    state: '[COMBAT // STABLE]',
    status: 'stable',
    hasSpike: false,
    gpuTemp: 61,
    cpuTemp: 68,
    sector: 'SECTOR_07',
    sparkline: [16.4, 16.7, 16.5, 16.9, 16.6, 16.8, 16.7, 16.5, 16.8, 16.7, 16.6, 16.7],
  },
  {
    id: 'TESTER-02',
    label: 'TESTER-02',
    hardware: 'LAPTOP-G2 // GTX 1660 Ti',
    pingMs: 18,
    fps: 11.8,
    frameTimeMs: 84.6,
    state: '[ENEMY WAVE 03]',
    status: 'crit',
    hasSpike: true,
    spikeFrameId: 14208,
    gpuTemp: 86,
    cpuTemp: 94,
    sector: 'ARENA_WAVE_3',
    sparkline: [16.8, 17.1, 18.2, 24.5, 42.0, 84.6, 52.0, 26.4, 18.0, 16.9, 17.2, 16.8],
  },
  {
    id: 'TESTER-03',
    label: 'TESTER-03',
    hardware: 'STEAMDECK-OLED // AMD APU',
    pingMs: 24,
    fps: 42.4,
    frameTimeMs: 23.5,
    state: '[PATROL // JITTER]',
    status: 'high',
    hasSpike: false,
    gpuTemp: 72,
    cpuTemp: 72,
    fanRpm: '4.0k',
    sector: 'OUTPOST_ALPHA',
    sparkline: [21.5, 23.0, 24.2, 22.8, 25.1, 23.5, 24.0, 22.9, 23.8, 24.1, 23.5, 23.2],
  },
  {
    id: 'TESTER-04',
    label: 'TESTER-04',
    hardware: 'PS5-DEV-KIT // CUSTOM RDNA2',
    pingMs: 4,
    fps: 60.0,
    frameTimeMs: 16.6,
    state: '[IDLE // OPTIMAL]',
    status: 'optimal',
    hasSpike: false,
    gpuTemp: 58,
    cpuTemp: 58,
    memoryUsage: '9.3GB',
    sector: 'TITLE_LOBBY',
    sparkline: [16.6, 16.6, 16.6, 16.7, 16.6, 16.6, 16.5, 16.6, 16.6, 16.7, 16.6, 16.6],
  },
  {
    id: 'TESTER-05',
    label: 'TESTER-05',
    hardware: 'RIG-RX7900XTX // 7800X3D',
    pingMs: 11,
    fps: 58.4,
    frameTimeMs: 17.1,
    state: '[EXPLORING // OPTIMAL]',
    status: 'stable',
    hasSpike: false,
    gpuTemp: 54,
    cpuTemp: 62,
    sector: 'FOREST_SECTOR',
    sparkline: [17.0, 16.9, 17.2, 17.1, 16.8, 17.3, 17.0, 17.2, 16.9, 17.1, 17.0, 17.1],
  },
];

export const generateTimelineFrames = (): FrameSample[] => {
  const frames: FrameSample[] = [];
  const totalPoints = 65;
  const spikeIndex = 48; // around t = +47.3s
  const startFrame = 14150;

  for (let i = 0; i < totalPoints; i++) {
    const frameNum = startFrame + i * 2;
    const timeSec = (i * 0.98).toFixed(1);
    const timestamp = `t = +${timeSec}s`;

    let totalMs = 16.3 + (Math.sin(i * 0.4) * 0.6) + (Math.random() * 0.4);
    let cpuMain = 10.2 + (Math.random() * 0.5);
    let renderThread = 4.2 + (Math.random() * 0.3);
    let gpu = 2.0 + (Math.random() * 0.2);
    let gc = 4096;
    let isSpike = false;
    let spikeLabel: string | undefined = undefined;
    let jankFactor: number | undefined = undefined;

    // Build realistic curve leading to and after the spike
    if (i === spikeIndex - 3) {
      totalMs = 19.4;
      cpuMain = 13.0;
    } else if (i === spikeIndex - 2) {
      totalMs = 28.5;
      cpuMain = 21.0;
    } else if (i === spikeIndex - 1) {
      totalMs = 52.1;
      cpuMain = 42.0;
      renderThread = 7.5;
    } else if (i === spikeIndex) {
      // The exact spike from mockup
      totalMs = 84.6;
      cpuMain = 68.2;
      renderThread = 12.1;
      gpu = 4.3;
      gc = 1048576; // 1.0 MB
      isSpike = true;
      spikeLabel = 'SPIKE: FRAME #14208 // 84.6ms // EXTREME JANK';
      jankFactor = 5.1;
    } else if (i === spikeIndex + 1) {
      totalMs = 46.2;
      cpuMain = 36.4;
      renderThread = 7.0;
    } else if (i === spikeIndex + 2) {
      totalMs = 22.3;
      cpuMain = 15.2;
    }

    frames.push({
      frameNumber: isSpike ? 14208 : frameNum,
      timestamp,
      timeOffsetSec: parseFloat(timeSec),
      totalFrameMs: parseFloat(totalMs.toFixed(1)),
      cpuMainMs: parseFloat(cpuMain.toFixed(1)),
      renderThreadMs: parseFloat(renderThread.toFixed(1)),
      gpuMs: parseFloat(gpu.toFixed(1)),
      gcBytes: gc,
      isSpike,
      spikeLabel,
      jankFactor,
    });
  }

  return frames;
};

export const initialHotspots: HotspotItem[] = [
  {
    id: 'hotspot-1',
    rank: '#01 CRIT',
    severity: 'crit',
    methodSignature: 'PlayerLoop/.../EnemyAI.Update()',
    assembly: 'Assembly-CSharp.dll // Class EnemyAI : MonoBehaviour',
    nodesAffected: '5 / 5',
    selfMs: 46.2,
    totalMs: 46.2,
    callCount: 180,
    gcAllocFormatted: '1.0 MB',
    filePath: 'Assets/Scripts/AI/EnemyAI.cs',
    line: 49,
    associatedDiagnosisId: 'diag-enemyai',
  },
  {
    id: 'hotspot-2',
    rank: '#02 HIGH',
    severity: 'high',
    methodSignature: 'UnityEngine.Physics2D::Simulate()',
    assembly: 'UnityEngine.Physics2DModule.dll',
    nodesAffected: '4 / 5',
    selfMs: 14.8,
    totalMs: 14.8,
    callCount: 60,
    gcAllocFormatted: '48 KB',
    filePath: 'Internal/Physics2D/Simulate',
    line: 120,
    associatedDiagnosisId: 'diag-physics',
  },
  {
    id: 'hotspot-3',
    rank: '#03 MED',
    severity: 'med',
    methodSignature: 'CombatManager::CalculateLineOfSight()',
    assembly: 'Assembly-CSharp.dll // SpatialGrid',
    nodesAffected: '5 / 5',
    selfMs: 9.4,
    totalMs: 11.0,
    callCount: 120,
    gcAllocFormatted: '128 KB',
    filePath: 'Assets/Scripts/Combat/CombatManager.cs',
    line: 88,
    associatedDiagnosisId: 'diag-combat',
  },
  {
    id: 'hotspot-4',
    rank: '#04 LOW',
    severity: 'low',
    methodSignature: 'CanvasRenderer::UpdateBatches()',
    assembly: 'UnityEngine.UIElements.dll',
    nodesAffected: '3 / 5',
    selfMs: 4.2,
    totalMs: 5.6,
    callCount: 1,
    gcAllocFormatted: '12 KB',
    filePath: 'Internal/UI/CanvasRenderer',
    line: 302,
    associatedDiagnosisId: 'diag-ui',
  },
  {
    id: 'hotspot-5',
    rank: '#05 STABLE',
    severity: 'stable',
    methodSignature: 'CameraManager::LateUpdate()',
    assembly: 'Cinemachine.Core.dll',
    nodesAffected: '5 / 5',
    selfMs: 1.2,
    totalMs: 1.2,
    callCount: 1,
    gcAllocFormatted: '0 B',
    filePath: 'Assets/Cinemachine/CameraManager.cs',
    line: 15,
    associatedDiagnosisId: 'diag-camera',
  },
];

export const initialDiagnoses: Record<string, AIDiagnosis> = {
  'diag-enemyai': {
    id: 'diag-enemyai',
    hotspotId: 'hotspot-1',
    rootCause: 'REPEATED FINDOBJECTSOFTYPE<PLAYER>() IN UPDATE()',
    tierBadge: 'CRIT TIER-1',
    description:
      '180 active Enemy AI instances execute quadratic O(N) scene traversal every single tick during Wave 03. Generates 1.0 MB garbage collection churn per frame and stalls CPU main thread by 46.2ms.',
    fpsUplift: '+35.2 FPS',
    fpsGainPercent: '+298% Gain',
    timeRecoveredMs: '42.1 ms',
    gcScrubbed: '-1.0 MB',
    vulnerableSource: {
      fileName: 'ENEMYAI.CS:49',
      label: 'VULNERABLE RUNTIME SOURCE (ENEMYAI.CS:49)',
      code: `// SLOW: Called 180x / frame
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
      summary: 'Replace per-frame global heap allocation with cached spatial bucket query',
      code: `// OPTIMIZED: Zero-alloc cached query
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
  },
  'diag-physics': {
    id: 'diag-physics',
    hotspotId: 'hotspot-2',
    rootCause: 'UNBOUNDED FIXEDTIMESTEP INTERPOLATION ACCUMULATION',
    tierBadge: 'HIGH TIER-2',
    description:
      'Sub-stepping physics simulator triggers 4 simulation ticks in a single frame spike due to delta time spiral of death when frame time drops below 33ms.',
    fpsUplift: '+11.4 FPS',
    fpsGainPercent: '+64% Gain',
    timeRecoveredMs: '10.2 ms',
    gcScrubbed: '-48 KB',
    vulnerableSource: {
      fileName: 'PHYSICSCONFIG.CS:12',
      label: 'VULNERABLE CONFIG (MAX ALLOWED TIMESTEP)',
      code: `// UNBOUNDED SPIRAL
void FixedUpdate() {
  Time.maximumDeltaTime = 0.333f;
  Physics2D.Simulate(Time.fixedDeltaTime);
}`,
    },
    proposedRefactor: {
      label: 'PROPOSED REFACTOR (CLAMPED FIXED TICKS)',
      summary: 'Clamp maximum allowed timestep to 1.5x fixedDeltaTime to prevent cascade stalls',
      code: `// CLAMPED FIXED DELTA
void Awake() {
  Time.maximumDeltaTime = Time.fixedDeltaTime * 1.5f;
  Physics2D.simulationMode = SimulationMode2D.Script;
}`,
    },
  },
  'diag-combat': {
    id: 'diag-combat',
    hotspotId: 'hotspot-3',
    rootCause: 'RAYCASTALL GENERATING UNMANAGED HEAP ALLOCATIONS',
    tierBadge: 'MED TIER-3',
    description:
      'Physics2D.RaycastAll instantiates temporary RaycastHit arrays per weapon cone query rather than using NonAlloc buffers.',
    fpsUplift: '+6.8 FPS',
    fpsGainPercent: '+32% Gain',
    timeRecoveredMs: '7.5 ms',
    gcScrubbed: '-128 KB',
    vulnerableSource: {
      fileName: 'COMBATMANAGER.CS:88',
      label: 'VULNERABLE RUNTIME (RAYCASTALL HEAP ALLOC)',
      code: `// ALLOCATES HIT ARRAY EVERY QUERY
var hits = Physics2D.RaycastAll(origin, dir, range);
for (int i = 0; i < hits.Length; i++) {
  ProcessDamage(hits[i]);
}`,
    },
    proposedRefactor: {
      label: 'PROPOSED REFACTOR (RAYCASTNONALLOC CACHE)',
      summary: 'Preallocate RaycastHit2D[16] buffer to eliminate 128KB GC allocation per frame',
      code: `// ZERO-ALLOC REUSABLE BUFFER
static readonly RaycastHit2D[] s_Hits = new RaycastHit2D[16];
int hitCount = Physics2D.RaycastNonAlloc(origin, dir, s_Hits, range);
for (int i = 0; i < hitCount; i++) {
  ProcessDamage(s_Hits[i]);
}`,
    },
  },
};

export const initialCallTree: CallTreeNode = {
  id: 'node-root',
  name: 'UnityPlayerLoop',
  durationMs: 84.6,
  percent: 100.0,
  children: [
    {
      id: 'node-physics',
      name: 'PreUpdate.PhysicsFixedUpdate',
      durationMs: 4.8,
      percent: 5.6,
    },
    {
      id: 'node-scripts',
      name: 'Update.ScriptRunBehaviourUpdate',
      durationMs: 67.4,
      percent: 79.6,
      tag: 'HOT PATH',
      tagSeverity: 'crit',
      children: [
        {
          id: 'node-enemy-update',
          name: 'EnemyAI.Update()',
          durationMs: 46.2,
          selfMs: 46.2,
          percent: 54.6,
          tag: 'ROOT BOTTLENECK (46.2MS SELFMS)',
          tagSeverity: 'crit',
          children: [
            {
              id: 'node-find-objects',
              name: 'UnityEngine.Object::FindObjectsOfType<Player>()',
              durationMs: 41.8,
              percent: 49.4,
              tag: '[180 calls / 1.0 MB alloc]',
              tagSeverity: 'high',
            },
          ],
        },
        {
          id: 'node-combat-update',
          name: 'CombatManager.Update()',
          durationMs: 11.0,
          percent: 13.0,
        },
      ],
    },
    {
      id: 'node-render',
      name: 'Render.WaitForGPUTarget',
      durationMs: 12.4,
      percent: 14.6,
    },
  ],
};

export const initialSubsystemMetrics: SubsystemMetric[] = [
  {
    name: 'MAIN THREAD',
    value: '84.6ms',
    numericVal: 84.6,
    maxVal: 100,
    status: 'crit',
  },
  {
    name: 'RENDER GLES/VK',
    value: '14.2ms',
    numericVal: 14.2,
    maxVal: 33.3,
    status: 'stable',
  },
  {
    name: 'GC HEAP ALLOC',
    value: '412 KB/f',
    numericVal: 41.2,
    maxVal: 500,
    status: 'med',
  },
  {
    name: 'PHYSX SIMULATION',
    value: '4.8ms',
    numericVal: 4.8,
    maxVal: 20,
    status: 'optimal',
  },
];
