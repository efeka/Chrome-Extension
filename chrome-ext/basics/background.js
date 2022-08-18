console.log('background xD');

chrome.action.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
	let msg = {
		txt: "hello"
	}
	chrome.tabs.sendMessage(tab.id, msg);
}