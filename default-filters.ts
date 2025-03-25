import { Configurable } from './hash.js';
import { BaseConfigurable, BaseFilter, Filter } from './oscd-diff.js';

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

const identifiers: Record<string, string[]> = {
  '*': ['name', 'id'],
  DAI: ['name', 'ix'],
  SMV: ['ldInst', 'cbName'],
  LNode: ['iedName', 'ldInst', 'prefix', 'lnClass', 'lnInst', 'lnType'],
  ConnectedAP: ['iedName', 'apName'],
  Terminal: ['connectivityNode'],
  SDI: ['name', 'ix'],
  LN0: ['prefix', 'lnClass', 'inst'],
  GSE: ['ldInst', 'cbName'],
  Hitem: ['version', 'revision'],
  LDevice: ['IED', 'inst'],
  IEDName: ['apRef', 'ldInst', 'prefix', 'lnClass', 'lnInst'],
  PhysConn: ['type'],
  Association: ['iedName', 'ldInst', 'prefix', 'lnClass', 'lnInst', 'lnType'],
  ClientLN: ['apRef', 'iedName', 'ldInst', 'prefix', 'lnClass', 'lnInst'],
  KDC: ['iedName', 'apName'],
  LN: ['prefix', 'lnClass', 'inst'],
  AccessPoint: ['name'],
};

const excludedIdentifiers = Object.entries(identifiers)
  .map(([tagName, attributes]) =>
    attributes.map(a => (tagName === '*' ? a : `${tagName}.${a}`)),
  )
  .flat();

const exceptions = ['Terminal.name', 'NeutralPoint.name', 'Log.name'];

export const defaultBaseFilters: BaseFilter = {
  inclusive: {
    selectors: {
      vals: [],
      except: [],
    },
    attributes: {
      vals: exceptions,
      except: excludedIdentifiers,
    },
    namespaces: {
      vals: [],
      except: [],
    },
  },
  exclusive: {
    selectors: {
      vals: [],
      except: [],
    },
    attributes: {
      vals: excludedIdentifiers,
      except: exceptions,
    },
    namespaces: {
      vals: [],
      except: [],
    },
  },
};

function extendConfigurable(
  {
    inclusiveBase,
    exclusiveBase,
  }: { inclusiveBase: BaseConfigurable; exclusiveBase: BaseConfigurable },
  configurable: Configurable,
) {
  return configurable.inclusive
    ? {
        inclusive: configurable.inclusive,
        vals: [...inclusiveBase.vals, ...configurable.vals],
        except: [...inclusiveBase.except, ...configurable.except],
      }
    : {
        inclusive: configurable.inclusive,
        vals: [...exclusiveBase.vals, ...configurable.vals],
        except: [...exclusiveBase.except, ...configurable.except],
      };
}

export function extendFilter(base: BaseFilter, filter: Filter): Filter {
  return {
    ...filter,
    selectors: extendConfigurable(
      {
        inclusiveBase: base.inclusive.selectors,
        exclusiveBase: base.exclusive.selectors,
      },
      filter.selectors,
    ),
    attributes: extendConfigurable(
      {
        inclusiveBase: base.inclusive.attributes,
        exclusiveBase: base.exclusive.attributes,
      },
      filter.attributes,
    ),
    namespaces: extendConfigurable(
      {
        inclusiveBase: base.inclusive.namespaces,
        exclusiveBase: base.exclusive.namespaces,
      },
      filter.namespaces,
    ),
  };
}

export const defaultFilters: Record<string, Filter> = {
  Complete: {
    ...BASE_FILTER,
    description: 'Compare everything in all namespaces',
  },
  'Complete without Text/Desc': {
    ...BASE_FILTER,
    selectors: {
      inclusive: false,
      vals: ['Text'],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: ['desc'],
      except: [],
    },
  },
  'Complete: Without Text/desc': {
    ...BASE_FILTER,
    description:
      'Compare everything but without Text elements and desc attributes',
    selectors: {
      inclusive: false,
      vals: ['Text'],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: ['desc'],
      except: [],
    },
  },
  'Complete: SCL Only (no Privates)': {
    ...BASE_FILTER,
    description: 'Compare the SCL namespace but ignore Private elements',
    ourSelector: '',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: ['Private'],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  Header: {
    ...BASE_FILTER,
    description: 'Compare versioning and history items',
    ourSelector: 'Header',
    theirSelector: 'Header',
  },
  Substation: {
    ...BASE_FILTER,
    description: 'Compare single line diagram and specification functionality',
    ourSelector: 'Substation',
    theirSelector: 'Substation',
  },
  'Communication: Complete': {
    ...BASE_FILTER,
    description: '',
    ourSelector: 'Communication',
    theirSelector: 'Communication',
  },
  'Communication: IP Addresses and MMS Session': {
    ...BASE_FILTER,
    description: 'Look at IP addresses',
    ourSelector: 'P',
    selectors: {
      inclusive: true,
      vals: [
        'P[type="IP"]',
        'P[type="IP"] *',
        'P[type="IP-SUBNET"]',
        'P[type="IP-SUBNET"] *',
        'P[type="IP-GATEWAY"]',
        'P[type="IP-GATEWAY"] *',
        'P[type="OSI-TSEL"]',
        'P[type="OSI-SEL"]',
        'P[type="OSI-SSEL"]',
      ],
      except: [],
    },
  },
  'Communication: Multicast Traffic Addressing': {
    ...BASE_FILTER,
    description:
      'Compare Communication GSE and SMV elements (MAC, VLAN, priority etc.)',
    ourSelector: 'Communication',
    selectors: {
      inclusive: true,
      vals: [
        'Communication',
        'SubNetwork',
        'ConnectedAP',
        'GSE',
        'SMV',
        'Address',
        'P[type="VLAN-ID"]',
        'P[type="VLAN-PRIORITY"]',
        'P[type="MAC-Address"]',
      ],
      except: [],
    },
  },
  'Communication: SCL without Privates': {
    ...BASE_FILTER,
    description:
      'Compare only the Communication section in the SCL namespace without Privates',
    ourSelector: 'Communication',
    theirSelector: 'Communication',
    selectors: {
      inclusive: false,
      vals: ['Private'],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  'IED: All - Complete': {
    ...BASE_FILTER,
    description: 'Compare all IED in all namespaces',
    ourSelector: 'IED',
  },
  'IED: All - Only SCL namespace without DataTypes or Privates': {
    ...BASE_FILTER,
    description:
      'Compare all IEDs, only in the SCL namespace and without referencing DataTypes or look into Private elements',
    ourSelector: 'IED',
    selectors: {
      inclusive: false,
      vals: ['Private'],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  'IED: Compare Two  IEDs': {
    ...BASE_FILTER,
    description:
      'Allow comparison of two IEDs in the same or a different file (requires user modification)',
    ourSelector: 'IED[name="XAT_BusA_P1"] *',
    theirSelector: 'IED[name="SOM_BusA_P1"] *',
    selectors: {
      inclusive: true,
      vals: [],
      except: ['ServerAt'],
    },
    attributes: {
      inclusive: false,
      vals: ['serviceType'],
      except: [],
    },
  },
  'IED: Individual': {
    ...BASE_FILTER,
    description: 'Compare a specific IED (requires user modification)',
    ourSelector: 'IED',
    selectors: {
      inclusive: true,
      vals: ['IED[name="SOM_BusA_P1"] *'],
      except: ['ServerAt'],
    },
    attributes: {
      inclusive: false,
      vals: ['serviceType'],
      except: [],
    },
  },
  'IED: MMS Report Content': {
    ...BASE_FILTER,
    description:
      'Compare ReportControl elements within each IED (buffered and unbuffered)',
    ourSelector: 'ReportControl',
  },
  DataTypeTemplates: {
    ...BASE_FILTER,
    description: 'Compare only data type definitions',
    ourSelector: 'DataTypeTemplates',
    theirSelector: 'DataTypeTemplates',
  },
};
