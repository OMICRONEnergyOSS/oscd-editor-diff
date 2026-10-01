[![Tests](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/actions/workflows/test.yml/badge.svg)](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/actions/workflows/test.yml) ![NPM Version](https://img.shields.io/npm/v/@omicronenergy/oscd-editor-diff)

# OpenSCD Diff Editor

An [OpenSCD](https://openscd.org) editor plugin for comparing two IEC 61850 SCL
files, or two parts of the same file (e.g. two IEDs), and showing the
differences in a tree view.

> This plugin is at an early stage of development. Expect rough edges and
> changes to its behaviour and comparison rules.

## What is this?

Most comparison tools treat an SCL file as text (line-by-line diff) or as
generic XML (a diff after canonicalisation). Both report differences in how
the XML happens to be written, such as indentation, attribute order and
element order. They also can't follow the references between SCL elements, so
a change to the identifiers SCL uses for referencing shows up everywhere they
are used. In a large SCD, the differences that matter are easily lost.

This plugin compares SCL as SCL. The aim is to show differences in the
engineered configuration, in particular what an IED sends and receives **on
the wire**, rather than differences in the XML.

### Fingerprinting

Each element gets a fingerprint (hash) built from:

- its attributes, independent of the order they are written in,
- the fingerprints of its children, independent of their order, except for
  the `FCDA`s in a `DataSet`, whose order determines the GOOSE/SV payload,
- the fingerprints of the elements it references (see below).

Identical parts of the two files have identical fingerprints and are hidden.
The tree only shows the path down to the elements that actually differ.

### Dereferencing

SCL elements refer to each other, and the plugin follows these references
and compares the content of what is referenced:

- `LN`/`LN0` → `LNodeType` → `DOType` → `DAType`/`EnumType`
- control blocks (`GSEControl`, `SampledValueControl`, `ReportControl`,
  `LogControl`) → `DataSet`
- `ConnectedAP` → `AccessPoint`, and `ServerAt` → `Server`

Some of these identifiers, such as data type IDs, are only a referencing
system within the SCL file. The content of a data type defines the data model
and the values exchanged in reports, GOOSE and SV, but its ID never appears in
that traffic. Because the referenced content is compared, these identifiers
can be ignored: two files whose data types were renamed by another tool (e.g.
after exporting IIDs and recombining them into an SCD) compare equal, and only
the real changes are shown. Others, such as a control block's `datSet`, are
carried in reports, GOOSE and SV messages and are still compared.

### Comparison rules

The elements, attributes and namespaces taken into account are configurable:

- **Base rules** apply to every comparison. By default they ignore naming
  identifiers (`name`, `inst`, `prefix`, ...), so that, for example, two IEDs
  with different names can be compared.
- **Comparison rules** select what to compare (e.g. a whole file,
  `Communication`, a single IED, `DataTypeTemplates`) and can include or
  exclude further elements, attributes and namespaces.

Rules can be exported and imported as JSON ("Export Filters" and "Import Filters").

## Limitations

- Comparing very large SCD files can be slow and use a lot of memory, as
  every element in scope is fingerprinted in the browser.
- Elements outside the SCL namespace (e.g. vendor-specific elements and
  `Private` content) are compared as raw XML, so they are sensitive to
  formatting.

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Local Demo with `web-dev-server`

```bash
npm run start
```

To run a local development server that serves the basic demo located in `demo/index.html`

&copy; 2026 OMICRON electronics GmbH

## License

[Apache-2.0](LICENSE)
