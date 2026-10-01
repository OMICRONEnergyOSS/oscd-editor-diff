import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './diff-tree.js';
import type { DiffTree } from './diff-tree.js';
import { newHasher } from './hash.js';
import {
  defaultBaseFilters,
  defaultFilters,
  extendFilter,
} from './default-filters.js';

const sclDocString = (
  typeSuffix: string,
  sAddr: string,
) => `<SCL xmlns="http://www.iec.ch/61850/2003/SCL">
  <IED name="IED1">
    <AccessPoint name="AP1">
      <Server>
        <Authentication />
        <LDevice inst="ldInst1">
          <LN0 lnClass="LLN0" inst="" lnType="LLN0${typeSuffix}"/>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
  <DataTypeTemplates>
    <LNodeType id="LLN0${typeSuffix}" lnClass="LLN0">
      <DO name="Mod" type="ENC${typeSuffix}"/>
    </LNodeType>
    <DOType id="ENC${typeSuffix}" cdc="ENC">
      <DA name="stVal" bType="Enum" fc="ST" type="Mod${typeSuffix}" sAddr="${sAddr}"/>
    </DOType>
    <EnumType id="Mod${typeSuffix}">
      <EnumVal ord="1">on</EnumVal>
    </EnumType>
  </DataTypeTemplates>
</SCL>`;

const createSclDoc = (sclString: string) =>
  new DOMParser().parseFromString(sclString, 'application/xml');

function childTrees(tree: Element): DiffTree[] {
  return Array.from(tree.shadowRoot?.querySelectorAll('diff-tree') ?? []);
}

function label(tree: Element): string {
  return (
    tree.shadowRoot?.querySelector('.header-row > button')?.textContent ?? ''
  );
}

describe('diff-tree with renamed data types', () => {
  it('compares renamed referenced types instead of showing them as removed and added', async () => {
    const ours = createSclDoc(sclDocString('', 'EN')).querySelector('LN0')!;
    const theirs = createSclDoc(sclDocString('@X#1', 'RELAY_EN')).querySelector(
      'LN0',
    )!;

    const options = extendFilter(defaultBaseFilters, defaultFilters.Complete);
    const ourHasher = newHasher(options);
    const theirHasher = newHasher(options);

    const lN0: DiffTree = await fixture(
      html`<diff-tree
        .ours=${ours}
        .theirs=${theirs}
        .ourHasher=${ourHasher}
        .theirHasher=${theirHasher}
        expanded
      ></diff-tree>`,
    );

    const lNodeTypes = childTrees(lN0);
    expect(lNodeTypes).to.have.length(1);
    expect(label(lNodeTypes[0])).to.include('#LLN0 -> #LLN0@X#1');

    const dOs = childTrees(lNodeTypes[0]);
    expect(dOs).to.have.length(1);
    expect(label(dOs[0])).to.include('Mod').and.not.include('->');

    const dOTypes = childTrees(dOs[0]);
    expect(dOTypes).to.have.length(1);
    expect(label(dOTypes[0])).to.include('#ENC -> #ENC@X#1');

    const dAs = childTrees(dOTypes[0]);
    expect(dAs).to.have.length(1);
    expect(label(dAs[0])).to.include('stVal').and.not.include('->');

    const rows = Array.from(
      dAs[0].shadowRoot?.querySelectorAll('table tr') ?? [],
    ).map(tr => tr.textContent?.replace(/\s+/g, ' ').trim());
    expect(rows).to.deep.equal(['sAddr EN RELAY_EN']);
    // the identical EnumType is not reported even though its id differs
    expect(childTrees(dAs[0])).to.have.length(0);
  });
});
