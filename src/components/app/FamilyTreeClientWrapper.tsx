'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicFamilyTreePage = dynamic(() => import('@/components/app/FamilyTreePage'), { ssr: false });

export default function FamilyTreeClientWrapper() {
  return <DynamicFamilyTreePage />;
}
