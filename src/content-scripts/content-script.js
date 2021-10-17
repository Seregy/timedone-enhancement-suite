import {ExpandCollapseElement} from './element/expand-collapse';

const EXPAND_COLLAPSE_ELEMENT =
  new ExpandCollapseElement(handleSwitchToExpandableState,
      handleSwitchToCollapsableState);
const MUTATION_OBSERVER = new MutationObserver((mutations) => {
  initWorklogRows(EXPAND_COLLAPSE_ELEMENT);
});

/**
 * Applies current feature settings to the page's content
 */
function applySettings() {
  const featureSettings = browser.storage.sync.get();
  featureSettings.then((settings) => {
    handleFooterDisplay(settings);
    handleExpandCollapseDisplay(settings);
  }, onStorageError);
}

/**
 * Handles the change to the feature settings
 *
 * @param {object} changes object describing the changes
 * @param {string} areaName name of the changed storage area
 */
function handleSettingsChanged(changes, areaName) {
  if (areaName === 'sync') {
    applySettings();
  }
}

/**
 * Handles the display of the footer based on the feature settings
 *
 * @param {FeatureSettings} featureSettings current feature settings
 */
function handleFooterDisplay(featureSettings) {
  if (featureSettings.noFooterBackground) {
    const worklogFooter = document.querySelector('div.worklog__footer');

    console.assert(!worklogFooter.hasAttribute('id'),
        'Worklog footer already has an ID assigned to it');
    worklogFooter.id = 'tes-worklog-footer';
    return;
  }

  const tesWorklogFooter = document.querySelector('#tes-worklog-footer');
  if (tesWorklogFooter) {
    tesWorklogFooter.removeAttribute('id');
  }
}

/**
 * Handles the display of the expand element based on the feature settings
 *
 * @param {FeatureSettings} featureSettings current feature settings
 */
function handleExpandCollapseDisplay(featureSettings) {
  if (featureSettings.expandAllButton) {
    const headerCell = document.querySelector('#head');
    headerCell.prepend(EXPAND_COLLAPSE_ELEMENT.htmlElement);

    initTableObserver(EXPAND_COLLAPSE_ELEMENT);
    return;
  }

  const headerCell = document.querySelector('#head');
  if (headerCell.contains(EXPAND_COLLAPSE_ELEMENT.htmlElement)) {
    headerCell.removeChild(EXPAND_COLLAPSE_ELEMENT.htmlElement);
  }
  const allManagedRows = document.querySelectorAll('.tes-row');
  allManagedRows.forEach((managedRow) =>
    managedRow.classList.remove('tes-row', 'tes-row-expanded',
        'tes-row-collapsed'));
  MUTATION_OBSERVER.disconnect();
}

/**
 * Initializes content observer for worklog table
 *
 * @param {ExpandCollapseElement} expandCollapseElement expand-collapse element
 * responsible for expanding worklog rows
 */
function initTableObserver(expandCollapseElement) {
  initWorklogRows(expandCollapseElement);
  MUTATION_OBSERVER.observe(document.querySelector('mat-table'), {
    childList: true,
  });
}

/**
 * Initializes existing worklog rows to make them managable
 *
 * Assigns required classes and event listeners to properly support
 * expand-collapse functionality
 *
 * @param {ExpandCollapseElement} expandCollapseElement expand-collapse element
 * responsible for expanding worklog rows
 */
function initWorklogRows(expandCollapseElement) {
  const allUnmanagedRows =
    document.querySelectorAll('mat-row.groupRow:not(.tes-row)');

  for (const unmanagedRow of allUnmanagedRows) {
    const nextElement = unmanagedRow.nextElementSibling;
    if (nextElement && !nextElement.classList.contains('groupRow')) {
      unmanagedRow.classList.add('tes-row', 'tes-row-expanded');
    } else {
      unmanagedRow.classList.add('tes-row', 'tes-row-collapsed');
    }

    unmanagedRow.addEventListener('click',
        (event) => toggleRow(event, expandCollapseElement));
  }
}

/**
 * Toggles the collapsed-expanded state of the row
 *
 * @param {Event} event event that triggered the toggle, associated with the row
 * @param {ExpandCollapseElement} expandCollapseElement expand-collapse element
 * responsible for expanding worklog rows
 */
function toggleRow(event, expandCollapseElement) {
  const target = event.target.closest('.tes-row-collapsed, .tes-row-expanded');

  if (target == null) {
    return;
  }

  target.classList.toggle('tes-row-collapsed');
  target.classList.toggle('tes-row-expanded');

  handleRowToggle(expandCollapseElement);
}

/**
 * Handles the change of collapsed-expanded state of a row
 *
 * Updates the state of expand-collapse element if needed
 *
 * @param {ExpandCollapseElement} expandCollapseElement expand-collapse element
 * to be updated
 */
function handleRowToggle(expandCollapseElement) {
  const collapsedRows = document.querySelectorAll('mat-row.tes-row-collapsed');

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

/**
 * Handles the error on retrieving settings from the storage
 * @param {*} error error to be handled
 */
function onStorageError(error) {
  console.log(`Error: ${error}`);
}

/**
 * Handles the switch of expand-collapse element to the collapsable state
 */
function handleSwitchToCollapsableState() {
  const collapsedRows = document.querySelectorAll('mat-row.tes-row-collapsed');
  for (const row of collapsedRows) {
    row.click();
  }
}

/**
 * Handles the switch of expand-collapse element to the expandable state
 */
function handleSwitchToExpandableState() {
  const expandedRows = document.querySelectorAll('mat-row.tes-row-expanded');
  for (const row of expandedRows) {
    row.click();
  }
}

applySettings();
browser.storage.onChanged.addListener(handleSettingsChanged);
