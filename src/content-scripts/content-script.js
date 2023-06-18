import {ExpandCollapseElement} from './element/expand-collapse.js';
import {handleProjectAutoselectFix} from './project-autoselect.js';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons.js';

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
    handleProjectAutoselectFix(settings);
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
async function handleFooterDisplay(featureSettings) {
  let footer;
  try {
    footer = await resolveElement(() =>
      document.querySelector('div.worklog__footer'));
  } catch (error) {
    console.error(`Encountered an error on applying no footer background
       settings: %o`, error);
  }

  if (!footer) {
    return;
  }

  if (featureSettings.noFooterBackground) {
    assignElementId(footer, 'tes-worklog-footer');
    return;
  }

  footer.removeAttribute('id');
}

/**
 * Assigns ID to the existing element
 *
 * @param {HTMLElement} element html element to assign the ID to
 * @param {string} newId id to assign to the element
 */
function assignElementId(element, newId) {
  if (element.id === newId) {
    return;
  }

  console.assert(!element.hasAttribute('id'),
      `Element has an ID assigned to it: ${element.id}`);
  element.id = newId;
}

/**
 * Handles the display of the expand element based on the feature settings
 *
 * @param {FeatureSettings} featureSettings current feature settings
 */
async function handleExpandCollapseDisplay(featureSettings) {
  let headerCell;
  try {
    headerCell = await resolveElement(() => document.querySelector('#head'));
  } catch (error) {
    console.error(`Encountered an error on applying expand-collapse settings:
     %o`, error);
  }

  if (!headerCell) {
    return;
  }

  if (featureSettings.expandAllButton) {
    headerCell.prepend(EXPAND_COLLAPSE_ELEMENT.htmlElement);

    initTableObserver(EXPAND_COLLAPSE_ELEMENT);
    return;
  }

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
  console.error(`Encountered an error on retrieving settings from the
   storage: ${error}`);
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

/**
 * Function that returns html element or null if it's not available
 *
 * @callback elementSupplier
 */

/**
 * Resolves html element on the page
 *
 * Handles the cases when the element can't be retrieved right away
 *
 * @param {elementSupplier} elementSupplier provider of the html element to
 * resolve
 * @return {Promise} promise for the html element
 */
function resolveElement(elementSupplier) {
  return new Promise((resolve) => {
    const element = elementSupplier();

    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      const element = elementSupplier();
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document, {childList: true, subtree: true});
  });
}

applySettings();
browser.storage.onChanged.addListener(handleSettingsChanged);
UIkit.use(Icons);
