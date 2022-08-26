
var codes = [];
var codeIndex = 0;

var buttons = [];
var buttonsIndex = [];

window.onload = function() {		
	let msg = {
		txt: "popupOpened"
	}
	chrome.runtime.sendMessage(msg);
};

document.addEventListener('DOMContentLoaded', function () {
    var buttonFetch = document.getElementById("fetchPrices");
    buttonFetch.addEventListener('click', sendMessageToBackground);

    var buttonAdd = document.getElementById("addCode");
    buttonAdd.addEventListener('click', addCodeToList);
});

function sendMessageToBackground() {
	var msg = {
		txt: "popup"
	}
	chrome.runtime.sendMessage(msg);	
}

function addCodeToList() {
	var code = document.getElementById("textArea").value;
	document.getElementById("textArea").value = "";
	createButton(code);
	var msg = {
		txt: "updateCodes",
		codes: buttons
	}
	chrome.runtime.sendMessage(msg);		
}

// Receive codes from storage
chrome.runtime.onMessage.addListener(function(msg, sender) {
	if (msg.txt === "sendingCodes") {
		var codes = msg.data;
		for (var i = 0; i < codes.length; i++) {
			createButton(codes[i]);
		}
	}
});

function createButton(name) {
	var button = document.createElement("button");
	button.id = name;
	buttons.push(button.id);
	button.innerHTML = '<i class=\"fa fa-close\"></i> ' + name;
	button.style.minWidth = "60px";
	button.style.maxWidth = "120px";
	button.style.minHeight = "25px";
	button.style.maxHeight = "50px";
	button.onclick = function(el) {
		document.getElementById("codeList").removeChild(button);
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i] === button.id) {
				buttons.splice(i, 1);
				break;
			}
		}

		var msg = {
			txt: "updateCodes",
			codes: buttons
		}
		chrome.runtime.sendMessage(msg);		
	}

	document.getElementById("codeList").appendChild(button);
}
