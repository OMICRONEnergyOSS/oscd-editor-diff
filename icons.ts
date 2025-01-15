import { svg, SVGTemplateResult, TemplateResult } from 'lit';

import { staticIcons as staticIconsHeader } from './icons/tHeader.js';
import {
  staticIcons as staticIconsSubstation,
  createIcon,
} from './icons/tSubstation.js';
import { staticIcons as staticIconsCommunication } from './icons/tCommunication.js';
import { staticIcons as staticIconsIED } from './icons/tIED.js';
import { staticIcons as staticIconsDataTypeTemplates } from './icons/tDataTypeTemplates.js';

export const inputIcon = svg`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
<path fill="currentColor" d="M14,12L10,8V11H2V13H10V16M20,18V6C20,4.89 19.1,4 18,4H6A2,2 0 0,0 4,6V9H6V6H18V18H6V15H4V18A2,2 0 0,0 6,20H18A2,2 0 0,0 20,18Z" />
</svg>`;

export const clientIcon = svg`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
<path fill="currentColor" d="M21,14V4H3V14H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14L16,21V22H8V21L10,18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21M4,5H15V10H4V5M16,5H20V7H16V5M20,8V13H16V8H20M4,11H9V13H4V11M10,11H15V13H10V11Z" />
</svg>`;

export const disconnect = svg`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
<path fill="currentColor" d="M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M14,13C12.89,13 12,13.89 12,15V19C12,20.11 12.89,21 14,21H11V23H23V21H20C21.11,21 22,20.11 22,19V15C22,13.89 21.11,13 20,13H14M3.88,13.46L2.46,14.88L4.59,17L2.46,19.12L3.88,20.54L6,18.41L8.12,20.54L9.54,19.12L7.41,17L9.54,14.88L8.12,13.46L6,15.59L3.88,13.46M14,15H20V19H14V15Z" />
</svg>`;

const staticIcons: Partial<Record<string, SVGTemplateResult | string>> = {
  SCL: 'package_2',
  Private: 'tag',
  Text: 'text_fields',
  Val: 'stylus',
  ...staticIconsHeader,
  ...staticIconsSubstation,
  ...staticIconsCommunication,
  ...staticIconsIED,
  ...staticIconsDataTypeTemplates,
};

export function iconFromPath(path: TemplateResult<2>): TemplateResult<2> {
  return svg`<svg
    viewBox="0 0 25 25"
    width="18"
    height="18"
  >
    ${path}
  </svg>`;
}

export function getDisplayIcon(element: Element): string | TemplateResult<2> {
  return staticIcons[element.tagName] ?? createIcon(element) ?? 'question_mark';
}
