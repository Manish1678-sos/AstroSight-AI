import { enrichAlert } from '../services/pythonBridge.js';

const CANDIDATES = [
  { objectId: 'ZTF26aabxq', type: 'SN CANDIDATE', ra: 10.428, dec: 41.269, magnitude: 18.42, period_days: 0.0, rise_time_days: 12.4 },
  { objectId: 'ZTF26aabwm', type: 'NEO CANDIDATE', ra: 188.211, dec: -3.441, magnitude: 19.03, period_days: 0.0, rise_time_days: 1.2 },
  { objectId: 'ZTF26aabtc', type: 'VARIABLE STAR', ra: 83.822, dec: 22.014, magnitude: 17.88, period_days: 4.85, rise_time_days: 0.0 }
];

/**
 * Starts a simulated ZTF transient alert stream over Socket.IO,
 * enriching candidates via the Python ML engine.
 *
 * @param {import('socket.io').Server} io - Initialized Socket.IO server instance.
 * @param {number} intervalMs - Stream broadcast frequency in milliseconds (default 1500ms).
 * @returns {NodeJS.Timeout} Timer handle used to stop the stream.
 */
export function startAlertStream(io, intervalMs = 1500) {
  let index = 0;

  const streamTimer = setInterval(async () => {
    try {
      const baseCandidate = CANDIDATES[index++ % CANDIDATES.length];

      // Simulate live telemetry jitter
      const magnitudeJitter = (Math.random() * 0.1 - 0.05).toFixed(2);
      const simulatedMagnitude = parseFloat((baseCandidate.magnitude + parseFloat(magnitudeJitter)).toFixed(2));

      const alertPayload = {
        ...baseCandidate,
        magnitude: simulatedMagnitude,
        features: {
          amplitude: parseFloat((21.0 - simulatedMagnitude).toFixed(2)),
          rise_time_days: baseCandidate.rise_time_days,
          period_days: baseCandidate.period_days,
          color_bv: 0.15,
        },
        receivedAt: new Date().toISOString(),
        source: 'ZTF',
      };

      // Enrich payload via ML Python bridge
      const enrichedAlert = await enrichAlert(alertPayload);

      // Broadcast enriched alert to connected clients
      io.emit('transient:alert', enrichedAlert);
    } catch (error) {
      console.error('[Alert Stream Error] Failed to process or broadcast alert:', error.message);
    }
  }, intervalMs);

  return streamTimer;
}

/**
 * Stops an active alert stream timer.
 *
 * @param {NodeJS.Timeout} streamTimer - Timer object returned by startAlertStream.
 */
export function stopAlertStream(streamTimer) {
  if (streamTimer) {
    clearInterval(streamTimer);
  }
}