import { svg } from 'lit';
import type { SVGTemplateResult } from 'lit';
import { iconFromPath } from '../icons.js';

export const gseControlPath = svg`<path fill="currentColor" d="M11,7H15V9H11V15H13V11H15V15A2,2 0 0,1 13,17H11A2,2 0 0,1 9,15V9A2,2 0 0,1 11,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />`;

export const lnPath = svg`<path d="m4.36 3.5c-2.08 0-3.78 1.7-3.78 3.78v10.4c0 2.08 1.7 3.78 3.78 3.78h16.3c2.08 0 3.78-1.7 3.78-3.78v-10.4c0-2.08-1.7-3.78-3.78-3.78zm0 1.7h16.3c1.16 0 2.07 0.909 2.07 2.07v10.4c0 1.16-0.909 2.08-2.07 2.08h-16.3c-1.16 0-2.07-0.909-2.07-2.08v-10.4c0-1.16 0.909-2.07 2.07-2.07z" stroke-width="1.11"/>
<path d="m5.97 17v-9h1.58v7.55h4.02v1.46z" fill="currentColor"/>
<path d="m17.2 17-3.27-6.94q0.0963 1.01 0.0963 1.62v5.31h-1.4v-9h1.79l3.32 6.99q-0.0963-0.963-0.0963-1.76v-5.24h1.4v9z" fill="currentColor"/>
`;

export const logControlPath = svg`<path fill="currentColor" d="M9,7H11V15H15V17H9V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />`;

export const reportControlPath = svg`<path fill="currentColor" d="M9,7H13A2,2 0 0,1 15,9V11C15,11.84 14.5,12.55 13.76,12.85L15,17H13L11.8,13H11V17H9V7M11,9V11H13V9H11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,16.41 7.58,20 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />`;

export const sampledValueControlPath = svg`<path fill="currentColor" d="M11,7H15V9H11V11H13A2,2 0 0,1 15,13V15A2,2 0 0,1 13,17H9V15H13V13H11A2,2 0 0,1 9,11V9A2,2 0 0,1 11,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />`;

export const dAIPath = svg`
  <g transform="matrix(.9 0 0 .9 .575 3.5)" fill="currentColor" stroke-width="1.1">
    <path d="m4.2 0c-2.31 0-4.2 1.89-4.2 4.2v11.6c0 2.31 1.89 4.2 4.2 4.2h18.1c2.31 0 4.2-1.89 4.2-4.2v-11.6c0-2.31-1.89-4.2-4.2-4.2zm0 1.89h18.1c1.29 0 2.3 1.01 2.3 2.3v11.6c0 1.29-1.01 2.31-2.3 2.31h-18.1c-1.29 0-2.3-1.01-2.3-2.31v-11.6c0-1.29 1.01-2.3 2.3-2.3z"/>
    <path d="m12.5 9.94q0 1.55-0.509 2.71-0.503 1.15-1.43 1.76-0.923 0.611-2.12 0.611h-3.37v-10h3.02q2.11 0 3.26 1.28 1.15 1.27 1.15 3.65zm-1.76 0q0-1.61-0.698-2.46-0.698-0.852-1.99-0.852h-1.24v6.77h1.48q1.12 0 1.79-0.931 0.663-0.931 0.663-2.53z"/>
    <path d="m19.7 15-0.74-2.56h-3.18l-0.74 2.56h-1.75l3.04-10h2.06l3.03 10zm-1.13-4.13-0.823-2.88-0.379-1.46q-0.0947 0.412-0.178 0.739-0.0829 0.327-1.02 3.59z"/>
  </g>
`;

export const dOIPath = svg`<path d="m4.36 3.5c-2.08 0-3.78 1.7-3.78 3.78v10.4c0 2.08 1.7 3.78 3.78 3.78h16.3c2.08 0 3.78-1.7 3.78-3.78v-10.4c0-2.08-1.7-3.78-3.78-3.78zm0 1.7h16.3c1.16 0 2.07 0.909 2.07 2.07v10.4c0 1.16-0.909 2.08-2.07 2.08h-16.3c-1.16 0-2.07-0.909-2.07-2.08v-10.4c0-1.16 0.909-2.07 2.07-2.07z" fill="currentColor" stroke-width="1.1"/>
<path d="m11.6 12.4q0 1.4-0.458 2.44-0.453 1.04-1.29 1.58-0.831 0.55-1.91 0.55h-3.03v-9h2.72q1.9 0 2.93 1.15 1.04 1.14 1.04 3.28zm-1.58 0q0-1.45-0.628-2.21-0.628-0.767-1.79-0.767h-1.12v6.09h1.33q1.01 0 1.61-0.838 0.597-0.838 0.597-2.28z" fill="currentColor" stroke-width="1.1"/>
<path d="m20.1 12.5q0 1.4-0.464 2.48t-1.32 1.64q-0.863 0.562-2.02 0.562-1.77 0-2.77-1.25t-0.999-3.43q0-2.17 0.999-3.38t2.79-1.22 2.79 1.22q1.01 1.22 1.01 3.37zm-1.6 0q0-1.46-0.575-2.29-0.575-0.831-1.61-0.831-1.05 0-1.63 0.824-0.575 0.818-0.575 2.29 0 1.48 0.586 2.34 0.591 0.85 1.61 0.85 1.05 0 1.63-0.831 0.575-0.831 0.575-2.36z" fill="currentColor" stroke-width="1.1"/>
`;

export const sDPath = svg`<path id="path2183" d="m4.36 3.5c-2.08 0-3.78 1.7-3.78 3.78v10.4c0 2.08 1.7 3.78 3.78 3.78h16.3c2.08 0 3.78-1.7 3.78-3.78v-10.4c0-2.08-1.7-3.78-3.78-3.78zm0 1.7h16.3c1.16 0 2.07 0.909 2.07 2.07v10.4c0 1.16-0.909 2.08-2.07 2.08h-16.3c-1.16 0-2.07-0.909-2.07-2.08v-10.4c0-1.16 0.909-2.07 2.07-2.07z" stroke-width="1" fill="currentColor"/>
<path id="path3794" d="m11.9 14.4q0 1.3-0.767 1.99-0.762 0.685-2.24 0.685-1.35 0-2.12-0.603-0.767-0.603-0.987-1.83l1.42-0.295q0.144 0.703 0.563 1.02 0.419 0.314 1.16 0.314 1.54 0 1.54-1.18 0-0.377-0.179-0.622-0.174-0.245-0.498-0.408-0.319-0.163-1.23-0.396-0.787-0.232-1.1-0.371-0.309-0.144-0.558-0.333-0.249-0.195-0.424-0.465-0.174-0.27-0.274-0.634-0.0947-0.364-0.0947-0.835 0-1.2 0.713-1.83 0.717-0.641 2.08-0.641 1.31 0 1.96 0.515 0.658 0.515 0.847 1.7l-1.43 0.245q-0.11-0.572-0.448-0.86-0.334-0.289-0.962-0.289-1.34 0-1.34 1.06 0 0.345 0.14 0.565 0.144 0.22 0.424 0.377 0.279 0.157 1.13 0.383 1.01 0.27 1.44 0.502 0.438 0.226 0.693 0.534 0.254 0.301 0.389 0.729 0.135 0.421 0.135 0.973z" stroke-width="1" fill="currentColor"/>
<path id="path3796" d="m19.2 12.4q0 1.37-0.429 2.39-0.424 1.02-1.21 1.56-0.777 0.54-1.78 0.54h-2.84v-8.85h2.54q1.77 0 2.75 1.13 0.972 1.12 0.972 3.23zm-1.48 0q0-1.43-0.588-2.17-0.588-0.754-1.68-0.754h-1.04v5.99h1.25q0.947 0 1.5-0.823 0.558-0.823 0.558-2.24z" stroke-width="1" fill="currentColor"/>
`;

export const clientLNPath = svg`
  <path 
    d="M21,14V4H3V14H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14L16,21V22H8V21L10,18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21M4,5H15V10H4V5M16,5H20V7H16V5M20,8V13H16V8H20M4,11H9V13H4V11M10,11H15V13H10V11Z"     stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"/
>`;

export const staticIcons: Partial<Record<string, string | SVGTemplateResult>> =
  {
    IED: 'developer_board',
    Server: 'dns',
    ServerAt: 'article_shortcut',
    Services: 'design_services',
    Authentication: 'key_vertical',
    LDevice: 'device_hub',
    DataSet: 'format_list_bulleted',
    FCDA: 'brick',
    Inputs: 'input',
    ExtRef: 'linear_scale',
    LN: iconFromPath(lnPath), // need dynamic function for different LN classes e.g. LGOS and LSVS
    LN0: 'settings',
    DAI: iconFromPath(dAIPath),
    DOI: iconFromPath(dOIPath),
    SDI: iconFromPath(sDPath),
    ReportControl: iconFromPath(reportControlPath),
    LogControl: iconFromPath(logControlPath),
    GSEControl: iconFromPath(gseControlPath),
    SampledValueControl: iconFromPath(sampledValueControlPath),
    DynAssociation: 'settings_ethernet',
    GetDirectory: 'folder',
    GetDataObjectDefinition: 'foundation',
    DataObjectDirectory: 'folder',
    GetDataSetValue: 'format_list_bulleted',
    DataSetDirectory: 'format_list_bulleted',
    ConfDataSet: 'format_list_bulleted',
    ReadWrite: 'edit',
    ConfReportControl: iconFromPath(reportControlPath),
    GetCBValues: 'call_received',
    ReportSettings: iconFromPath(reportControlPath),
    GSESettings: iconFromPath(gseControlPath),
    GOOSE: iconFromPath(gseControlPath),
    FileHandling: 'description',
    ConfLNs: 'settings',
    ClientServices: 'design_services',
    TimeSyncProt: 'schedule',
    ConfLdName: 'manufacturing',
    SupSubscription: 'vital_signs',
    RedProt: 'alt_route',
    SettingControl: 'tune',
    SettingGroups: 'settings_input_component',
    ValueHandling: 'label',
    CommProt: 'stacks',
    SMVSettings: iconFromPath(sampledValueControlPath),
    SMVSc: iconFromPath(sampledValueControlPath),
  };
