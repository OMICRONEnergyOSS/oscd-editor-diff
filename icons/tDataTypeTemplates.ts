import { svg } from 'lit';
import type { SVGTemplateResult } from 'lit';
import { iconFromPath } from '../icons.js';
import {
  dAIPath,
  dOIPath,
  lnPath,
  reportControlPath,
  gseControlPath,
  sampledValueControlPath,
  logControlPath,
} from './tIED.js';

const enumPath = svg`  <path d="m4.36 3.5c-2.08 0-3.78 1.7-3.78 3.78v10.4c0 2.08 1.7 3.78 3.78 3.78h16.3c2.08 0 3.78-1.7 3.78-3.78v-10.4c0-2.08-1.7-3.78-3.78-3.78zm0 1.7h16.3c1.16 0 2.07 0.909 2.07 2.07v10.4c0 1.16-0.909 2.08-2.07 2.08h-16.3c-1.16 0-2.07-0.909-2.07-2.08v-10.4c0-1.16 0.909-2.07 2.07-2.07z" stroke-width="1.11"/>
<path d="m17.5 17-3.27-6.94q0.0963 1.01 0.0963 1.62v5.31h-1.4v-9h1.79l3.32 6.99q-0.0963-0.963-0.0963-1.76v-5.24h1.4v9z"/>
<path d="m5.68 17v-9h5.9v1.46h-4.33v2.26h4v1.46h-4v2.38h4.55v1.46z"/>
`;

export const staticIcons: Partial<Record<string, string | SVGTemplateResult>> =
  {
    DataTypeTemplates: 'database',
    LNodeType: iconFromPath(lnPath),
    BDA: 'brick',
    DA: iconFromPath(dAIPath),
    DAType: iconFromPath(dAIPath), // show type somehow?
    DO: iconFromPath(dOIPath),
    DOType: iconFromPath(dOIPath), // show type somehow?
    ReportControl: iconFromPath(reportControlPath),
    LogControl: iconFromPath(logControlPath),
    GSEControl: iconFromPath(gseControlPath),
    SampledValueControl: iconFromPath(sampledValueControlPath),
    EnumType: iconFromPath(enumPath),
    EnumVal: 'stylus',
  };
