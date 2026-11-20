import {
  MonitoredSystem,
  PredictiveWarning,
  VeilWatchSettings,
} from '../types/veilwatch';

export function analyzePredictiveWarnings(
  systems: MonitoredSystem[],
  thresholds: VeilWatchSettings['thresholds']
): PredictiveWarning[] {
  const warnings: PredictiveWarning[] = [];
  const now = new Date().toISOString();

  for (const sys of systems) {
    if (!sys.monitoringActive) continue;
    const recent = sys.history.slice(-4);
    if (recent.length < 3) continue;

    // 1. Sustained CPU breach or upward trend approaching critical
    const cpuValues = recent.map((p) => p.cpu);
    const cpuConsecutiveWarn = cpuValues.filter((v) => v >= thresholds.cpuWarning).length;
    const cpuDelta = Number((cpuValues[cpuValues.length - 1] - cpuValues[0]).toFixed(1));

    if (cpuConsecutiveWarn >= 3 || (sys.cpuUsage >= thresholds.cpuWarning && cpuDelta >= 8)) {
      const isCrit = sys.cpuUsage >= thresholds.cpuCritical;
      warnings.push({
        id: `pred-cpu-${sys.id}`,
        systemId: sys.id,
        systemName: sys.name,
        category: sys.category,
        severity: isCrit ? 'critical' : 'warning',
        metric: 'CPU',
        currentValue: sys.cpuUsage,
        threshold: isCrit ? thresholds.cpuCritical : thresholds.cpuWarning,
        trendDelta: cpuDelta,
        ruleTriggered:
          cpuConsecutiveWarn >= 3
            ? `Sustained CPU >= ${thresholds.cpuWarning}% across ${cpuConsecutiveWarn} consecutive intervals`
            : `Rapid CPU climb (+${cpuDelta}%) above ${thresholds.cpuWarning}% warning baseline`,
        explanation: `Recent ${recent.length} telemetry intervals recorded CPU at [${cpuValues
          .map((v) => `${v}%`)
          .join(' -> ')}], breaching the rule-based threshold of ${
          isCrit ? thresholds.cpuCritical : thresholds.cpuWarning
        }%.`,
        recommendedMaintenance:
          'Inspect worker thread pool saturation, review recent container deployments, and prepare horizontal scaling or rate-limiting.',
        detectedAt: now,
      });
    }

    // 2. Sustained Memory breach
    const memValues = recent.map((p) => p.memory);
    const memConsecutiveWarn = memValues.filter((v) => v >= thresholds.memoryWarning).length;
    const memDelta = Number((memValues[memValues.length - 1] - memValues[0]).toFixed(1));

    if (memConsecutiveWarn >= 3 || (sys.memoryUsage >= thresholds.memoryWarning && memDelta >= 6)) {
      const isCrit = sys.memoryUsage >= thresholds.memoryCritical;
      warnings.push({
        id: `pred-mem-${sys.id}`,
        systemId: sys.id,
        systemName: sys.name,
        category: sys.category,
        severity: isCrit ? 'critical' : 'warning',
        metric: 'Memory',
        currentValue: sys.memoryUsage,
        threshold: isCrit ? thresholds.memoryCritical : thresholds.memoryWarning,
        trendDelta: memDelta,
        ruleTriggered:
          memConsecutiveWarn >= 3
            ? `Sustained Memory >= ${thresholds.memoryWarning}% across ${memConsecutiveWarn} consecutive intervals`
            : `Monotonic Memory growth (+${memDelta}%) exceeding ${thresholds.memoryWarning}% threshold`,
        explanation: `Memory telemetry progressed through [${memValues
          .map((v) => `${v}%`)
          .join(' -> ')}]. Rule-based leak heuristic flagged sustained heap retention.`,
        recommendedMaintenance:
          'Capture a local sanitized heap summary, verify cache eviction TTL policies, and schedule a graceful rolling restart window.',
        detectedAt: now,
      });
    }

    // 3. Sustained Response Time degradation
    const rtValues = recent.map((p) => p.responseMs);
    const rtConsecutiveWarn = rtValues.filter((v) => v >= thresholds.responseWarningMs).length;
    const rtDelta = Math.round(rtValues[rtValues.length - 1] - rtValues[0]);

    if (
      rtConsecutiveWarn >= 3 ||
      (sys.responseTimeMs >= thresholds.responseWarningMs && rtDelta >= 45)
    ) {
      const isCrit = sys.responseTimeMs >= thresholds.responseCriticalMs;
      warnings.push({
        id: `pred-rt-${sys.id}`,
        systemId: sys.id,
        systemName: sys.name,
        category: sys.category,
        severity: isCrit ? 'critical' : 'warning',
        metric: 'Response Time',
        currentValue: sys.responseTimeMs,
        threshold: isCrit ? thresholds.responseCriticalMs : thresholds.responseWarningMs,
        trendDelta: rtDelta,
        ruleTriggered:
          rtConsecutiveWarn >= 3
            ? `Sustained Latency >= ${thresholds.responseWarningMs}ms across ${rtConsecutiveWarn} intervals`
            : `Latency escalation (+${rtDelta}ms) past ${thresholds.responseWarningMs}ms baseline`,
        explanation: `Response latency moved across [${rtValues
          .map((v) => `${v}ms`)
          .join(' -> ')}], indicating downstream contention or connection pool queueing.`,
        recommendedMaintenance:
          'Check database connection pool wait times, inspect upstream TLS handshake latency, and validate circuit-breaker thresholds.',
        detectedAt: now,
      });
    }
  }

  return warnings;
}
