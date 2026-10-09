import { create } from 'zustand';
import {
  generateTimelineFrames,
  initialCallTree,
  initialDiagnoses,
  initialHotspots,
  initialSubsystemMetrics,
  initialTesters,
} from '../mock/mockTelemetryData';
import {
  mapHotspotsDtoToHotspotItems,
  mapReportDtoToAIDiagnosis,
  mapTesterDtoToTesterNode,
} from '../services/api/adapters';
import { telemetryApi } from '../services/api/telemetryApi';
import type {
  AIDiagnosis,
  CallTreeNode,
  FrameSample,
  HotspotItem,
  SubsystemMetric,
  TesterNode,
} from '../types/telemetry';

export type TimeWindow = '60s' | '5m' | 'session';
export type NavTab = 'telemetry' | 'squad' | 'ai-studio' | 'calltree';
export type ConnectionMode = 'live' | 'mock';

interface TelemetryState {
  // State
  testers: TesterNode[];
  selectedTesterId: string;
  timelineFrames: FrameSample[];
  selectedFrameNumber: number;
  hotspots: HotspotItem[];
  selectedHotspotId: string;
  diagnoses: Record<string, AIDiagnosis>;
  callTree: CallTreeNode;
  subsystems: SubsystemMetric[];

  isLive: boolean;
  timeWindow: TimeWindow;
  filterSpikesOnly: boolean;
  activeTab: NavTab;

  isCallTreeDrawerOpen: boolean;
  isSimulatingBudget: boolean;
  isABBenchmarking: boolean;
  isEngineScanning: boolean;
  patchPushed: boolean;
  patchPushing: boolean;
  lastPatchTimestamp: string | null;

  ipcConnected: boolean;
  pingMs: number;
  samplingFrequency: string;

  // Live Backend Integration State
  connectionMode: ConnectionMode;
  backendOnline: boolean;
  isBackendSeeding: boolean;
  lastSyncTimestamp: string | null;

  // Actions
  setSelectedTester: (id: string) => void;
  setSelectedFrame: (frameNumber: number) => void;
  setSelectedHotspot: (id: string) => void;
  toggleLive: () => void;
  setTimeWindow: (window: TimeWindow) => void;
  toggleFilterSpikes: () => void;
  setActiveTab: (tab: NavTab) => void;
  setCallTreeDrawerOpen: (open: boolean) => void;
  toggleSimulateBudget: () => void;
  toggleABBenchmark: () => void;
  runAIDiagnosticEngine: () => Promise<void>;
  pushPatchToUnity: () => void;
  resortHotspots: () => void;
  jumpToSpike: (frameNumber?: number) => void;
  exportTracyTrace: () => void;
  generateLLMFixLog: () => void;
  tickLiveData: () => void;

  // Backend Actions
  setConnectionMode: (mode: ConnectionMode) => void;
  fetchLiveTelemetry: () => Promise<void>;
  seedBackend: () => Promise<void>;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  testers: initialTesters,
  selectedTesterId: 'TESTER-02',
  timelineFrames: generateTimelineFrames(),
  selectedFrameNumber: 14208,
  hotspots: initialHotspots,
  selectedHotspotId: 'hotspot-1',
  diagnoses: initialDiagnoses,
  callTree: initialCallTree,
  subsystems: initialSubsystemMetrics,

  isLive: true,
  timeWindow: '60s',
  filterSpikesOnly: true,
  activeTab: 'telemetry',

  isCallTreeDrawerOpen: false,
  isSimulatingBudget: false,
  isABBenchmarking: false,
  isEngineScanning: false,
  patchPushed: false,
  patchPushing: false,
  lastPatchTimestamp: null,

  ipcConnected: true,
  pingMs: 1.2,
  samplingFrequency: '1,201,000 SAMPLES/SEC',

  connectionMode: 'live',
  backendOnline: true,
  isBackendSeeding: false,
  lastSyncTimestamp: null,

  setSelectedTester: (id: string) => {
    set((state) => {
      const tester = state.testers.find((t) => t.id === id);
      if (!tester) return { selectedTesterId: id };

      if (id !== 'TESTER-02') {
        const frames = state.timelineFrames.map((f, idx) => ({
          ...f,
          totalFrameMs: parseFloat((tester.frameTimeMs + Math.sin(idx) * 0.4).toFixed(1)),
          cpuMainMs: parseFloat((tester.frameTimeMs * 0.65).toFixed(1)),
          renderThreadMs: parseFloat((tester.frameTimeMs * 0.25).toFixed(1)),
          gpuMs: parseFloat((tester.frameTimeMs * 0.1).toFixed(1)),
          isSpike: false,
          spikeLabel: undefined,
        }));
        return {
          selectedTesterId: id,
          timelineFrames: frames,
          selectedFrameNumber: frames[Math.floor(frames.length / 2)]?.frameNumber || 14208,
        };
      } else {
        return {
          selectedTesterId: id,
          timelineFrames: generateTimelineFrames(),
          selectedFrameNumber: 14208,
        };
      }
    });
  },

  setSelectedFrame: (frameNumber: number) => {
    set({ selectedFrameNumber: frameNumber });
  },

  setSelectedHotspot: (id: string) => {
    set({ selectedHotspotId: id });
  },

  toggleLive: () => {
    set((state) => ({ isLive: !state.isLive }));
  },

  setTimeWindow: (timeWindow: TimeWindow) => {
    set({ timeWindow });
  },

  toggleFilterSpikes: () => {
    set((state) => ({ filterSpikesOnly: !state.filterSpikesOnly }));
  },

  setActiveTab: (activeTab: NavTab) => {
    set({ activeTab });
  },

  setCallTreeDrawerOpen: (isCallTreeDrawerOpen: boolean) => {
    set({ isCallTreeDrawerOpen });
  },

  toggleSimulateBudget: () => {
    set((state) => ({ isSimulatingBudget: !state.isSimulatingBudget }));
  },

  toggleABBenchmark: () => {
    set((state) => ({ isABBenchmarking: !state.isABBenchmarking }));
  },

  setConnectionMode: (connectionMode: ConnectionMode) => {
    set({ connectionMode });
    if (connectionMode === 'live') {
      get().fetchLiveTelemetry();
    } else {
      set({
        testers: initialTesters,
        hotspots: initialHotspots,
        diagnoses: initialDiagnoses,
      });
    }
  },

  fetchLiveTelemetry: async () => {
    const { connectionMode } = get();
    if (connectionMode !== 'live') return;

    try {
      const [testersDto, hotspotsDto] = await Promise.all([
        telemetryApi.getTesters().catch(() => null),
        telemetryApi.getHotspots().catch(() => null),
      ]);

      const now = new Date().toISOString().substring(11, 19);

      if (testersDto && testersDto.length > 0) {
        const mappedTesters = testersDto.map((t, idx) => mapTesterDtoToTesterNode(t, idx));
        set({
          testers: mappedTesters,
          backendOnline: true,
          lastSyncTimestamp: now,
        });
      }

      if (hotspotsDto && hotspotsDto.hotspots && hotspotsDto.hotspots.length > 0) {
        const mappedHotspots = mapHotspotsDtoToHotspotItems(hotspotsDto.hotspots);
        set((state) => ({
          hotspots: mappedHotspots,
          backendOnline: true,
          lastSyncTimestamp: now,
          subsystems: state.subsystems.map((sub) => {
            if (sub.name === 'MAIN THREAD') {
              const peakMs = hotspotsDto.hotspots[0]?.maxSelfMs || 84.6;
              return {
                ...sub,
                value: `${peakMs.toFixed(1)}ms`,
                numericVal: peakMs,
              };
            }
            return sub;
          }),
        }));
      }

      // Check report if present
      const reportDto = await telemetryApi.getReport().catch(() => null);
      if (reportDto && reportDto.findings && reportDto.findings.length > 0) {
        const updatedDiag = mapReportDtoToAIDiagnosis(reportDto, hotspotsDto?.hotspots?.[0]);
        set((state) => ({
          diagnoses: {
            ...state.diagnoses,
            'diag-enemyai': updatedDiag,
          },
        }));
      }
    } catch {
      set({ backendOnline: false });
    }
  },

  seedBackend: async () => {
    set({ isBackendSeeding: true });
    try {
      await telemetryApi.seedDatabase();
      await get().fetchLiveTelemetry();
    } catch {
      // Graceful error handle
    } finally {
      set({ isBackendSeeding: false });
    }
  },

  runAIDiagnosticEngine: async () => {
    set({ isEngineScanning: true });
    const { connectionMode } = get();

    if (connectionMode === 'live') {
      try {
        await telemetryApi.triggerAnalyze();

        // Poll for report completion
        let retries = 0;
        const maxRetries = 5;
        const pollInterval = setInterval(async () => {
          retries++;
          try {
            const report = await telemetryApi.getReport();
            if ((report && report.findings && report.findings.length > 0) || retries >= maxRetries) {
              clearInterval(pollInterval);
              if (report && report.findings && report.findings.length > 0) {
                const hotspots = await telemetryApi.getHotspots().catch(() => null);
                const updatedDiag = mapReportDtoToAIDiagnosis(report, hotspots?.hotspots?.[0]);
                set((state) => ({
                  diagnoses: {
                    ...state.diagnoses,
                    'diag-enemyai': updatedDiag,
                  },
                }));
              }
              set({
                isEngineScanning: false,
                activeTab: 'telemetry',
                selectedHotspotId: 'hotspot-1',
              });
            }
          } catch {
            if (retries >= maxRetries) {
              clearInterval(pollInterval);
              set({ isEngineScanning: false });
            }
          }
        }, 1000);
        return;
      } catch {
        // Fallback to local sequence if live analyze throws
      }
    }

    // Local fallback animation
    setTimeout(() => {
      set({
        isEngineScanning: false,
        activeTab: 'telemetry',
        selectedHotspotId: 'hotspot-1',
      });
    }, 1200);
  },

  pushPatchToUnity: () => {
    set({ patchPushing: true });
    setTimeout(() => {
      const now = new Date().toISOString().substring(11, 19);
      set({
        patchPushing: false,
        patchPushed: true,
        lastPatchTimestamp: now,
      });
      setTimeout(() => {
        set((state) => ({
          isSimulatingBudget: true,
          testers: state.testers.map((t) =>
            t.id === 'TESTER-02'
              ? {
                  ...t,
                  fps: 58.6,
                  frameTimeMs: 17.0,
                  status: 'stable',
                  hasSpike: false,
                  state: '[ENEMY WAVE 03 // PATCHED]',
                }
              : t
          ),
        }));
      }, 500);
    }, 800);
  },

  resortHotspots: () => {
    set((state) => ({
      hotspots: [...state.hotspots].reverse(),
    }));
  },

  jumpToSpike: (frameNumber = 14208) => {
    set({
      selectedTesterId: 'TESTER-02',
      selectedFrameNumber: frameNumber,
      timelineFrames: generateTimelineFrames(),
      selectedHotspotId: 'hotspot-1',
      isLive: false,
    });
  },

  exportTracyTrace: () => {
    const data = {
      format: 'TracyTelemetryStream v0.9',
      session: 'SESSION_002',
      tester: get().selectedTesterId,
      frame: get().selectedFrameNumber,
      timestamp: new Date().toISOString(),
      hotspots: get().hotspots,
      callTree: get().callTree,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profilerai_session002_frame_${get().selectedFrameNumber}.tracy.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  generateLLMFixLog: () => {
    const diag = get().diagnoses['diag-enemyai'];
    const log = `PROFILERAI AUTOMATED PATCH LOG\nDate: ${new Date().toUTCString()}\nTarget: ${diag?.rootCause}\nRecovered Budget: ${diag?.timeRecoveredMs}\nFPS Uplift: ${diag?.fpsUplift}\n\nProposed Refactor:\n${diag?.proposedRefactor.code}`;
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LLM_Patch_Log_${get().selectedFrameNumber}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  tickLiveData: () => {
    const { isLive, selectedTesterId, connectionMode } = get();
    if (!isLive) return;

    if (connectionMode === 'live') {
      get().fetchLiveTelemetry();
      return;
    }

    set((state) => {
      const pingDrift = +(1.1 + Math.random() * 0.3).toFixed(1);
      const updatedTesters = state.testers.map((t) => {
        if (t.id === selectedTesterId && t.hasSpike) return t;
        const delta = (Math.random() - 0.5) * 0.3;
        const newFps = +(t.fps + delta).toFixed(1);
        return {
          ...t,
          fps: Math.max(10, Math.min(60, newFps)),
        };
      });

      return {
        pingMs: pingDrift,
        testers: updatedTesters,
      };
    });
  },
}));
