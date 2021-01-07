/// <reference types="types-for-adobe/Photoshop/2015.5"/>

interface ProgressWindow extends Window {
  pbar?: Progressbar,
}

const progressWin = (endValue?: number): ProgressWindow => {
  endValue = endValue || 100;
  const win: ProgressWindow = new Window(`palette`);
  win.pbar = win.add(`progressbar`, undefined, 0, endValue);
  return win;
};

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
  const progressWindow: ProgressWindow = progressWin(imageFiles.length);
  progressWindow.show();
  for (let index = 0; index < imageFiles.length; index++) {
    const image = imageFiles[index];
    $.writeln(image.fsName);
    if (progressWindow.pbar) {
      progressWindow.pbar.value = index + 1;
    }
  }
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
  const bBrowse: Button = gInput.add(`button`, undefined, `Browse…`);
  tInput.characters = 20;
  tInput.active = true;

  const gButtons: Group = wInput.add(`group`);
  const bOK: Button = gButtons.add(`button`, undefined, `Begin`, {name: `ok`});
  // eslint-disable-next-line no-unused-vars
  const bCancel: Button = gButtons.add(`button`, undefined, `Cancel`);

  bOK.enabled = false;

  // Define when the "OK" button becomes enabled.
  const enbaleOK = (): void => {
    bOK.enabled = !!tInput.text;
  };

  tInput.onChanging = enbaleOK;
  tInput.onChange = enbaleOK;

  // Define the behavior of the "Browse" button
  bBrowse.onClick = (): void => {
    const selectedFolder: Folder = Folder.selectDialog(`Choose a Folder`);
    tInput.text = selectedFolder.fsName;
    enbaleOK();
  };

  // When the user presses the "OK" button
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
