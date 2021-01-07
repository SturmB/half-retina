/// <reference types="types-for-adobe/Photoshop/2015.5"/>

/**
 * Creates a custom version of the ScriptUI object "Window" to allow for
 * a Progressbar.
 */
interface ProgressWindow extends Window {
  pbar?: Progressbar,
  timeRemain?: StaticText,
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
  const timeRemainGroup: Group = win.add(`group`);
  timeRemainGroup.orientation = `row`;
  timeRemainGroup.add(`statictext`, undefined, `Time remaining:`);
  win.timeRemain = timeRemainGroup.add(`statictext`);
  win.timeRemain.preferredSize[0] = 300;
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
 * Returns a string with either an "s" or nothing depending on whether or not
 * the given number is more than 1.
 *
 * @param num A given number to check against.
 * @returns An "s" or an empty string.
 */
const numberEnding = (num: number): string => {
  return num > 1 ? `s` : ``;
};

/**
 * Returns a comma and space within a string iff a given string isn't empty.
 *
 * @param str String against which to check and see if it exists.
 * @returns Either a comma and space or nothing.
 */
const addSeparator = (str: string): string => {
  return str.length > 0 ? `, ` : ``;
};

/**
 * Returns a remainder based on a given time frame.
 *
 * @param workingSeconds The number of seconds to work with.
 * @param timeFrame The frame of time we're working in.
 * @returns The remainder of time.
 */
const remainder = (workingSeconds: number, timeFrame: number): number => {
  return (workingSeconds %= timeFrame);
};

/**
 * Returns a human-readable amount of time remaining for a task to complete,
 * given the number of microseconds of that time.
 *
 * @param milliseconds The microseconds remaining.
 * @returns The human-readable string representation of that time.
 */
const timeToString = (milliseconds: number = 0): string => {
  // TIP: to find current time in milliseconds, use:
  // var  current_time_milliseconds = new Date().getTime();
  let returnStr = ``;

  const MILLISECONDS_IN_A_SECOND: number = 1000;
  const SECONDS_IN_A_YEAR: number = 31536000;
  const SECONDS_IN_A_DAY: number = 86400;
  const SECONDS_IN_AN_HOUR: number = 3600;
  const SECONDS_IN_A_MINUTE: number = 60;

  let workingSeconds: number = Math.floor(
    milliseconds / MILLISECONDS_IN_A_SECOND
  );
  const years: number = Math.floor(workingSeconds / SECONDS_IN_A_YEAR);
  workingSeconds = remainder(workingSeconds, SECONDS_IN_A_YEAR);
  const days: number = Math.floor(workingSeconds / SECONDS_IN_A_DAY);
  workingSeconds = remainder(workingSeconds, SECONDS_IN_A_DAY);
  const hours: number = Math.floor(workingSeconds / SECONDS_IN_AN_HOUR);
  workingSeconds = remainder(workingSeconds, SECONDS_IN_AN_HOUR);
  const minutes: number = Math.floor(workingSeconds / SECONDS_IN_A_MINUTE);
  const seconds: number = remainder(workingSeconds, SECONDS_IN_A_MINUTE);

  if (years) {
    returnStr += `${years} year${numberEnding(years)}`;
  }
  // Possible Todo: Months! Maybe weeks?
  if (days) {
    returnStr += `${addSeparator(returnStr)}${days} day${numberEnding(days)}`;
  }
  if (hours) {
    returnStr += `${addSeparator(returnStr)}${hours} hour${numberEnding(
      hours
    )}`;
  }
  if (minutes) {
    returnStr += `${addSeparator(returnStr)}${minutes} minute${numberEnding(
      minutes
    )}`;
  }
  if (seconds) {
    returnStr += `${addSeparator(returnStr)}${seconds} second${numberEnding(
      seconds
    )}`;
  }

  if (returnStr) {
    return returnStr;
  }

  return `less than a second`; // "just now" or other string you like;
};

const calculateTimeRemaining = (startTime: Date, completedTasks: number, totalTasks: number): number => {
  const currentDate: Date = new Date();
  const elapsed: number = currentDate.getTime() - startTime.getTime();
  const timePer: number = elapsed / completedTasks;
  const tasksRemaining: number = totalTasks - completedTasks;
  const millisecondsRemaining: number = tasksRemaining * timePer;

  return millisecondsRemaining;
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
  const startTime: Date = new Date();
  const progressWindow: ProgressWindow = progressWin(imageFiles.length);
  progressWindow.show();
  for (let index = 0; index < imageFiles.length; index++) {
    const image = imageFiles[index];
    if (progressWindow.pbar) {
      progressWindow.pbar.value = index + 1;
    }
    processImage(image);
    const timeRemaining: number = calculateTimeRemaining(startTime, index + 1, imageFiles.length);
    if (progressWindow.timeRemain) {
      progressWindow.timeRemain.text = timeToString(timeRemaining);
    }
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
