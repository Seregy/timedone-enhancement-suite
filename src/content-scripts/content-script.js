import { ExpandCollapseElement } from "./element/expand-collapse";

const shortFooterSettings = browser.storage.sync.get("shortFooter");
shortFooterSettings.then(handleFooterDisplay, onError);
initTableObserver();
const expandCollapseElement = new ExpandCollapseElement(handleSwitchToExpandableState, handleSwitchToCollapsableState);

function initTableObserver() {
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
    });
    initToggleStuff();
  });

  observer.observe(document.querySelector("mat-table"), {
    childList: true
  });
}

function handleFooterDisplay(footerSettings) {
  if (footerSettings.shortFooter) {
    const worklogFooter = document.querySelector("div.worklog__footer");

    const headerCell = document.querySelector("#head");
    headerCell.prepend(expandCollapseElement.htmlElement);

    worklogFooter.style.width = "auto";
    worklogFooter.style.padding = "0";
    worklogFooter.style.right = "auto";

    const worklogTimeIcon = worklogFooter.querySelector(
      ".btn__worklog-time > img"
    );
    worklogTimeIcon.style.marginLeft = "4rem";
  }
}

function initToggleStuff() {
  const allUnmanagedRows = document.querySelectorAll("mat-row.groupRow:not(.tes-row)");
  
  for (const unmanagedRow of allUnmanagedRows) {
    const nextElement = unmanagedRow.nextElementSibling;
    if (nextElement && !nextElement.classList.contains("groupRow")) {
      unmanagedRow.classList.add("tes-row", "tes-row-expanded");
    } else {
      unmanagedRow.classList.add("tes-row", "tes-row-collapsed");
    }

    unmanagedRow.addEventListener('click', toggleRow);
  }
}

function toggleRow(event) {
  const target = event.target.closest(".tes-row-collapsed, .tes-row-expanded");
  target.classList.toggle("tes-row-collapsed");
  target.classList.toggle("tes-row-expanded");

  toggleExpandCollapseElement();
}

function toggleExpandCollapseElement() {
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
