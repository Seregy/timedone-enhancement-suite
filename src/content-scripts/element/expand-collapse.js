const EXPAND_COLLAPSE_STATE = Object.freeze({
  EXPANDABLE: "unfold_more",
  COLLAPSABLE: "unfold_less",
});

export class ExpandCollapseElement {

  #buttonHtmlElement;
  #iconHtmlElement;

  constructor(onExpandableState, onCollapsableState) {
    this.#iconHtmlElement = this.#buildIconElement();
    this.#buttonHtmlElement = this.#buildButtonElement(this.#iconHtmlElement, onExpandableState, onCollapsableState);
  }

  get isExpandable() {
    return this.#iconHtmlElement.textContent === EXPAND_COLLAPSE_STATE.EXPANDABLE;
  }

  makeExpandable() {
    this.#iconHtmlElement.textContent = EXPAND_COLLAPSE_STATE.EXPANDABLE;
  }

  makeCollapsable() {
    this.#iconHtmlElement.textContent = EXPAND_COLLAPSE_STATE.COLLAPSABLE;
  }

  get htmlElement() {
    return this.#buttonHtmlElement;
  }

  #buildButtonElement(iconElement, onExpandableState, onCollapsableState) {
    const buttonElement = document.createElement("button");
    buttonElement.classList.add("collapse-expand", "btn");
    buttonElement.title = "Розгорнути всі";
    buttonElement.appendChild(iconElement);
    buttonElement.addEventListener('click', () => this.#toggleState(onExpandableState, onCollapsableState));

    return buttonElement;
  }

  #buildIconElement() {
    const iconElement = document.createElement("mat-icon");
    iconElement.classList.add("material-icons");
    iconElement.textContent = "unfold_more";
    return iconElement;
  }

  #toggleState(onExpandableState, onCollapsableState) {
    if (this.isExpandable) {
      this.makeCollapsable();
      onCollapsableState();
      return;
    }

    this.makeExpandable();
    onExpandableState();
  }
}