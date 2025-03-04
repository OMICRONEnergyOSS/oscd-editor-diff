import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { DiffTree } from './diff-tree.js';
import { newHasher } from './hash.js';

export const sclDocString = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL">
  <IED name="IED1">
    <AccessPoint name="AP1">
      <Server>
        <Authentication />
        <LDevice inst="ldInst1">
          <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
          <LN lnClass="XCBR" inst="1" lnType="baseXCBR">
            <DOI name="SomeDOI" desc="SomeDesc">
              <DAI name="SomeDAI" desc="SomeDesc" >
                <Val>SomeValue</Val>
              </DAI>
              <DAI name="SomeDAI2" desc="SomeDesc" >
                <Val>SomeValue2</Val>
              </DAI>
            </DOI>
          </LN>
        </LDevice>
        <LDevice inst="ldInst2">
          <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
          <LN lnClass="XCBR" inst="1" lnType="baseXCBR">
            <DOI name="SomeDOI" desc="SomeDesc">
              <DAI name="SomeDAI" desc="SomeDesc" >
                <Val>SomeValue</Val>
              </DAI>
              <DAI name="SomeDAI2" desc="SomeDesc" >
                <Val>SomeValue2</Val>
              </DAI>
            </DOI>
          </LN>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
</SCL>`;

export const sclDocString2 = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL">
  <IED name="IED1">
    <AccessPoint name="AP1">
      <Server>
        <Authentication />
        <LDevice inst="ldInst1">
          <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
          <LN lnClass="XCBR" inst="1" lnType="baseXCBR">
            <DOI name="SomeDOI" desc="SomeDesc">
              <DAI name="SomeDAI" desc="SomeDesc" >
                <Val>SomeValue</Val>
              </DAI>
              <DAI name="SomeDAI2" desc="SomeDesc" >
                <Val>SomeValue2</Val>
              </DAI>
            </DOI>
          </LN>
        </LDevice>
        <LDevice inst="ldInst2">
          <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
          <LN lnClass="XCBR" inst="1" lnType="baseXCBR">
            <DOI name="SomeDOI" desc="SomeDesc">
              <DAI name="SomeDAI" desc="SomeDesc" >
                <Val>SomeValue</Val>
              </DAI>
              <DAI name="SomeDAI2" desc="SomeDesc" >
                <Val>SomeValue3</Val>
              </DAI>
            </DOI>
          </LN>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
</SCL>`;

const createSclDoc = (sclString: string) =>
  new DOMParser().parseFromString(sclString, 'application/xml');

const getAndAssertFirstDiffTree = (
  currentDiffTreeIdentifier: string,
  diffTree: Element,
  label: string,
) => {
  const firstDiffTreeChild = diffTree.shadowRoot?.querySelector('diff-tree');

  const headerRowButtonTextContent = diffTree.shadowRoot?.querySelector(
    '.header-row > button',
  )?.textContent;
  expect(headerRowButtonTextContent).to.include(
    label,
    `Expected diff-tree[${currentDiffTreeIdentifier}] to have a child diff-tree with label ${label} and instead got: ${headerRowButtonTextContent}`,
  );
  return firstDiffTreeChild;
};

describe('identify the correct child element #54', () => {
  it('displays no action button', async () => {
    const ours = createSclDoc(sclDocString).documentElement;
    const theirs = createSclDoc(sclDocString2).documentElement;
    // const theirLdInst2ValElement = theirs.querySelector(
    //   "LDevice[inst='ldInst2'] DAI[name='SomeDAI'] Val",
    // );
    // if (theirLdInst2ValElement) {
    //   theirLdInst2ValElement.textContent = 'SomeValue3';
    // }

    const ourHasher = await new Promise<ReturnType<typeof newHasher>>(
      resolve => {
        const hasher = newHasher();
        hasher.hash(ours);
        resolve(hasher);
      },
    );

    const theirHasher = await new Promise<ReturnType<typeof newHasher>>(
      resolve => {
        const hasher = newHasher();
        hasher.hash(theirs);
        resolve(hasher);
      },
    );

    const diffTree: DiffTree = await fixture(
      html`<diff-tree
        .ours=${ours}
        .theirs=${theirs}
        .ourHasher=${ourHasher}
        .theirHasher=${theirHasher}
      ></diff-tree>`,
    );

    const IED1 = getAndAssertFirstDiffTree('SCL', diffTree, 'IED1')!;
    const AP1AccessPoint = getAndAssertFirstDiffTree('IED1', IED1, 'AP1')!;
    const AP1Server = getAndAssertFirstDiffTree(
      'AP1AccessPoint',
      AP1AccessPoint,
      'Server',
    )!;
    const ldInst2 = getAndAssertFirstDiffTree(
      'AP1Server',
      AP1Server,
      'ldInst2',
    )!;

    const childDiffTrees = ldInst2.shadowRoot?.querySelectorAll('diff-tree');

    expect(childDiffTrees).to.have.length(1);
  });
});
