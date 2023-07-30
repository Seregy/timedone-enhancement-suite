# Timedone Enhancement Suite

An unofficial browser extension that enhances the Timedone interface. Designed to add additional features and fix some small inconveniences that haven't been resolved yet in the original web application.

## Install

### Firefox

Download and install the `.xpi` file from the [latest extension release](https://github.com/Seregy/timedone-enhancement-suite/releases/latest/). 
It's signed by Mozilla and will be updated automatically.

Please note that Firefox doesn't grant the necessary permissions to modify the pages' content upon installing the extension. You'll need to either temporarily grant them each time you visit Timedone or assign them once on a permanent basis.

### Chrome

This extension is available in the [Chrome Web Store](https://chrome.google.com/webstore/detail/apbfnmaechldmmpifmoojldifceehiin).

## Features

### Expand all button

Adds a new [expand/collapse all button](docs/assets/expand-collapse.png?raw=1) that opens or closes all group rows on the page in one click.

### Footer display fix

Adjusts the way the footer element is [displayed on the page](docs/assets/footer.png?raw=1) by removing its background and preventing it from overlapping the last entry on the page.

### Project autoselect bugfix

Fixes the bug with the "Add new entry" modal window not selecting the project by default.

This issue may appear when the web application attempts to load the last created log entry from the storage and fill in the values. The extension attempts to properly pick the last used project if it detects that the selection element is empty.

Disabled by default, consider turning it on if you do experience issues with the project selection.

### Extended projects time summary

Extends the original projects' time summary modal window. Displays individual log entries for each project and allows grouping them by defining a regular expression to extract the group key.

Provided regular expression must contain exactly one capturing group, which will be used to extract the grouping key. All log entries sharing the same extracted value will be placed in one group. If a log entry doesn't match the provided regex, it will be placed in the default group. If no regular expression is provided, all log entries will be placed in the default group.

Specifying the group key extraction pattern allows grouping multiple entries by a [common keyword](docs/assets/projects-time/group-keyword.png?raw=1), [suffix](docs/assets/projects-time/group-suffix.png?raw=1), or the [whole description](docs/assets/projects-time/group-full-match.png?raw=1).
Extraction patterns are specified and stored separately for each project.