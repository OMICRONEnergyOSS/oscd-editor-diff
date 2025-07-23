import { Configurable } from './hash.js';
import { BaseConfigurable, BaseFilter, Filter } from './oscd-editor-diff.js';

const identifiers: Record<string, string[]> = {
  '*': ['name', 'id'],
  DAI: ['name', 'ix'],
  SMV: ['ldInst', 'cbName'],
  ConnectedAP: ['iedName', 'apName'],
  SDI: ['name', 'ix'],
  LN0: ['prefix', 'lnClass', 'inst'],
  GSE: ['ldInst', 'cbName'],
  Hitem: ['version', 'revision'],
  LDevice: ['IED', 'inst'],
  PhysConn: ['type'],
  KDC: ['iedName', 'apName'],
  LN: ['prefix', 'lnClass', 'inst'],
  AccessPoint: ['name'],
};

const excludedIdentifiers = Object.entries(identifiers)
  .map(([tagName, attributes]) =>
    attributes.map(a => (tagName === '*' ? a : `${tagName}.${a}`)),
  )
  .flat();

const exceptions = [
  'Terminal.name',
  'NeutralPoint.name',
  'Log.name',
  'GSEControl.name',
  'SampledValueControl.name',
  'ReportControl.name',
];

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
    description: 'Compare everything in all namespaces',
    ourSelector: '',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Complete: Without Text/desc': {
    description:
      'Compare everything but without Text elements and desc attributes',
    ourSelector: '',
    theirSelector: '',
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
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Complete: SCL Only (no Privates)': {
    description:
      'Compare the SCL namespace (but not Private elements or other namespaced items)',
    ourSelector: '',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: ['Private'],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  Header: {
    description: 'Compare versioning and history items',
    ourSelector: 'Header',
    theirSelector: 'Header',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  Substation: {
    description: 'Compare single line diagram and specification functionality',
    ourSelector: 'Substation',
    theirSelector: 'Substation',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Communication: Complete': {
    description: '',
    ourSelector: 'Communication',
    theirSelector: 'Communication',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Communication: IP Addresses and MMS Session': {
    description:
      'Compare IP address, subnet and gateway and MMS session parameters',
    ourSelector: 'Communication',
    theirSelector: '',
    selectors: {
      inclusive: true,
      vals: [
        'Communication',
        'Communication > SubNetwork',
        'Communication > SubNetwork > ConnectedAP',
        'Communication > SubNetwork > ConnectedAP > Address',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP"] *',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP-SUBNET"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP-SUBNET"] *',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP-GATEWAY"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="IP-GATEWAY"] *',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-TSEL"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-TSEL"] *',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-SEL"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-SEL"] *',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-SSEL"]',
        'Communication > SubNetwork > ConnectedAP > Address > P[type="OSI-SSEL"] *',
      ],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Communication: Multicast Traffic Addressing': {
    description:
      'Compare Communication GSE and SMV elements (MAC, VLAN, priority etc.)',
    ourSelector: 'Communication',
    theirSelector: '',
    selectors: {
      inclusive: true,
      vals: [
        'Communication',
        'Communication > SubNetwork',
        'Communication > SubNetwork > ConnectedAP',
        'Communication > SubNetwork > ConnectedAP > GSE',
        'Communication > SubNetwork > ConnectedAP > SMV',
        'Communication > SubNetwork > ConnectedAP > GSE > Address',
        'Communication > SubNetwork > ConnectedAP > SMV > Address',
        'Communication > SubNetwork > ConnectedAP > GSE > Address > P[type="VLAN-ID"]',
        'Communication > SubNetwork > ConnectedAP > GSE > Address > P[type="VLAN-PRIORITY"]',
        'Communication > SubNetwork > ConnectedAP > GSE > Address > P[type="MAC-Address"]',
        'Communication > SubNetwork > ConnectedAP > SMV > Address > P[type="VLAN-ID"]',
        'Communication > SubNetwork > ConnectedAP > SMV > Address > P[type="VLAN-PRIORITY"]',
        'Communication > SubNetwork > ConnectedAP > SMV > Address > P[type="MAC-Address"]',
      ],
      except: ['AccessPoint'],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'Communication: SCL without Privates': {
    description:
      'Compare only the Communication section in the SCL namespace without Privates (does not de-reference to AccessPoint)',
    ourSelector: 'Communication',
    theirSelector: 'Communication',
    selectors: {
      inclusive: false,
      vals: ['Private', 'AccessPoint'],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  'IED: All - Complete': {
    description: 'Compare all IED in all namespaces',
    ourSelector: 'IED',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'IED: All - Only SCL namespace without DataTypes or Privates': {
    description:
      'Compare all IEDs, only in the SCL namespace and without referencing DataTypes or look into Private elements',
    ourSelector: 'IED',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: ['Private'],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
  'IED: Compare Two  IEDs': {
    description:
      'Allow comparison of two IEDs in the same or a different file (requires user modification)',
    ourSelector: 'IED[name="Put first IED name here"]',
    theirSelector: 'IED[name="Put second IED name here"]',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'IED: Individual': {
    description: 'Compare a specific IED (requires user modification)',
    ourSelector: 'IED[name="Put your IED name here"]\n',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'IED: MMS Report Content': {
    description:
      'Compare ReportControl elements within each IED (buffered and unbuffered)',
    ourSelector: 'ReportControl',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  'IED: Subscriptions and Supervisions': {
    description:
      'Compare subscriptions (Inputs and External References) and supervision references (LGOS and LSVS Logical Nodes)',
    ourSelector: 'IED\n',
    theirSelector: '',
    selectors: {
      inclusive: true,
      vals: [
        'IED',
        'IED > AccessPoint',
        'IED > AccessPoint > Server',
        'IED > AccessPoint > Server > LDevice',
        'IED > AccessPoint > Server > LDevice > LN0',
        'IED > AccessPoint > Server > LDevice > LN',
        'IED > AccessPoint > Server > LDevice > LN0 > Inputs',
        'IED > AccessPoint > Server > LDevice > LN > Inputs',
        'IED > AccessPoint > Server > LDevice > LN0 > Inputs > ExtRef',
        'IED > AccessPoint > Server > LDevice > LN > Inputs > ExtRef',
        'IED > AccessPoint > Server > LDevice > LN[lnClass="LGOS"]',
        'IED > AccessPoint > Server > LDevice > LN[lnClass="LSVS"]',
        'IED > AccessPoint > Server > LDevice > LN[lnClass="LGOS"] *',
        'IED > AccessPoint > Server > LDevice > LN[lnClass="LSVS"] *',
      ],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: false,
      vals: [],
      except: [],
    },
  },
  DataTypeTemplates: {
    description: 'Compare data type definitions (only SCL namespace)',
    ourSelector: 'DataTypeTemplates',
    theirSelector: '',
    selectors: {
      inclusive: false,
      vals: [],
      except: [],
    },
    attributes: {
      inclusive: false,
      vals: [],
      except: [],
    },
    namespaces: {
      inclusive: true,
      vals: ['http://www.iec.ch/61850/2003/SCL'],
      except: [],
    },
  },
};
