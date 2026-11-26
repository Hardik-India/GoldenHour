import { asyncHandler } from '../utils/asyncHandler';
import { runTriage } from '../utils/triage';
import { env } from '../config/env';

/** POST /api/triage - public, rule-based decision support. */
export const triage = asyncHandler(async (req, res) => {
  const result = runTriage(req.body);
  res.json({
    success: true,
    ...result,
    emergencyNumbers: { national: env.emergencyNumber, ambulance: env.ambulanceNumber },
    disclaimer: 'This is guidance, not a diagnosis. Call 112 / 108 for every serious emergency.',
  });
});
