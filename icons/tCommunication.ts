// import { svg } from 'lit';
import type { SVGTemplateResult } from 'lit';
import { iconFromPath } from '../icons.js';
import { gseControlPath, sampledValueControlPath } from './tIED.js';

// const communicationPath = svg`
//   <rect
//     width="8"
//     height="8"
//     x="8.5"
//     y="2"
//     rx="1"
//     ry="1"
//     fill="transparent"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />
//   <rect
//     width="8"
//     height="8"
//     x="2.5"
//     y="15"
//     rx="1"
//     ry="1"
//     fill="transparent"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />
//   <rect
//     width="8"
//     height="8"
//     x="15"
//     y="15"
//     rx="1"
//     ry="1"
//     fill="transparent"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />
//   <line
//     x1="2"
//     y1="12.5"
//     x2="23"
//     y2="12.5"
//     stroke="currentColor"
//     stroke-linecap="round"
//     stroke-width="1.5"
//   />
//   <line
//     x1="12.5"
//     y1="10"
//     x2="12.5"
//     y2="12.5"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />
//   <line
//     x1="6.5"
//     y1="12.5"
//     x2="6.5"
//     y2="15"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />
//   <line
//     x1="19"
//     y1="12.5"
//     x2="19"
//     y2="15"
//     stroke="currentColor"
//     stroke-width="1.5"
//   />`;

export const staticIcons: Partial<Record<string, string | SVGTemplateResult>> =
  {
    Communication: 'lan',
    AccessPoint: 'present_to_all',
    GSE: iconFromPath(gseControlPath),
    SMV: iconFromPath(sampledValueControlPath),
    SubNetwork: 'hub',
    P: 'read_more',
    ConnectedAP: 'computer',
    Address: 'alternate_email',
    PhysConn: 'settings_input_hdmi',
    MinTime: 'start',
    MaxTime: 'vital_signs',
  };
