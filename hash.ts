import xxhash from 'xxhash-wasm';

const xxh = await xxhash();

export type HashDB = Record<string, Record<string, object>>;
export type IdentityDB = Record<string, string | number>;
export type Hasher = (e: Element) => string;
export type Description = Record<string, string | string[]> & {
  eNS?: Record<string, Record<string, string>>;
};

function findConnectedAPReferences(e: Element): Element[] {
  const iedName = e.getAttribute('iedName');
  const apName = e.getAttribute('apName');
  const scl = e.closest('SCL');
  if (!iedName || !apName || !scl) {
    return [];
  }
  return Array.from(
    scl.querySelectorAll(
      `:scope>IED[name="${iedName}"]>AccessPoint[name="${apName}"]`,
    ) ?? [],
  );
}

function findAccessPointServerReferences(
  e: Element,
  filter: (element: Element) => boolean,
): Element[] {
  let server = e.querySelector(':scope>ServerAt, :scope>Server') ?? undefined;
  let apName = server?.getAttribute('apName');
  while (server && server.tagName !== 'Server') {
    if (!filter(server)) {
      return [];
    }
    server =
      server
        .closest('IED')
        ?.querySelector(
          `:scope>AccessPoint[name="${apName}"]>Server, :scope>AccessPoint[name="${apName}"]>ServerAt`,
        ) ?? undefined;
    apName = server?.getAttribute('apName');
  }
  if (server && !filter(server)) {
    return [];
  }
  if (!server) {
    return [];
  }
  return [server];
}

const referenceLookups: Record<
  string,
  (e: Element, filter: (element: Element) => boolean) => Element[]
> = {
  ConnectedAP: findConnectedAPReferences,
  AccessPoint: findAccessPointServerReferences,
};

function findReferences(
  element: Element,
  filter: (e: Element) => boolean,
): Element[] {
  const referencedElements = [] as Element[];

  if (element.tagName in referenceLookups) {
    return referenceLookups[element.tagName](element, filter);
  }

  if (!(element.tagName in references)) {
    return [];
  }

  references[element.tagName].forEach(({ fields, to, scope }) => {
    const candidates = Array.from(
      element.closest(scope)?.querySelectorAll(to) ?? [],
    );
    referencedElements.push(
      ...candidates.filter(toE => {
        const toAttrs = fields.map(f => f.to);
        const fromAttrs = fields.map(f => f.from);
        const toVals = toAttrs.map(a => toE.getAttribute(a));
        const fromVals = fromAttrs.map(a => element.getAttribute(a));
        return fromVals.every((val, i) => toVals[i] === val) && toE;
      }),
    );
  });

  return referencedElements;
}

export function createHashElementPredicate({
  selectors,
  namespaces,
}: Pick<HasherOptions, 'selectors' | 'namespaces'>) {
  return (element: Element) => {
    if (
      selectors.inclusive &&
      (!selectors.vals.some(sel => element.matches(sel)) ||
        selectors.except.some(sel => element.matches(sel)))
    ) {
      return false;
    }
    if (
      !selectors.inclusive &&
      selectors.vals.some(sel => element.matches(sel)) &&
      !selectors.except.some(sel => element.matches(sel))
    ) {
      return false;
    }
    if (
      (namespaces.inclusive &&
        !namespaces.vals.includes(element.namespaceURI ?? '')) ||
      namespaces.except.includes(element.namespaceURI ?? '')
    ) {
      return false;
    }
    if (
      !namespaces.inclusive &&
      namespaces.vals.includes(element.namespaceURI ?? '') &&
      !namespaces.except.includes(element.namespaceURI ?? '')
    ) {
      return false;
    }
    return true;
  };
}

/** Get count from referenced sibling element */
function siblingCount(element: Element, name: string): string | undefined {
  const parent = element.parentElement;
  if (!parent) {
    return undefined;
  }

  const sibling = Array.from(parent.children).find(
    child => child.getAttribute('name') === name,
  );
  if (!sibling) {
    return undefined;
  }

  const count = sibling.getAttribute('count');
  if (!count) {
    return undefined;
  }

  if (!/^\d+$/.test(count)) {
    return undefined;
  }

  return count;
}

export interface ElementDB {
  e2h: WeakMap<Element, string>;
  h2e: Map<string, Set<Element>>;
}

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
  { attributes, namespaces }: HasherOptions = {
    selectors: { inclusive: false, vals: [], except: [] },
    attributes: { inclusive: false, vals: [], except: [] },
    namespaces: { inclusive: false, vals: [], except: [] },
  },
  shouldHashElement: (element: Element) => boolean = () => true,
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

  function describeChildren(e: Element) {
    const description: Record<string, string[]> = {};

    const includedChildren = Array.from(e.children).filter(shouldHashElement);

    Array.from(e.children)
      .map(c => c.tagName)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .forEach(tag => {
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

    findReferences(e, shouldHashElement)
      .filter(shouldHashElement)
      .forEach(element => {
        const tag = `@${element.tagName}`;
        if (!(tag in description)) {
          description[tag] = [];
        }
        description[tag].push(hash(element));
        description[tag].sort();
      });

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
        .filter(shouldHashElement)
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
      description['Text Content'] = textContent;
    }
    return description;
  }

  function describeElement(e: Element) {
    if (e.tagName === 'AccessPoint') {
      return describeAccessPoint(e);
    }
    const description: Record<string, unknown> = {
      ...describeAttributes(e),
      ...describeChildren(e),
      ...describeReferences(e),
      ...describeTextContent(e),
    };
    return description;
  }

  function describeBDA(e: Element) {
    const description: Record<string, unknown> = {
      ...describeElement(e),
    };

    const count = e.getAttribute('count');

    if (
      count &&
      /^\s*\d+\s*$/.test(count) &&
      !Number.isNaN(Number.parseInt(count, 10))
    ) {
      // count can be an unsigned integer
      description.count = count;
    } else if (count && !Number.isNaN(siblingCount(e, count))) {
      // count can be a reference to another sibling that has integer definition
      description.count = siblingCount(e, count);
    }

    return description;
  }

  function describeDataSet(e: Element) {
    const description = describeElement(e);
    const fcdas = Array.from(e.querySelectorAll(':scope > FCDA'));
    if (fcdas.length) {
      description['@FCDA'] = fcdas.map(hash);
    }
    return description;
  }

  function describeAccessPoint(e: Element) {
    const description = {
      ...describeAttributes(e),
      ...describeChildren(e),
    } as Description;
    const servers = findAccessPointServerReferences(e, shouldHashElement);
    if (servers.length) {
      description['@Server'] = servers.map(hash);
      delete description['@ServerAt'];
    }
    return description;
  }

  const descriptions: Record<string, (e: Element) => object> = {
    BDA: describeBDA,
    DA: describeBDA,
    AccessPoint: describeAccessPoint,
    DataSet: describeDataSet,
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
      return describeElement(e);
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
      db[tag] = {};
    }
    if (!(digest in db[tag])) {
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
  findReferences: (element: Element) => Element[];
} {
  const db: HashDB = {};
  const eDb: ElementDB = { e2h: new WeakMap(), h2e: new Map() };

  const optionsFilter = createHashElementPredicate({
    selectors: options.selectors,
    namespaces: options.namespaces,
  });

  return {
    hash: hasher(db, eDb, options, optionsFilter),
    db,
    eDb,
    findReferences: (element: Element) =>
      findReferences(element, optionsFilter),
  };
}
