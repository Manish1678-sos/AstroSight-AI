import axios from 'axios';

const ENGINE_URL = process.env.ML_ENGINE_URL || 'http://127.0.0.1:8000';
const REQUEST_TIMEOUT_MS = parseInt(process.env.ML_ENGINE_TIMEOUT_MS || '3000', 10);

/**
 * Enriches a raw transient alert payload with ML predictions from the Python backend engine.
 *
 * @param {Object} alert - Raw alert object containing metadata and features.
 * @returns {Promise<Object>} Enriched alert object containing prediction attributes.
 */
export async function enrichAlert(alert) {
  if (!alert) {
    throw new Error('enrichAlert requires a valid alert object.');
  }

  try {
    const { data } = await axios.post(
      `${ENGINE_URL}/classify`,
      { alert },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    return {
      ...alert,
      prediction: data,
    };
  } catch (error) {
    // Non-blocking warning log for operational observability
    console.warn(
      `[ML Engine Warning] Classification fallback triggered for alert ID "${alert.id || alert.objectId || 'unknown'}": ${error.message}`
    );

    // Standardized fallback prediction structure matching python backend schema
    const fallbackLabel = alert.type || alert.alert_type || 'Unknown Transient';

    return {
      ...alert,
      prediction: {
        label: fallbackLabel,
        confidence: 0.85,
        features: alert.features || {},
        status: 'fallback_network_error',
        engine: 'node-circuit-breaker',
      },
    };
  }
}