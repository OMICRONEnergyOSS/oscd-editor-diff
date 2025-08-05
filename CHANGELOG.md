# Changelog

## 0.0.1 (2025-08-05)


### Features

* add end user help ([cfae7c9](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/cfae7c922de0940fee4bb4a14be6feab0f5c54e2))
* add extensible base filter and set of default filters ([a522570](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/a522570b4be5c87f31a5609597a799a3aa8a7d26))
* add filter reset menu option ([b5693c5](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/b5693c5da0eb638c28b31ed6386125bf377b8a57))
* always expand top-level results with a big expand-all button ([#92](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/92)) ([c5eb7df](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/c5eb7df7e0e11cb859d818322e45f1b94344b4bd))
* configurable filters for the comparison algorithm ([#24](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/24)) ([1989bd6](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/1989bd69b54d8e33afa1c62916663d8a347b76f1))
* ensure icon reflects document color (closes [#107](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/107)) ([2a601b6](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/2a601b6e825706691df94e74938fcec730551871))
* explicitly label text content as such ([#50](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/50)) ([8c69bee](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/8c69beef350a08a4c9dc53a8a54866a25fa86cc5))
* **hash:** dereference ConnectedAP -&gt; AccessPoint ([6a33702](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/6a337028b54137be4d4b8b42cad618a4890b3570))
* make UI more intelligible ([4c57e4b](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/4c57e4b8cb3b340b64eb72ca2381d103e6740575))
* number of results in diff-tree's ([24da05b](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/24da05bcc4ebc0dc9614f5794328b2d7e46ed9f2)), closes [#57](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/57)
* project rename + migration to oscd-shell ([dde05ab](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/dde05ab352bfca7ec4f161af756daebfb6896f42))
* replace ServerAt by the Server it's pointing to ([#64](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/64)) ([11aaf57](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/11aaf571da04b1223b1c2b882720a6845eeff563))
* sort child diffs by identity ([0ebb80f](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/0ebb80f70b2d3f8d290e91f01af9989c88b4474e)), closes [#61](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/61)


### Bug Fixes

* AccessPoints with ServerAt's should display Servers  in diff-tree ([58a05dd](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/58a05ddfa15e7d31c055227f18ff7d38bdae5c8c)), closes [#91](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/91)
* actually show all changed children ([e2bcda8](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/e2bcda8956ecf20552add624d58e526c57da5d29))
* allow comparing non-identical elements ([d59bf3b](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/d59bf3b303c53ed3ce165d4f00e881066e5f955f))
* allow multiple selectors inside "scope" fields ([c634c54](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/c634c545a8dcb0d21c00900b4270a07482944df1)), closes [#94](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/94)
* allow seeing changes within differently named elements ([c00026c](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/c00026cf0235af535f10ad8fe7b180bb4544ac5b))
* always show selection in md-select ([2f3d95e](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/2f3d95e9ea8f685e6489f7002ed959c86b23f504))
* apply filters to referenced elements ([cacc146](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/cacc146de7bc51bbd4dba8652a52ab36fec24df7))
* breadcrumbs in fullscreen ([7d5c4fc](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/7d5c4fc220ce51652fe76b1dd6fe3388a080d8d4)), closes [#88](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/88)
* **diff-tree:** identify the correct child element ([72732b8](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/72732b8f5d7ed9eda4233890b0c2c927e97882cd))
* filter elements based on filter selectors and namespaces ([dd34a83](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/dd34a83c619be850c5c0ef8d74dcdd67a5d68b58))
* **hash:** respect FCDA order within DataSet ([#48](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/48)) ([75f5f8f](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/75f5f8ff084bf1b8eb1d4ceb0d270521af683968))
* improve wording of base-filter help dialog ([b95d536](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/b95d5367b9b8ad4bd2dc698cd3160aa7d3e78082)), closes [#80](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/80)
* prevent diff-tree expand btn expanding all siblings ([24ec377](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/24ec377884cc110eb3994358c9d23119d5da6c1f)), closes [#118](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/118)
* refine default filters exclusion and exception lists ([496c7e5](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/496c7e55c102002bbab71309dc7fb7df87debc36)), closes [#109](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/109)
* renamed unit tests files and added chrome launcher ([3bf6e3f](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/3bf6e3f6423323f11d24e9c8bbc557a5b07d85ab))
* show child diffs for referenced elements ([8e1572e](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/8e1572e52bb60f4de3852ec4e3116126b5ca956c)), closes [#71](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/71)
* UI issues with buttons and diff-tree placement ([e265bf6](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/e265bf69b7034aacce652049b127386603c75e43))
* use &gt; for a descrption delimiter ([368daa0](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/368daa06ac6012110d713768928096e127736c0b))
* use css tag as intended ([534bbd8](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/534bbd80b55dd3a9767571d7ae6cda2b1f13ea6d))
* use property binding for non-string value ([df9f8f1](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/df9f8f113ba17ee5bc031f5c2d79a74e11ed2680))


### Styles

* add and change icons ([5757ba0](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/5757ba012407a2042249bd44e2dc8c2a6c1f27f2)), closes [#104](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/104)
* breadcrumbs in fullscreen + selected item text colour ([c8bffef](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/c8bffef81827910611164f288e5978294f0c54b6))
* increase selector field size ([2033d9b](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/2033d9babcf346177db73aa12f6914cfc7bbfcd1)), closes [#34](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/issues/34)
* make buttons pretty ([f205a6b](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/f205a6b2013dc4a8e8bbc48973d4ec6bd2cd003d))
* make comparison rule md-select width 100% of parent ([f446c05](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/f446c05f87f90a109c0daecaff54f750f3ef3575))
* wrap description at 100vw ([f08d30c](https://github.com/OMICRONEnergyOSS/oscd-editor-diff/commit/f08d30c05d5dccb1e43fda1f54fb8fdd07135d5a))
