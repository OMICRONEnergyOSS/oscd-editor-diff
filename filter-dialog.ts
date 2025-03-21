import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import type {
  MdDialog,
  MdFilledTextField,
  MdOutlinedTextField,
} from '@material/web/all.js';

import { HELP_CONTENT_URL, type Filter } from './oscd-diff.js';
import { InfoDialog } from './info-dialog.js';
import { loadResource, nonemptyLines } from './util.js';
import { DefaultHelpDialogContent } from './default-help-dialog-content.js';

export type OscdDiffFilterSaveEventDetail = {
  oldName: string;
  newName: string;
  filter: Filter;
};

export type OscdDiffFilterSaveEvent =
  CustomEvent<OscdDiffFilterSaveEventDetail>;

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

  @query('info-dialog') infoDialog?: InfoDialog;

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

  async showHelpDialog() {
    if (this.infoDialog) {
      try {
        const content = await loadResource(HELP_CONTENT_URL);
        this.infoDialog.contentText = content;
      } catch {
        this.infoDialog.contentText = DefaultHelpDialogContent;
      }
      this.infoDialog.open = true;
    }
  }

  renderLabelAndRadioGroupRow({
    value,
    onChange,
    name,
    label,
  }: {
    value: boolean;
    onChange: (val: boolean) => void;
    name: string;
    label: string;
  }) {
    return html` <div class="rule-label-row">
      <h3>${label}</h3>
      <div class="inclusion-radio-group">
        <label
          ><md-radio
            name=${name}
            aria-label="Include"
            ?checked=${value}
            @input=${() => {
              onChange(true);
              this.requestUpdate();
            }}
          >
          </md-radio>
          Include</label
        >
        <label
          ><md-radio
            name=${name}
            aria-label="Exclude"
            ?checked=${!value}
            @input=${() => {
              onChange(false);
              this.requestUpdate();
            }}
          >
          </md-radio>
          Exclude</label
        >
      </div>
    </div>`;
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
        <div slot="headline">
          <div>Edit Comparison Rules</div>
          <md-icon @click=${() => this.showHelpDialog()}>help</md-icon>
        </div>
        <form slot="content" id="filterForm" method="dialog">
          <md-outlined-text-field
            label="Name"
            class="details-field"
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
          </md-outlined-text-field>

          <md-outlined-text-field
            id="description"
            label="Description"
            class="details-field"
            type="textarea"
            .value="${this.filterDescription}"
            @input=${(event: Event) => {
              this.filterDescription =
                (event.target as MdFilledTextField).value.trim() || '';
            }}
          >
            <md-icon slot="leading-icon">description</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="Scope"
            type="textarea"
            rows="4"
            class="details-field"
            .value=${this.ourSelector}
            @input=${(event: Event) => {
              this.ourSelector = (event.target as MdOutlinedTextField).value;
            }}
          >
            <md-icon slot="leading-icon">plagiarism</md-icon>
          </md-outlined-text-field>

          <h2 class="rules-section-header">Rules</h2>

          ${this.renderLabelAndRadioGroupRow({
            label: 'Elements',
            value: this.selectorsInclusive,
            onChange: val => {
              this.selectorsInclusive = val;
            },
            name: 'element-selectors',
          })}
          <md-outlined-text-field
            label="${this.selectorsInclusive ? 'Include' : 'Exclude'}"
            style="grid-column: 1 / 3"
            type="textarea"
            rows="3"
            cols="48"
            .value=${this.selectorsVals.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsVals = nonemptyLines(value);
            }}
          ></md-outlined-text-field>
          <md-outlined-text-field
            type="textarea"
            rows="3"
            cols="48"
            label="Except"
            .value=${this.selectorsExcept.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.selectorsExcept = nonemptyLines(value);
            }}
          ></md-outlined-text-field>

          ${this.renderLabelAndRadioGroupRow({
            label: 'Attributes',
            value: this.attributesInclusive,
            onChange: val => {
              this.attributesInclusive = val;
            },
            name: 'attributes-selectors',
          })}

          <md-outlined-text-field
            label="${this.attributesInclusive ? 'Include' : 'Exclude'}"
            style="grid-column: 1 / 3"
            type="textarea"
            cols="48"
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
            cols="48"
            label="Except"
            .value=${this.attributesExcept.join('\n')}
            @input=${(event: Event) => {
              const { value } = event.target as MdOutlinedTextField;
              this.attributesExcept = nonemptyLines(value);
            }}
          ></md-outlined-text-field>

          ${this.renderLabelAndRadioGroupRow({
            label: 'Namespaces',
            value: this.namespacesInclusive,
            onChange: val => {
              this.namespacesInclusive = val;
            },
            name: 'namespaces-selectors',
          })}

          <md-outlined-text-field
            label="${this.namespacesInclusive ? 'Include' : 'Exclude'}"
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
      <info-dialog heading="Editing comparison rules"></info-dialog>
    `;
  }

  static styles = css`
    md-dialog {
      max-height: 100vh;
      max-width: 100vw;
    }

    div[slot='headline'] {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    md-switch {
      vertical-align: middle;
      margin-inline: 8px;
      --md-switch-selected-icon-color: var(--oscd-base00);
    }

    .details-field {
      grid-column: 1 / -1;
      margin-bottom: 8px;
    }

    .rules-section-header {
      grid-column: 1 / -1;
      margin-top: 16px;
      margin-bottom: 0;
      padding-bottom: 8px;
      color: var(--oscd-base00);
      border-bottom: 1px solid var(--oscd-base00);
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

    h2,
    h3,
    label,
    legend {
      color: var(--oscd-base00);
      font-weight: normal;
    }

    h3 {
      font-size: 1.25em;
    }

    .rule-label-row {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .rule-label-row h3 {
      margin-top: 0;
      margin-bottom: 0;
    }

    .inclusion-radio-group {
      display: flex;
      gap: 16px;
    }

    md-outlined-text-field[type='textarea']:not(#description) {
      --md-outlined-text-field-input-text-font: var(
        --oscd-text-font-mono,
        'Roboto Mono'
      );
    }
  `;
}

declare global {
  interface CustomEventMap {
    'oscd-diff-filter-save': OscdDiffFilterSaveEvent;
  }
}
