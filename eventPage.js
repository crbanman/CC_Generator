var rootContextMenu = {
    "id": "root",
    "title": "Generate CC",
    "contexts": ["all"],
}

var amexContextMenu = {
    "id": "amex",
    "title": "Amex (copied)",
    "parentId": "root",
    "contexts": ["all"]
}
var discoverContextMenu = {
    "id": "discover",
    "title": "Discover (copied)",
    "parentId": "root",
    "contexts": ["all"]
}
var mastercardContextMenu = {
    "id": "mastercard",
    "title": "Mastercard (copied)",
    "parentId": "root",
    "contexts": ["all"]
}
var visaContextMenu = {
    "id": "visa",
    "title": "Visa (copied)",
    "parentId": "root",
    "contexts": ["all"]
}
var customContextMenu = {
    "id": "custom",
    "title": "Custom (copied)",
    "parentId": "root",
    "contexts": ["all"]
}
chrome.contextMenus.create(rootContextMenu);
chrome.contextMenus.create(amexContextMenu);
chrome.contextMenus.create(discoverContextMenu);
chrome.contextMenus.create(mastercardContextMenu);
chrome.contextMenus.create(visaContextMenu);
chrome.contextMenus.create(customContextMenu);

chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId != "root") {
        var issuer = clickData.menuItemId;
        getCCNumber(issuer, function (cardNumber) {
            addToValueToClipboard(cardNumber);
        });
    }
});
