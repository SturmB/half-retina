"use strict";
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
    $.writeln(imageFiles.toString());
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
