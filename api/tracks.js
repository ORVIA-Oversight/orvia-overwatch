const DEMO_TRACKS = [
  { id: 'XRAY-01', name: 'XRAY-01', lat: 53.5488, lon: -1.4791, source: 'SIMULATED', status: 'LIVE', ageSeconds: 4 },
  { id: 'XRAY-02', name: 'XRAY-02', lat: 53.5502, lon: -1.4759, source: 'SIMULATED', status: 'LIVE', ageSeconds: 9 },
  { id: 'CONTROL-01', name: 'CONTROL', lat: 53.5473, lon: -1.4820, source: 'SIMULATED', status: 'CONTROL', ageSeconds: 2 }
];

function json(res, status, payload) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8').send(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const base = (process.env.TRACCAR_BASE_URL || '').replace(/\/$/, '');
  const token = process.env.TRACCAR_TOKEN || '';

  if (!base || !token) {
    return json(res, 200, {
      ok: true,
      mode: 'SIMULATED',
      provider: 'ORVIA SENSE demo adapter',
      tracks: DEMO_TRACKS,
      note: 'Set TRACCAR_BASE_URL and TRACCAR_TOKEN to switch this endpoint to the self-hosted Traccar feed.'
    });
  }

  try {
    const response = await fetch(base + '/api/positions', {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Traccar returned ' + response.status);
    const positions = await response.json();
    const tracks = positions.map(p => ({
      id: String(p.deviceId),
      name: 'DEVICE-' + p.deviceId,
      lat: p.latitude,
      lon: p.longitude,
      source: 'TRACCAR',
      status: p.valid === false ? 'DELAYED' : 'LIVE',
      ageSeconds: Math.max(0, Math.round((Date.now() - new Date(p.fixTime || p.serverTime || Date.now()).getTime()) / 1000)),
      speed: p.speed,
      course: p.course,
      accuracy: p.accuracy ?? null
    }));

    return json(res, 200, { ok: true, mode: 'LIVE', provider: 'Traccar', tracks });
  } catch (error) {
    return json(res, 502, { ok: false, mode: 'ERROR', error: error?.message || 'Unable to read Traccar positions' });
  }
}
