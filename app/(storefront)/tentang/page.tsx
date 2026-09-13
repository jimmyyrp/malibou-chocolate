'use client';

import React from 'react';
import { AboutMalibou } from '../../../src/components/AboutMalibou';
import { WhyMalibou } from '../../../src/components/WhyMalibou';
import { CtaOrder } from '../../../src/components/CtaOrder';

export default function TentangPage() {
  return (
    <div className="pt-24 sm:pt-28">
      <AboutMalibou />
      <WhyMalibou />
      <CtaOrder />
    </div>
  );
}