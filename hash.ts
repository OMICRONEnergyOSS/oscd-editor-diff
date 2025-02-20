/* eslint-disable no-use-before-define */
import xxhash from 'xxhash-wasm';

const xxh = await xxhash();

export type HashDB = Record<string, Record<string, object>>;
export type IdentityDB = Record<string, string | number>;
export type Hasher = (e: Element) => string;
export type Description = Record<string, string | string[]> & {
  eNS?: Record<string, Record<string, string>>;
};

const xmlTruths = new Set(['true', '1']);
function isXmlTrue(val: string | null): boolean {
  return val !== null && xmlTruths.has(val.trim());
}

/** Get count from referenced sibling element */
function siblingCount(element: Element, name: string): number {
  const parent = element.parentElement;
  if (!parent) {
    return NaN;
  }

  const sibling = Array.from(parent.children).find(
    child => child.getAttribute('name') === name,
  );
  if (!sibling) {
    return NaN;
  }

  const count = sibling.getAttribute('count');
  if (!count) {
    return NaN;
  }

  if (!/^\d+$/.test(count)) {
    return NaN;
  }

  return parseInt(count, 10);
}

export interface ElementDB {
  e2h: WeakMap<Element, string>;
  h2e: Map<string, Set<Element>>;
}

const identifiers: Record<string, string[]> = {
  DAI: ['name', 'ix'],
  SMV: ['ldInst', 'cbName'],
  LNode: ['iedName', 'ldInst', 'prefix', 'lnClass', 'lnInst', 'lnType'],
  FCDA: [
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'fc',
    'ix',
  ],
  ConnectedAP: ['iedName', 'apName'],
  ExtRef: [
    'iedName',
    'intAddr',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'serviceType',
    'srcLDInst',
    'srcPrefix',
    'srcLNClass',
    'srcLNInst',
    'srcCBName',
  ],
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
};

interface Reference {
  fields: { to: string; from: string }[];
  to: string;
  from: string;
  scope: string;
}

const references: Record<string, Reference[]> = {
  LN0: [
    {
      fields: [
        {
          to: 'id',
          from: 'lnType',
        },
        {
          to: 'lnClass',
          from: 'lnClass',
        },
      ],
      to: ':scope>DataTypeTemplates>LNodeType',
      from: ':scope>IED>AccessPoint>Server>LDevice>LN0',
      scope: 'SCL',
    },
  ],
  LN: [
    {
      fields: [
        {
          to: 'id',
          from: 'lnType',
        },
        {
          to: 'lnClass',
          from: 'lnClass',
        },
      ],
      to: ':scope>DataTypeTemplates>LNodeType',
      from: ':scope>IED>AccessPoint>LN',
      scope: 'SCL',
    },
    {
      fields: [
        {
          to: 'id',
          from: 'lnType',
        },
        {
          to: 'lnClass',
          from: 'lnClass',
        },
      ],
      to: ':scope>DataTypeTemplates>LNodeType',
      from: ':scope>IED>AccessPoint>Server>LDevice>LN',
      scope: 'SCL',
    },
  ],
  ServerAt: [
    {
      fields: [
        {
          to: 'name',
          from: 'apName',
        },
      ],
      to: ':scope>AccessPoint',
      from: ':scope>AccessPoint>ServerAt',
      scope: 'IED',
    },
  ],
  LogControl: [
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>LogControl',
      scope: 'LN',
    },
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>LogControl',
      scope: 'LN0',
    },
  ],
  /* ConnectedAP: [
    {
      fields: [
        {
          to: "name",
          from: "iedName",
        },
      ],
      to: ":scope>IED",
      from: ":scope>Communication>SubNetwork>ConnectedAP",
      scope: "SCL",
    },
  ], */
  DO: [
    {
      fields: [
        {
          to: 'id',
          from: 'type',
        },
      ],
      to: ':scope>DOType',
      from: ':scope>LNodeType>DO',
      scope: 'DataTypeTemplates',
    },
  ],
  SDO: [
    {
      fields: [
        {
          to: 'id',
          from: 'type',
        },
      ],
      to: ':scope>DOType',
      from: ':scope>DOType>SDO',
      scope: 'DataTypeTemplates',
    },
  ],
  BDA: [
    {
      fields: [
        {
          to: 'id',
          from: 'type',
        },
      ],
      to: ':scope>DAType, :scope>EnumType',
      from: ':scope>DOType>DA,                                              \n          :scope>DAType>BDA',
      scope: 'DataTypeTemplates',
    },
  ],
  /* Terminal: [
    {
      fields: [
        {
          to: "name",
          from: "substationName",
        },
      ],
      to: ":scope>Substation, :scope>Process,                          \n               :scope>Line",
      from: ":scope Terminal",
      scope: "SCL",
    },
  ], */
  SampledValueControl: [
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>SampledValueControl',
      scope: 'LN0',
    },
  ],
  GSEControl: [
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>GSEControl',
      scope: 'LN0',
    },
  ],
  DA: [
    {
      fields: [
        {
          to: 'id',
          from: 'type',
        },
      ],
      to: ':scope>DAType, :scope>EnumType',
      from: ':scope>DOType>DA, :scope>DAType>BDA',
      scope: 'DataTypeTemplates',
    },
  ],
  ReportControl: [
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>ReportControl',
      scope: 'LN',
    },
    {
      fields: [
        {
          to: 'name',
          from: 'datSet',
        },
      ],
      to: ':scope>DataSet',
      from: ':scope>ReportControl',
      scope: 'LN0',
    },
  ],
};

const defaults: Record<string, Record<string, string>> = {
  SubNetwork: {
    desc: '',
  },
  DAI: {
    desc: '',
  },
  ConfDataSet: {
    modify: 'true',
  },
  SMV: {
    desc: '',
  },
  NeutralPoint: {
    desc: '',
    name: '',
  },
  Function: {
    desc: '',
  },
  AccessPoint: {
    clock: 'false',
    desc: '',
    kdc: 'false',
    router: 'false',
  },
  LNode: {
    desc: '',
    iedName: 'None',
    ldInst: '',
    lnInst: '',
    prefix: '',
  },
  ServerAt: {
    desc: '',
  },
  Inputs: {
    desc: '',
  },
  DOType: {
    desc: '',
    iedType: '',
  },
  LogControl: {
    bufTime: '0',
    desc: '',
    intgPd: '0',
    lnClass: 'LLN0',
    logEna: 'true',
    prefix: '',
    reasonCode: 'true',
  },
  SubEquipment: {
    desc: '',
    phase: 'none',
    virtual: 'false',
  },
  Server: {
    certificate: 'false',
    desc: '',
    none: 'true',
    password: 'false',
    strong: 'false',
    timeout: '30',
    weak: 'false',
  },
  SMVSettings: {
    cbName: 'Fix',
    synchSrcId: 'false',
    samplesPerSec: 'false',
    nofASDU: 'Fix',
    kdaParticipant: 'false',
    optFields: 'Fix',
    datSet: 'Fix',
    svID: 'Fix',
    pdcTimeStamp: 'false',
    smpRate: 'Fix',
  },
  FCDA: {
    prefix: '',
  },
  ConnectedAP: {
    desc: '',
  },
  Header: {
    nameStructure: 'IEDName',
    revision: '',
  },
  ConfReportControl: {
    bufConf: 'false',
    bufMode: 'both',
  },
  DO: {
    desc: '',
    transient: 'false',
  },
  SMVsc: {
    delivery: 'multicast',
    deliveryConf: 'false',
    rSV: 'false',
    sv: 'true',
  },
  ReportSettings: {
    cbName: 'Fix',
    bufTime: 'Fix',
    intgPd: 'Fix',
    trgOps: 'Fix',
    rptID: 'Fix',
    optFields: 'Fix',
    datSet: 'Fix',
    resvTms: 'false',
    owner: 'false',
  },
  IED: {
    desc: '',
    engRight: 'full',
    originalSclRelease: '1',
    originalSclRevision: 'A',
    originalSclVersion: '2003',
  },
  DataSet: {
    desc: '',
  },
  Communication: {
    desc: '',
  },
  ConfLNs: {
    fixLnInst: 'false',
    fixPrefix: 'false',
  },
  SDO: {
    count: '0',
    desc: '',
  },
  EqFunction: {
    desc: '',
  },
  GeneralEquipment: {
    desc: '',
    virtual: 'false',
  },
  BDA: {
    count: '0',
    desc: '',
    valImport: 'false',
    valKind: 'Set',
  },
  Terminal: {
    desc: '',
    name: '',
  },
  Log: {
    desc: '',
  },
  SettingGroups: {
    resvTms: 'false',
  },
  ClientServices: {
    rSV: 'false',
    supportsLdName: 'false',
    unbufReport: 'false',
    readLog: 'false',
    gsse: 'false',
    bufReport: 'false',
    noIctBinding: 'false',
    sv: 'false',
    rGOOSE: 'false',
    goose: 'false',
  },
  Line: {
    desc: '',
  },
  DOI: {
    desc: '',
  },
  McSecurity: {
    encryption: 'false',
    signature: 'false',
  },
  SMVSecurity: {
    desc: '',
  },
  LogSettings: {
    cbName: 'Fix',
    datSet: 'Fix',
    intgPd: 'Fix',
    logEna: 'Fix',
    trgOps: 'Fix',
  },
  SettingControl: {
    actSG: '1',
    desc: '',
  },
  RedProt: {
    hsr: 'false',
    prp: 'false',
    rstp: 'false',
  },
  SDI: {
    desc: '',
  },
  EnumType: {
    desc: '',
  },
  TapChanger: {
    desc: '',
    virtual: 'false',
  },
  DAType: {
    desc: '',
    iedType: '',
  },
  TrgOps: {
    dchg: 'false',
    dupd: 'false',
    gi: 'true',
    period: 'false',
    qchg: 'false',
  },
  TimeSyncProt: {
    c37_238: 'false',
    iec61850_9_3: 'false',
    other: 'false',
    sntp: 'true',
  },
  SampledValueControl: {
    refreshTime: 'false',
    dataSet: 'false',
    smpMod: 'SmpPerPeriod',
    multicast: 'true',
    desc: '',
    security: 'false',
    sampleRate: 'false',
    synchSourceId: 'false',
    timestamp: 'false',
    securityEnable: 'None',
  },
  ConductingEquipment: {
    desc: '',
    virtual: 'false',
  },
  GSE: {
    desc: '',
  },
  FileHandling: {
    ftp: 'false',
    ftps: 'false',
    mms: 'true',
  },
  GOOSE: {
    fixedOffs: 'false',
    goose: 'true',
    rGOOSE: 'false',
  },
  EqSubFunction: {
    desc: '',
  },
  Substation: {
    desc: '',
  },
  GSEControl: {
    desc: '',
    fixedOffs: 'false',
    securityEnable: 'None',
    type: 'GOOSE',
  },
  ConnectivityNode: {
    desc: '',
  },
  Services: {
    nameLength: '32',
  },
  SubFunction: {
    desc: '',
  },
  LDevice: {
    desc: '',
  },
  Bay: {
    desc: '',
  },
  GOOSESecurity: {
    desc: '',
  },
  ValueHandling: {
    setToRO: 'false',
  },
  DA: {
    count: '0',
    dchg: 'false',
    desc: '',
    dupd: 'false',
    qchg: 'false',
    valImport: 'false',
    valKind: 'Set',
  },
  TransformerWinding: {
    desc: '',
    virtual: 'false',
  },
  EnumVal: {
    desc: '',
  },
  RptEnabled: {
    desc: '',
    max: '1',
  },
  GSESettings: {
    appID: 'Fix',
    cbName: 'Fix',
    datSet: 'Fix',
    dataLabel: 'Fix',
    kdaParticipant: 'false',
  },
  PowerTransformer: {
    desc: '',
    virtual: 'false',
  },
  CommProt: {
    ipv6: 'false',
  },
  PhysConn: {
    desc: '',
  },
  VoltageLevel: {
    desc: '',
  },
  Association: {
    prefix: '',
  },
  Process: {
    desc: '',
  },
  ProtNs: {
    type: '8-MMS',
  },
  Voltage: {
    multiplier: '',
  },
  ReportControl: {
    indexed: 'true',
    dataSet: 'false',
    buffered: 'false',
    desc: '',
    bufTime: '0',
    bufOvfl: 'true',
    intgPd: '0',
    entryID: 'false',
    reasonCode: 'false',
    dataRef: 'false',
    timeStamp: 'false',
    seqNum: 'false',
    configRef: 'false',
  },
  ClientLN: {
    prefix: '',
  },
  LNodeType: {
    desc: '',
    iedType: '',
  },
  LN: {
    desc: '',
    prefix: '',
  },
};

export type Configurable = {
  inclusive: boolean;
  vals: string[];
  except: string[];
};
export type HasherOptions = {
  selectors: Configurable;
  attributes: Configurable;
  namespaces: Configurable;
};

export function hasher(
  db: HashDB,
  eDb: ElementDB,
  { selectors, attributes, namespaces }: HasherOptions = {
    selectors: { inclusive: false, vals: [], except: [] },
    attributes: { inclusive: false, vals: [], except: [] },
    namespaces: { inclusive: false, vals: [], except: [] },
  },
): Hasher {
  function describeAttributes(e: Element) {
    const description: Description = {};

    const includedAttributes = Array.from(e.attributes).filter(a => {
      const ns = a.namespaceURI ?? '';
      const name = ns ? `${ns}:${a.localName}` : a.localName;
      const tagAndName = `${e.tagName}.${name}`;

      if (
        namespaces.inclusive &&
        (!namespaces.vals.includes(ns) || namespaces.except.includes(ns))
      ) {
        return false;
      }
      if (
        !namespaces.inclusive &&
        namespaces.vals.includes(ns) &&
        !namespaces.except.includes(ns)
      ) {
        return false;
      }

      const attrInVals =
        attributes.vals.includes(name) || attributes.vals.includes(tagAndName);
      const attrInExcept =
        attributes.except.includes(name) ||
        attributes.except.includes(tagAndName);

      if (attributes.inclusive && (!attrInVals || attrInExcept)) {
        return false;
      }
      if (!attributes.inclusive && attrInVals && !attrInExcept) {
        return false;
      }

      return true;
    });

    includedAttributes
      .filter(a => !a.namespaceURI)
      .map(a => a.localName)
      .filter(a => !(e.tagName in identifiers && a in identifiers[e.tagName]))
      .sort()
      .forEach(name => {
        if (e.tagName in defaults && name in defaults[e.tagName]) {
          description[name] = defaults[e.tagName][name];
        }
        const val = e.getAttribute(name);
        if (!val) {
          return;
        }
        description[name] = val.trim();
      });

    const includedNamespaces = new Set(
      includedAttributes.map(a => a.namespaceURI),
    );
    includedNamespaces.delete(null);

    if (includedNamespaces.size) {
      description.eNS = {};
    }

    includedNamespaces.forEach(ns => {
      const nsAttrs = includedAttributes.filter(a => a.namespaceURI === ns);
      const nsDescription: Record<string, string> = {};
      nsAttrs
        .map(a => a.localName)
        .sort()
        .forEach(name => {
          const val = e.getAttributeNS(ns, name);
          if (val) {
            nsDescription[name] = val.trim();
          }
        });
      description.eNS![ns!] = nsDescription;
    });

    return description;
  }

  function describeChildren(e: Element, ...tags: string[]) {
    const description: Record<string, string[]> = {};

    const includedChildren = Array.from(e.children).filter(c => {
      if (
        selectors.inclusive &&
        (!selectors.vals.some(sel => c.matches(sel)) ||
          selectors.except.some(sel => c.matches(sel)))
      ) {
        return false;
      }
      if (
        !selectors.inclusive &&
        selectors.vals.some(sel => c.matches(sel)) &&
        !selectors.except.some(sel => c.matches(sel))
      ) {
        return false;
      }
      if (
        (namespaces.inclusive &&
          !namespaces.vals.includes(c.namespaceURI ?? '')) ||
        namespaces.except.includes(c.namespaceURI ?? '')
      ) {
        return false;
      }
      if (
        !namespaces.inclusive &&
        namespaces.vals.includes(c.namespaceURI ?? '') &&
        !namespaces.except.includes(c.namespaceURI ?? '')
      ) {
        return false;
      }
      return true;
    });

    tags.forEach(tag => {
      const hashes = includedChildren
        .filter(c => c.tagName === tag)
        .map(hash)
        .sort();
      if (hashes.length) {
        description[`@${tag}`] = hashes;
      }
    });
    return description;
  }

  function describeReferences(e: Element) {
    const description: Record<string, string[]> = {};
    if (!(e.tagName in references)) {
      return description;
    }

    references[e.tagName].forEach(({ fields, to, scope }) => {
      const candidates = Array.from(
        e.closest(scope)?.querySelectorAll(to) ?? [],
      );
      const hashes = candidates
        .filter(toE => {
          const toAttrs = fields.map(f => f.to);
          const fromAttrs = fields.map(f => f.from);
          const toVals = toAttrs.map(a => toE.getAttribute(a));
          const fromVals = fromAttrs.map(a => e.getAttribute(a));
          return fromVals.every((val, i) => toVals[i] === val) && toE;
        })
        .map(hash)
        .sort();
      if (hashes.length) {
        description[`@${to.split('>').pop()}`] = hashes;
      }
    });

    return description;
  }

  function describeTextContent(e: Element) {
    const description: Record<string, string> = {};
    if (e.children.length > 0) {
      return description;
    }
    const textContent = e.textContent?.trim();
    if (textContent) {
      description['>'] = textContent;
    }
    return description;
  }

  function describeNaming(e: Element) {
    const childTags = Array.from(e.children)
      .map(c => c.tagName)
      .filter((c, i, arr) => arr.indexOf(c) === i);
    const description: Record<string, unknown> = {
      ...describeAttributes(e),
      ...describeChildren(e, ...childTags),
      ...describeReferences(e),
      ...describeTextContent(e),
    };
    return description;
  }

  function describeBDA(e: Element) {
    const description: Record<string, unknown> = {
      ...describeNaming(e),
      bType: e.getAttribute('bType'),
      valKind: 'Set',
      valImport: false,
      count: 0,
    };

    const [sAddr, valKind, valImport, type, count] = [
      'sAddr',
      'valKind',
      'valImport',
      'type',
      'count',
    ].map(attr => e.getAttribute(attr));

    if (sAddr) {
      description.sAddr = sAddr;
    }

    if (valKind && ['Spec', 'Conf', 'RO', 'Set'].includes(valKind)) {
      description.valKind = valKind as 'Spec' | 'RO' | 'Conf' | 'Set';
    }

    if (isXmlTrue(valImport)) {
      description.valImport = true;
    }

    if (count && /^\d+$/.test(count) && !Number.isNaN(parseInt(count, 10))) {
      // count can be an unsigned integer
      description.count = parseInt(count, 10);
    } else if (count && !Number.isNaN(siblingCount(e, count))) {
      // count can be a reference to another sibling that has integer definition
      description.count = siblingCount(e, count);
    }

    const referencedType = Array.from(
      e.closest('DataTypeTemplates')?.children ?? [],
    ).find(child => child.getAttribute('id') === type);
    if (referencedType) {
      description[`@${referencedType.tagName}`] = [hash(referencedType)];
    }

    return description;
  }

  const descriptions: Record<string, (e: Element) => object> = {
    BDA: describeBDA,
    DA: describeBDA,
    DO: e => {
      const template = Array.from(
        e.closest('DataTypeTemplates')?.children ?? [],
      ).find(child => child.getAttribute('id') === e.getAttribute('type'));
      return {
        ...describeNaming(e),
        [`@${template?.tagName}`]: template ? [hash(template)] : [],
      };
    },
    EnumVal: e => ({
      ...describeNaming(e),
      val: e.textContent ?? '',
    }),
    ProtNs: e => ({
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      type: e.getAttribute('type') || '8-MMS',
      val: e.textContent ?? '',
    }),
    Val: e =>
      ({
        val: e.textContent ?? '',
        ...(e.getAttribute('sGroup') && {
          sGroup: parseInt(e.getAttribute('sGroup') ?? '', 10),
        }),
      }) as object,
  };

  function describe(e: Element) {
    if (e.tagName in descriptions) {
      return descriptions[e.tagName](e);
    }
    if (e.tagName === 'Private') {
      return { xml: e.outerHTML };
    }
    if (e.tagName === 'Text') {
      return { xml: e.outerHTML };
    }
    if (e.namespaceURI === 'http://www.iec.ch/61850/2003/SCL') {
      return describeNaming(e);
    }
    return { xml: e.outerHTML };
  }

  function hash(e: Element): string {
    if (eDb.e2h.has(e)) {
      return eDb.e2h.get(e)!;
    }
    const tag =
      e.namespaceURI === e.ownerDocument.documentElement.namespaceURI
        ? e.localName
        : `${e.localName}@${e.namespaceURI}`;
    const description = describe(e);
    const digest = xxh.h64ToString(JSON.stringify(description));
    if (!(tag in db)) {
      // eslint-disable-next-line no-param-reassign
      db[tag] = {};
    }
    if (!(digest in db[tag])) {
      // eslint-disable-next-line no-param-reassign
      db[tag][digest] = description;
    }
    if (!eDb.h2e.has(digest)) {
      eDb.h2e.set(digest, new Set<Element>().add(e));
    } else if (!eDb.h2e.get(digest)!.has(e)) {
      eDb.h2e.get(digest)!.add(e);
    }
    if (!eDb.e2h.has(e)) {
      eDb.e2h.set(e, digest);
    }
    return digest;
  }

  return hash;
}

export function newHasher(
  options: HasherOptions = {
    selectors: { inclusive: false, vals: [], except: [] },
    attributes: { inclusive: false, vals: [], except: [] },
    namespaces: { inclusive: false, vals: [], except: [] },
  },
): {
  hash: Hasher;
  db: HashDB;
  eDb: ElementDB;
} {
  const db: HashDB = {};
  const eDb: ElementDB = { e2h: new WeakMap(), h2e: new Map() };
  return { hash: hasher(db, eDb, options), db, eDb };
}
