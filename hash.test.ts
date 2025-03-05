import { expect } from '@open-wc/testing';

import { newHasher } from './hash.js';

const testScl = new DOMParser().parseFromString(
  `<SCL
      xmlns="http://www.iec.ch/61850/2003/SCL"
      xmlns:sxy="http://www.iec.ch/61850/2003/SCLcoordinates"
      xmlns:ens="http://somevalidURI"
    >
      <IED name="IED1">
        <AccessPoint name="AP1">
          <Server>
            <Authentication />
            <LDevice inst="ldInst1">
              <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="baseXCBR"/>
            </LDevice>
            <LDevice inst="ldInst2">
              <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="equalXCBR"/>
              </LDevice>
            <LDevice inst="ldInst3">
              <LN0 lnClass="LLN0" inst="" lnType="diffLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="diffXCBR"/>
              </LDevice>
          </Server>
        </AccessPoint>
      </IED>
      <IED name="IED2">
        <AccessPoint name="AP1">
          <Server>
            <Authentication />
            <LDevice inst="ldInst1">
              <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="baseXCBR"/>
            </LDevice>
            <LDevice inst="ldInst2">
              <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="equalXCBR"/>
              </LDevice>
            <LDevice inst="ldInst3">
              <LN0 lnClass="LLN0" inst="" lnType="diffLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="diffXCBR"/>
              </LDevice>
          </Server>
        </AccessPoint>
      </IED>
      <IED name="IED3">
        <AccessPoint name="AP1">
          <Server>
            <Authentication />
            <LDevice inst="ldInst1">
              <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="baseXCBR"/>
            </LDevice>
            <LDevice inst="ldInst2">
              <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
              <LN lnClass="XCBR" inst="1" lnType="equalXCBR"/>
              </LDevice>
          </Server>
        </AccessPoint>
      </IED>
      <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="baseLLN0" >
          <DO name="Beh" type="someEqualDOType" />
        </LNodeType>
        <LNodeType lnClass="LLN0" id="equalLLN0" >
          <DO name="Beh" type="someEqualDOType" />
        </LNodeType>
        <LNodeType lnClass="LLN0" id="diffLLN0" >
          <DO name="Beh" type="someDiffDOType" />
        </LNodeType>
        <LNodeType lnClass="XCBR" id="equalXCBR" >
          <DO name="Beh" type="someEqualDOType" />
        </LNodeType>
        <LNodeType lnClass="XCBR" id="baseXCBR" >
          <DO name="Beh" type="someBaseDOType" />
        </LNodeType>
        <LNodeType lnClass="XCBR" id="diffXCBR" >
          <DO name="Beh" type="someDiffDOType" />
        </LNodeType>
        <DOType cdc="SPS" id="someBaseDOType">
          <DA name="stVal" bType="Struct" fc="ST" type="someBaseDAType" />
        </DOType>
        <DOType cdc="SPS" id="someEqualDOType">
          <DA name="stVal" bType="Struct" fc="ST" type="someEqualDAType" />
        </DOType>
        <DOType cdc="SPS" id="someDiffDOType">
          <DA name="stVal" bType="Enum" fc="ST" type="someID" />
        </DOType>
        <DAType id="someBaseDAType" desc="someDesc">     
          <BDA name="mag" desc="someEqual" bType="Struct" sAddr="someSAddr" type="AnalogueValue"/>
          <BDA name="stVal" desc="someEnumBDA" bType="Enum" sAddr="someSAddr" type="someEnumType"/>
          <ProtNs type="8-MMS">IEC 61850-8-1:2007</ProtNs>
        </DAType>
        <DAType id="someEqualDAType" desc="someDesc">     
          <BDA name="mag" desc="someEqual" bType="Struct" sAddr="someSAddr" type="AnalogueValue"/>
          <BDA name="stVal" desc="someEnumBDA" bType="Enum" sAddr="someSAddr" type="someEnumType"/>
          <ProtNs>IEC 61850-8-1:2007</ProtNs>
        </DAType>
        <DAType id="AnalogueValue" iedType="someIedType">
            <BDA desc="someDiff1" name="f" bType="FLOAT32" valKind="RO" valImport="true">
                <Val sGroup="1">45.00</Val>
                <Val sGroup="2">65.00</Val>
            </BDA>
        </DAType>
        <EnumType id="someEnumType" desc="someDesc">     
          <EnumVal ord="-1" desc="someDesc">SomeContent</EnumVal>
          <EnumVal ord="13">SomeOtherContent</EnumVal>
          <EnumVal ord="-23"></EnumVal>
      </EnumType>
      <EnumType id="someID">
        <Private type="someType" desc="someDesc" sxy:x="10" ens:some="someOtherNameSpace">
          <![CDATA[some comment]]>
          <IED name="somePrivateIED"/>
        </Private>
        <Text>Some detailed description</Text>
        <ens:SomeNonSCLElement />
        <EnumVal ord="1">A</EnumVal>
      </EnumType>
      <EnumType id="someDiffID" >
        <Private type="someType" desc="someDesc" ens:some="someOtherNameSpace" sxy:x="10" >
          <![CDATA[some comment]]>
          <IED name="somePrivateIED"/>
        </Private>
        <Text>Some detailed description</Text>
        <ens:SomeNonSCLElement />
        <EnumVal ord="1"></EnumVal>
      </EnumType>
      <EnumType id="someOtherID">
        <Private type="someType" desc="someDesc" sxy:x="10" ens:some="someOtherNameSpace">
          <![CDATA[some comment]]>
          <IED name="somePrivateIED"/>
        </Private>
        <Text>Some detailed description</Text>
        <ens:SomeNonSCLElement />
        <EnumVal ord="1">A</EnumVal>
      </EnumType>
      </DataTypeTemplates>
    </SCL>`,
  'application/xml',
);

function scl(
  tagName: string,
  attributes: Record<string, string> = {},
  children: Element[] = [],
): Element {
  const element = testScl.createElementNS(
    testScl.documentElement.namespaceURI ?? '',
    tagName,
  );
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  for (const child of children) {
    element.appendChild(child.cloneNode(true));
  }
  return element;
}

describe('hash', () => {
  let { hash } = newHasher();

  beforeEach(() => {
    ({ hash } = newHasher());
  });

  it('is sensitive to the order of FCDAs in a DataSet', () => {
    const fcdaAttrs = { lnInst: '1' };
    const fcda1 = scl('FCDA', fcdaAttrs);
    const fcda2 = scl('FCDA', { ...fcdaAttrs, lnInst: '2' });
    const a = scl('DataSet', { name: 'DS1' }, [fcda1, fcda2]);
    const b = scl('DataSet', { name: 'DS1' }, [fcda1, fcda2]);
    expect(hash(a)).to.equal(hash(b));

    const c = scl('DataSet', { name: 'DS1' }, [fcda2, fcda1]);
    expect(hash(a)).not.to.equal(hash(c));
  });

  it('does not distinguish inline Server from ServerAt reference', () => {
    ({ hash } = newHasher({
      selectors: { inclusive: false, vals: [], except: [] },
      attributes: { inclusive: false, vals: ['AccessPoint.name'], except: [] },
      namespaces: { inclusive: false, vals: [], except: [] },
    }));
    const server = scl('Server', {}, [scl('LDevice', { inst: 'ldInst1' })]);
    const serverAt = scl('ServerAt', { apName: 'AP1' });
    const recursiveServerAt = scl('ServerAt', { apName: 'AP2' });
    const ap1 = scl('AccessPoint', { name: 'AP1' }, [server]);
    const ap2 = scl('AccessPoint', { name: 'AP2' }, [serverAt]);
    const ap3 = scl('AccessPoint', { name: 'AP3' }, [recursiveServerAt]);
    const ied = scl('IED', { name: 'IED1' }, [ap1, ap2, ap3]);
    const ap1Inst = ied.querySelector('AccessPoint[name="AP1"]');
    const ap2Inst = ied.querySelector('AccessPoint[name="AP2"]');
    const ap3Inst = ied.querySelector('AccessPoint[name="AP3"]');
    if (!ap1Inst || !ap2Inst || !ap3Inst) {
      throw new Error('Server or ServerAt not found');
    }
    const ap1InstHash = hash(ap1Inst);
    const ap2InstHash = hash(ap2Inst);
    const ap3InstHash = hash(ap3Inst);
    expect(ap1InstHash).to.equal(ap2InstHash);
    expect(ap1InstHash).to.equal(ap3InstHash);
  });

  it('respects both selectors and namespaces when dereferencing ServerAt', () => {
    ({ hash } = newHasher({
      selectors: { inclusive: false, vals: [], except: [] },
      attributes: { inclusive: false, vals: ['AccessPoint.name'], except: [] },
      namespaces: { inclusive: false, vals: [], except: [] },
    }));
    const { hash: hashWithoutServerAt } = newHasher({
      selectors: { inclusive: false, vals: ['ServerAt'], except: [] },
      attributes: { inclusive: false, vals: ['AccessPoint.name'], except: [] },
      namespaces: { inclusive: false, vals: [], except: [] },
    });
    const { hash: hashWithoutServer } = newHasher({
      selectors: { inclusive: false, vals: ['Server'], except: [] },
      attributes: { inclusive: false, vals: ['AccessPoint.name'], except: [] },
      namespaces: { inclusive: false, vals: [], except: [] },
    });
    const { hash: hashWithoutSCLNamespace } = newHasher({
      selectors: { inclusive: false, vals: [], except: [] },
      attributes: { inclusive: false, vals: ['AccessPoint.name'], except: [] },
      namespaces: {
        inclusive: false,
        vals: ['http://www.iec.ch/61850/2003/SCL'],
        except: [],
      },
    });

    const server = scl('Server', {}, [scl('LDevice', { inst: 'ldInst1' })]);
    const serverAt = scl('ServerAt', { apName: 'AP1' });
    const ap1 = scl('AccessPoint', { name: 'AP1' }, [server]);
    const ap2 = scl('AccessPoint', { name: 'AP2' }, [serverAt]);
    const ied = scl('IED', { name: 'IED1' }, [ap1, ap2]);
    const ap1Inst = ied.querySelector('AccessPoint[name="AP1"]');
    const ap2Inst = ied.querySelector('AccessPoint[name="AP2"]');
    if (!ap1Inst || !ap2Inst) {
      throw new Error('Server or ServerAt not found');
    }

    // Expect three different values A != B != C for these eight digests:

    const digest1 = hash(ap1Inst); // A
    const digest2 = hash(ap2Inst); // A
    expect(digest1).to.equal(digest2);
    const digest1WithoutServerAt = hashWithoutServerAt(ap1Inst); // A
    expect(digest1).to.equal(digest1WithoutServerAt);

    const digest1WithoutServer = hashWithoutServer(ap1Inst); // B
    expect(digest1).to.not.equal(digest1WithoutServer); // A != B
    const digest2WithoutServerAt = hashWithoutServerAt(ap2Inst); // B
    expect(digest1WithoutServer).to.equal(digest2WithoutServerAt);
    const digest1WithoutSCLNamespace = hashWithoutSCLNamespace(ap1Inst); // B
    expect(digest1WithoutServer).to.equal(digest1WithoutSCLNamespace);
    const digest2WithoutSCLNamespace = hashWithoutSCLNamespace(ap2Inst); // B
    expect(digest1WithoutServer).to.equal(digest2WithoutSCLNamespace);

    const digest2WithoutServer = hashWithoutServer(ap2Inst); // C
    expect(digest2WithoutServer).not.to.equal(digest1); // A != C
    expect(digest2WithoutServer).not.to.equal(digest1WithoutServer); // B != C
  });

  it("is sensitive to children's hashes in AccessPoint", () => {
    const ln = scl('LN', { lnClass: 'XCBR', inst: '1', lnType: 'baseXCBR' });
    const ap1 = scl('AccessPoint', { name: 'AP1' }, [ln]);
    const ap2 = scl('AccessPoint', { name: 'AP1' }, []);
    expect(hash(ap1)).not.to.equal(hash(ap2));
  });
});
