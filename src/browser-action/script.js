function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    shortFooter: document.querySelector("#short-footer").checked
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#short-footer").checked = result.shortFooter || false;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("shortFooter");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
