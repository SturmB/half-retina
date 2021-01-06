/// <reference types="types-for-adobe/Photoshop/2015.5"/>

const getImages = (startFolder: Folder, files?: File[]): File[] => {
  const reRetina3: RegExp = new RegExp(`@3x.(jp|pn)g`, `i`);
  files = files || [];
  const currentFiles: Array<File | Folder> = startFolder.getFiles("*");
  for (const currentFile of currentFiles) {
    if (currentFile instanceof Folder) {
      getImages(currentFile, files);
    } else {
      if (reRetina3.test(currentFile.name)) {
        files.push(currentFile);
      }
    }
  }
  return files;
};

const beginWork = (startingFolder: Folder): void => {
  // Get the list of all "@3x" images
  const imageFiles: File[] = getImages(startingFolder);
  $.writeln(imageFiles.toString());
};

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
  tInput.onChanging = (): void => {
    bOK.enabled = !!tInput.text;
  };

  // Define the behavior of the "Browse" button
  bBrowse.onClick = (): void => {
    const selectedFolder: Folder = Folder.selectDialog(`Choose a Folder`);
    tInput.text = selectedFolder.fsName;
  };

  if (wInput.show() === 1) {
    const searchFolder: Folder = new Folder(tInput.text);
    // Check to make sure the directory exists.
    if (searchFolder.exists) {
      beginWork(searchFolder);
      return;
    } else {
      alert(`"${searchFolder.fsName}" does not exist. Please try again.`);
    }
  }
})();
