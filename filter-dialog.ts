import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import type {
  MdDialog,
  MdOutlinedTextField,
  MdSwitch,
} from '@material/web/all.js';

import type { Filter } from './oscd-diff.js';

export type OscdDiffFilterSaveEventDetail = {
  oldName: string;
  newName: string;
  filter: Filter;
};

export type OscdDiffFilterDeleteEventDetail = {
  name: string;
};

export type OscdDiffFilterSaveEvent =
  CustomEvent<OscdDiffFilterSaveEventDetail>;
export type OscdDiffFilterDeleteEvent =
  CustomEvent<OscdDiffFilterDeleteEventDetail>;

@customElement('filter-dialog')
export class FilterDialog extends LitElement {
  @query('md-dialog') dialog?: MdDialog;

  @property({ type: Boolean }) get open() {
    return !!this.dialog?.open;
  }

  set open(open: boolean) {
    if (this.dialog) this.dialog.open = open;
  }

  @property() filterName = '';

  @property() get filter() {
    return {
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
  }

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

  @query('#filterName') filterNameInput?: MdOutlinedTextField;

  render() {
    return html`
      <md-dialog
        @closed=${(event: Event) => {
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
          if (returnValue === 'delete' && this.filterNameInput) {
            this.dispatchEvent(
              new CustomEvent<OscdDiffFilterDeleteEventDetail>(
                'oscd-diff-filter-delete',
                {
                  detail: {
                    name: this.filterName,
                  },
                  bubbles: true,
                  composed: true,
                },
              ),
            );
          }
        }}
      >
        <div slot="headline">Edit Filter ${this.filterName}</div>
        <form slot="content" id="form-id" method="dialog">
          <md-outlined-text-field
            label="Filter name"
            style="grid-column: 1/3"
            type="text"
            id="filterName"
            value="${this.filterName}"
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="From selector"
            style="--md-outlined-text-field-container-shape: 48px;"
            type="search"
            .value=${this.ourSelector}
            @change=${(event: Event) => {
              this.ourSelector = (event.target as MdOutlinedTextField).value;
            }}
          ></md-outlined-text-field>
          <md-outlined-text-field
            label="To selector"
            style="--md-sys-color-primary: var(--oscd-secondary); --md-outlined-text-field-container-shape: 48px;"
            type="search"
            .value=${this.theirSelector}
            @change=${(event: Event) => {
              this.theirSelector = (event.target as MdOutlinedTextField).value;
            }}
          ></md-outlined-text-field>
          <label for="inclsel" style="text-align: right;"
            >Include Selectors</label
          >
          <md-switch
            aria-label="Include Selectors"
            icons
            ?selected=${this.selectorsInclusive}
            @input=${(event: InputEvent) => {
              this.selectorsInclusive = (event.target as MdSwitch).selected;
            }}
          ></md-switch>
          <md-filled-text-field
            label="${this.selectorsInclusive ? 'include' : 'exclude'}"
            type="textarea"
            rows="3"
            .value=${this.selectorsVals.join('\n')}
            @change=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsVals = value.split('\n').map(line => line.trim());
            }}
          ></md-filled-text-field>
          <md-filled-text-field
            type="textarea"
            rows="3"
            label="except"
            .value=${this.selectorsExcept.join('\n')}
            @change=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsExcept = value.split('\n').map(line => line.trim());
            }}
          ></md-filled-text-field>
          <label for="inclattr" style="text-align: right;"
            >Include Attributes</label
          >
          <md-switch
            aria-label="Include Attributes"
            icons
            ?selected=${this.attributesInclusive}
            @input=${(event: InputEvent) => {
              this.attributesInclusive = (event.target as MdSwitch).selected;
            }}
          ></md-switch>
          <md-filled-text-field
            label="${this.attributesInclusive ? 'include' : 'exclude'}"
            type="textarea"
            rows="3"
            .value=${this.attributesVals.join('\n')}
            @change=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.attributesVals = value.split('\n').map(line => line.trim());
            }}
          ></md-filled-text-field>
          <md-filled-text-field
            type="textarea"
            rows="3"
            label="except"
            .value=${this.attributesExcept.join('\n')}
            @change=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.attributesExcept = value
                .split('\n')
                .map(line => line.trim());
            }}
          ></md-filled-text-field>
          <label for="inclns" style="text-align: right;"
            >Include Namespaces</label
          >
          <md-switch
            aria-label="Include Namespaces"
            id="inclns"
            icons
            ?selected=${this.namespacesInclusive}
            @input=${(event: InputEvent) => {
              this.namespacesInclusive = (event.target as MdSwitch).selected;
            }}
          ></md-switch>
          <md-filled-text-field
            label="${this.namespacesInclusive ? 'include' : 'exclude'}"
            type="textarea"
            rows="3"
            .value=${this.namespacesVals.join('\n')}
            @change=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.namespacesVals = value.split('\n').map(line => line.trim());
            }}
          ></md-filled-text-field>
        </form>
        <div slot="actions">
          <md-text-button form="form-id" value="delete">Delete</md-text-button>
          <md-text-button form="form-id" value="cancel">Cancel</md-text-button>
          <md-text-button form="form-id" value="save">Save</md-text-button>
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    md-dialog {
      max-height: 100vh;
      max-width: 100vw;
    }

    form {
      color: var(--oscd-base02);
      font-family: var(--oscd-text-font);
      display: grid;
      gap: 8px;
      grid-template-columns: max-content max-content;
      margin-bottom: 1em;
      align-items: center;
    }
  `;
}

declare global {
  interface CustomEventMap {
    'oscd-diff-filter-save': OscdDiffFilterSaveEvent;
    'oscd-diff-filter-delete': OscdDiffFilterDeleteEvent;
  }
}
