import { ExpandCollapseElement } from "./element/expand-collapse";

const EXPAND_COLLAPSE_ELEMENT = new ExpandCollapseElement(handleSwitchToExpandableState, handleSwitchToCollapsableState);
const MUTATION_OBSERVER = new MutationObserver((mutations) => {
  initToggleStuff(EXPAND_COLLAPSE_ELEMENT);
});

function applySettings() {
  const featureSettings = browser.storage.sync.get();
  featureSettings.then(settings => {
    handleFooterDisplay(settings);
    handleExpandCollapseDisplay(settings);
  }, onError);
}

function handleSettingsChanged(changes, areaName) {
  if (areaName === "sync") {
    applySettings();
  }
}

function handleFooterDisplay(featureSettings) {
  console.log(featureSettings);
  if (featureSettings.noFooterBackground) {
    const worklogFooter = document.querySelector("div.worklog__footer");

    console.assert(!worklogFooter.hasAttribute("id"), "Worklog footer already has an ID assigned to it");
    worklogFooter.id = "tes-worklog-footer";
    return;
  }

  const tesWorklogFooter = document.querySelector("#tes-worklog-footer");
  if (tesWorklogFooter) {
    tesWorklogFooter.removeAttribute("id");
  }
}

function handleExpandCollapseDisplay(featureSettings) {
  if (featureSettings.expandAllButton) {

    const headerCell = document.querySelector("#head");
    headerCell.prepend(EXPAND_COLLAPSE_ELEMENT.htmlElement);

    initTableObserver(EXPAND_COLLAPSE_ELEMENT);
    return;
  }

  const headerCell = document.querySelector("#head");
  if (headerCell.contains(EXPAND_COLLAPSE_ELEMENT.htmlElement)) {
    headerCell.removeChild(EXPAND_COLLAPSE_ELEMENT.htmlElement);
  }
  const allManagedRows = document.querySelectorAll(".tes-row");
  allManagedRows.forEach(managedRow => managedRow.classList.remove("tes-row", "tes-row-expanded", "tes-row-collapsed"));
  MUTATION_OBSERVER.disconnect();
}

function initTableObserver(expandCollapseElement) {
  initToggleStuff(expandCollapseElement);
  MUTATION_OBSERVER.observe(document.querySelector("mat-table"), {
    childList: true
  });
}

function initToggleStuff(expandCollapseElement) {
  const allUnmanagedRows = document.querySelectorAll("mat-row.groupRow:not(.tes-row)");

  for (const unmanagedRow of allUnmanagedRows) {
    const nextElement = unmanagedRow.nextElementSibling;
    if (nextElement && !nextElement.classList.contains("groupRow")) {
      unmanagedRow.classList.add("tes-row", "tes-row-expanded");
    } else {
      unmanagedRow.classList.add("tes-row", "tes-row-collapsed");
    }

    unmanagedRow.addEventListener('click', event => toggleRow(event, expandCollapseElement));
  }
}

function toggleRow(event, expandCollapseElement) {
  const target = event.target.closest(".tes-row-collapsed, .tes-row-expanded");

  if (target == null) {
    return;
  }

  target.classList.toggle("tes-row-collapsed");
  target.classList.toggle("tes-row-expanded");

  toggleExpandCollapseElement(expandCollapseElement);
}

function toggleExpandCollapseElement(expandCollapseElement) {
  const collapsedRows = document.querySelectorAll("mat-row.tes-row-collapsed");

  if (expandCollapseElement.isExpandable) {

    if (collapsedRows.length === 0) {
      expandCollapseElement.makeCollapsable();
    }

    return;
  }

  if (collapsedRows.length > 0) {
    expandCollapseElement.makeExpandable();
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function handleSwitchToCollapsableState() {
  const collapsedRows = document.querySelectorAll("mat-row.tes-row-collapsed");
  for (const row of collapsedRows) {
    row.click();
  }
}

function handleSwitchToExpandableState() {
  const expandedRows = document.querySelectorAll("mat-row.tes-row-expanded");
  for (const row of expandedRows) {
    row.click();
  }
}

applySettings();
browser.storage.onChanged.addListener(handleSettingsChanged);