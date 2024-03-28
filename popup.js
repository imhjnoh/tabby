await init();
await initTabs();

const tabColors = [
  "random",
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

const tabColorMap = {
  random: "FFC800",
  grey: "#DBDCE0",
  blue: "#8AB4F9",
  red: "#F38B82",
  yellow: "#FDD664",
  green: "#81CA95",
  pink: "#FF8BCC",
  purple: "#C58AFA",
  cyan: "#78D9ED",
  orange: "#FCAD70",
};

const today = new Date().toLocaleString();
document.getElementById("date").textContent = today;
setInterval(() => {
  const today = new Date().toLocaleString();
  document.getElementById("date").textContent = today;
}, 1000);
const defaultFavicon = chrome.runtime.getURL("images/icon-32.png");
const tabbyImage = chrome.runtime.getURL("images/icon-128.png");
const tabby = document.querySelector(".tabby");
tabby.src = tabbyImage;
let tabs;
let selectedTabs = [];

async function init() {
  tabs = await chrome.tabs.query({ currentWindow: true });
  selectedTabs = [];
}

const colorTemplate = document.getElementById("colors_option");
const colorElements = new Set();
for (const color of tabColors) {
  const element = colorTemplate.content.firstElementChild.cloneNode(true);
  element.textContent = color;
  element.style.background = color;
  colorElements.add(element);
}
const colorSelector = document.querySelector("select");
const colorChip = document.getElementById("color-chip");
colorSelector.append(...colorElements);
colorChip.style.before = tabColorMap[getColor()];
colorSelector.addEventListener("change", ({ target }) => {
  colorChip.style.backgroundColor = tabColorMap[target.value];
});

const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

async function initTabs() {
  const template = document.getElementById("li_template");
  const list = document.querySelector("ul");
  list.innerHTML = "";
  const elements = new Set();
  for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).host;
    const favicon = tab.favIconUrl;
    const groupId = tab.groupId;

    console.log(groupId);
    if (groupId > -1) {
      const group = await chrome.tabGroups.get(groupId);
      console.log(group);
      element.querySelector(".li_group_color").style.backgroundColor =
        tabColorMap[group.color];
    }
    element.querySelector(".title").textContent = title;
    element.querySelector(".title").title = title;
    element.querySelector(".icon").src =
      favicon != null && favicon != "" ? favicon : defaultFavicon;
    element.querySelector(".pathname").textContent = pathname;
    element
      .querySelector(".tab-checkbox")
      .addEventListener("change", ({ target }) => {
        updateTabList(tab.id, target.checked);
      });
    element.querySelector(".tab-checkbox").id = tab.id;
    element.querySelector(".li_btn").addEventListener("click", async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
  }
  list.append(...elements);
}

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
  const selectedColor = getColor();
  const color =
    selectedColor != "random"
      ? selectedColor
      : tabColors[Math.floor(Math.random() * tabColors.length - 1) + 1];
  const tabIds = [...selectedTabs];
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    const groupName = document.querySelector("#group-name-input").value;
    await chrome.tabGroups.update(group, {
      color,
      title: "🐱" + groupName ?? "Tabby",
    });
    await init();
    await initTabs();
  }
});

selectAllBtn.addEventListener("click", async () => {
  selectAllTabs();
});
deselectAllBtn.addEventListener("click", async () => {
  deselectAllTabs();
});
