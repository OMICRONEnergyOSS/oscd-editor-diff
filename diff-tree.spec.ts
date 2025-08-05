import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './diff-tree.js';
import type { DiffTree } from './diff-tree.js';
import { newHasher } from './hash.js';

export const sclDocString = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL">
  <IED name="IED1">
    <AccessPoint name="AP1a">
      <Server>
        <Authentication />
        <LDevice inst="ldInst1">
          <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
        </LDevice>
        <LDevice inst="ldInst2">
          <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
  <IED name="IED2">
    <AccessPoint name="AP1b">
      <Server>
        <Authentication />
        <LDevice inst="ldInst1">
          <LN0 lnClass="LLN0" inst="" lnType="baseLLN0"/>
        </LDevice>
        <LDevice inst="ldInst2">
          <LN0 lnClass="LLN0" inst="" lnType="equalLLN0"/>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
</SCL>`;

const createSclDoc = (sclString: string) =>
  new DOMParser().parseFromString(sclString, 'application/xml');

describe('diff-tree', () => {
  it('allows elements with different identities to be compared', async () => {
    const ours = createSclDoc(sclDocString).querySelector('IED[name="IED1"]')!;
    const theirs =
      createSclDoc(sclDocString).querySelector('IED[name="IED2"]')!;

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
        expanded
      ></diff-tree>`,
    );

    expect(
      diffTree.shadowRoot!.querySelector('.header-row button')?.textContent,
    ).to.include('IED1 -> IED2');
  });
});
