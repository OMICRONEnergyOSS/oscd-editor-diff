import { LitElement, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { identity } from '@openenergytools/scl-lib';

import '@material/web/all.js';
import type { MdFilledSelect } from '@material/web/all.js';

import { HasherOptions, newHasher } from './hash.js';

import './diff-tree.js';
import './filter-dialog.js';
import type {
  FilterDialog,
  OscdDiffFilterDeleteEvent,
  OscdDiffFilterSaveEvent,
} from './filter-dialog.js';
import { defaultFilters } from './default-filters.js';

export type Filter = HasherOptions & {
  ourSelector: string;
  theirSelector: string;
};

export default class OscdDiff extends LitElement {
  @query('#doc1') doc1?: HTMLSelectElement;

  @query('#doc2') doc2?: HTMLSelectElement;

  @query('#doc1sel') doc1sel?: HTMLInputElement;

  @query('#doc2sel') doc2sel?: HTMLInputElement;

  @query('filter-dialog') filterDialog?: FilterDialog;

  @property() docName = '';

  @property() doc?: XMLDocument;

  @property() docs: Record<string, XMLDocument> = {};

  @state()
  selectedFilterName: string = '';

  get selectedFilter() {
    return this.filters[this.selectedFilterName] || defaultFilters.Complete;
  }

  @state() filters: Record<string, Filter> = defaultFilters;

  setFilters(updatedFilters: Record<string, Filter>) {
    localStorage.setItem('oscd-diff-filters', JSON.stringify(updatedFilters));
    this.filters = updatedFilters;
  }

  deleteFilter(filterName: string) {
    // TODO(stee) make this nicer
    const newFilters = { ...this.filters };
    delete newFilters[filterName];
    this.setFilters(newFilters);
    if (Object.keys(newFilters).length === 0) {
      this.setFilters(defaultFilters);
    }
  }

  get docName1(): string {
    return this.doc1?.value || '';
  }

  get docName2(): string {
    return this.doc2?.value || '';
  }

  get selector1(): string {
    return (
      this.doc1sel?.value ||
      this.docs[this.docName1]?.documentElement.tagName ||
      ':root'
    );
  }

  get selector2(): string {
    return this.doc2sel?.value || this.selector1;
  }

  hashers = new WeakMap<XMLDocument, ReturnType<typeof newHasher>>();

  firstUpdated() {
    const filtersStr = localStorage.getItem('oscd-diff-filters');
    if (filtersStr) {
      try {
        const filters = JSON.parse(filtersStr) as Record<string, Filter>;
        if (Object.keys(filters).length > 0) {
          this.filters = filters;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }

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
        <md-filled-select required id="doc1" label="From">
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
          label="To"
          style="--md-sys-color-primary: var(--oscd-secondary)"
        >
          ${Object.keys(this.docs).map(
            name =>
              html`<md-select-option value="${name}"
                >${name}</md-select-option
              >`,
          )}
        </md-filled-select>

        <div class="oscd-diff__filter-selector-row">
          <md-filled-select
            required
            label="Filters"
            .value=${this.selectedFilterName}
            @change=${(event: Event) => {
              this.selectedFilterName = (event.target as MdFilledSelect).value;
            }}
          >
            ${Object.keys(this.filters).map(
              (filterName: string) =>
                html`<md-select-option
                  value=${filterName}
                  ?selected=${this.selectedFilterName === filterName}
                  >${filterName}</md-select-option
                >`,
            )}
          </md-filled-select>
          <md-outlined-icon-button
            @click=${async () => {
              if (this.filterDialog) {
                const newFilterName = `${this.selectedFilterName} - copy`;
                this.setFilters({
                  ...this.filters,
                  [newFilterName]: this.selectedFilter,
                });
                await this.updateComplete;
                this.selectedFilterName = newFilterName;
              }
            }}
          >
            <md-icon>content_copy</md-icon>
          </md-outlined-icon-button>
          <md-outlined-icon-button
            @click=${() => {
              if (this.filterDialog) {
                this.filterDialog.open = true;
              }
            }}
          >
            <md-icon>edit</md-icon>
          </md-outlined-icon-button>
        </div>

        <md-outlined-text-field
          label="${this.docName1 || 'From'} selector"
          style="--md-outlined-text-field-container-shape: 48px;"
          type="search"
          id="doc1sel"
          .value=${this.selectedFilter.ourSelector}
          .placeholder=${this.docs[this.docName1]?.documentElement.tagName ||
          ':root'}
          @change=${() => this.requestUpdate()}
        ></md-outlined-text-field>
        <md-outlined-text-field
          label="${this.docName2 || 'To'} selector"
          style="--md-sys-color-primary: var(--oscd-secondary); --md-outlined-text-field-container-shape: 48px;"
          type="search"
          id="doc2sel"
          .value=${this.selectedFilter.theirSelector}
          .placeholder=${this.selector1}
        ></md-outlined-text-field>

        <md-filled-button
          @click=${() => {
            const doc1 = this.docs[this.docName1];
            const doc2 = this.docs[this.docName2];
            if (!doc1 || !doc2) return;
            const options = {
              attributes: this.selectedFilter.attributes,
              selectors: this.selectedFilter.selectors,
              namespaces: this.selectedFilter.namespaces,
            };
            this.hashers.set(doc1, newHasher(options));
            this.hashers.set(doc2, newHasher(options));
            this.requestUpdate();
          }}
        >
          diff
        </md-filled-button>

        <filter-dialog
          filterName="${this.selectedFilterName}"
          .filter=${this.selectedFilter}
          @oscd-diff-filter-save=${async (event: OscdDiffFilterSaveEvent) => {
            this.setFilters({
              ...this.filters,
              [event.detail.newName]: event.detail.filter,
            });
            if (event.detail.newName !== event.detail.oldName) {
              this.deleteFilter(event.detail.oldName);
              await this.updateComplete;
              this.selectedFilterName = event.detail.newName;
            }
          }}
          @oscd-diff-filter-delete=${(event: OscdDiffFilterDeleteEvent) => {
            this.deleteFilter(event.detail.name);
            [this.selectedFilterName] = Object.keys(this.filters);
          }}
        ></filter-dialog>
      </div>
      ${Object.keys(elements).map(id => {
        const { ours, theirs } = elements[id];
        return html`<diff-tree
          .ours=${ours}
          .theirs=${theirs}
          .ourHasher=${ours?.ownerDocument &&
          this.hashers.get(ours.ownerDocument)}
          .theirHasher=${theirs?.ownerDocument &&
          this.hashers.get(theirs.ownerDocument)}
        ></diff-tree>`;
      })}`;
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

    .oscd-diff__filter-selector-row {
      grid-column: 1/3;
      display: flex;
      gap: 1em;
      align-items: center;
    }

    .oscd-diff__filter-selector-row md-filled-select {
      flex-grow: 1;
    }
  `;
}
