import UIkit from 'uikit';

const EXPAND_COLLAPSE_ICON_NAME = Object.freeze({
  EXPANDABLE: 'expand',
  COLLAPSABLE: 'shrink',
});

/**
 * Expand-collapse element for expanding/collapsing multiple items at once
 */
export class ExpandCollapseElement {
  #buttonHtmlElement;
  #iconHtmlElement;
  #expandable = true;

  /**
   * Constructs new expand instance of expand-collapse element
   * @param {ExpandCollapseElement~onExpandableState} onExpandableState
   * callback to execute on element's state change to expandable
   * @param {ExpandCollapseElement~onCollapsableState} onCollapsableState
   * callback to execute on element's state change to collapsable
   */
  constructor(onExpandableState, onCollapsableState) {
    this.#iconHtmlElement = this.#buildIconElement();
    this.#buttonHtmlElement =
      this.#buildButtonElement(this.#iconHtmlElement, onExpandableState,
          onCollapsableState);
  }

  /**
   * Checks whether the element is in expandable state
   *
   * @return {boolean} true if element is expandable, false otherwise
   */
  get isExpandable() {
    return this.#expandable;
  }

  /**
   * Manually switches the element into expandable state
   */
  makeExpandable() {
    this.#setIcon(this.#iconHtmlElement, EXPAND_COLLAPSE_ICON_NAME.EXPANDABLE);
    this.#expandable = true;
  }

  /**
   * Manually switches the element into collapsable state
   */
  makeCollapsable() {
    this.#setIcon(this.#iconHtmlElement, EXPAND_COLLAPSE_ICON_NAME.COLLAPSABLE);
    this.#expandable = false;
  }

  /**
   * Returns html element, associated with this instance
   *
   * Should be used to add the collapse-expand element to the DOM
   */
  get htmlElement() {
    return this.#buttonHtmlElement;
  }

  /**
   * Builds html element as a button
   *
   * @param {HTMLElement} iconElement icon html element to be included
   * into the button
   * @param {ExpandCollapseElement~onExpandableState} onExpandableState
   * callback to execute on  element's state change to expandable
   * @param {ExpandCollapseElement~onCollapsableState} onCollapsableState
   * callback to execute on element's state change to collapsable
   * @return {HTMLElement} button html element
   */
  #buildButtonElement(iconElement, onExpandableState, onCollapsableState) {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('tes-collapse-expand', 'btn');
    buttonElement.title = 'Розгорнути всі';
    buttonElement.appendChild(iconElement);
    buttonElement.addEventListener('click',
        () => this.#toggleState(onExpandableState, onCollapsableState));

    return buttonElement;
  }

  /**
   * Builds html element for displaying current state as an icon
   * @return {HTMLElement} icon html element
   */
  #buildIconElement() {
    const iconElement = document.createElement('span');
    this.#setIcon(iconElement, EXPAND_COLLAPSE_ICON_NAME.EXPANDABLE);

    return iconElement;
  }

  /**
   * Toggles the current state of the element
   *
   * @param {ExpandCollapseElement~onExpandableState} onExpandableState
   * callback to execute on element's state change to expandable
   * @param {ExpandCollapseElement~onCollapsableState} onCollapsableState
   * callback to execute on element's state change to collapsable
   */
  #toggleState(onExpandableState, onCollapsableState) {
    if (this.isExpandable) {
      this.makeCollapsable();
      onCollapsableState();
      return;
    }

    this.makeExpandable();
    onExpandableState();
  }

  /**
   * Sets new icon for the icon element
   *
   * @param {*} iconHtmlElement icon HTML element
   * @param {*} iconNameToSet new icon name to use
   */
  #setIcon(iconHtmlElement, iconNameToSet) {
    UIkit.icon(iconHtmlElement, {icon: iconNameToSet});
  }

  /**
   * Callback to be executed after switching the element to expandable state
   *
   * Won't be executed if the state of the element was changed manually
   * via {@link makeExpandable}
   *
   * @callback ExpandCollapseElement~onExpandableState
   */

  /**
   * Callback to be executed after switching the element to collapsable state
   *
   * Won't be executed if the state of the element was changed manually
   * via {@link makeCollapsable}
   *
   * @callback ExpandCollapseElement~onCollapsableState
  */
}
