import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import type { MdDialog, MdOutlinedTextField } from '@material/web/all.js';

import { HELP_CONTENT_BASE_URL, BaseFilter } from './oscd-editor-diff.js';
import { InfoDialog } from './info-dialog.js';
import { loadResource } from './util.js';
import { DefaultHelpBaseDialogContent } from './default-help-base-dialog-content.js';

export type OscdDiffBaseFilterSaveEventDetail = {
  base: BaseFilter;
};

export type OscdDiffBaseFilterSaveEvent =
  CustomEvent<OscdDiffBaseFilterSaveEventDetail>;

function nonemptyLines(text: string) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
}

function renderSingleFieldRow({
  valueFieldlabel,
  valueField,
  onValueChange,
}: {
  valueFieldlabel: string;
  valueField: string[];
  onValueChange: (value: string[]) => void;
}) {
  return html`
    <md-outlined-text-field
      label="${valueFieldlabel}"
      style="grid-column: 1 / -1"
      type="textarea"
      rows="3"
      cols="48"
      .value=${valueField.join('\n')}
      @input=${(event: Event) => {
        const { value } = event.target as MdOutlinedTextField;
        onValueChange(nonemptyLines(value));
      }}
    ></md-outlined-text-field>
  `;
}

function renderDoubleFieldRow({
  valueFieldlabel,
  valueField,
  exceptField,
  onValueChange,
  onExceptChange,
}: {
  valueFieldlabel: string;
  valueField: string[];
  exceptField: string[];
  onValueChange: (value: string[]) => void;
  onExceptChange: (value: string[]) => void;
}) {
  return html`
    <md-outlined-text-field
      label="${valueFieldlabel}"
      style="grid-column: 1 / 2"
      type="textarea"
      rows="3"
      cols="48"
      .value=${valueField.join('\n')}
      @input=${(event: Event) => {
        const { value } = event.target as MdOutlinedTextField;
        onValueChange(nonemptyLines(value));
      }}
    ></md-outlined-text-field>
    <md-outlined-text-field
      type="textarea"
      rows="3"
      cols="48"
      label="Except"
      .value=${exceptField.join('\n')}
      @input=${(event: Event) => {
        const { value } = event.target as MdOutlinedTextField;
        onExceptChange(nonemptyLines(value));
      }}
    ></md-outlined-text-field>
  `;
}

@customElement('base-filter-dialog')
export class BaseFilterDialog extends LitElement {
  @property({ type: Boolean }) get open() {
    return !!this.dialog?.open;
  }

  set open(open: boolean) {
    if (this.dialog) {
      this.dialog.open = open;
    }
  }

  @state() inclusiveSelectorsVals = [] as string[];

  @state() inclusiveSelectorsExcept = [] as string[];

  @state() inclusiveAttributesVals = [] as string[];

  @state() inclusiveAttributesExcept = [] as string[];

  @state() inclusiveNamespacesVals = [] as string[];

  @state() inclusiveNamespacesExcept = [] as string[];

  @state() exclusiveSelectorsVals = [] as string[];

  @state() exclusiveSelectorsExcept = [] as string[];

  @state() exclusiveAttributesVals = [] as string[];

  @state() exclusiveAttributesExcept = [] as string[];

  @state() exclusiveNamespacesVals = [] as string[];

  @state() exclusiveNamespacesExcept = [] as string[];

  @query('#main-dialog') dialog?: MdDialog;

  @query('info-dialog') infoDialog?: InfoDialog;

  @query('#warning-dialog') warningDialog?: InfoDialog;

  #oldBase?: BaseFilter;

  @property({ type: Object })
  get base() {
    return {
      exclusive: {
        selectors: {
          vals: this.exclusiveSelectorsVals,
          except: this.exclusiveSelectorsExcept,
        },
        attributes: {
          vals: this.exclusiveAttributesVals,
          except: this.exclusiveAttributesExcept,
        },
        namespaces: {
          vals: this.exclusiveNamespacesVals,
          except: this.exclusiveNamespacesExcept,
        },
      },
      inclusive: {
        selectors: {
          vals: this.inclusiveSelectorsVals,
          except: this.inclusiveSelectorsExcept,
        },
        attributes: {
          vals: this.inclusiveAttributesVals,
          except: this.inclusiveAttributesExcept,
        },
        namespaces: {
          vals: this.inclusiveNamespacesVals,
          except: this.inclusiveNamespacesExcept,
        },
      },
    };
  }

  set base(base: BaseFilter) {
    this.#oldBase = base;
    this.inclusiveSelectorsVals = base.inclusive.selectors.vals;
    this.inclusiveSelectorsExcept = base.inclusive.selectors.except;
    this.inclusiveAttributesVals = base.inclusive.attributes.vals;
    this.inclusiveAttributesExcept = base.inclusive.attributes.except;
    this.inclusiveNamespacesVals = base.inclusive.namespaces.vals;
    this.inclusiveNamespacesExcept = base.inclusive.namespaces.except;
    this.exclusiveAttributesExcept = base.exclusive.attributes.except;
    this.exclusiveAttributesVals = base.exclusive.attributes.vals;
    this.exclusiveNamespacesExcept = base.exclusive.namespaces.except;
    this.exclusiveNamespacesVals = base.exclusive.namespaces.vals;
    this.exclusiveSelectorsExcept = base.exclusive.selectors.except;
    this.exclusiveSelectorsVals = base.exclusive.selectors.vals;
  }

  dispatchSaveEvent() {
    this.dispatchEvent(
      new CustomEvent<OscdDiffBaseFilterSaveEventDetail>(
        'oscd-diff-base-filter-save',
        {
          detail: {
            base: this.base,
          },
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  resetDialog() {
    if (this.#oldBase) {
      this.base = { ...this.#oldBase };
    }
    if (this.dialog) {
      this.dialog.returnValue = '';
    }
  }

  async showHelpDialog() {
    if (this.infoDialog) {
      try {
        const content = await loadResource(HELP_CONTENT_BASE_URL);
        this.infoDialog.contentText = content;
      } catch {
        this.infoDialog.contentText = DefaultHelpBaseDialogContent;
      }
      this.infoDialog.open = true;
    }
  }

  render() {
    return html`
      <md-dialog
        id="main-dialog"
        @cancel=${(event: Event) => event.preventDefault()}
        @closed=${(event: CustomEvent) => {
          const { returnValue } = event.target as MdDialog;
          if (this.warningDialog && returnValue === 'save') {
            this.warningDialog.open = true;
          } else if (returnValue === 'cancel') {
            this.resetDialog();
          }
        }}
      >
        <div slot="headline">
          <div>Edit Base Rules</div>
          <md-icon @click=${() => this.showHelpDialog()}>help</md-icon>
        </div>
        <form slot="content" id="form" method="dialog">
          <h3>Exclude Rules</h3>

          ${renderDoubleFieldRow({
            valueFieldlabel: 'Selectors',
            valueField: this.exclusiveSelectorsVals,
            exceptField: this.exclusiveSelectorsExcept,
            onValueChange: vals => {
              this.exclusiveSelectorsVals = vals;
            },
            onExceptChange: except => {
              this.exclusiveSelectorsExcept = except;
            },
          })}
          ${renderDoubleFieldRow({
            valueFieldlabel: 'Attributes',
            valueField: this.exclusiveAttributesVals,
            exceptField: this.exclusiveAttributesExcept,
            onValueChange: vals => {
              this.exclusiveAttributesVals = vals;
            },
            onExceptChange: except => {
              this.exclusiveAttributesExcept = except;
            },
          })}
          ${renderSingleFieldRow({
            valueFieldlabel: 'Namespaces',
            valueField: this.exclusiveNamespacesVals,
            onValueChange: vals => {
              this.exclusiveNamespacesVals = vals;
            },
          })}

          <h3 style="grid-column: 1 / -1">Include Rules</h3>
          ${renderDoubleFieldRow({
            valueFieldlabel: 'Elements',
            valueField: this.inclusiveSelectorsVals,
            exceptField: this.inclusiveSelectorsExcept,
            onValueChange: vals => {
              this.inclusiveSelectorsVals = vals;
            },
            onExceptChange: except => {
              this.inclusiveSelectorsExcept = except;
            },
          })}
          ${renderDoubleFieldRow({
            valueFieldlabel: 'Attributes',
            valueField: this.inclusiveAttributesVals,
            exceptField: this.inclusiveAttributesExcept,
            onValueChange: vals => {
              this.inclusiveAttributesVals = vals;
            },
            onExceptChange: except => {
              this.inclusiveAttributesExcept = except;
            },
          })}
          ${renderSingleFieldRow({
            valueFieldlabel: 'Namespaces',
            valueField: this.inclusiveNamespacesVals,
            onValueChange: vals => {
              this.inclusiveNamespacesVals = vals;
            },
          })}
        </form>
        <div slot="actions">
          <md-text-button @click=${() => this.dialog?.close('cancel')}
            >Cancel</md-text-button
          >
          <md-filled-button form="form" value="save">Save</md-filled-button>
        </div>
      </md-dialog>
      <info-dialog heading="Editing comparison rules"></info-dialog>
      <md-dialog
        type="alert"
        id="warning-dialog"
        @closed=${(event: CustomEvent) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const dialog = event.target as MdDialog;
          if (dialog.returnValue === 'confirm') {
            this.dispatchSaveEvent();
          }
          this.resetDialog();
        }}
      >
        <div slot="headline"><md-icon>warning</md-icon>Warning</div>
        <form slot="content" id="warning-dialog-form" method="dialog">
          Warning, changes made here are applied to all existing filters, are
          you sure you want to save these changes?
        </form>
        <div slot="actions">
          <md-text-button form="warning-dialog-form" value="cancel"
            >Cancel</md-text-button
          >
          <md-filled-button form="warning-dialog-form" value="confirm"
            >Save</md-filled-button
          >
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    #main-dialog {
      max-height: 100vh;
      max-width: 100vw;
      min-width: 1064px;
    }

    #main-dialog div[slot='headline'] {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #form {
      color: var(--oscd-base02);
      font-family: var(--oscd-text-font);
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 1em;
      align-items: center;
    }

    #form h3 {
      font-size: 1.25em;
      font-weight: normal;
      margin-bottom: 0;
      grid-column: 1 / -1;
    }

    #warning-dialog div[slot='headline'] {
      color: var(--oscd-warning);
      border-bottom: 1px solid var(--oscd-warning);
    }

    md-outlined-text-field {
      --md-outlined-text-field-input-text-font: var(
        --oscd-text-font-mono,
        'Roboto Mono'
      );
    }

    #warning-dialog md-dialog {
      max-width: 400px;
    }
  `;
}

declare global {
  interface CustomEventMap {
    'oscd-diff-base-filter-save': OscdDiffBaseFilterSaveEvent;
  }
}
