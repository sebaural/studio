import type { FamilyMember } from '@/lib/types';

export const initialMembers: FamilyMember[] = [
  {
    "id": "1",
    "name": "Semyon Slizh",
    "birthDate": "1908-10-24",
    "deathDate": "1995-10-20",
    "birthplace": "Slizhi, Belarus",
    "bio": "A veteran of World War II, John was a carpenter by trade and a loving grandfather.",
    "photoUrl": "https://picsum.photos/seed/heritage1/400/400",
    "photoHint": "person",
    "parents": [],
    "spouse": "2",
    "children": [
      "3",
      "5"
    ]
  },
  {
    "id": "2",
    "name": "Maria Ivanovna Slizh",
    "birthDate": "1908-08-07",
    "deathDate": "2001-01-15",
    "birthplace": "Izhevsk, Russia",
    "bio": "Mary was a school teacher known for her kindness and delicious apple pies.",
    "photoUrl": "https://picsum.photos/seed/heritage2/400/400",
    "photoHint": "person",
    "parents": [],
    "spouse": "1",
    "children": [
      "3",
      "5"
    ]
  },
  {
    "id": "3",
    "name": "Yuriy Semyonovich Slizh",
    "birthDate": "1950-11-01",
    "deathDate": "2024-03-15",
    "birthplace": "Chelyabinsk, Russia",
    "bio": "An architect who loved to sail. He designed several notable buildings in his city.",
    "photoUrl": "https://picsum.photos/seed/heritage3/400/400",
    "photoHint": "person",
    "parents": [
      "1",
      "2"
    ],
    "spouse": "4",
    "children": []
  },
  {
    "id": "4",
    "name": "Valentina Slizh",
    "birthDate": "1952-02-20",
    "deathDate": "2018-03-01",
    "birthplace": "Zaporozhie, Ukrane",
    "bio": "A journalist who traveled the world, Jane had a passion for storytelling and photography.",
    "photoUrl": "https://picsum.photos/seed/heritage4/400/400",
    "photoHint": "person",
    "parents": [],
    "spouse": "3",
    "children": []
  },
  {
    "id": "5",
    "name": "Galina Semyonovna Scherbina",
    "birthDate": "1936-07-14",
    "birthplace": "Chelyabinsk, Russia",
    "bio": "A software developer and amateur musician, Sarah carries on her family's legacy of creativity.",
    "photoUrl": "https://picsum.photos/seed/heritage6/400/400",
    "photoHint": "person",
    "parents": [
      "1",
      "2"
    ],
    "children": []
  }
];
