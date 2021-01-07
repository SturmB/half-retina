"use strict";
var processImage = function (imageFile) {
    var saveFile = new File(imageFile.fsName.replace("@3x", "@1.5x"));
    var saveOptions = new JPEGSaveOptions();
    saveOptions.embedColorProfile = false;
    saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    saveOptions.matte = MatteType.WHITE;
    saveOptions.quality = 12;
    var workDoc = app.open(imageFile);
    workDoc.resizeImage(workDoc.width.value / 2, workDoc.height.value / 2, workDoc.resolution, ResampleMethod.AUTOMATIC, 0);
    workDoc.saveAs(saveFile, saveOptions);
    workDoc.close(SaveOptions.DONOTSAVECHANGES);
    imageFile.remove();
    return;
};
var progressWin = function (endValue) {
    endValue = endValue || 100;
    var win = new Window("palette", "Progress");
    win.pbar = win.add("progressbar", undefined, 0, endValue);
    win.pbar.preferredSize[0] = 300;
    var timeRemainGroup = win.add("group");
    timeRemainGroup.orientation = "row";
    timeRemainGroup.add("statictext", undefined, "Time remaining:");
    win.timeRemain = timeRemainGroup.add("statictext");
    win.timeRemain.preferredSize[0] = 300;
    return win;
};
var getImages = function (startFolder, files) {
    var reRetina3 = new RegExp("@3x.(jp|pn)g", "i");
    files = files || [];
    var currentFiles = startFolder.getFiles("*");
    for (var _i = 0, currentFiles_1 = currentFiles; _i < currentFiles_1.length; _i++) {
        var currentFile = currentFiles_1[_i];
        if (currentFile instanceof Folder) {
            getImages(currentFile, files);
        }
        else {
            if (reRetina3.test(currentFile.name)) {
                files.push(currentFile);
            }
        }
    }
    return files;
};
var numberEnding = function (num) {
    return num > 1 ? "s" : "";
};
var addSeparator = function (str) {
    return str.length > 0 ? ", " : "";
};
var remainder = function (workingSeconds, timeFrame) {
    return (workingSeconds %= timeFrame);
};
var timeToString = function (milliseconds) {
    if (milliseconds === void 0) { milliseconds = 0; }
    var returnStr = "";
    var MILLISECONDS_IN_A_SECOND = 1000;
    var SECONDS_IN_A_YEAR = 31536000;
    var SECONDS_IN_A_DAY = 86400;
    var SECONDS_IN_AN_HOUR = 3600;
    var SECONDS_IN_A_MINUTE = 60;
    var workingSeconds = Math.floor(milliseconds / MILLISECONDS_IN_A_SECOND);
    var years = Math.floor(workingSeconds / SECONDS_IN_A_YEAR);
    workingSeconds = remainder(workingSeconds, SECONDS_IN_A_YEAR);
    var days = Math.floor(workingSeconds / SECONDS_IN_A_DAY);
    workingSeconds = remainder(workingSeconds, SECONDS_IN_A_DAY);
    var hours = Math.floor(workingSeconds / SECONDS_IN_AN_HOUR);
    workingSeconds = remainder(workingSeconds, SECONDS_IN_AN_HOUR);
    var minutes = Math.floor(workingSeconds / SECONDS_IN_A_MINUTE);
    var seconds = remainder(workingSeconds, SECONDS_IN_A_MINUTE);
    if (years) {
        returnStr += years + " year" + numberEnding(years);
    }
    if (days) {
        returnStr += "" + addSeparator(returnStr) + days + " day" + numberEnding(days);
    }
    if (hours) {
        returnStr += "" + addSeparator(returnStr) + hours + " hour" + numberEnding(hours);
    }
    if (minutes) {
        returnStr += "" + addSeparator(returnStr) + minutes + " minute" + numberEnding(minutes);
    }
    if (seconds) {
        returnStr += "" + addSeparator(returnStr) + seconds + " second" + numberEnding(seconds);
    }
    if (returnStr) {
        return returnStr;
    }
    return "less than a second";
};
var calculateTimeRemaining = function (startTime, completedTasks, totalTasks) {
    var currentDate = new Date();
    var elapsed = currentDate.getTime() - startTime.getTime();
    var timePer = elapsed / completedTasks;
    var tasksRemaining = totalTasks - completedTasks;
    var millisecondsRemaining = tasksRemaining * timePer;
    return millisecondsRemaining;
};
var beginWork = function (startingFolder) {
    var imageFiles = getImages(startingFolder);
    var startTime = new Date();
    var progressWindow = progressWin(imageFiles.length);
    progressWindow.show();
    for (var index = 0; index < imageFiles.length; index++) {
        var image = imageFiles[index];
        if (progressWindow.pbar) {
            progressWindow.pbar.value = index + 1;
        }
        processImage(image);
        var timeRemaining = calculateTimeRemaining(startTime, index + 1, imageFiles.length);
        if (progressWindow.timeRemain) {
            progressWindow.timeRemain.text = timeToString(timeRemaining);
        }
    }
    progressWindow.close();
    return;
};
(function () {
    var wInput = new Window("dialog", "Half-Retina");
    wInput.alignChildren = "right";
    var sNote = wInput.add("statictext", undefined, "Note: case-sensitive.");
    sNote.alignment = "center";
    var gInput = wInput.add("group");
    gInput.add("statictext", undefined, "Directory:");
    var tInput = gInput.add("edittext");
    var bBrowse = gInput.add("button", undefined, "Browse\u2026");
    tInput.characters = 20;
    tInput.active = true;
    var gButtons = wInput.add("group");
    var bOK = gButtons.add("button", undefined, "Begin", {
        name: "ok"
    });
    var bCancel = gButtons.add("button", undefined, "Cancel");
    bOK.enabled = false;
    var enbaleOK = function () {
        bOK.enabled = !!tInput.text;
    };
    tInput.onChanging = enbaleOK;
    tInput.onChange = enbaleOK;
    bBrowse.onClick = function () {
        var selectedFolder = Folder.selectDialog("Choose a Folder");
        tInput.text = selectedFolder.fsName;
        enbaleOK();
    };
    if (wInput.show() === 1) {
        var searchFolder = new Folder(tInput.text);
        if (searchFolder.exists) {
            beginWork(searchFolder);
            return;
        }
        else {
            alert("\"" + searchFolder.fsName + "\" does not exist. Please try again.");
        }
    }
})();
