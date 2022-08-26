
chrome.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(request, sender, sendResponse) {
	if (request.txt === "checkPrice") {
		const list = document.getElementById('MainContent_PanelInfo').getElementsByTagName('li');
		var element = list[0].innerText;

		var numberRegex = /\d+/;
		var numberIndex = element.match(numberRegex);
		var price = element.substring(numberIndex.index);

		var msg = {
			txt: "content",
			price: price
		}
		chrome.runtime.sendMessage(msg);
	}
	else if (request.txt === "saveResults") {
		var results = "";
		for (var i = 0; i < request.data.length; i++) {
			results += request.data[i];
			if (i < request.data.length - 1) {
				results += "*";
			}
		}

		var formattedResult = { result: results }
		var fileName = "TefasRecentPrices.txt";
		saveData(results, fileName);
	}	
}

var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data).replaceAll("\"", "").replaceAll("*", "\n").replaceAll(",", "."),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
