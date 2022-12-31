// TODO: finishedHisse gereksiz olabilir
// TODO: sonuclari backgroundda degil contentte tutmak daha iyi olabilir

const fonMainURL = "https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=";
var fonCodes = [];
var fonResults = [];
var fonCodeIndex = fonResultIndex = 0;

const hisseMainURL = "https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/default.aspx";
var hisseCodes = [];

var finishedFon = false, finishedHisse = false;

var canRun = false;
var activeTabId;

// Update the tab with the new URL
function updateTab() {
	// Check fon prices first, hisse prices second
	if (!finishedFon) {
		var newURL = fonMainURL + fonCodes[fonCodeIndex++];
	}
	else if (!finishedHisse) {
		var newURL = hisseMainURL;
	}

	// If all prices are not checked yet, update the tab with a new URL
	if (!finishedFon || !finishedHisse) {
		var updateProperties = new Object();
		updateProperties.url = newURL;
		chrome.tabs.update(activeTabId, updateProperties);	
	}
}

// Send message to content.js after the update is complete
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && canRun) {
    	if (!finishedFon) {
	    	let msg = {
				txt: "checkPrice",
				type: "fon"
			}
			chrome.tabs.sendMessage(activeTabId, msg);
    	}
    	else if (!finishedHisse) {
	    	let msg = {
				txt: "checkPrice",
				type: "hisse",
				codes: hisseCodes
			}
			chrome.tabs.sendMessage(activeTabId, msg); 
    	}
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
	if (msg.txt === "fetchedFonData") {
		// Receive the message from content.js and update the tab with the next URL
 		contentTabId = sender.tab.id;
 		fonResults[fonResultIndex++] = fonCodes[fonCodeIndex - 1] + " " + msg.price;

 		// If there are more fons to check, keep updating the tab with the new URL
 		if (fonCodeIndex < fonCodes.length) {
			updateTab(activeTabId);
 		}
 		else {
 			// If all fons are checked, check hisse prices next
 			finishedFon = true;
 			updateTab(activeTabId);
 		}
	}
	else if (msg.txt === "fetchedHisseData") {
		// After checking all fon and hisse prices, send a message to content.js to save them in a file
		let newMsg = {
			txt: "saveResults",
			fonData: fonResults,
			hisseData: msg.hisseResults
		}
		chrome.tabs.sendMessage(activeTabId, newMsg);   			
	 	canRun = false;
	 	fonCodeIndex = 0;
	 	fonResultIndex = 0; 
	 	finishedFon = finishedHisse = false;
	}
	else if (msg.txt === "popup") {
		// Receive message from popup.js and start running the program
		canRun = true;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var currTab = tabs[0];
			activeTabId = currTab.id;
		});
		chrome.storage.local.get("savedCodes", function(items) {
			var storedCodes = items.savedCodes;
			var pivot = storedCodes.indexOf("*");
			fonCodes = storedCodes.slice(0, pivot);
			hisseCodes = storedCodes.slice(pivot + 1);
			updateTab();		
		});
	}
	else if (msg.txt === "popupOpened") {
		/* To clear local storage
		chrome.storage.local.remove(["savedHisseCodes","savedFonCodes"],function(){
		 var error = chrome.runtime.lastError;
		    if (error) {
		        console.error(error);
		    }
		})
		*/		
		// Retrieve saved codes from storage when user clicks on the popup
		chrome.storage.local.get("savedCodes", function(items) {
			var storedCodes = items.savedCodes;
			var pivot = storedCodes.indexOf("*");
			fonCodes = storedCodes.slice(0, pivot);
			hisseCodes = storedCodes.slice(pivot + 1);

			var msg = {
				txt: "sendingCodes",
				fonCodes: fonCodes,
				hisseCodes: hisseCodes
			}
			chrome.runtime.sendMessage(msg);
		});		
	}
	else if (msg.txt === "updateCodes") {
		// Save codes to chrome storage
		fonCodes = msg.fonCodes;
		hisseCodes = msg.hisseCodes;
		var arrayToStore = fonCodes.push("*");
		arrayToStore = fonCodes.concat(hisseCodes);
		fonCodes.pop("*");
		chrome.storage.local.set({savedCodes: arrayToStore});		
	}
});
