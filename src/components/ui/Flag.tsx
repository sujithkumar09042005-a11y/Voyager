// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import {
  AE, AR, AU, BR, CH, EG, ES, FR, GB, GR, HR, ID, IN, IS, IT, JO, JP, MA, MV, MX,
  NL, NO, NP, NZ, PE, SG, TH, TR, US, ZA,
} from 'country-flag-icons/react/1x1';

// The package's own component type, so its props line up exactly.
type FlagComponent = typeof AE;

/** Every country that appears in destinations.json. Add a line here when adding a destination. */
const FLAGS: Record<string, FlagComponent> = {
  'Argentina': AR,
  'Australia': AU,
  'Brazil': BR,
  'Croatia': HR,
  'Egypt': EG,
  'France': FR,
  'Greece': GR,
  'Iceland': IS,
  'India': IN,
  'Indonesia': ID,
  'Italy': IT,
  'Japan': JP,
  'Jordan': JO,
  'Maldives': MV,
  'Mexico': MX,
  'Morocco': MA,
  'Nepal': NP,
  'Netherlands': NL,
  'New Zealand': NZ,
  'Norway': NO,
  'Peru': PE,
  'Singapore': SG,
  'South Africa': ZA,
  'Spain': ES,
  'Switzerland': CH,
  'Thailand': TH,
  'Turkey': TR,
  'United Arab Emirates': AE,
  'United Kingdom': GB,
  'United States': US,
};

interface FlagProps {
  country: string;
  className?: string;
}

/**
 * Square national flag. Decorative: the country is always named in nearby text,
 * so the SVG is hidden from screen readers. Renders nothing for an unknown country.
 */
export function Flag({ country, className = '' }: FlagProps) {
  const Svg = FLAGS[country];
  if (!Svg) return null;
  return <Svg className={className} aria-hidden="true" />;
}
