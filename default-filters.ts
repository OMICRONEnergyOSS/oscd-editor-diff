import { Configurable } from './hash.js';
import { Filter } from './oscd-diff.js';

const BASE_CONFIGURABLE: Configurable = {
  inclusive: false,
  vals: [] as string[],
  except: [] as string[],
};

const BASE_FILTER: Filter = {
  description: '',
  ourSelector: '',
  theirSelector: '',
  selectors: BASE_CONFIGURABLE,
  attributes: BASE_CONFIGURABLE,
  namespaces: BASE_CONFIGURABLE,
};

export const defaultFilters: Record<string, Filter> = {
  Complete: BASE_FILTER,
  'Complete without Text/Desc': {
    ...BASE_FILTER,
    selectors: {
      ...BASE_CONFIGURABLE,
      vals: ['Text'],
    },
    attributes: {
      ...BASE_CONFIGURABLE,
      vals: ['desc'],
    },
  },
};
