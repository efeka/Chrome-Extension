
const mainURL = "https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=";
var codes = [];//["TCA", "TGE", "TBS", "ABC", "DEF"];
var codeIndex = 0;

var canRun = false;
var activeTabId;

var results = [];
var resultIndex = 0;

// Update the tab with the new URL
function updateTab() {
	var newURL = mainURL + codes[codeIndex++];
	var updateProperties = new Object();
	updateProperties.url = newURL;
	chrome.tabs.update(activeTabId, updateProperties);	
}

// Send message to content.js after the update is complete
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && canRun) {
		let msg = {
			txt: "checkPrice"
		}
		chrome.tabs.sendMessage(activeTabId, msg);     
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
	// Receive the message from content.js and update the tab with the next URL
 	if (msg.txt === "content") {
 		contentTabId = sender.tab.id;
 		results[resultIndex++] = codes[codeIndex - 1] + " " + msg.price;
 		if (codeIndex < codes.length) {
			updateTab(activeTabId);   
 		}
 		else {
			let msg = {
				txt: "saveResults",
				data: results
			}
			chrome.tabs.sendMessage(activeTabId, msg);   			
 			canRun = false;
 			codeIndex = 0;
 			resultIndex = 0;
 		}
	}
	else if (msg.txt === "popup") {
		// Receive message from popup.js and start running the program
		canRun = true;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var currTab = tabs[0];
			activeTabId = currTab.id;
		});
		chrome.storage.local.get("savedCodes", function(items) {
			codes = items.savedCodes;
			updateTab();
		});
	}
	else if (msg.txt === "popupOpened") {
		chrome.storage.local.get("savedCodes", function(items) {
			codes = items.savedCodes;
			var msg = {
				txt: "sendingCodes",
				data: codes
			}
			chrome.runtime.sendMessage(msg);
		});		
	}
	else if (msg.txt === "updateCodes") {
		codes = msg.codes;
		chrome.storage.local.set({savedCodes: codes});
	}
});
