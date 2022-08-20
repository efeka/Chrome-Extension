
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
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && canRun) {
		let msg = {
			txt: "checkPrice"
		}
		chrome.tabs.sendMessage(activeTabId, msg);     
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
 	if (msg.from == "content") {
 		contentTabId = sender.tab.id;
 		console.log(codes[codeIndex - 1] + " " + msg.price);
 		if (codeIndex < codes.length) {
			updateTab(activeTabId);   
 		}
 		else {
 			canRun = false;
 			codeIndex = 0;
 		}
	}
});
