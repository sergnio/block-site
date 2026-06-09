const input = document.getElementById("site");
const addBtn = document.getElementById("add");
const list = document.getElementById("list");

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

async function getSites() {
  const { blockedSites = [] } = await chrome.storage.sync.get("blockedSites");
  return blockedSites;
}

async function setSites(sites) {
  await chrome.storage.sync.set({ blockedSites: sites });
}

async function render() {
  const sites = await getSites();
  list.innerHTML = "";
  if (sites.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No sites blocked yet.";
    list.appendChild(li);
    return;
  }
  sites.forEach((domain) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = domain;
    const remove = document.createElement("button");
    remove.textContent = "\u00d7";
    remove.title = "Remove";
    remove.addEventListener("click", async () => {
      const next = (await getSites()).filter((d) => d !== domain);
      await setSites(next);
      render();
    });
    li.appendChild(span);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

async function addSite() {
  const domain = normalize(input.value);
  if (!domain) return;
  const sites = await getSites();
  if (!sites.includes(domain)) {
    sites.push(domain);
    await setSites(sites);
  }
  input.value = "";
  render();
}

addBtn.addEventListener("click", addSite);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addSite();
});

render();
