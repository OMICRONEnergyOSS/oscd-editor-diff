import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import type { MdDialog } from '@material/web/all.js';

@customElement('info-dialog')
export class InfoDialog extends LitElement {
  @property({ type: Boolean }) get open() {
    return !!this.dialog?.open;
  }

  set open(open: boolean) {
    if (this.dialog) {
      this.dialog.open = open;
    }
  }

  @property() heading = '';

  @property()
  set contentText(value: string | undefined) {
    if (this.contentDiv && value) {
      this.contentDiv.innerHTML = value;
    }
  }

  @query('md-dialog') dialog?: MdDialog;

  @query('#content') contentDiv?: MdDialog;

  render() {
    return html`
      <md-dialog>
        <div slot="headline">${this.heading}</div>
        <div id="content" slot="content"></div>
        <div slot="actions">
          <md-filled-button @click=${() => this.dialog?.close('close')}
            >Close</md-filled-button
          >
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    md-dialog {
      max-height: 95vh;
      max-width: 80vw;
    }

    table {
      border: 1px solid var(--oscd-base01);
    }

    th,
    td {
      color: var(--oscd-base01);
      padding-inline: 8px;
    }

    a {
      color: var(--oscd-base02);
  `;
}
