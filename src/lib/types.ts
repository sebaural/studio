export type FamilyMember = {
  id: string;
  name: string;
  birthDate: string;
  deathDate?: string;
  birthplace: string;
  bio: string;
  photoUrl: string;
  photoHint: string;
  parents: string[];
  spouse?: string;
  children: string[];
};

export type HistoricalInsight = {
  nameMeaning: string;
  historicalEvents: string;
  birthplaceInformation: string;
  additionalInsights?: string;
};
