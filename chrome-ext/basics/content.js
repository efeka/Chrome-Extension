console.log("Chrome extension go");

chrome.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(request, sender, sendResponse) {
	console.log(request.txt);
	if (request.txt === "hello") {
		const list = document.getElementById('MainContent_PanelInfo').getElementsByTagName('li');

		var element = list[0].innerText;
		var numberRegex = /\d+/;
		var numberIndex = element.match(numberRegex);

		var price = element.substring(numberIndex.index);
		alert(price);
	}
}