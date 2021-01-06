/// <reference types="types-for-adobe/Photoshop/2015.5"/>

(() => {
  // Build ScriptUI window
  const wInput: Window = new Window(`dialog`, `Half-Retina`);
  wInput.alignChildren = `right`;

  const sNote: StaticText = wInput.add(
    `statictext`,
    undefined,
    `Note: case-sensitive.`
  );
  sNote.alignment = `center`;

  const gInput: Group = wInput.add(`group`);
  gInput.add(`statictext`, undefined, `Directory:`);
  const tInput: EditText = gInput.add(`edittext`);
  const bBrowse: Button = gInput.add(`button`);
  tInput.characters = 20;
  tInput.active = true;

  const gButtons: Group = wInput.add(`group`);
  const bOK: Button = gButtons.add(`button`, undefined, `Begin`, {name: `ok`});
  // eslint-disable-next-line no-unused-vars
  const bCancel: Button = gButtons.add(`button`, undefined, `Cancel`);

  bOK.enabled = false;
  tInput.onChanging = () => {
    bOK.enabled = !!tInput.text;
  };

  // Define the behavior of the "Browse" button
  bBrowse.onClick = () => {
    tInput.text;
  };

  if (wInput.show() === 1) {
    // const find: string = tInput.text;
    // const replaceWith: string = tOutput.text;

    // const rootLayers: Layers = workDoc.layers;

    // renameLayer(rootLayers, find, replaceWith);
    $.writeln("Test");
  }
})();
