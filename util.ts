export type fcdaDesc = {
  LDevice?: string | null;
  LN?: string | null;
  DOI?: string | null;
  SDI?: string[];
  DAI?: string | null;
};

export function getFcdaInstDesc(fcda: Element): fcdaDesc {
  const [doName, daName] = ['doName', 'daName'].map(attr =>
    fcda.getAttribute(attr),
  );

  const ied = fcda.closest('IED')!;
  if (!ied) {
    return {};
  }

  const anyLn = Array.from(
    ied.querySelectorAll(
      `:scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute(
        'ldInst',
      )}"] > LN, :scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute(
        'ldInst',
      )}"] > LN0`,
    ),
  ).find(
    lN =>
      (lN.getAttribute('prefix') ?? '') ===
        (fcda.getAttribute('prefix') ?? '') &&
      lN.getAttribute('lnClass') === (fcda.getAttribute('lnClass') ?? '') &&
      (lN.getAttribute('inst') ?? '') === (fcda.getAttribute('lnInst') ?? ''),
  );

  if (!anyLn) {
    return {};
  }

  let descs: fcdaDesc = {};

  const ldDesc = anyLn.closest('LDevice')!.getAttribute('desc');
  descs = { ...descs, ...(ldDesc && ldDesc !== '' && { LDevice: ldDesc }) };

  const lnDesc = anyLn.getAttribute('desc');
  descs = { ...descs, ...(lnDesc && lnDesc !== '' && { LN: lnDesc }) };

  const doNames = doName!.split('.');
  const daNames = daName?.split('.');

  const doi = anyLn.querySelector(`:scope > DOI[name="${doNames[0]}"`);

  if (!doi) {
    return descs;
  }

  let doiDesc = doi?.getAttribute('desc');

  if (!doiDesc) {
    doiDesc =
      doi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ?? null;
  }

  descs = { ...descs, ...(doiDesc && doiDesc !== '' && { DOI: doiDesc }) };

  let previousDI: Element = doi;
  const daAsSDI = daNames ? daNames.slice(0, daNames.length - 1) : [];
  doNames
    .concat(daAsSDI)
    .slice(1)
    .forEach(sdiName => {
      const sdi = previousDI.querySelector(`:scope > SDI[name="${sdiName}"]`);
      if (sdi) {
        previousDI = sdi;
      }
      let sdiDesc = sdi?.getAttribute('desc');

      if (!sdiDesc) {
        sdiDesc =
          sdi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
          null;
      }
      if (!('SDI' in descs)) {
        descs = {
          ...descs,
          ...(sdiDesc && sdiDesc !== '' && { SDI: [sdiDesc] }),
        };
      } else if (sdiDesc) {
        descs.SDI!.push(sdiDesc);
      }
    });

  if (!daName || !daNames) {
    return descs;
  }

  // ix and array elements not supported
  const lastdaName = daNames?.slice(daNames.length - 1);
  const dai = previousDI.querySelector(`:scope > DAI[name="${lastdaName}"]`);
  if (!dai) {
    return descs;
  }

  const daiDesc = dai.getAttribute('desc');
  descs = { ...descs, ...(daiDesc && daiDesc !== '' && { DAI: daiDesc }) };

  return descs;
}

export async function loadResource(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(async response => {
        if (!response.ok) {
          reject(new Error(''));
        } else {
          const content = await response.text();
          resolve(content);
        }
      })
      .catch(() => {
        reject(new Error(''));
      });
  });
}
