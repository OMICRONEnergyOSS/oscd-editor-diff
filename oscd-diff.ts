import { LitElement, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { MdSwitch } from '@material/web/switch/switch.js';
import { identity } from '@openenergytools/scl-lib';
import { newHasher } from './hash.js';

import './diff-tree.js';

export default class OscdDiff extends LitElement {
  @query('#doc1') doc1?: HTMLSelectElement;

  @query('#doc2') doc2?: HTMLSelectElement;

  @query('#tag') tag?: HTMLSelectElement;

  @query('#doc1sel') doc1sel?: HTMLInputElement;

  @query('#doc2sel') doc2sel?: HTMLInputElement;

  @query('#inclsel') inclsel?: MdSwitch;

  @query('#inclattr') inclattr?: MdSwitch;

  @query('#inclns') inclns?: MdSwitch;

  @query('#selvals') selvals?: HTMLInputElement;

  @query('#selexcept') selexcept?: HTMLInputElement;

  @query('#attrvals') attrvals?: HTMLInputElement;

  @query('#attrexcept') attrexcept?: HTMLInputElement;

  @query('#nsvals') nsvals?: HTMLInputElement;

  @query('#nsexcept') nsexcept?: HTMLInputElement;

  @property() docName = '';

  @property() doc?: XMLDocument;

  @property() docs: Record<string, XMLDocument> = {};

  get docName1(): string {
    return this.doc1?.value || '';
  }

  get docName2(): string {
    return this.doc2?.value || '';
  }

  get selector1(): string {
    return this.doc1sel?.value || ':root';
  }

  get selector2(): string {
    return this.doc2sel?.value || ':root';
  }

  get tagName(): string {
    return this.tag?.value || '';
  }

  get includeSelectors(): boolean {
    return this.inclsel?.selected || false;
  }

  get includeAttributes(): boolean {
    return this.inclattr?.selected || false;
  }

  get includeNamespaces(): boolean {
    return this.inclns?.selected || false;
  }

  get selectorValues(): string[] {
    return (
      this.selvals?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  get selectorExceptions(): string[] {
    return (
      this.selexcept?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  get attributeValues(): string[] {
    return (
      this.attrvals?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  get attributeExceptions(): string[] {
    return (
      this.attrexcept?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  get namespaceValues(): string[] {
    return (
      this.nsvals?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  get namespaceExceptions(): string[] {
    return (
      this.nsexcept?.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length) || []
    );
  }

  hashers = new WeakMap<XMLDocument, ReturnType<typeof newHasher>>();

  render() {
    const elements: Record<string, { ours?: Element; theirs?: Element }> = {};

    this.docs[this.docName1]?.querySelectorAll(this.selector1).forEach(el => {
      const id = identity(el);
      if (!elements[id]) elements[id] = {};
      elements[id].ours = el;
    });

    this.docs[this.docName2]?.querySelectorAll(this.selector2).forEach(el => {
      const id = identity(el);
      if (!elements[id]) elements[id] = {};
      elements[id].theirs = el;
    });

    return html`<div
        style="color: var(--oscd-base02); font-family: var(--oscd-text-font); display: grid; gap: 8px; grid-template-columns: min-content min-content; margin-bottom: 1em; align-items: center;"
      >
        <md-filled-select required id="doc1" label="Document 1">
          ${Object.keys(this.docs).map(
            name =>
              html`<md-select-option value="${name}"
                >${name}</md-select-option
              >`,
          )}
        </md-filled-select>
        <md-filled-select
          required
          id="doc2"
          label="Document 2"
          style="--md-sys-color-primary: var(--oscd-secondary)"
        >
          ${Object.keys(this.docs).map(
            name =>
              html`<md-select-option value="${name}"
                >${name}</md-select-option
              >`,
          )}
        </md-filled-select>
        <md-outlined-text-field
          label="${this.docName1 || 'Document 1'} selector"
          style="--md-outlined-text-field-container-shape: 48px;"
          type="search"
          id="doc1sel"
        ></md-outlined-text-field>
        <md-outlined-text-field
          label="${this.docName2 || 'Document 2'} selector"
          style="--md-sys-color-primary: var(--oscd-secondary); --md-outlined-text-field-container-shape: 48px;"
          type="search"
          id="doc2sel"
        ></md-outlined-text-field>
        <label for="inclsel" style="text-align: right;"
          >Include Selectors</label
        >
        <md-switch
          aria-label="Include Selectors"
          id="inclsel"
          icons
          @change=${() => this.requestUpdate()}
        ></md-switch>
        <md-filled-text-field
          label="${this.includeSelectors ? 'include' : 'exclude'}"
          type="textarea"
          rows="3"
          id="selvals"
        ></md-filled-text-field>
        <md-filled-text-field
          type="textarea"
          rows="3"
          label="except"
          id="selexcept"
        ></md-filled-text-field>
        <label for="inclattr" style="text-align: right;"
          >Include Attributes</label
        >
        <md-switch
          aria-label="Include Attributes"
          id="inclattr"
          icons
          @change=${() => this.requestUpdate()}
        ></md-switch>
        <md-filled-text-field
          label="${this.includeAttributes ? 'include' : 'exclude'}"
          type="textarea"
          rows="3"
          id="attrvals"
        ></md-filled-text-field>
        <md-filled-text-field
          type="textarea"
          rows="3"
          label="except"
          id="attrexcept"
        ></md-filled-text-field>
        <label for="inclns" style="text-align: right;"
          >Include Namespaces</label
        >
        <md-switch
          aria-label="Include Namespaces"
          id="inclns"
          icons
          @change=${() => this.requestUpdate()}
        ></md-switch>
        <md-filled-text-field
          label="${this.includeNamespaces ? 'include' : 'exclude'}"
          type="textarea"
          rows="3"
          id="nsvals"
        ></md-filled-text-field>
        <md-filled-text-field
          type="textarea"
          rows="3"
          label="except"
          id="nsexcept"
        ></md-filled-text-field>
        <md-filled-button
          @click=${() => {
            const doc1 = this.docs[this.docName1];
            const doc2 = this.docs[this.docName2];
            if (!doc1 || !doc2) return;
            const options = {
              attributes: {
                inclusive: this.includeAttributes,
                vals: this.attributeValues,
                except: this.attributeExceptions,
              },
              selectors: {
                inclusive: this.includeSelectors,
                vals: this.selectorValues,
                except: this.selectorExceptions,
              },
              namespaces: {
                inclusive: this.includeNamespaces,
                vals: this.namespaceValues,
                except: this.namespaceExceptions,
              },
            };
            this.hashers.set(doc1, newHasher(options));
            this.hashers.set(doc2, newHasher(options));
            this.requestUpdate();
          }}
          }
        >
          diff
        </md-filled-button>
      </div>
      ${Object.keys(elements).map(
        id =>
          html`<diff-tree
            .ours=${elements[id].ours}
            .theirs=${elements[id].theirs}
            .hashers=${this.hashers}
          ></diff-tree>`,
      )}`;
  }

  static styles = css`
    * {
      cursor: default;
    }
    :host {
      font-family: var(--oscd-text-font);
      display: block;
      padding: 0.5rem;
      --oscd-text-font: var(--oscd-theme-text-font, 'Roboto');
      --md-sys-color-primary: var(--oscd-primary);
      --md-sys-color-secondary: var(--oscd-secondary);
      --md-sys-color-secondary-container: var(--oscd-base2);
      --md-sys-color-on-primary: var(--oscd-base3);
      --md-sys-color-on-secondary: var(--oscd-base3);
      --md-sys-color-on-surface: var(--oscd-base00);
      --md-sys-color-on-surface-variant: var(--oscd-base01);
      --md-sys-color-surface: var(--oscd-base2);
      --md-sys-color-surface-container: var(--oscd-base3);
      --md-sys-color-surface-container-high: var(--oscd-base3);
      --md-sys-color-surface-container-highest: var(--oscd-base3);
    }
  `;
}
