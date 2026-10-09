import type {
  HotspotResponseDto,
  PerfEventDto,
  ReportDto,
  TesterInfoDto,
} from '../../types/backendDto';

const API_BASE = '/api';

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text || text.trim() === 'null') {
      return null as T;
    }

    return JSON.parse(text) as T;
  } finally {
    clearTimeout(id);
  }
}

export const telemetryApi = {
  async getTesters(): Promise<TesterInfoDto[]> {
    return fetchWithTimeout<TesterInfoDto[]>(`${API_BASE}/testers`);
  },

  async getHotspots(): Promise<HotspotResponseDto> {
    return fetchWithTimeout<HotspotResponseDto>(`${API_BASE}/hotspots`);
  },

  async getReport(): Promise<ReportDto | null> {
    return fetchWithTimeout<ReportDto | null>(`${API_BASE}/report`);
  },

  async triggerAnalyze(): Promise<{ status: string }> {
    return fetchWithTimeout<{ status: string }>(`${API_BASE}/analyze`, {
      method: 'POST',
    });
  },

  async seedDatabase(): Promise<{ seeded: number }> {
    return fetchWithTimeout<{ seeded: number }>(`${API_BASE}/dev/seed`, {
      method: 'POST',
    });
  },

  async postDeepPerf(event: PerfEventDto): Promise<unknown> {
    return fetchWithTimeout<unknown>(`${API_BASE}/perf/deep`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
};
