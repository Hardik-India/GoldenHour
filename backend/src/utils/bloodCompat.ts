export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'HH'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/**
 * Red-cell compatibility: for a patient group, which donor groups can safely give.
 * "HH" is the rare Bombay phenotype - patients can only receive from other HH donors.
 */
const DONORS_FOR_PATIENT: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['A-', 'O-'],
  'A+': ['A-', 'A+', 'O-', 'O+'],
  'B-': ['B-', 'O-'],
  'B+': ['B-', 'B+', 'O-', 'O+'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
  HH: ['HH'],
};

export const compatibleDonorGroups = (patient: BloodGroup): BloodGroup[] =>
  DONORS_FOR_PATIENT[patient];

export const isRareGroup = (group: BloodGroup): boolean =>
  group === 'HH' || group === 'AB-' || group === 'B-';
