const shortFooterSettings = browser.storage.sync.get("shortFooter");
shortFooterSettings.then(handleFooterDisplay, onError);
initTableObserver();

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
    const ceButton = document.createElement("button");
    ceButton.classList.add("collapse-expand", "btn");
    ceButton.title = "Розгорнути всі";
    const span1 = document.createElement("mat-icon");
    span1.classList.add("material-icons");
    span1.textContent = "unfold_more";
    ceButton.appendChild(span1);
    ceButton.addEventListener('click', toggleExpand);
    headerCell.prepend(ceButton);

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
  const allRows = document.querySelectorAll("mat-row.groupRow:not(.tes-row)");
  for (row of allRows) {
    const nextElement = row.nextElementSibling;
    if (nextElement && !nextElement.classList.contains("groupRow")) {
      row.classList.add("tes-row", "tes-row-expanded");
    } else {
      row.classList.add("tes-row", "tes-row-collapsed");
    }

    row.addEventListener('click', toggleRow);
  }
}

function toggleRow(event) {
  const target = event.target.closest(".tes-row-collapsed, .tes-row-expanded");
  target.classList.toggle("tes-row-collapsed");
  target.classList.toggle("tes-row-expanded");

  toggleExpandIcon();
}

function toggleExpandIcon() {
  const spanStuff = document.querySelector(".collapse-expand > mat-icon");

  if (spanStuff.textContent === "unfold_more") {
    const collapsedRows = document.querySelectorAll("mat-row.tes-row-collapsed");

    if (collapsedRows.length === 0) {
      spanStuff.textContent = "unfold_less";
    }
  } else if (spanStuff.textContent === "unfold_less") {
    const collapsedRows = document.querySelectorAll("mat-row.tes-row-collapsed");

    if (collapsedRows.length > 0) {
      spanStuff.textContent = "unfold_more";
    }
  }
}

function toggleExpand(event) {
  const spanStuff = document.querySelector(".collapse-expand > mat-icon");

  if (spanStuff.textContent === "unfold_more") {
    spanStuff.textContent = "unfold_less";

    const allRows = document.querySelectorAll("mat-row.tes-row-collapsed");
    for (row of allRows) {
      row.click();
    }

  } else {
    spanStuff.textContent = "unfold_more";

    const allRows = document.querySelectorAll("mat-row.tes-row-expanded");
    for (row of allRows) {
      row.click();
    }
  }  
}

function onError(error) {
  console.log(`Error: ${error}`);
}
