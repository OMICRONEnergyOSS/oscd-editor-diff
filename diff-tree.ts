import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { identity } from '@openenergytools/scl-lib';

import { Description } from './hash.js';
import type { newHasher } from './hash.js';
import { getDisplayIcon } from './icons.js';
import { getFcdaInstDesc } from './util.js';

function filterObject(
  obj: object,
  predicate: (entry: [string, any]) => boolean,
) {
  return Object.fromEntries(Object.entries(obj).filter(predicate));
}

function getDiff(ours: Description, theirs: Description) {
  const diff: Record<
    string,
    { ours?: string | string[]; theirs?: string | string[] }
  > = {};

  const keys = new Set([...Object.keys(ours), ...Object.keys(theirs)]);

  keys.forEach(key => {
    if (ours[key] === theirs[key]) {
      return;
    }
    const val = ours[key] ?? theirs[key];

    if (typeof val !== 'object') {
      diff[key] = { ours: ours[key], theirs: theirs[key] };
    } else if (Array.isArray(val)) {
      const arrayDiff = { ours: [] as string[], theirs: [] as string[] };
      const vals = new Set([...(ours[key] ?? []), ...(theirs[key] ?? [])]);
      vals.forEach(v => {
        const inOurs = ours[key]?.includes(v);
        const inTheirs = theirs[key]?.includes(v);
        if (inOurs && inTheirs) {
          return;
        }
        arrayDiff[inOurs ? 'ours' : 'theirs'].push(v);
      });
      if (arrayDiff.ours.length || arrayDiff.theirs.length) {
        diff[key] = arrayDiff;
      }
    } else if (key === 'eNS') {
      const eNSDiff: Record<
        string,
        Record<string, { ours?: string; theirs?: string }>
      > = {};
      const eNS = new Set([
        ...Object.keys(ours.eNS ?? {}),
        ...Object.keys(theirs.eNS ?? {}),
      ]);
      eNS.forEach(ns => {
        const ks = new Set([
          ...Object.keys(ours.eNS?.[ns] ?? {}),
          ...Object.keys(theirs.eNS?.[ns] ?? {}),
        ]);
        ks.forEach(k => {
          if (ours.eNS?.[ns]?.[k] === theirs.eNS?.[ns]?.[k]) {
            return;
          }
          eNSDiff[ns] ??= {};
          eNSDiff[ns][k] = {
            ours: ours.eNS?.[ns]?.[k],
            theirs: theirs.eNS?.[ns]?.[k],
          };
        });
      });
      if (Object.keys(eNSDiff).length) {
        diff[key] = eNSDiff;
      }
    } else {
      diff[key] = {
        ours: 'undiffable data type',
        theirs: 'undiffable data type',
      };
    }
  });

  return diff;
}

@customElement('diff-tree')
export class DiffTree extends LitElement {
  @property() ours?: Element;

  @property() theirs?: Element;

  @property() ourHasher?: ReturnType<typeof newHasher>;

  @property() theirHasher?: ReturnType<typeof newHasher>;

  @property({ type: Number }) depth = 0;

  @property({ type: Boolean, reflect: true })
  get odd(): boolean {
    return this.depth % 2 === 0;
  }

  #expanded = false;

  @property({ type: Boolean, reflect: true })
  get expanded(): boolean {
    return this.#expanded;
  }

  set expanded(value: boolean) {
    this.#expanded = value;
    this.everExpanded = this.everExpanded || value;
  }

  @state()
  everExpanded = false;

  @property({ type: Boolean })
  fullscreen = false;

  @state()
  childrenExpanded: boolean[] = [];

  get allChildrenExpanded(): boolean {
    return (
      this.childrenExpanded.length > 0 && this.childrenExpanded.every(e => e)
    );
  }

  @query('md-icon-button') expandButton!: HTMLElement;

  get ourHash(): string | undefined {
    return this.ours && this.ourHasher?.hash(this.ours);
  }

  get theirHash(): string | undefined {
    return this.theirs && this.theirHasher?.hash(this.theirs);
  }

  get ourDescription(): Description | undefined {
    return (
      this.ours &&
      (this.ourHasher?.db[this.ours.tagName][this.ourHash ?? ''] as
        | Description
        | undefined)
    );
  }

  get theirDescription(): Description | undefined {
    return (
      this.theirs &&
      (this.theirHasher?.db[this.theirs.tagName][this.theirHash ?? ''] as
        | Description
        | undefined)
    );
  }

  get diff(): Record<string, { ours?: any; theirs?: any }> {
    return getDiff(this.ourDescription ?? {}, this.theirDescription ?? {});
  }

  get childCount(): number {
    return Object.keys(this.diff)
      .filter(key => key.startsWith('@'))
      .map(key =>
        Math.max(this.diff[key].ours.length, this.diff[key].theirs.length),
      )
      .reduce((a, b) => a + b, 0);
  }

  firstUpdated() {
    if (this.childCount === 1) {
      this.childrenExpanded = [true];
    }
    this.childrenExpanded = new Array(this.childCount).fill(false);
  }

  renderChildDiffs() {
    if (!this.everExpanded) {
      return nothing;
    }
    return html`<div id="child-diffs">
      ${Object.entries(this.diff).map(([key, { ours, theirs }]) => {
        if (!key.startsWith('@')) {
          return nothing;
        }
        const tag = key.slice(1);
        const elementDiff: Record<
          string,
          { ourElement?: Element; theirElement?: Element }
        > = {};
        ours.forEach((digest: string) => {
          const element = [
            ...Array.from(this.ours?.children ?? []),
            ...(this.ours && this.ourHasher
              ? this.ourHasher.findReferences(this.ours)
              : []),
          ].find(
            e => e.tagName === tag && this.ourHasher?.eDb.e2h.get(e) === digest,
          );
          if (!element) {
            return;
          }
          const id = identity(element as Element);
          elementDiff[id] ??= {};
          elementDiff[id].ourElement = element;
        });
        theirs.forEach((digest: string) => {
          const element = [
            ...Array.from(this.theirs?.children ?? []),
            ...(this.theirs && this.theirHasher
              ? this.theirHasher.findReferences(this.theirs)
              : []),
          ].find(
            e =>
              e.tagName === tag && this.theirHasher?.eDb.e2h.get(e) === digest,
          );
          if (!element) {
            return;
          }
          const id = identity(element as Element);
          elementDiff[id] ??= {};
          elementDiff[id].theirElement = element;
        });
        const expanded = this.childCount <= 1;
        return Object.values(elementDiff).map(
          ({ ourElement: o, theirElement: t }, i: number) =>
            html`<diff-tree
              .ours=${o}
              .theirs=${t}
              .ourHasher=${this.ourHasher}
              .theirHasher=${this.theirHasher}
              @diff-toggle=${(event: CustomEvent<{ expanded: boolean }>) => {
                event.stopPropagation();
                this.childrenExpanded[i] = event.detail.expanded;
                this.requestUpdate();
              }}
              ?expanded=${expanded}
              ?fullscreen=${this.fullscreen}
              .depth=${this.depth + 1}
            ></diff-tree>`,
        );
      })}
    </div>`;
  }

  renderAttributeDiff() {
    const attrDiff = filterObject(
      this.diff,
      ([key]) => !key.startsWith('@') && key !== 'eNS',
    );
    const eNSDiff = this.diff.eNS;
    if (!Object.keys(attrDiff).length && !eNSDiff) {
      return nothing;
    }
    return html`<table>
      ${Object.entries(attrDiff).map(
        ([name, { ours, theirs }]) =>
          html`<tr tabindex="0">
            <th></th>
            <th>${name}</th>
            <td><span>${ours}</span></td>
            <td><span>${theirs}</span></td>
          </tr>`,
      )}
      ${Object.entries(eNSDiff ?? {}).map(([ns, ks]) =>
        (
          Object.entries(ks) as [string, { ours: string; theirs: string }][]
        ).map(
          ([k, { ours, theirs }]) =>
            html`<tr tabindex="0">
              <th>${ns}</th>
              <th>${k}</th>
              <td><span>${ours}</span></td>
              <td>
                <span>${theirs}</span>
              </td>
            </tr>`,
        ),
      )}
    </table>`;
  }

  renderDiff() {
    return html`${this.renderAttributeDiff()}${this.renderChildDiffs()}`;
  }

  render() {
    if (this.ourHash === this.theirHash) {
      return nothing;
    }

    const element = this.ours ?? this.theirs;
    if (!element) {
      return nothing;
    }
    let id = ((identity(element) || element.tagName) as string)
      .split('>')
      .pop();
    if (this.ours && this.theirs) {
      const theirId = identity(this.theirs);
      const ourId = identity(this.ours);
      if (theirId && ourId && ourId !== theirId) {
        id = `${ourId || this.ours!.tagName} -> ${theirId || this.theirs!.tagName}`;
      }
    }
    let color = 'inherit';
    if (!this.ours) {
      color = 'var(--oscd-secondary, darkgreen)';
    }
    if (!this.theirs) {
      color = 'var(--oscd-primary, darkred)';
    }
    const fullscreenStyles = this.fullscreen
      ? html`<style>
          .header-row {
            top: ${this.depth * 24}px;
            z-index: ${10000 - this.depth};
            position: sticky;
          }
        </style>`
      : nothing;
    const style = html`<style>
        button {
          color: ${color};
        }
      </style>
      ${fullscreenStyles}`;
    let desc = element.getAttribute('desc') || '';
    if (element.tagName === 'FCDA') {
      const { LDevice, LN, DOI, SDI, DAI } = getFcdaInstDesc(
        element as Element,
      );
      desc = [LDevice, LN, DOI, ...(SDI ?? []), DAI]
        .filter(Boolean)
        .join(' > ');
    }
    if (desc) {
      desc = `: ${desc}`;
    }
    if (id !== element.tagName) {
      desc = `${element.tagName}${desc}`;
    }

    if (this.childCount > 0) {
      desc = `${desc} (${this.childCount})`;
    }

    return html`<div class="header-row">
        <button
          @click=${() => {
            this.expanded = !this.expanded;
            this.dispatchEvent(
              new CustomEvent('diff-toggle', {
                bubbles: true,
                composed: true,
                detail: { expanded: this.expanded },
              }),
            );
          }}
        >
          <md-icon
            >${this.expanded ? 'arrow_drop_down' : 'arrow_right'}</md-icon
          >
          <md-icon class="display">${getDisplayIcon(element)}</md-icon>
          ${id} <small>${desc}</small>
        </button>
        ${this.childCount > 1
          ? html`
          <md-icon-button ?selected=${this.allChildrenExpanded} toggle id="expand-all-btn" @click=${async () => {
            this.expanded = true;
            this.dispatchEvent(
              new CustomEvent('diff-toggle', {
                bubbles: true,
                composed: true,
                detail: { expanded: true },
              }),
            );
            await this.updateComplete;
            this.shadowRoot
              ?.querySelectorAll<DiffTree>('diff-tree')
              .forEach((dt: DiffTree) => {
                // eslint-disable-next-line no-param-reassign
                dt.expanded = !this.allChildrenExpanded;
              });
            this.childrenExpanded = this.childrenExpanded.fill(
              !this.allChildrenExpanded,
            );
          }}><md-icon slot="selected">collapse_all</md-icon><md-icon>expand_all</md-icon></md-icon-button
          ></md-icon-button>
        `
          : nothing}
      </div>
      <div class="content-row">
        ${this.everExpanded ? this.renderDiff() : ''} ${style}
      </div> `;
  }

  static styles = css`
    small {
      font-size: 0.8em;
      font-weight: 300;
      color: var(--oscd-base02);
    }
    :host([odd]) small {
      color: var(--oscd-base01);
    }

    #expand-all-btn {
      --md-icon-button-icon-size: 16px;
      --md-icon-button-selected-icon-color: var(
        --md-sys-color-on-surface-variant
      );
      --md-icon-button-selected-hover-icon-color: var(
        --md-sys-color-on-surface-variant
      );
      --md-icon-button-selected-focus-icon-color: var(
        --md-sys-color-on-surface-variant
      );
      height: 24px;
      width: 24px;
      margin: 4px 8px;
    }

    @media print {
      #expand-all-btn {
        display: none;
      }
    }

    md-icon {
      height: 20px;
    }
    md-icon.display {
      --md-icon-size: 20px;
      position: relative;
      top: 3px;
      left: -3px;
    }
    #child-diffs {
      margin-left: 1em;
      margin-right: 1em;
    }
    th {
      font-weight: 300;
    }
    tr:focus {
      outline: none;
    }
    td {
      font-weight: 400;
    }
    th:first-child {
      text-align: right;
      color: var(--oscd-base1);
    }
    th:nth-child(2) {
      text-align: left;
      color: var(--oscd-base0);
      padding-left: 0.5em;
    }
    table td:nth-child(3) {
      text-align: right;
      color: var(--oscd-primary, darkred);
      padding-left: 1em;
    }
    td:nth-child(4) {
      text-align: left;
      color: var(--oscd-secondary, darkgreen);
      padding-left: 1em;
    }
    span {
      display: block;
      transition: max-height 0.5s ease-in-out;
    }
    tr:not(:focus) span {
      max-height: 20px;
      overflow: hidden;
    }
    tr:not(:focus):hover span {
      max-height: 60px;
    }
    tr {
      background: var(--tr-bg);
      color: var(--tr-fg);
      vertical-align: top;
    }
    tr:nth-child(2n) {
      --tr-bg: var(--oscd-base3);
      --tr-fg: var(--oscd-base0);
      --tr-fg-alt: var(--oscd-base1);
    }
    tr:nth-child(2n + 1) {
      --tr-bg: var(--oscd-base2);
      --tr-fg: var(--oscd-base00);
      --tr-fg-alt: var(--oscd-base0);
    }
    :host([odd]) tr:nth-child(2n) {
      --tr-bg: var(--oscd-base2);
      --tr-fg: var(--oscd-base00);
      --tr-fg-alt: var(--oscd-base0);
    }
    :host([odd]) tr:nth-child(2n + 1) {
      --tr-bg: var(--oscd-base3);
      --tr-fg: var(--oscd-base0);
      --tr-fg-alt: var(--oscd-base1);
    }
    tr:focus:nth-child(2n) {
      --tr-bg: var(--oscd-base03);
      --tr-fg: var(--oscd-base00);
      --tr-fg-alt: var(--oscd-base01);
    }
    tr:focus:nth-child(2n + 1) {
      --tr-bg: var(--oscd-base02);
      --tr-fg: var(--oscd-base0);
      --tr-fg-alt: var(--oscd-base00);
    }
    :host([odd]) tr:focus:nth-child(2n) {
      --tr-bg: var(--oscd-base02);
      --tr-fg: var(--oscd-base0);
      --tr-fg-alt: var(--oscd-base00);
    }
    :host([odd]) tr:focus:nth-child(2n + 1) {
      --tr-bg: var(--oscd-base03);
      --tr-fg: var(--oscd-base00);
      --tr-fg-alt: var(--oscd-base01);
    }
    table {
      border: 0.25em solid var(--oscd-base3);
      table-layout: auto;
      border-collapse: collapse;
      max-width: 100%;
      margin-left: 1em;
      margin-right: 1em;
      background: none;
    }
    :host([odd]) table {
      border: 0.25em solid var(--oscd-base2);
    }
    * {
      cursor: default;
    }
    :host {
      font-family: var(--oscd-text-font);
      display: block;
      background: var(--oscd-base2);
      color: var(--oscd-base03);
    }
    :host(:last-child) {
      border-bottom: 0.25em solid var(--oscd-base3);
    }
    :host([odd]:last-child) {
      border-bottom: 0.25em solid var(--oscd-base2);
    }
    :host([odd]) {
      background: var(--oscd-base3);
      color: var(--oscd-base02);
    }

    .header-row {
      background: var(--oscd-base2);
      width: 100%;
      display: flex;
      justify-content: space-between;
      height: 25px;
      align-items: center;
    }

    :host([odd]) .header-row {
      background: var(--oscd-base3);
    }

    button {
      display: block;
      background: inherit;
      width: 100%;
      border: none;
      margin: 0;
      padding: 0;
      border-radius: 0;
      text-align: inherit;
      font: inherit;
      appearance: none;
    }
    :host(:not([expanded])) .content-row {
      display: none;
    }
  `;
}
