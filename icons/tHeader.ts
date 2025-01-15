import type { SVGTemplateResult } from 'lit';

export const staticIcons: Partial<Record<string, string | SVGTemplateResult>> =
  {
    Header: 'family_history',
    History: 'timeline',
    Hitem: 'work_history', // or save_clock?
  };
