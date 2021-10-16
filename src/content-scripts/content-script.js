import { ExpandCollapseElement } from "./element/expand-collapse";

init();

function init() {
  const shortFooterSettings = browser.storage.sync.get("shortFooter");
  shortFooterSettings.then(handleFooterDisplay, onError);

  handleExpandCollapseDisplay({expandAll: true});
}

function handleFooterDisplay(footerSettings) {
  if (footerSettings.shortFooter) {
    const worklogFooter = document.querySelector("div.worklog__footer");

    console.assert(!worklogFooter.hasAttribute("id"), "Worklog footer already has an ID assigned to it");
    worklogFooter.id = "tes-worklog-footer";
  }
}

function handleExpandCollapseDisplay(expandCollapseSettings) {
  if (expandCollapseSettings.expandAll) {
    const expandCollapseElement = new ExpandCollapseElement(handleSwitchToExpandableState, handleSwitchToCollapsableState);

    const headerCell = document.querySelector("#head");
    headerCell.prepend(expandCollapseElement.htmlElement);

    initTableObserver(expandCollapseElement);
  }
}

function initTableObserver(expandCollapseElement) {
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
    });
    initToggleStuff(expandCollapseElement);
  });

  observer.observe(document.querySelector("mat-table"), {
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
