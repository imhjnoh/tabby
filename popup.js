const today = new Date().toString();
document.getElementById("date").textContent = today;
setInterval(() => {
  const today = new Date().toString();
  document.getElementById("date").textContent = today;
}, 1000);

const tabs = await chrome.tabs.query({ currentWindow: true });
let selectedTabs = [];
const tabColors = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

const colorTemplate = document.getElementById("colors_option");
const colorElements = new Set();
for (const color of tabColors) {
  const element = colorTemplate.content.firstElementChild.cloneNode(true);
  console.log(color, element.querySelector(".color_option"));
  element.textContent = color;
  element.style.color = color;
  colorElements.add(element);
}
document.querySelector("select").append(...colorElements);

const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
console.log(tabs);
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const pathname = new URL(tab.url).host;

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element
    .querySelector(".tab-checkbox")
    .addEventListener("change", ({ target }) => {
      updateTabList(tab.id, target.checked);
    });
  element.querySelector(".tab-checkbox").id = tab.id;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector("ul").append(...elements);

function updateTabList(tabId, checked) {
  if (checked === true) {
    if (!selectedTabs.includes(tabId)) {
      selectedTabs.push(tabId);
    }
  } else {
    if (selectedTabs.includes(tabId)) {
      selectedTabs = selectedTabs.filter((selectedId) => selectedId !== tabId);
    }
  }
}

function selectAllTabs() {
  selectedTabs = [...tabs.map(({ id }) => id)];
  selectedTabs.forEach((tabId) => {
    document.getElementById(tabId).checked = true;
  });
}
function deselectAllTabs() {
  selectedTabs = [];
  tabs.forEach(({ id }) => {
    document.getElementById(id).checked = false;
  });
}
function getColor() {
  return document.getElementById("colors").value;
}

const button = document.querySelector("button");
const selectAllBtn = document.getElementById("select-all");
const deselectAllBtn = document.getElementById("deselect-all");

button.addEventListener("click", async () => {
  console.log(selectedTabs);
  const color = getColor();
  const tabIds = [...selectedTabs];
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    const groupName = document.querySelector("#group-name-input").value;
    await chrome.tabGroups.update(group, { color, title: groupName ?? "DOCS" });
  }
});

selectAllBtn.addEventListener("click", async () => {
  selectAllTabs();
});
deselectAllBtn.addEventListener("click", async () => {
  deselectAllTabs();
});
