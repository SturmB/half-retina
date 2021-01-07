/// <reference types="types-for-adobe/Photoshop/2015.5"/>

/**
 * Creates a custom version of the ScriptUI object "Window" to allow for
 * a Progressbar.
 */
interface ProgressWindow extends Window {
  pbar?: Progressbar;
}

/**
 * Opens an image file in Photoshop, scales it down to 1/2 of its
 * original size, then saves it with the "@1.5x" text, closes it,
 * and finally deletes the original.
 *
 * @param {File} imageFile The image file upon which resizing will be performed
 */
const processImage = (imageFile: File): void => {
  const saveFile: File = new File(imageFile.fsName.replace(`@3x`, `@1.5x`));

  const saveOptions: JPEGSaveOptions = new JPEGSaveOptions();
  saveOptions.embedColorProfile = false;
  saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
  saveOptions.matte = MatteType.WHITE;
  saveOptions.quality = 12;

  const workDoc: Document = app.open(imageFile);

  workDoc.resizeImage(
    // @ts-ignore 'value' DOES exist
    workDoc.width.value / 2,
    // @ts-ignore 'value' DOES exist
    workDoc.height.value / 2,
    workDoc.resolution,
    ResampleMethod.AUTOMATIC,
    0 // Noise value should be 0.
  );

  workDoc.saveAs(saveFile, saveOptions);
  workDoc.close(SaveOptions.DONOTSAVECHANGES);

  imageFile.remove();

  return;
};

/**
 * Generates a progress bar window (palette, actually).
 *
 * @param {number} endValue The maximum number that the bar represents
 */
const progressWin = (endValue?: number): ProgressWindow => {
  endValue = endValue || 100;
  const win: ProgressWindow = new Window(`palette`, `Progress`);
  win.pbar = win.add(`progressbar`, undefined, 0, endValue);
  win.pbar.preferredSize[0] = 300;
  return win;
};

/**
 * Crawls through all subfolders of the given folder and returns an array
 * of all jpg or png files with "@3x" in the name.
 *
 * @param {Folder} startFolder The folder in which to begin looking for files
 * @param {Array} files An array of all relevant files found
 */
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

/**
 * Wrapper that executes everything: Gets all the images in the given folder,
 * creates and displays a progress bar window, etc. It them updates that window
 * with every image file processed as it processes them.
 *
 * @param {Folder} startingFolder The folder in which all work will be done
 */
const beginWork = (startingFolder: Folder): void => {
  // Get the list of all "@3x" images
  const imageFiles: File[] = getImages(startingFolder);
  const progressWindow: ProgressWindow = progressWin(imageFiles.length);
  progressWindow.show();
  for (let index = 0; index < imageFiles.length; index++) {
    const image = imageFiles[index];
    if (progressWindow.pbar) {
      progressWindow.pbar.value = index + 1;
    }
    processImage(image);
  }
  progressWindow.close();
  return;
};

/**
 * The IIFE that begins everything.
 * It generates a dialog window to ask for the folder in which all work
 * will be performed, then calls the wrapper function that performs
 * said work.
 */
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
  const bOK: Button = gButtons.add(`button`, undefined, `Begin`, {
    name: `ok`,
  });
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
