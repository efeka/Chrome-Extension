
chrome.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(request, sender, sendResponse) {
	if (request.txt === "checkPrice") {
		const list = document.getElementById('MainContent_PanelInfo').getElementsByTagName('li');
		var element = list[0].innerText;

		var numberRegex = /\d+/;
		var numberIndex = element.match(numberRegex);
		var price = element.substring(numberIndex.index);

		var msg = {
			from: "content",
			price: price
		}
		chrome.runtime.sendMessage(msg);
	}
}
