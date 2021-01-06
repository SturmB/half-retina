"use strict";
(function () {
    var wInput = new Window("dialog", "Half-Retina");
    wInput.alignChildren = "right";
    var sNote = wInput.add("statictext", undefined, "Note: case-sensitive.");
    sNote.alignment = "center";
    var gInput = wInput.add("group");
    gInput.add("statictext", undefined, "Directory:");
    var tInput = gInput.add("edittext");
    var bBrowse = gInput.add("button");
    tInput.characters = 20;
    tInput.active = true;
    var gButtons = wInput.add("group");
    var bOK = gButtons.add("button", undefined, "Begin", { name: "ok" });
    var bCancel = gButtons.add("button", undefined, "Cancel");
    bOK.enabled = false;
    tInput.onChanging = function () {
        bOK.enabled = !!tInput.text;
    };
    bBrowse.onClick = function () {
        tInput.text;
    };
    if (wInput.show() === 1) {
        $.writeln("Test");
    }
})();
