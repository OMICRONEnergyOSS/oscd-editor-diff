import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import type {
  MdDialog,
  MdFilledTextField,
  MdOutlinedTextField,
  MdSwitch,
} from '@material/web/all.js';

import type { Filter } from './oscd-diff.js';

export type OscdDiffFilterSaveEventDetail = {
  oldName: string;
  newName: string;
  filter: Filter;
};

export type OscdDiffFilterSaveEvent =
  CustomEvent<OscdDiffFilterSaveEventDetail>;

function nonemptyLines(text: string) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
}

@customElement('filter-dialog')
export class FilterDialog extends LitElement {
  @property({ type: Boolean }) get open() {
    return !!this.dialog?.open;
  }

  set open(open: boolean) {
    if (this.dialog) {
      this.dialog.open = open;
    }
  }

  @property() filterName = '';

  @property() existingFilterNames: string[] = [];

  @state() filterDescription: string = '';

  @state() ourSelector = '';

  @state() theirSelector = '';

  @state() selectorsInclusive = false;

  @state() selectorsVals = [] as string[];

  @state() selectorsExcept = [] as string[];

  @state() attributesInclusive = false;

  @state() attributesVals = [] as string[];

  @state() attributesExcept = [] as string[];

  @state() namespacesInclusive = false;

  @state() namespacesVals = [] as string[];

  @state() namespacesExcept = [] as string[];

  @query('md-dialog') dialog?: MdDialog;

  @query('#filterName') filterNameInput?: MdOutlinedTextField;

  #oldFilter?: Filter;

  get filter() {
    return {
      description: this.filterDescription,
      ourSelector: this.ourSelector,
      theirSelector: this.theirSelector,
      selectors: {
        inclusive: this.selectorsInclusive,
        vals: this.selectorsVals,
        except: this.selectorsExcept,
      },
      attributes: {
        inclusive: this.attributesInclusive,
        vals: this.attributesVals,
        except: this.attributesExcept,
      },
      namespaces: {
        inclusive: this.namespacesInclusive,
        vals: this.namespacesVals,
        except: this.namespacesExcept,
      },
    };
  }

  set filter(filter: Filter) {
    this.filterDescription = filter.description;
    this.ourSelector = filter.ourSelector;
    this.theirSelector = filter.theirSelector;
    this.selectorsInclusive = filter.selectors.inclusive;
    this.selectorsVals = filter.selectors.vals;
    this.selectorsExcept = filter.selectors.except;
    this.attributesInclusive = filter.attributes.inclusive;
    this.attributesVals = filter.attributes.vals;
    this.attributesExcept = filter.attributes.except;
    this.namespacesInclusive = filter.namespaces.inclusive;
    this.namespacesVals = filter.namespaces.vals;
    this.namespacesExcept = filter.namespaces.except;
    this.#oldFilter = filter;
  }

  resetDialog() {
    if (!this.filterNameInput) {
      return;
    }
    this.filterNameInput.value = this.filterName;
    this.filterNameInput.setCustomValidity('');
    this.filterNameInput.reportValidity();
    if (this.#oldFilter) {
      this.filter = { ...this.#oldFilter };
    }
    if (this.dialog) {
      this.dialog.returnValue = '';
    }
  }

  render() {
    return html`
      <md-dialog
        @cancel=${(event: Event) => event.preventDefault()}
        @closed=${(event: CustomEvent) => {
          const { returnValue } = event.target as MdDialog;
          if (returnValue === 'save' && this.filterNameInput) {
            this.dispatchEvent(
              new CustomEvent<OscdDiffFilterSaveEventDetail>(
                'oscd-diff-filter-save',
                {
                  detail: {
                    filter: this.filter,
                    oldName: this.filterName,
                    newName: this.filterNameInput.value,
                  },
                  bubbles: true,
                  composed: true,
                },
              ),
            );
          }
          this.resetDialog();
        }}
      >
        <div slot="headline">Edit Filter ${this.filterName}</div>
        <form slot="content" id="filterForm" method="dialog">
          <md-filled-text-field
            label="Filter name"
            style="grid-column: 1 / -1"
            type="text"
            id="filterName"
            required
            .value="${this.filterName}"
            @input=${() => {
              const value = this.filterNameInput?.value.trim() || '';
              if (!this.filterNameInput) {
                return;
              }
              this.filterNameInput.setCustomValidity('');
              if (this.existingFilterNames.includes(value)) {
                this.filterNameInput.setCustomValidity(
                  'Filter name already exists',
                );
              }
              if (value === '__proto__') {
                this.filterNameInput.setCustomValidity(
                  'Filter name cannot be __proto__',
                );
              }
              this.filterNameInput.reportValidity();
            }}
          >
            <md-icon slot="leading-icon">filter_list</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Description"
            style="grid-column: 1 / -1"
            type="textarea"
            .value="${this.filterDescription}"
            @input=${(event: Event) => {
              this.filterDescription =
                (event.target as MdFilledTextField).value.trim() || '';
            }}
          >
            <md-icon slot="leading-icon">description</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="From elements"
            type="search"
            .value=${this.ourSelector}
            @input=${(event: Event) => {
              this.ourSelector = (event.target as MdOutlinedTextField).value;
            }}
          >
            <md-icon slot="leading-icon">plagiarism</md-icon>
          </md-filled-text-field>
          <md-icon>compare_arrows</md-icon>
          <md-filled-text-field
            label="To elements"
            style="--md-sys-color-primary: var(--oscd-secondary);"
            type="search"
            .value=${this.theirSelector}
            @input=${(event: Event) => {
              this.theirSelector = (event.target as MdOutlinedTextField).value;
            }}
          >
            <md-icon slot="leading-icon">plagiarism</md-icon>
          </md-filled-text-field>
          <div style="grid-column: 1 / -1; height:16px;"></div>
          <label style="grid-column: 1 / -1;"
            >Include Elements
            <md-switch
              aria-label="Include Selectors"
              icons
              ?selected=${this.selectorsInclusive}
              @input=${(event: InputEvent) => {
                this.selectorsInclusive = (event.target as MdSwitch).selected;
              }}
            ></md-switch>
          </label>
          <md-outlined-text-field
            label="${this.selectorsInclusive ? 'include' : 'exclude'}"
            style="grid-column: 1 / 3"
            type="textarea"
            rows="3"
            .value=${this.selectorsVals.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsVals = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
          <md-outlined-text-field
            type="textarea"
            rows="3"
            label="except"
            .value=${this.selectorsExcept.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsExcept = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
          <label style="grid-column: 1 / -1;"
            >Include Attributes
            <md-switch
              aria-label="Include Attributes"
              icons
              ?selected=${this.attributesInclusive}
              @input=${(event: InputEvent) => {
                this.attributesInclusive = (event.target as MdSwitch).selected;
              }}
            ></md-switch>
          </label>
          <md-outlined-text-field
            label="${this.attributesInclusive ? 'include' : 'exclude'}"
            style="grid-column: 1 / 3"
            type="textarea"
            rows="3"
            .value=${this.attributesVals.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.attributesVals = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
          <md-outlined-text-field
            type="textarea"
            rows="3"
            label="except"
            .value=${this.attributesExcept.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.attributesExcept = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
          <label style="grid-column: 1 / -1;"
            >Include Namespaces
            <md-switch
              aria-label="Include Namespaces"
              icons
              ?selected=${this.namespacesInclusive}
              @input=${(event: InputEvent) => {
                this.namespacesInclusive = (event.target as MdSwitch).selected;
              }}
            ></md-switch>
          </label>
          <md-outlined-text-field
            label="${this.namespacesInclusive ? 'include' : 'exclude'}"
            style="grid-column: 1 / -1"
            type="textarea"
            rows="3"
            .value=${this.namespacesVals.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.namespacesVals = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
        </form>
        <div slot="actions">
          <md-text-button @click=${() => this.dialog?.close('cancel')}
            >Cancel</md-text-button
          >
          <md-filled-button form="filterForm" value="save"
            >Save</md-filled-button
          >
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    md-dialog {
      max-height: 100vh;
      max-width: 100vw;
    }

    md-switch {
      vertical-align: middle;
      margin-left: 8px;
    }

    form {
      color: var(--oscd-base02);
      font-family: var(--oscd-text-font);
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr min-content 1fr;
      margin-bottom: 1em;
      align-items: center;
    }
  `;
}

declare global {
  interface CustomEventMap {
    'oscd-diff-filter-save': OscdDiffFilterSaveEvent;
  }
}
