import { svg } from 'lit';
import type { SVGTemplateResult, TemplateResult } from 'lit';
import { iconFromPath } from '../icons.js';

const defaultEquipmentPath = svg`
  <circle
    cx="12.5"
    cy="12.5"
    r="11"
    stroke-width="1.5"
    stroke="currentColor"
    fill="none"
  />
  <path
    d=" M 7.5 17.5
    L 12 13
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="	M 11 7
      L 10 8
      C 5 13, 11 20, 17 15
      L 18 14
      Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path
    d=" M 13 9
    L 16 6
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d=" M 16 12
    L 19 9
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
`;

const equipmentPaths: Record<string, TemplateResult<2>> = {
  CAB: svg`
    <path
      d="M 12.5,0 V 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="M 9.4,4.2 H 15.6 L 12.5,8.3 Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="m 12.5,8.3 v 9"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="m 9.4,21.3 h 6.2 l -3.1,-4.1 z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="m 12.5,21.3 v 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    `,
  CAP: svg`
    <path
      d="M 6.5,10.1 H 18.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="M 12.5,0 V 10.1"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="M 6.5,14.9 H 18.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="M 12.5,14.9 V 25"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    `,
  CBR: svg`
    <line
      x1="12.5"
      y1="0"
      x2="12.5"
      y2="4"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="12.5"
      y1="25"
      x2="12.5"
      y2="21"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="12.5"
      y1="21"
      x2="4"
      y2="5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="9.5"
      y1="1"
      x2="15.5"
      y2="7"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="9.5"
      y1="7"
      x2="15.5"
      y2="1"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  CTR: svg`
    <line
      x1="12.5"
      y1="0"
      x2="12.5"
      y2="25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle
      cx="12.5"
      cy="12.5"
      r="7.5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  DIS: svg`
    <path
      d="M 12.5 0 L 12.5 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d=" M 12.5 25 L 12.5 21"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 12.5 21 L 4 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 8 4 L 17 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  GEN: svg`
    <path
      d="m 16.2,12.5 v 4.2 q -0.2,0.2 -0.6,0.6 -0.4,0.4 -1.1,0.7 -0.7,0.3 -1.8,0.3 -1.8,0 -2.9,-1.2 -1.1,-1.2 -1.1,-3.6 v -2.1 q 0,-2.4 1,-3.6 1,-1.1 2.9,-1.1 1.7,0 2.6,0.9 0.9,0.9 1,2.6 h -1.4 q -0.1,-1.1 -0.6,-1.6 -0.5,-0.6 -1.5,-0.6 -1.3,0 -1.8,0.9 -0.5,0.9 -0.5,2.6 v 2.1 q 0,1.8 0.7,2.7 0.7,0.9 1.9,0.9 1,0 1.4,-0.3 0.4,-0.3 0.6,-0.5 v -2.6 h -2.1 v -1.2 z"
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0.3"
      stroke-linecap="round"
    />
    <path
      d="M 12.5,0 V 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <circle
      cx="12.5"
      cy="12.5"
      r="8.5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  IFL: svg`
    <path
      d="M 12.5 0 L 12.5 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 12.5 25 L 12.5 21"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <polygon
      points="4,4 12.5,21 21,4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    `,
  LIN: svg`
    <path
      d="M 12.5,0 V 25"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="m 10.3,12.5 4.3,-2.5"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="m 10.3,15 4.3,-2.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  MOT: svg`
    <path
      d="m 12.5,15.5 2.3,-7.8 h 1.4 v 9.6 h -1.1 v -3.7 l 0.1,-3.7 -2.3,7.4 h -0.9 L 9.8,9.8 9.9,13.6 v 3.7 H 8.8 V 7.7 h 1.4 z"
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0.3"
      stroke-linecap="round"
    />
    `,
  REA: svg`
    <path
      d="m 4.5,12.5 h 8 V 0"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="m 4.5,12.5 a 8,8 0 0 1 8,-8 8,8 0 0 1 8,8 8,8 0 0 1 -8,8"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 12.5,20.5 V 25"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 12.5,0 V 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <circle
      cx="12.5"
      cy="12.5"
      r="8.5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  RES: svg`
    <path
      d="M 12.5,0 V 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="m 12.5 25 v -4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <rect
      y="4"
      x="8.5"
      height="17"
      width="8"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  SAR: svg`
    <path
      d="M 12.5,0 V 8"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <path
      d="m 12.5,21 v 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="10"
      y1="24.25"
      x2="15"
      y2="24.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M 11.2,8 12.5,11 13.8,8 Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
    />
    <rect
      y="4"
      x="8.5"
      height="17"
      width="8"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  SMC: svg`
    <path
      d="m 16.6,12.5 c -0.7,1.4 -1.3,2.8 -2.1,2.8 -1.5,0 -2.6,-5.6 -4.1,-5.6 -0.7,0 -1.4,1.4 -2.1,2.8"
      stroke="currentColor"
      fill="none"
      stroke-width="1.2"
      stroke-linecap="round"
    />
    <path
      d="M 12.5,0 V 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      />
    <circle
      cx="12.5"
      cy="12.5"
      r="8.5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    `,
  VTR: svg`
    <line
      x1="12.5"
      y1="0"
      x2="12.5"
      y2="5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle
      cx="12.5"
      cy="10"
      r="5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle
      cx="12.5"
      cy="15"
      r="5"
      stroke="currentColor"
      fill="none"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  `,
  ESW: svg`<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
    <path
      d="m12.5 0v4"
    />
    <path
      d="m12.5 18.1v-4"
    />
    <path
      d="m12.5 14.1-8.5-8.55"
    />
    <path
      d="m8 4h9"
    />
  </g>
  <g
    transform="rotate(90 9.32 15.7)"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  >
    <line x1="12.5" x2="12.5" y1="17" y2="8" />
    <line x1="14.7" x2="14.7" y1="15.5" y2="9.5" />
    <line x1="16.8" x2="16.8" y1="14.5" y2="10.5" />
  </g>
  `,
};

export const powerTransformerTwoWindingPath = svg`
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="20"
    x2="12.5"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />`;

export function createIcon(element: Element): string | TemplateResult<2> {
  if (element.tagName === 'ConductingEquipment') {
    let type = element.getAttribute('type');
    if (
      type === 'DIS' &&
      element.querySelector(':scope > Terminal[cNodeName="grounded"]')
    ) {
      type = 'ESW';
    }
    if (type) {
      return iconFromPath(equipmentPaths[type]);
    }
    return defaultEquipmentPath;
  }

  return 'question_mark';
}

const bayPath = svg`<path
    d="M 3 2 L 22 2"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 3 5 L 22 5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 7 2 L 7 7.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 18 5 L 18 7.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 5.5 8.5 L 7 11 L 7 13 L 18 13 L 18 11 L 16.5 8.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 13 L 12.5 15"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 11 16 L 12.5 18.5 L 12.5 23"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 10.5 21 L 12.5 23 L 14.5 21"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />`;

const voltageLevelPath = svg`<path
    d="M 4 4 L 12.5 21 L 21 4"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linejoin="round"
    stroke-linecap="round"
  />`;

const connectivityNodePath = svg`
  <circle
    stroke="currentColor"
    fill="currentColor"
    stroke-width="1"
    cx="12.5"
    cy="12.5"
    r="5"
  />`;

const transformerWindingPath = svg`
  <path     
    d="m10.3 1.3v2.87s4.32 0 4.32 2.08c0 2.08-4.32 2.08-4.32 2.08s4.32 0 4.32 2.08c0 2.08-4.32 2.08-4.32 2.08s4.32 0 4.32 2.08-4.32 2.08-4.32 2.08 4.32 0 4.32 2.08-4.32 2.08-4.32 2.08v2.87" 
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />`;

const processIconPath = svg`
  <path d="M18.71,15.29c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l.29.29h-5.59c0-1.1-.9-2-2-2h-2c-1.01,0-1.84.76-1.97,1.74-.61-.34-1.03-.99-1.03-1.74,0-1.1.9-2,2-2h5c0,1.1.9,2,2,2h2c1.1,0,2-.9,2-2v-.14c1.72-.45,3-2,3-3.86,0-2.21-1.79-4-4-4h-5c0-1.1-.9-2-2-2h-2c-1.1,0-2,.9-2,2h-2c-.55,0-1,.45-1,1s.45,1,1,1h2c0,1.1.9,2,2,2h2c1.1,0,2-.9,2-2h5c1.1,0,2,.9,2,2,0,.75-.42,1.39-1.03,1.74-.13-.98-.96-1.74-1.97-1.74h-2c-1.1,0-2,.9-2,2h-5c-2.21,0-4,1.79-4,4,0,1.86,1.28,3.41,3,3.86v.14c0,1.1.9,2,2,2h2c1.1,0,2-.9,2-2h5.59l-.29.29c-.39.39-.39,1.02,0,1.41.2.2.45.29.71.29s.51-.1.71-.29l2-2c.39-.39.39-1.02,0-1.41l-2-2ZM8,7v-2h2v2s-2,0-2,0ZM14,11h2v2s-2,0-2,0v-2ZM8,19v-2h2v2s-2,0-2,0Z"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <rect y="0" width="24" height="24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  `;

const lineIconPath = svg`
  <path d="M14.39,11.93l-1.39.58v-1.84l2.15-.89c.51-.21.75-.8.54-1.31-.21-.51-.8-.75-1.31-.54l-1.39.58V3c0-.55-.45-1-1-1s-1,.45-1,1v6.33l-2.15.89c-.51.21-.75.8-.54,1.31.21.51.8.75,1.31.54l1.39-.58v1.84l-2.15.89c-.51.21-.75.8-.54,1.31.21.51.8.75,1.31.54l1.39-.58v5.5c0,.55.45,1,1,1s1-.45,1-1v-6.33l2.15-.89c.51-.21.75-.8.54-1.31-.21-.51-.8-.75-1.31-.54Z"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"    
    />
  <rect width="24" height="24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
    />
`;

const tapChangerPath = svg`
  <path d="m18.7 4.96-14.7 14.4 0.701 0.713 14.7-14.4z" fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"/>
  <path d="m21.1 3.29-1.34 4.81-3.5-3.57z" fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"/>
  <path d="m21.6 2.82-0.559 0.145-5.4 1.39 4.31 4.39zm-0.951 0.934-1.03 3.7-2.69-2.74z" fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
    />
`;
export const generalConductingEquipmentIcon = svg`
  <path
    d="M20.41,3.59c-.78-.78-2.05-.78-2.83,0-.59.59-.73,1.47-.43,2.19l-1.49,1.49c-1.02-.79-2.29-1.27-3.67-1.27-3.31,0-6,2.69-6,6,0,1.38.48,2.66,1.27,3.67l-1.49,1.49c-.73-.31-1.6-.17-2.19.43-.78.78-.78,2.05,0,2.83.78.78,2.05.78,2.83,0,.59-.59.73-1.47.43-2.19l1.49-1.49c1.02.79,2.29,1.27,3.67,1.27,3.31,0,6-2.69,6-6,0-1.38-.48-2.66-1.27-3.67l1.49-1.49c.73.31,1.6.17,2.19-.43.78-.78.78-2.05,0-2.83ZM12,16c-2.21,0-4-1.79-4-4s1.79-4,4-4,4,1.79,4,4-1.79,4-4,4Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
`;

export const staticIcons: Partial<Record<string, string | SVGTemplateResult>> =
  {
    VoltageLevel: iconFromPath(voltageLevelPath),
    Bay: iconFromPath(bayPath),
    Substation: 'margin',
    Terminal: 'line_end_circle',
    ConnectivityNode: iconFromPath(connectivityNodePath),
    TransformerWinding: iconFromPath(transformerWindingPath),
    PowerTransformer: iconFromPath(powerTransformerTwoWindingPath),
    Process: iconFromPath(processIconPath),
    Line: iconFromPath(lineIconPath),
    Function: 'functions',
    EqSubFunction: 'functions',
    EqFunction: 'functions',
    SubFunction: 'functions',
    LNode: 'bubbles',
    TapChanger: iconFromPath(tapChangerPath),
    SubEquipment: iconFromPath(generalConductingEquipmentIcon),
  };

//   Didn't use:

// export const dataTypeTemplateIcons: Partial<Record<string, SVGTemplateResult>> =
//   {
//     DAType: getIcon('dAIcon'),
//     DOType: getIcon('dOIcon'),
//     EnumType: getIcon('enumIcon'),
//     LNodeType: getIcon('lNIcon'),
//   };

// export const zeroLineIcon = html`<svg
//   xmlns="http://www.w3.org/2000/svg"
//   slot="icon"
//   viewBox="0 0 25 25"
// >
//   <path
//     d="M 2 9 L 12.5 2 L 23 9 L 21 9 L 21 21 L 4 21 L 4 9 Z"
//     fill="transparent"
//     stroke="currentColor"
//     stroke-width="2"
//     stroke-linejoin="round"
//   />
//   <path
//     d="M 11 7 L 17.5 7 L 13.5 11 L 16.5 11 L 10 19 L 11.5 13 L 8.5 13 Z "
//     fill="currentColor"
//   />
// </svg>`;

// export const voltageLevelIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: currentColor;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <path
//     class="cls-1"
//     d="M11.13,20.06L3.63,6.93c-.27-.48-.11-1.09.37-1.36h0c.48-.27,1.09-.11,1.36.37l6.64,11.61,6.64-11.61c.27-.48.88-.65,1.36-.37h0c.48.27.65.88.37,1.36l-7.5,13.13c-.38.67-1.35.67-1.74,0Z"
//   />
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// export const bayIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//         stroke-width: 0px;
//       }
//     </style>
//   </defs>
//   <path
//     class="cls-1"
//     d="M7.75,8c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.5h-1.25c0,.84.52,1.55,1.25,1.85v8.65h1.5v-8.65c.73-.3,1.25-1.01,1.25-1.85h-1.25v-1.5Z"
//   />
//   <path
//     class="cls-1"
//     d="M12.75,8c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.5h-1.25c0,.84.52,1.55,1.25,1.85v8.65h1.5v-8.65c.73-.3,1.25-1.01,1.25-1.85h-1.25v-1.5Z"
//   />
//   <path
//     class="cls-1"
//     d="M17.75,8c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.5h-1.25c0,.84.52,1.55,1.25,1.85v8.65h1.5v-8.65c.73-.3,1.25-1.01,1.25-1.85h-1.25v-1.5Z"
//   />
//   <path
//     class="cls-1"
//     d="M20,4H4c-1.1,0-2,.9-2,2v4c0,1.1.9,2,2,2v-6h16v6c1.1,0,2-.9,2-2v-4c0-1.1-.9-2-2-2Z"
//   />
// </svg>`;

// export const disconnectorIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: #fff;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <g>
//     <path
//       class="cls-1"
//       d="M12.71,15.29l-6.79-6.79c-.39-.39-1.02-.39-1.41,0-.39.39-.39,1.02,0,1.41l6.5,6.5v4.59c0,.55.45,1,1,1s1-.45,1-1v-5c0-.13-.03-.26-.08-.38-.05-.12-.12-.23-.22-.33Z"
//     />
//     <path
//       class="cls-1"
//       d="M14,6h-1v-3c0-.55-.45-1-1-1s-1,.45-1,1v3h-1c-.55,0-1,.45-1,1s.45,1,1,1h4c.55,0,1-.45,1-1s-.45-1-1-1Z"
//     />
//   </g>
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// export const circuitBreakerIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: #fff;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <g>
//     <path
//       class="cls-1"
//       d="M12.71,15.29l-6.79-6.79c-.39-.39-1.02-.39-1.41,0-.39.39-.39,1.02,0,1.41l6.5,6.5v4.59c0,.55.45,1,1,1s1-.45,1-1v-5c0-.13-.03-.26-.08-.38-.05-.12-.12-.23-.22-.33Z"
//     />
//     <path
//       class="cls-1"
//       d="M13.41,7l1.29-1.29c.39-.39.39-1.02,0-1.41s-1.02-.39-1.41,0l-1.29,1.29-1.29-1.29c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l1.29,1.29-1.29,1.29c-.39.39-.39,1.02,0,1.41.2.2.45.29.71.29s.51-.1.71-.29l1.29-1.29,1.29,1.29c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.02,0-1.41l-1.29-1.29Z"
//     />
//   </g>
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// export const currentTransformerIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: #fff;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <path
//     class="cls-1"
//     d="M19,12c0-3.53-2.61-6.43-6-6.92v-2.08c0-.55-.45-1-1-1s-1,.45-1,1v2.08c-3.39.49-6,3.39-6,6.92s2.61,6.43,6,6.92v2.08c0,.55.45,1,1,1s1-.45,1-1v-2.08c3.39-.49,6-3.39,6-6.92ZM7,12c0-2.42,1.72-4.44,4-4.9v9.8c-2.28-.46-4-2.48-4-4.9ZM13,16.9V7.1c2.28.46,4,2.48,4,4.9s-1.72,4.44-4,4.9Z"
//   />
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// export const voltageTransformerIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: #fff;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <path
//     class="cls-1"
//     d="M17,10c0-2.42-1.72-4.44-4-4.9v-2.1s0-1-1-1-1,1-1,1v2.1c-2.28.46-4,2.48-4,4.9,0,.71.15,1.39.42,2-.27.61-.42,1.29-.42,2,0,2.42,1.72,4.44,4,4.9v1.1h-1c-.55,0-1,.45-1,1s.45,1,1,1h4c.55,0,1-.45,1-1s-.45-1-1-1h-1v-1.1c2.28-.46,4-2.48,4-4.9,0-.71-.15-1.39-.42-2,.27-.61.42-1.29.42-2ZM12,7c1.66,0,3,1.34,3,3,0,0,0,.01,0,.02-.84-.63-1.87-1.02-3-1.02s-2.16.39-3,1.02c0,0,0-.01,0-.02,0-1.66,1.34-3,3-3ZM14.22,12c-.55.61-1.34,1-2.22,1s-1.67-.39-2.22-1c.55-.61,1.34-1,2.22-1s1.67.39,2.22,1ZM12,17c-1.66,0-3-1.34-3-3,0,0,0-.01,0-.02.84.63,1.87,1.02,3,1.02s2.16-.39,3-1.02c0,0,0,.01,0,.02,0,1.66-1.34,3-3,3Z"
//   />
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// export const earthSwitchIcon = html`<svg
//   id="Laag_1"
//   data-name="Laag 1"
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
// >
//   <defs>
//     <style>
//       .cls-1 {
//         fill: currentColor;
//       }

//       .cls-1,
//       .cls-2 {
//         stroke-width: 0px;
//       }

//       .cls-2 {
//         fill: #fff;
//         opacity: 0;
//       }
//     </style>
//   </defs>
//   <g>
//     <path
//       class="cls-1"
//       d="M13,20h-2c-.55,0-1,.45-1,1s.45,1,1,1h2c.55,0,1-.45,1-1s-.45-1-1-1Z"
//     />
//     <path
//       class="cls-1"
//       d="M15,16h-2v-5c0-.13-.03-.26-.08-.38-.05-.12-.12-.23-.22-.33L5.91,3.5c-.39-.39-1.02-.39-1.41,0-.39.39-.39,1.02,0,1.41l6.5,6.5v4.59h-2c-.55,0-1,.45-1,1s.45,1,1,1h6c.55,0,1-.45,1-1s-.45-1-1-1Z"
//     />
//     <path
//       class="cls-1"
//       d="M10,4h4c.55,0,1-.45,1-1s-.45-1-1-1h-4c-.55,0-1,.45-1,1s.45,1,1,1Z"
//     />
//   </g>
//   <rect class="cls-2" width="24" height="24" />
// </svg>`;

// const sizableSmvIcon = svg`
//   <svg viewBox="0 0 24 24">
//     <path fill="currentColor" d="M11,7H15V9H11V11H13A2,2 0 0,1 15,13V15A2,2 0 0,1 13,17H9V15H13V13H11A2,2 0 0,1 9,11V9A2,2 0 0,1 11,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
//   </svg>`;

// const sizableGooseIcon = svg`<svg viewBox="0 0 24 24">
// <path fill="currentColor" d="M11,7H15V9H11V15H13V11H15V15A2,2 0 0,1 13,17H11A2,2 0 0,1 9,15V9A2,2 0 0,1 11,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
// </svg>`;

//
// const substationIcon = svg`<svg id="Laag_1" data-name="Laag 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
// <defs>
//   <style>
//     .cls-1 {
//       fill: currentColor;
//     }

//     .cls-1, .cls-2 {
//       stroke-width: 0px;
//     }

//     .cls-2 {
//       fill: currentColor;
//       opacity: 0;
//     }
//   </style>
// </defs>
// <g>
//   <path class="cls-1" d="M19.3,7.94l-6-5.14c-.75-.64-1.85-.65-2.6,0l-6,5.14c-.44.38-.7.93-.7,1.52v9.54c0,1.1.9,2,2,2h12c1.1,0,2-.9,2-2v-9.54c0-.58-.25-1.14-.7-1.52ZM18,19H6v-9.54l6-5.14,6,5.14v9.54Z"/>
//   <path class="cls-1" d="M11.57,7.74l-3,5c-.09.15-.09.35,0,.5.09.16.26.25.44.25h2v3.5c0,.22.15.42.37.48.04.01.09.02.13.02.17,0,.34-.09.43-.24l3-5c.09-.15.09-.35,0-.5-.09-.16-.26-.25-.44-.25h-2v-3.5c0-.22-.15-.42-.37-.48-.22-.06-.45.03-.56.22Z"/>
// </g>
// <rect class="cls-2" y="0" width="24" height="24"/>
// </svg>`;
