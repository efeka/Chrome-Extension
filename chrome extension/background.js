
var codes = ["YSF", "TTA", "GAN", "IBE"];
var codeIndex = 0;
var mainURL = "https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=";
var canRun = false;
var activeTabId;

function updateTab() {
	var newURL = mainURL + codes[codeIndex++];
	var updateProperties = new Object();
	updateProperties.url = newURL;
	chrome.tabs.update(activeTabId, updateProperties);	
}

// Handle button click
chrome.action.onClicked.addListener(function(tab) {
	canRun = true;
	activeTabId = tab.id;
	updateTab();
	/*
	for (var i = 0; i < codes.length; i++) {
		var newURL = mainURL + codes[i];
		var updateProperties = new Object();
		updateProperties.url = newURL;
		console.log("update start");
		chrome.tabs.update(tab.id, updateProperties);		
	}
	*/
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && canRun) {
    	console.log("update complete");
		let msg = {
			txt: "checkPrice"
		}
		chrome.tabs.sendMessage(activeTabId, msg);     
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
 	if (msg.from == "content") {
 		contentTabId = sender.tab.id;
 		console.log("received price: " + msg.price);
 		if (codeIndex < codes.length)
			updateTab(activeTabId);   
	}
});
