import { generateLuhnNumber } from "./services/NumberGenerator/index";

const rootContextMenu = {
  id: "root",
  title: "Generate CC",
  contexts: ["all"],
};

const amexContextMenu = {
  id: "amex",
  title: "Amex (copied)",
  parentId: "root",
  contexts: ["all"],
};
const discoverContextMenu = {
  id: "discover",
  title: "Discover (copied)",
  parentId: "root",
  contexts: ["all"],
};
const mastercardContextMenu = {
  id: "mastercard",
  title: "Mastercard (copied)",
  parentId: "root",
  contexts: ["all"],
};
const visaContextMenu = {
  id: "visa",
  title: "Visa (copied)",
  parentId: "root",
  contexts: ["all"],
};
const customContextMenu = {
  id: "custom",
  title: "Custom (copied)",
  parentId: "root",
  contexts: ["all"],
};

chrome.contextMenus.create(rootContextMenu);
chrome.contextMenus.create(amexContextMenu);
chrome.contextMenus.create(discoverContextMenu);
chrome.contextMenus.create(mastercardContextMenu);
chrome.contextMenus.create(visaContextMenu);
chrome.contextMenus.create(customContextMenu);

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId != "root") {
    const issuer = clickData.menuItemId;
    const test = generateLuhnNumber(123, 10);
    // getCCNumber(issuer, function (cardNumber) {
    //   addToValueToClipboard(cardNumber);
    // });
  }
});

export {};
