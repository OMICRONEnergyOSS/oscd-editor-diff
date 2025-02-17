import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { identity } from '@openenergytools/scl-lib';

import { Description } from './hash.js';
import type { newHasher } from './hash.js';

function filterObject(
  obj: object,
  predicate: (entry: [string, any]) => boolean,
) {
  return Object.fromEntries(Object.entries(obj).filter(predicate));
}

function getDiff(ours: Description, theirs: Description) {
  const diff: Record<string, { ours?: any; theirs?: any }> = {};

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

  @property({ type: Boolean, reflect: true })
  expanded = false;

  @query('md-icon-button') expandButton!: HTMLElement;

  get ourHash(): string | undefined {
    return this.ours && this.ourHasher && this.ourHasher.eDb.e2h.get(this.ours);
  }

  get theirHash(): string | undefined {
    return (
      this.theirs &&
      this.theirHasher &&
      this.theirHasher.eDb.e2h.get(this.theirs)
    );
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

  renderChildDiffs() {
    if (!this.expanded) {
      return nothing;
    }
    return html`<div>
      ${Object.entries(this.diff).map(([key, { ours, theirs }]) => {
        if (!key.startsWith('@')) {
          return nothing;
        }
        const tag = key.slice(1);
        const elementDiff: Record<
          string,
          { ours?: Element; theirs?: Element }
        > = {};
        ours.forEach((digest: string) => {
          const element = Array.from(
            this.ourHasher?.eDb.h2e.get(digest)?.values() ?? [],
          ).find(e => e.tagName === tag);
          if (!element) {
            return;
          }
          const id = identity(element as Element);
          elementDiff[id] ??= {};
          elementDiff[id].ours = element;
        });
        theirs.forEach((digest: string) => {
          const element = Array.from(
            this.theirHasher?.eDb.h2e.get(digest)?.values() ?? [],
          ).find(e => e.tagName === tag);
          if (!element) {
            return;
          }
          const id = identity(element as Element);
          elementDiff[id] ??= {};
          elementDiff[id].theirs = element;
        });
        const expanded = Object.keys(elementDiff).length === 1;
        return Object.values(elementDiff).map(
          ({ ours: o, theirs: t }) =>
            html`<diff-tree
              .ours=${o}
              .theirs=${t}
              .ourHasher=${this.ourHasher}
              .theirHasher=${this.theirHasher}
              .expanded=${expanded}
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
    const id = this.depth
      ? (<string>(identity(element) || element.tagName)).split('>').pop()
      : identity(element) || element.tagName;
    let color = 'inherit';
    if (!this.ours) {
      color = 'var(--oscd-secondary)';
    }
    if (!this.theirs) {
      color = 'var(--oscd-primary)';
    }
    const style = html`<style>
      button {
        color: ${color};
        top: ${this.depth * 24 + 60}px;
      }
      @media (max-width: 599px) {
        button {
          top: ${this.depth * 24 + 52}px;
        }
      }
    </style>`;
    let desc = element.getAttribute('desc') || '';
    if (desc) {
      desc = `: ${desc}`;
    }
    if (id !== element.tagName) {
      desc = `${element.tagName}${desc}`;
    }

    return html`<button
        @click=${() => {
          this.expanded = !this.expanded;
        }}
      >
        <md-icon>${this.expanded ? 'arrow_drop_down' : 'arrow_right'}</md-icon>
        ${id} <small>${desc}</small>
      </button>
      ${this.expanded ? this.renderDiff() : ''} ${style}`;
  }

  static styles = css`
    small {
      font-size: 0.8em;
      font-weight: 300;
      color: var(--oscd-base0);
    }
    :host([odd]) small {
      color: var(--oscd-base1);
    }
    md-icon {
      height: 20px;
    }
    div {
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
      color: var(--oscd-primary);
      padding-left: 1em;
    }
    td:nth-child(4) {
      text-align: left;
      color: var(--oscd-secondary);
      padding-left: 1em;
    }
    td:nth-child(4) {
      text-align: left;
      color: var(--oscd-secondary);
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
      color: var(--oscd-base01);
    }
    :host(:last-child) {
      border-bottom: 0.25em solid var(--oscd-base3);
    }
    :host([odd]:last-child) {
      border-bottom: 0.25em solid var(--oscd-base2);
    }
    :host([odd]) {
      background: var(--oscd-base3);
      color: var(--oscd-base00);
    }
    button {
      display: block;
      background: var(--oscd-base2);
      width: 100%;
      border: none;
      margin: 0;
      padding: 0;
      border-radius: 0;
      text-align: inherit;
      font: inherit;
      appearance: none;
    }
    :host([expanded]) button {
      position: sticky;
    }
    :host([odd]) button {
      background: var(--oscd-base3);
    }
  `;
}
