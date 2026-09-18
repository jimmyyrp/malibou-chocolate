'use client';

import React from 'react';
import { AboutMalibou } from './AboutMalibou';
import { WhyMalibou } from './WhyMalibou';
import { CtaOrder } from './CtaOrder';

export default function TentangPage() {
  return (
    <div className="pt-24 sm:pt-28">
      <AboutMalibou />
      <WhyMalibou />
      <CtaOrder />
    </div>
  );
}