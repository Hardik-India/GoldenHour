export interface TriageInput {
  conscious?: boolean;
  breathing?: boolean;
  severeBleeding?: boolean;
  chestPain?: boolean;
  canMove?: boolean;
  trapped?: boolean;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface TriageResult {
  severity: Severity;
  callEmergency: boolean;
  recommendedGuides: string[];
  advice: string[];
}

/**
 * Rule-based triage. This is decision SUPPORT for bystanders, not a diagnosis.
 * Always tell the user to call 112 / 108.
 */
export function runTriage(input: TriageInput): TriageResult {
  const advice: string[] = ['Call 112 or 108 now if you have not already.'];
  const guides: string[] = [];
  let severity: Severity = 'low';

  if (input.breathing === false || input.conscious === false) {
    severity = 'critical';
    guides.push('cpr-adult');
    advice.push('Person is unresponsive or not breathing: start chest compressions immediately.');
    advice.push('Send someone to fetch the nearest AED, if one is known.');
  } else if (input.severeBleeding) {
    severity = 'high';
    guides.push('severe-bleeding');
    advice.push('Press firmly on the wound with a clean cloth and do not release.');
  } else if (input.chestPain) {
    severity = 'high';
    advice.push('Keep the person seated and calm. Do not let them walk. Loosen tight clothing.');
  } else if (input.trapped || input.canMove === false) {
    severity = 'high';
    guides.push('road-accident-first-aid');
    advice.push('Do not move the person unless there is fire or immediate danger.');
  } else if (input.canMove === true) {
    severity = 'medium';
    advice.push('Keep the person still and watch breathing until help arrives.');
  }

  return {
    severity,
    callEmergency: true,
    recommendedGuides: guides,
    advice,
  };
}

export const severityRank: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};
