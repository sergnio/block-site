// Rebuilds the dynamic blocking rules from the stored list of domains.
async function updateRules() {
  const { blockedSites = [] } = await chrome.storage.sync.get("blockedSites");

  // Remove all existing dynamic rules first.
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((r) => r.id);

  // Build a new rule per blocked domain.
  const addRules = blockedSites.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ["main_frame"]
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });
}

chrome.runtime.onInstalled.addListener(updateRules);
chrome.runtime.onStartup.addListener(updateRules);

// Refresh rules whenever the stored list changes.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blockedSites) {
    updateRules();
  }
});
