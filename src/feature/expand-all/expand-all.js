import {ExpandCollapseElement} from './element/expand-collapse-element.js';
import htmlHelper from '../../helper/html-helper.js';
import './expand-all.css';

const EXPAND_COLLAPSE_ELEMENT =
  new ExpandCollapseElement(handleSwitchToExpandableState,
      handleSwitchToCollapsableState);
const MUTATION_OBSERVER = new MutationObserver((mutations) => {
  initWorklogRows(EXPAND_COLLAPSE_ELEMENT);
});
const COLLAPSED_ROW_CLASS_NAME = 'tes-row-collapsed';
const EXPANDED_ROW_CLASS_NAME = 'tes-row-expanded';
const MANAGED_ROW_CLASS_NAME = 'tes-row';

let initialized = false;

/**
 * Returns a unique feature identifier
 * @return {string} feature ID
 */
function getId() {
  return 'expand-all';
}

/**
 * Returns a feature description
 *
 * @return {string} feature description
 */
function getDescription() {
  return 'Enable the expand all button';
}

/**
 * Returns whether the feature has been initialized
 *
 * @return {boolean} feature initilization status
 */
function isInitialized() {
  return initialized;
}

/**
 * Initializes and enables the feature
 */
async function initialize() {
  const headerCell = await resolveHeaderCell();
  if (!headerCell) {
    return;
  }

  headerCell.prepend(EXPAND_COLLAPSE_ELEMENT.htmlElement);
  initTableObserver(EXPAND_COLLAPSE_ELEMENT);

  initialized = true;
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  const headerCell = await resolveHeaderCell();
  if (!headerCell) {
    return;
  }

  if (headerCell.contains(EXPAND_COLLAPSE_ELEMENT.htmlElement)) {
    headerCell.removeChild(EXPAND_COLLAPSE_ELEMENT.htmlElement);
  }

  const allManagedRows =
    document.querySelectorAll(`.${MANAGED_ROW_CLASS_NAME}`);
  allManagedRows.forEach((managedRow) =>
    managedRow.classList.remove(MANAGED_ROW_CLASS_NAME, EXPANDED_ROW_CLASS_NAME,
        COLLAPSED_ROW_CLASS_NAME));
  MUTATION_OBSERVER.disconnect();

  initialized = false;
}

/**
 * Resolve header cell
 * @return {Promise.<HTMLElement>} promise for the header HTML element
 */
async function resolveHeaderCell() {
  try {
    return await htmlHelper.resolveElement(() =>
      document.querySelector('#head'));
  } catch (error) {
    console.error(`Encountered an error on resolving header cell: %o`, error);
  }
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
  const allUnmanagedRows = document
      .querySelectorAll(`mat-row.groupRow:not(.${MANAGED_ROW_CLASS_NAME})`);

  for (const unmanagedRow of allUnmanagedRows) {
    const nextElement = unmanagedRow.nextElementSibling;
    if (nextElement && !nextElement.classList.contains('groupRow')) {
      unmanagedRow.classList.add(MANAGED_ROW_CLASS_NAME,
          EXPANDED_ROW_CLASS_NAME);
    } else {
      unmanagedRow.classList.add(MANAGED_ROW_CLASS_NAME,
          COLLAPSED_ROW_CLASS_NAME);
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
  const target = event.target
      .closest(`.${COLLAPSED_ROW_CLASS_NAME}, .${EXPANDED_ROW_CLASS_NAME}`);

  if (target == null) {
    return;
  }

  target.classList.toggle(COLLAPSED_ROW_CLASS_NAME);
  target.classList.toggle(EXPANDED_ROW_CLASS_NAME);

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
  const collapsedRows =
    document.querySelectorAll(`mat-row.${COLLAPSED_ROW_CLASS_NAME}`);

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
 * Handles the switch of expand-collapse element to the collapsable state
 */
function handleSwitchToCollapsableState() {
  const collapsedRows =
    document.querySelectorAll(`mat-row.${COLLAPSED_ROW_CLASS_NAME}`);
  for (const row of collapsedRows) {
    row.click();
  }
}

/**
 * Handles the switch of expand-collapse element to the expandable state
 */
function handleSwitchToExpandableState() {
  const expandedRows =
    document.querySelectorAll(`mat-row.${EXPANDED_ROW_CLASS_NAME}`);
  for (const row of expandedRows) {
    row.click();
  }
}

export default {getId, getDescription, isInitialized, initialize, deregister};
