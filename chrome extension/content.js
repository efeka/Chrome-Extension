chrome.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(request, sender, sendResponse) {
	if (request.txt === "checkPrice") {
		if (request.type === "fon") {
			// Fetch fon price from the current page
			const list = document.getElementById('MainContent_PanelInfo').getElementsByTagName('li');
			var element = list[0].innerText;

			var numberRegex = /\d+/;
			var numberIndex = element.match(numberRegex);
			var price = element.substring(numberIndex.index);

			// After fetching the price, send it back to the background script
			var msg = {
				txt: "fetchedFonData",
				price: price
			}
			chrome.runtime.sendMessage(msg);
		}
		else if (request.type === "hisse") {
			// Fetch hisse prices from the current page
			const tableRows = document.getElementById('DataTables_Table_0_wrapper').getElementsByTagName('tr');
			var hisseCodes = request.codes.sort();
			var fetchedResults = [];
			
			// Go through each row in the table
			for (var i = 2; i < tableRows.length; i++) {
				var rowData = tableRows[i].getElementsByTagName('td');
				var code = rowData[0].innerText.replace(/[^a-zA-Z]+/g, '');
				// Check if the code from the table matches any of the ones that are being searched
				// This has to be done in sort of an inefficient way because it is not guaranteed that
				// the user input would only include valid codes
				for (var j = 0; j < hisseCodes.length; j++) {
					if (code === hisseCodes[j]) {
						var price = rowData[1].innerHTML.replace(".", "");
						fetchedResults.push(code + " " + price);
						hisseCodes.splice(j, 1);
						break;
					}
					if (hisseCodes.length === 0)
						break;
				}
			}

			// After fetching the prices, send them back to the background script
			var msg = {
				txt: "fetchedHisseData",
				hisseResults: fetchedResults
			}
			window.alert("Bilinmeyen hisse kodları: " + hisseCodes);
			chrome.runtime.sendMessage(msg);
		}
	}
	else if (request.txt === "saveResults") {
		var finalFonResults = "";
		for (var i = 0; i < request.fonData.length; i++) {
			finalFonResults += request.fonData[i];
			if (i < request.fonData.length - 1) {
				finalFonResults += "*";
			}
		}

		var finalHisseResults = "";
		for (var i = 0; i < request.hisseData.length; i++) {
			finalHisseResults += request.hisseData[i];
			if (i < request.hisseData.length - 1) {
				finalHisseResults += "*";
			}
		}

		var fileName1 = "GuncelFonFiyatlari.txt";
		var fileName2 = "GuncelHisseFiyatlari.txt";
		saveData(finalFonResults, fileName1);
		saveData(finalHisseResults, fileName2);
	}	
}

var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data).replaceAll("\"", "").replaceAll("*", "_"),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
