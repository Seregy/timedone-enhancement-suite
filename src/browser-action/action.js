function loadOptions() {

  function setCurrentChoice(currentSettings) {
    getNoFooterBackgroundCheckbox().checked = currentSettings.noFooterBackground || currentSettings.shortFooter || false;
    getExpandAllButtonCheckbox().checked = currentSettings.expandAllButton || false;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let currentSettings = browser.storage.sync.get();
  currentSettings.then(setCurrentChoice, onError);
}

function saveOptions() {
  browser.storage.sync.set({
    noFooterBackground: getNoFooterBackgroundCheckbox().checked,
    expandAllButton: getExpandAllButtonCheckbox().checked,
  });
}

function getNoFooterBackgroundCheckbox() {
  return document.querySelector("#no-footer-background");
}

function getExpandAllButtonCheckbox() {
  return document.querySelector("#expand-all-button");
}

function initEventListeners() {
  getNoFooterBackgroundCheckbox().addEventListener("change", saveOptions);
  getExpandAllButtonCheckbox().addEventListener("change", saveOptions);

  document.addEventListener("DOMContentLoaded", loadOptions);
}

initEventListeners();