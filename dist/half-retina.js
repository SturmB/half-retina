"use strict";
var createHalfRetina = function (imageFile) {
    var saveFile = new File(imageFile.fsName.replace("@3x", "@1.5x"));
    $.writeln("Save file is " + saveFile.fsName);
    var workDoc = app.open(imageFile);
    $.writeln("workDoc is " + workDoc.name);
    workDoc.close(SaveOptions.DONOTSAVECHANGES);
    return;
};
var progressWin = function (endValue) {
    endValue = endValue || 100;
    var win = new Window("palette");
    win.pbar = win.add("progressbar", undefined, 0, endValue);
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
var beginWork = function (startingFolder) {
    var imageFiles = getImages(startingFolder);
    var progressWindow = progressWin(imageFiles.length);
    progressWindow.show();
    for (var index = 0; index < imageFiles.length; index++) {
        var image = imageFiles[index];
        $.writeln("Image fsName is " + image.fsName);
        if (progressWindow.pbar) {
            progressWindow.pbar.value = index + 1;
        }
        createHalfRetina(image);
        return;
    }
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
    var bOK = gButtons.add("button", undefined, "Begin", { name: "ok" });
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
