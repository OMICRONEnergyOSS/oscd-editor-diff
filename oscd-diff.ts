import { LitElement, html, css, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import { identity } from '@openenergytools/scl-lib';

import '@material/web/all.js';
import type { MdFilledSelect, MdMenu } from '@material/web/all.js';

import {
  Configurable,
  createHashElementPredicate,
  HasherOptions,
  newHasher,
} from './hash.js';

import './diff-tree.js';
import './filter-dialog.js';
import './base-filter-dialog.js';
import './info-dialog.js';
import type { FilterDialog, OscdDiffFilterSaveEvent } from './filter-dialog.js';
import type { InfoDialog } from './info-dialog.js';
import {
  defaultBaseFilters,
  defaultFilters,
  extendFilter,
} from './default-filters.js';
import { DefaultInfoDialogContent } from './default-info-dialog-content.js';
import { loadResource, nonemptyLines } from './util.js';
import type {
  BaseFilterDialog,
  OscdDiffBaseFilterSaveEvent,
} from './base-filter-dialog.js';

const INFO_CONTENT_URL = './oscd-diff-info-content.html';
export const HELP_CONTENT_URL = './oscd-diff-help-content.html';
export const HELP_CONTENT_BASE_URL = './oscd-diff-help-base-content.html';

export type BaseConfigurable = {
  vals: string[];
  except: string[];
};
export type BaseOptions = {
  selectors: BaseConfigurable;
  attributes: BaseConfigurable;
  namespaces: BaseConfigurable;
};

export type BaseFilter = {
  inclusive: BaseOptions;
  exclusive: BaseOptions;
};

export type Filter = HasherOptions & {
  description: string;
  ourSelector: string;
  theirSelector: string;
};

export type StoredFilters = {
  base: BaseFilter;
  filters: Record<string, Filter>;
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

function isValidBaseConfigurable(configurable: BaseConfigurable) {
  return (
    Array.isArray(configurable.vals) &&
    Array.isArray(configurable.except) &&
    configurable.vals.every(s => typeof s === 'string') &&
    configurable.except.every(s => typeof s === 'string')
  );
}

function isValidBaseOptions(options: BaseOptions) {
  return (
    isValidBaseConfigurable(options.selectors) &&
    isValidBaseConfigurable(options.attributes) &&
    isValidBaseConfigurable(options.namespaces)
  );
}

export function isBaseFilter(obj: object): obj is BaseFilter {
  const baseFilter = obj as BaseFilter;
  if (!baseFilter.inclusive || !baseFilter.exclusive) {
    return false;
  }

  return (
    isValidBaseOptions(baseFilter.inclusive) &&
    isValidBaseOptions(baseFilter.exclusive)
  );
}

export function isFilter(obj: object): obj is Filter {
  const filterTypes = {
    description: 'string',
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

type StoredDiff = {
  elements: Record<string, { ours?: Element; theirs?: Element }>;
  ourHasher: ReturnType<typeof newHasher>;
  theirHasher: ReturnType<typeof newHasher>;
  filter: Filter;
  filterName: string;
  ourSelector: string;
  theirSelector: string;
  ourDocName: string;
  theirDocName: string;
};

function describeConfigurable(
  { inclusive, vals, except }: Configurable,
  name: string,
) {
  const verb = inclusive ? 'Including' : 'Excluding';
  const object = vals.length
    ? html` ${name}: <code>${vals.join(', ')}</code>`
    : ` no ${name}`;
  const exceptions = except.length
    ? html`, except: <code>${except.join(', ')}</code>`
    : '';
  return html`${verb}${object}${exceptions}`;
}

export default class OscdDiff extends LitElement {
  @property() docName = '';

  @property() doc?: XMLDocument;

  @property() docs: Record<string, XMLDocument> = {};

  @query('#doc1') doc1?: HTMLSelectElement;

  @query('#filters-import-field') filtersInputField?: HTMLInputElement;

  @query('#doc2') doc2?: HTMLSelectElement;

  @query('#doc1sel') doc1sel?: HTMLInputElement;

  @query('#doc2sel') doc2sel?: HTMLInputElement;

  @query('filter-dialog') filterDialog?: FilterDialog;

  @query('base-filter-dialog') baseFilterDialog?: BaseFilterDialog;

  @query('info-dialog') infoDialog?: InfoDialog;

  @query('md-menu') filterMenu?: MdMenu;

  @query('#diff-container') diffContainer?: HTMLDivElement;

  @state() filters: Record<string, Filter> = defaultFilters;

  @state() baseFilter: BaseFilter = defaultBaseFilters;

  @state()
  selectedFilterName: string = '';

  @state() lastDiff?: StoredDiff;

  @state() get fullscreen() {
    return (
      this.diffContainer &&
      this.shadowRoot &&
      this.shadowRoot.fullscreenElement === this.diffContainer
    );
  }

  @state() individuallyScoped = false;

  setFilters(updatedFilters: Record<string, Filter>) {
    this.filters = updatedFilters;
    this.storeFilters();
  }

  setBaseFilter(updatedBaseFilter: BaseFilter) {
    this.baseFilter = updatedBaseFilter;
    this.storeFilters();
  }

  storeFilters() {
    localStorage.setItem(
      'oscd-diff-filters',
      JSON.stringify({ base: this.baseFilter, filters: this.filters }),
    );
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
        const storedFilters = JSON.parse(filtersStr) as StoredFilters;
        if (
          storedFilters.base &&
          Object.keys(storedFilters.filters).length > 0
        ) {
          this.filters = storedFilters.filters;
          this.baseFilter = storedFilters.base;
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
      const importedJson = JSON.parse(await files[0].text());
      if (typeof importedJson !== 'object') {
        // eslint-disable-next-line no-console
        console.error('Invalid file format', importedJson);
        return;
      }
      let importedFilters;
      let baseFilter;
      if (importedJson.base && importedJson.filters) {
        importedFilters = importedJson.filters;
        if (!isBaseFilter(importedJson.base)) {
          // eslint-disable-next-line no-console
          console.error('Invalid base filter format');
          return;
        }
        baseFilter = importedJson.base as BaseFilter;
      } else if (Object.keys(importedJson).length > 0) {
        importedFilters = importedJson.filters;
        baseFilter = defaultBaseFilters;
      } else {
        // eslint-disable-next-line no-console
        console.error('Invalid filter format', importedJson);
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
      this.setBaseFilter(baseFilter);
      this.setFilters(newFilters);
    } catch (err) {
      // eslint-disable-next-line no-console
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
    const blob = new Blob(
      [
        JSON.stringify(
          { base: this.baseFilter, filters: this.filters },
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    );
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

  showBaseFilterDialog() {
    if (this.baseFilterDialog) {
      this.baseFilterDialog.open = true;
    }
  }

  async showInfoDialog() {
    if (this.infoDialog) {
      try {
        const infoContent = await loadResource(INFO_CONTENT_URL);
        this.infoDialog.contentText = infoContent;
      } catch {
        this.infoDialog.contentText = DefaultInfoDialogContent;
      }
      this.infoDialog.open = true;
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

  printMe() {
    const { diffContainer } = this;
    const openSCD = document.querySelector<LitElement>('open-scd');
    if (!diffContainer || !openSCD) {
      return;
    }
    const oldDisplay = openSCD.style.display;
    openSCD.style.display = 'none';
    document.body.prepend(diffContainer);
    window.print();
    this.shadowRoot!.append(diffContainer);
    openSCD.style.display = oldDisplay;
  }

  renderFilterDescription() {
    if (!this.lastDiff) {
      return nothing;
    }
    const {
      filter,
      filterName,
      ourSelector,
      theirSelector,
      ourDocName,
      theirDocName,
    } = this.lastDiff;
    return html`
      <div id="filter-description" style="margin: 16px;">
        <h3 style="font-weight: 400">Comparison Rule: ${filterName}</h3>
        ${filter.description ? html`<em>${filter.description}</em>` : nothing}
        <p>
          Comparing
          <span class="ours"
            ><code>${ourSelector}</code> elements from
            <strong>${ourDocName}</strong></span
          >
          to
          <span class="theirs"
            ><code>${theirSelector}</code> elements from
            <strong>${theirDocName}</strong></span
          >
        </p>
        <ul>
          <li>${describeConfigurable(filter.selectors, 'elements')}</li>
          <li>${describeConfigurable(filter.attributes, 'attributes')}</li>
          <li>${describeConfigurable(filter.namespaces, 'namespaces')}</li>
        </ul>
      </div>
    `;
  }

  renderViewButtons() {
    return Object.keys(this.lastDiff?.elements ?? {}).length
      ? html`<div class="view-buttons">
          <md-filled-icon-button @click=${() => this.printMe()}>
            <md-icon>print</md-icon>
          </md-filled-icon-button>
          <md-filled-icon-button
            toggle
            ?selected=${this.fullscreen}
            @click=${async () => {
              if (this.fullscreen) {
                await document.exitFullscreen();
              } else {
                await this.diffContainer?.requestFullscreen();
              }
              this.requestUpdate();
            }}
          >
            <md-icon>fullscreen</md-icon>
            <md-icon slot="selected">fullscreen_exit</md-icon>
          </md-filled-icon-button>
        </div>`
      : nothing;
  }

  render() {
    const promise = Promise.all(
      Object.values(this.lastDiff?.elements ?? {}).map(({ ours, theirs }) => {
        const ourHasher = ours && this.lastDiff?.ourHasher;
        const ourHash = ourHasher && hashElement(ours, ourHasher);
        const theirHasher = theirs && this.lastDiff?.theirHasher;
        const theirHash = theirHasher && hashElement(theirs, theirHasher);
        return Promise.all([ourHash, theirHash]);
      }),
    );

    return html`<div>
        <div class="filter-section">
          <div id="filter-selector-row">
            <div>
              <md-filled-select
                required
                label="Comparison Rules"
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
                      <div slot="headline">${filterName}</div></md-select-option
                    >`,
                )}
              </md-filled-select>
              <pre>${this.selectedFilter.description}</pre>
            </div>
            <span class="filter-menu-button">
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
                  @click=${() => this.showBaseFilterDialog()}
                >
                  <md-icon slot="start">border_color</md-icon>
                  <div slot="headline">Edit Base Rules</div>
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

          <md-filled-select
            required
            id="doc1"
            label="From document"
            @change=${() => this.requestUpdate()}
          >
            <md-icon slot="leading-icon">draft</md-icon>
            ${Object.keys(this.docs).map(
              name =>
                html`<md-select-option value="${name}"
                  ><div slot="headline">${name}</div></md-select-option
                >`,
            )}
          </md-filled-select>
          <md-filled-select
            required
            id="doc2"
            label="To document"
            @change=${() => this.requestUpdate()}
            style="--md-sys-color-primary: var(--oscd-secondary)"
          >
            <md-icon slot="leading-icon">draft</md-icon>
            ${Object.keys(this.docs).map(
              name =>
                html`<md-select-option value="${name}"
                  ><div slot="headline">${name}</div></md-select-option
                >`,
            )}
          </md-filled-select>

          <md-filled-text-field
            label=${this.individuallyScoped ? 'From Scope' : 'Scope'}
            style=${!this.individuallyScoped ? 'grid-column: 1/3;' : ''}
            type="textarea"
            rows="4"
            id="doc1sel"
            .value=${this.selectedFilter.ourSelector}
            .placeholder=${this.docs[this.docName1]?.documentElement.tagName ||
            ':root'}
            @change=${() => {
              if (this.doc2sel?.placeholder) {
                this.doc2sel!.placeholder = this.selector1;
              }
            }}
          >
            <md-icon slot="leading-icon">plagiarism</md-icon>
          </md-filled-text-field>

          ${this.individuallyScoped
            ? html`<md-filled-text-field
                label="To Scope"
                style="--md-sys-color-primary: var(--oscd-secondary);"
                type="textarea"
                rows="4"
                id="doc2sel"
                .value=${this.selectedFilter.theirSelector}
                .placeholder=${this.selector1}
              >
                <md-icon slot="leading-icon">plagiarism</md-icon>
              </md-filled-text-field>`
            : nothing}

          <label class="individually-scoped-checkbox-label">
            <md-checkbox
              touch-target="wrapper"
              ?checked=${this.individuallyScoped}
              @change=${(event: Event) => {
                this.individuallyScoped = (
                  event.target as HTMLInputElement
                ).checked;
              }}
            ></md-checkbox>
            Separate From/To scopes
          </label>

          ${until(
            promise.then(
              () =>
                html`<md-filled-button
                  ?disabled=${!this.docName1 || !this.docName2}
                  style="grid-column: 1/3;"
                  @click=${() => {
                    const doc1 = this.docs[this.docName1];
                    const doc2 = this.docs[this.docName2];
                    if (!doc1 || !doc2) {
                      return;
                    }

                    const { selectors, attributes, namespaces } = extendFilter(
                      this.baseFilter,
                      this.selectedFilter,
                    );
                    const options = { selectors, attributes, namespaces };

                    const ourHasher = newHasher(options);
                    const theirHasher = newHasher(options);

                    let elements: Record<
                      string,
                      { ours?: Element; theirs?: Element }
                    > = {};

                    const shouldDiffElement =
                      createHashElementPredicate(options);

                    Array.from(
                      this.docs[this.docName1]?.querySelectorAll(
                        nonemptyLines(this.selector1).join(', '),
                      ),
                    )
                      .filter(shouldDiffElement)
                      .forEach(el => {
                        const id = identity(el);
                        if (!elements[id]) {
                          elements[id] = {};
                        }
                        elements[id].ours = el;
                      });

                    Array.from(
                      this.docs[this.docName2]?.querySelectorAll(
                        nonemptyLines(this.selector2).join(', '),
                      ),
                    )
                      .filter(shouldDiffElement)
                      .forEach(el => {
                        const id = identity(el);
                        if (!elements[id]) {
                          elements[id] = {};
                        }
                        elements[id].theirs = el;
                      });

                    if (Object.keys(elements).length === 2) {
                      const [
                        { ours: ours1, theirs: theirs1 },
                        { ours: ours2, theirs: theirs2 },
                      ] = Object.values(elements);
                      const ours = ours1 || ours2;
                      const theirs = theirs1 || theirs2;
                      const ourId = ours ? identity(ours) : false;
                      const theirId = theirs ? identity(theirs) : false;
                      if (ourId && theirId && ourId !== theirId) {
                        elements = {
                          [`${ourId} -> ${theirId}`]: {
                            ours: elements[ourId!]?.ours,
                            theirs: elements[theirId!]?.theirs,
                          },
                        };
                      }
                    }
                    this.lastDiff = {
                      elements,
                      ourHasher,
                      theirHasher,
                      filter: this.selectedFilter,
                      filterName: this.selectedFilterName,
                      ourSelector: this.selector1,
                      theirSelector: this.selector2,
                      ourDocName: this.docName1,
                      theirDocName: this.docName2,
                    };
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

          <base-filter-dialog
            .base=${this.baseFilter}
            @oscd-diff-base-filter-save=${async (
              event: OscdDiffBaseFilterSaveEvent,
            ) => {
              this.setBaseFilter(event.detail.base);
            }}
          ></base-filter-dialog>
          <info-dialog heading="SCL Comparison Tool"></info-dialog>
        </div>
        <div class="aside-actions-container">
          <md-icon-button @click=${() => this.showInfoDialog()}
            ><md-icon>info</md-icon></md-icon-button
          >
          ${this.fullscreen ? nothing : this.renderViewButtons()}
        </div>
      </div>
      <div
        id="diff-container"
        @fullscreenchange=${() => this.requestUpdate()}
        class=${this.fullscreen ? 'fullscreen' : ''}
      >
        <style>
          @media print {
            html,
            body,
            #diff-container {
              background-color: white;
              color: black;
              font-family: var(--oscd-theme-text-font, 'Roboto');
            }
            .ours {
              color: darkred;
            }
            .theirs {
              color: darkgreen;
            }
            md-filled-icon-button {
              display: none;
            }
          }
        </style>
        ${this.renderFilterDescription()}
        ${this.fullscreen ? this.renderViewButtons() : nothing}
        ${until(
          promise.then(() => {
            let same = true;
            const trees = Object.keys(this.lastDiff?.elements ?? {}).map(id => {
              const { ours, theirs } = this.lastDiff!.elements[id];
              const { ourHasher, theirHasher } = this.lastDiff!;
              const ourHash = ours && ourHasher.hash(ours);
              const theirHash = theirs && theirHasher.hash(theirs);
              if (ourHash !== theirHash) {
                same = false;
                return html`<diff-tree
                  .ours=${ours}
                  .theirs=${theirs}
                  .ourHasher=${ourHasher}
                  .theirHasher=${theirHasher}
                  ?fullscreen=${this.fullscreen}
                  ?expanded=${Object.keys(this.lastDiff?.elements ?? {})
                    .length === 1}
                ></diff-tree>`;
              }
              return nothing;
            });
            return same && trees.length
              ? html`<div style="margin: 16px;">No differences</div>`
              : trees;
          }),
          nothing,
        )}
      </div>`;
  }

  static styles = css`
    * {
      cursor: default;
    }

    :host {
      font-family: var(--oscd-text-font);
      color: var(--oscd-base01);
      display: block;
      padding: 0.5rem;
      --oscd-text-font: var(--oscd-theme-text-font, 'Roboto');
      --oscd-text-font-mono: var(--oscd-theme-text-font-mono, 'Roboto Mono');
      --oscd-warning: var(--oscd-theme-warning, #b58900);
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
      --md-sys-color-scrim: var(--oscd-base1);
    }

    :host > div:first-child {
      display: flex;
      justify-content: space-between;
      max-width: calc(100vw - 32px);
    }

    :host .filter-section {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr 1fr;
      margin: 16px;
      margin-bottom: 1em;
      align-items: center;
    }

    :host md-filled-select {
      min-width: 260px;
      width: 100%;
    }

    #filters-import-field {
      display: block;
      visibility: hidden;
      width: 0;
      height: 0;
    }

    .aside-actions-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: end;
    }

    .aside-actions-container .view-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }

    #diff-container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      background-color: var(--oscd-base2);
      gap: 0px;
    }

    #diff-container.fullscreen {
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
    #diff-container.fullscreen md-filled-icon-button {
      position: fixed;
      top: 8px;
      right: 24px;
      z-index: 10001;
    }

    #filter-description {
      display: none;
    }

    .fullscreen #filter-description {
      display: block;
    }

    diff-tree {
      max-width: calc(100vw - 32px);
    }

    .fullscreen diff-tree {
      max-width: calc(100vw - 16px);
    }

    md-menu {
      min-width: max-content;
    }

    #filter-selector-row {
      grid-column: 1/-1;
      display: flex;
      gap: 8px;
      align-items: start;
    }

    #filter-selector-row > div {
      flex-grow: 1;
    }

    .filter-menu-button {
      position: relative;
      margin-top: 8px;
    }

    .ours {
      color: var(--oscd-primary);
    }

    .theirs {
      color: var(--oscd-secondary);
    }

    .individually-scoped-checkbox-label {
      grid-column: 1/3;
      color: var(--oscd-base00);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0px;
      margin-bottom: 12px;
    }

    .individually-scoped-checkbox-label md-checkbox {
      margin-top: 0;
      margin-bottom: 0;
    }

    md-filled-text-field[type='textarea'] {
      --md-filled-text-field-input-text-font: var(
        --oscd-text-font-mono,
        'Roboto Mono'
      );
    }

    pre {
      font-family: var(--oscd-text-font, 'Roboto');
      white-space: pre-wrap;
      margin-block: 4px;
    }

    code,
    tt {
      font-family: var(--oscd-text-font-mono, 'Roboto Mono');
    }

    /* Add Roboto Mono Regular font face, loaded from the fonts directory */
    @font-face {
      font-family: 'Roboto Mono';
      font-style: normal;
      font-weight: 400;
      src: url('./fonts/RobotoMono-Regular.ttf') format('truetype');
    }
  `;
}
