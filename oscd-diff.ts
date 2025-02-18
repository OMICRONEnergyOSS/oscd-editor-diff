import { LitElement, html, css, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import { identity } from '@openenergytools/scl-lib';

import '@material/web/all.js';
import type { MdFilledSelect, MdMenu } from '@material/web/all.js';

import { HasherOptions, newHasher } from './hash.js';

import './diff-tree.js';
import './filter-dialog.js';
import type { FilterDialog, OscdDiffFilterSaveEvent } from './filter-dialog.js';
import { defaultFilters } from './default-filters.js';

export type Filter = HasherOptions & {
  ourSelector: string;
  theirSelector: string;
};

function hasPropertyOfType(
  obj: Record<string, unknown>,
  prop: string,
  type: string,
): boolean {
  return (
    prop in obj &&
    // eslint-disable-next-line valid-typeof
    (typeof obj[prop] === type ||
      (type === 'array' && Array.isArray(obj[prop])))
  );
}

async function hashElement(el: Element, hasher: ReturnType<typeof newHasher>) {
  await new Promise(resolve => {
    setTimeout(resolve, 0);
  });
  return hasher.hash(el);
}

export function isFilter(obj: object): obj is Filter {
  const filterTypes = {
    ourSelector: 'string',
    theirSelector: 'string',
    selectors: 'object',
    attributes: 'object',
    namespaces: 'object',
  };

  const configurableTypes = {
    inclusive: 'boolean',
    vals: 'array',
    except: 'array',
  };

  if (
    !Object.entries(filterTypes).every(([prop, type]) => {
      if (!hasPropertyOfType(obj as Record<string, unknown>, prop, type)) {
        return false;
      }
      if (type === 'string') {
        return true;
      }
      const configurable = (obj as Filter)[prop as keyof HasherOptions];
      if (
        type === 'object' &&
        !Object.entries(configurableTypes).every(([p, t]) => {
          if (!hasPropertyOfType(configurable, p, t)) {
            return false;
          }

          if (
            t === 'array' &&
            !configurable[p as 'vals' | 'except'].every(
              s => typeof s === 'string',
            )
          ) {
            return false;
          }
          return true;
        })
      ) {
        return false;
      }
      return true;
    })
  ) {
    return false;
  }
  return true;
}

export default class OscdDiff extends LitElement {
  @property() docName = '';

  @property() doc?: XMLDocument;

  @property() docs: Record<string, XMLDocument> = {};

  @state()
  selectedFilterName: string = '';

  @query('#doc1') doc1?: HTMLSelectElement;

  @query('#filters-import-field') filtersInputField?: HTMLInputElement;

  @query('#doc2') doc2?: HTMLSelectElement;

  @query('#doc1sel') doc1sel?: HTMLInputElement;

  @query('#doc2sel') doc2sel?: HTMLInputElement;

  @query('filter-dialog') filterDialog?: FilterDialog;

  @query('md-menu') filterMenu?: MdMenu;

  @state() filters: Record<string, Filter> = defaultFilters;

  setFilters(updatedFilters: Record<string, Filter>) {
    localStorage.setItem('oscd-diff-filters', JSON.stringify(updatedFilters));
    this.filters = updatedFilters;
  }

  async deleteFilter(filterName: string) {
    const newFilters = { ...this.filters };
    delete newFilters[filterName];
    this.setFilters(newFilters);
    if (Object.keys(newFilters).length === 0) {
      this.setFilters(defaultFilters);
    }
    await this.updateComplete;
    this.setSelectedFilterName(Object.keys(this.filters)[0]);
  }

  get selectedFilter() {
    return this.filters[this.selectedFilterName] || defaultFilters.Complete;
  }

  setSelectedFilterName(name: string) {
    if (!(name in this.filters)) {
      // eslint-disable-next-line no-console
      console.error(`Filter ${name} not found`);
      return;
    }
    localStorage.setItem('oscd-diff-selected-filter', name);
    this.selectedFilterName = name;
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
    const selectedFilterName = localStorage.getItem(
      'oscd-diff-selected-filter',
    );
    if (selectedFilterName && selectedFilterName in this.filters) {
      this.selectedFilterName = selectedFilterName;
    } else {
      [this.selectedFilterName] = Object.keys(this.filters);
    }
  }

  async handleImportFieldChanged(event: Event) {
    const { files } = event.target as HTMLInputElement;
    if (!files || files.length <= 0) {
      return;
    }
    try {
      const importedFilters = JSON.parse(await files[0].text());
      if (typeof importedFilters !== 'object') {
        return;
      }
      const newFilters = { ...this.filters };
      Object.entries(importedFilters as Record<string, unknown>).forEach(
        ([filterName, filter]) => {
          if (filter && typeof filter === 'object' && isFilter(filter)) {
            newFilters[filterName] = filter;
          }
        },
      );
      this.setFilters(newFilters);
    } catch (err) {
      console.error(err);
    }
  }

  importFilters() {
    this.filtersInputField?.click();
    if (this.filtersInputField) {
      this.filtersInputField.value = '';
    }
  }

  exportFilters() {
    const blob = new Blob([JSON.stringify(this.filters, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filters.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  showFilterDialog() {
    if (this.filterDialog) {
      this.filterDialog.open = true;
    }
  }

  uniqueFilterName(): string {
    let i = 1;
    const filterName = this.selectedFilterName.replace(/\s*\d+$/, '');
    let newName = `${filterName} 1`;
    while (newName in this.filters) {
      i += 1;
      newName = `${filterName} ${i}`;
    }
    return newName;
  }

  async duplicateFilter() {
    if (this.filterDialog) {
      const newFilterName = this.uniqueFilterName();
      this.setFilters({
        ...this.filters,
        [newFilterName]: this.selectedFilter,
      });
      await this.updateComplete;
      this.setSelectedFilterName(newFilterName);
    }
  }

  render() {
    const elements: Record<string, { ours?: Element; theirs?: Element }> = {};

    this.docs[this.docName1]?.querySelectorAll(this.selector1).forEach(el => {
      const id = identity(el);
      if (!elements[id]) {
        elements[id] = {};
      }
      elements[id].ours = el;
    });

    this.docs[this.docName2]?.querySelectorAll(this.selector2).forEach(el => {
      const id = identity(el);
      if (!elements[id]) {
        elements[id] = {};
      }
      elements[id].theirs = el;
    });

    const promise = Promise.all(
      Object.values(elements).map(({ ours, theirs }) => {
        const ourHasher = ours && this.hashers.get(ours.ownerDocument);
        const ourHash = ourHasher && hashElement(ours, ourHasher);
        const theirHasher = theirs && this.hashers.get(theirs.ownerDocument);
        const theirHash = theirHasher && hashElement(theirs, theirHasher);
        return Promise.all([ourHash, theirHash]);
      }),
    );

    return html`<div style="">
        <div id="filter-selector-row">
          <md-filled-select
            required
            label="Filter"
            .value=${this.selectedFilterName}
            @change=${(event: Event) => {
              this.setSelectedFilterName(
                (event.target as MdFilledSelect).value,
              );
            }}
          >
            <md-icon slot="leading-icon">filter_list</md-icon>
            ${Object.keys(this.filters).map(
              (filterName: string) =>
                html`<md-select-option
                  value=${filterName}
                  ?selected=${this.selectedFilterName === filterName}
                >
                  ${filterName}</md-select-option
                >`,
            )}
          </md-filled-select>
          <span style="position: relative">
            <input
              type="file"
              accept="application/json"
              id="filters-import-field"
              @change=${this.handleImportFieldChanged}
            />
            <md-icon-button
              id="filter-menu-button"
              @click=${() => {
                if (this.filterMenu) {
                  this.filterMenu.open = !this.filterMenu.open;
                }
              }}
              ><md-icon>more_vert</md-icon></md-icon-button
            >
            <md-menu anchor="filter-menu-button">
              <md-menu-item
                type="button"
                href="#"
                @click=${() => this.showFilterDialog()}
              >
                <md-icon slot="start">edit</md-icon>
                <div slot="headline">Edit</div>
              </md-menu-item>
              <md-menu-item
                type="button"
                href="#"
                @click=${() => this.duplicateFilter()}
              >
                <md-icon slot="start">content_copy</md-icon>
                <div slot="headline">Duplicate</div>
              </md-menu-item>
              <md-menu-item
                type="button"
                href="#"
                @click=${() => this.deleteFilter(this.selectedFilterName)}
                style="--md-menu-item-leading-icon-color:var(--oscd-error); --md-menu-item-label-text-color:var(--oscd-error)"
              >
                <md-icon slot="start">delete</md-icon>
                <div slot="headline">Delete</div>
              </md-menu-item>
              <md-divider></md-divider>
              <md-menu-item
                type="button"
                href="#"
                @click=${() => this.importFilters()}
              >
                <md-icon slot="start">publish</md-icon>
                <div slot="headline">Import Filters</div>
              </md-menu-item>
              <md-menu-item
                type="button"
                href="#"
                @click=${() => this.exportFilters()}
              >
                <md-icon slot="start">download</md-icon>
                <div slot="headline">Export Filters</div>
              </md-menu-item>
            </md-menu>
          </span>
        </div>

        <md-filled-select required id="doc1" label="From document">
          <md-icon slot="leading-icon">draft</md-icon>
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
          label="To document"
          style="--md-sys-color-primary: var(--oscd-secondary)"
        >
          <md-icon slot="leading-icon">draft</md-icon>
          ${Object.keys(this.docs).map(
            name =>
              html`<md-select-option value="${name}"
                >${name}</md-select-option
              >`,
          )}
        </md-filled-select>

        <md-filled-text-field
          label="From elements"
          type="search"
          id="doc1sel"
          .value=${this.selectedFilter.ourSelector}
          .placeholder=${this.docs[this.docName1]?.documentElement.tagName ||
          ':root'}
          @change=${() => this.requestUpdate()}
        >
          <md-icon slot="leading-icon">plagiarism</md-icon>
        </md-filled-text-field>
        <md-filled-text-field
          label="To elements"
          style="--md-sys-color-primary: var(--oscd-secondary);"
          type="search"
          id="doc2sel"
          .value=${this.selectedFilter.theirSelector}
          .placeholder=${this.selector1}
        >
          <md-icon slot="leading-icon">plagiarism</md-icon>
        </md-filled-text-field>

        ${until(
          promise.then(
            () =>
              html`<md-filled-button
                style="grid-column: 1/3;"
                @click=${() => {
                  const doc1 = this.docs[this.docName1];
                  const doc2 = this.docs[this.docName2];
                  if (!doc1 || !doc2) {
                    return;
                  }
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
                Compare
                <md-icon slot="icon">difference</md-icon>
              </md-filled-button>`,
          ),
          html`<md-filled-button
            disabled
            style="grid-column: 1/3; --md-filled-button-icon-size: 32px;"
          >
            Compare
            <md-circular-progress
              style="--md-circular-progress-active-indicator-color: var(--oscd-base00);"
              slot="icon"
              indeterminate
            ></md-circular-progress>
          </md-filled-button>`,
        )}

        <filter-dialog
          filterName="${this.selectedFilterName}"
          .existingFilterNames=${Object.keys(this.filters).filter(
            name => name !== this.selectedFilterName,
          )}
          .filter=${this.selectedFilter}
          @oscd-diff-filter-save=${async (event: OscdDiffFilterSaveEvent) => {
            this.setFilters({
              ...this.filters,
              [event.detail.newName]: event.detail.filter,
            });
            if (event.detail.newName !== event.detail.oldName) {
              this.deleteFilter(event.detail.oldName);
              await this.updateComplete;
              this.setSelectedFilterName(event.detail.newName);
            }
          }}
        ></filter-dialog>
      </div>
      ${until(
        promise.then(() =>
          Object.keys(elements).map(id => {
            const { ours, theirs } = elements[id];
            return html`<diff-tree
              .ours=${ours}
              .theirs=${theirs}
              .ourHasher=${ours?.ownerDocument &&
              this.hashers.get(ours.ownerDocument)}
              .theirHasher=${theirs?.ownerDocument &&
              this.hashers.get(theirs.ownerDocument)}
            ></diff-tree>`;
          }),
        ),
        nothing,
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
      --md-sys-color-outline-variant: var(--oscd-base0);
    }

    :host > div {
      color: var(--oscd-base02);
      font-family: var(--oscd-text-font);
      display: grid;
      gap: 12px;
      grid-template-columns: max-content max-content;
      margin: 16px;
      margin-bottom: 1em;
      align-items: center;
    }

    #filters-import-field {
      display: block;
      visibility: hidden;
      width: 0;
      height: 0;
    }

    md-menu {
      min-width: max-content;
    }

    #filter-selector-row {
      grid-column: 1/3;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    #filter-selector-row md-filled-select {
      flex-grow: 1;
    }
  `;
}
