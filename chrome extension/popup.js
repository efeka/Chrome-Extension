var fonButtons = [];
var hisseButtons = [];

var selectedColor = '#22AAFF'
var deselectedColor = '#808080'

const Options = {
	Fon: 0,
	Hisse: 1
}
var selectedMode = Options.Hisse;

window.onload = function() {		
	let msg = {
		txt: "popupOpened"
	}
	chrome.runtime.sendMessage(msg);
	changeModeToHisseler();
};

document.addEventListener('DOMContentLoaded', function () {
    var buttonFetch = document.getElementById("fetchPrices");
    buttonFetch.addEventListener('click', sendMessageToBackground);

    var buttonAdd = document.getElementById("addCode");
    buttonAdd.addEventListener('click', addCodeToList);

    var buttonHisseler = document.getElementById("hisseler");
    buttonHisseler.addEventListener('click', changeModeToHisseler)

    var buttonFonlar = document.getElementById("fonlar");
    buttonFonlar.addEventListener('click', changeModeToFonlar)
});

function sendMessageToBackground() {
	var msg = {
		txt: "popup"
	}
	chrome.runtime.sendMessage(msg);
}

function addCodeToList() {
	// Format the space separated inputs and put them in an array
	var codes = document.getElementById("textArea").value.toUpperCase().trim().replace(/\s+/g, " ").split(" ").sort();
	document.getElementById("textArea").value = "";

	// Add the given codes as buttons to the appropriate list
	for (var i = 0; i < codes.length; i++) {
		if (codes[i].length >= 3) {
			if (selectedMode === Options.Fon)
				createButton(codes[i], Options.Fon);
			else if (selectedMode === Options.Hisse)
				createButton(codes[i], Options.Hisse);
		}
	}

	// Send the inputted codes to the background script so that they can be saved into the local storage
	var msg = {
		txt: "updateCodes",
		fonCodes: fonButtons,
		hisseCodes: hisseButtons
	}
	chrome.runtime.sendMessage(msg);	
}

// Receive codes from storage
chrome.runtime.onMessage.addListener(function(msg, sender) {
	if (msg.txt === "sendingCodes") {
		var fonCodes = msg.fonCodes;
		var hisseCodes = msg.hisseCodes;
		for (var i = 0; i < fonCodes.length; i++) {
			createButton(fonCodes[i], Options.Fon);
		}
		for (var i = 0; i < hisseCodes.length; i++) {
			createButton(hisseCodes[i], Options.Hisse);
		}
	}
});

function createButton(name, option) {
	var button = document.createElement("button");
	button.id = name;
	if (option === Options.Fon)
		fonButtons.push(button.id);
	else if (option === Options.Hisse)
		hisseButtons.push(button.id);

	button.innerHTML = '<i class=\"fa fa-close\"></i> ' + name;
	button.style.minWidth = "60px";
	button.style.maxWidth = "120px";
	button.style.minHeight = "25px";
	button.style.maxHeight = "50px";

	button.onclick = function(el) {
		for (var i = 0; i < fonButtons.length; i++) {
			if (fonButtons[i] === button.id) {
				fonButtons.splice(i, 1);
				document.getElementById("fonCodeList").removeChild(button);
				break;
			}
		}
		for (var i = 0; i < hisseButtons.length; i++) {
			if (hisseButtons[i] === button.id) {
				hisseButtons.splice(i, 1);
				document.getElementById("hisseCodeList").removeChild(button);
				break;
			}
		}
		var msg = {
			txt: "updateCodes",
			fonCodes: fonButtons,
			hisseCodes: hisseButtons
		}
		chrome.runtime.sendMessage(msg);
	}
	// sorun burda, default hisse seçildiği için storagedan gelenlerin hepsi hisseye konuluyor
	if (option === Options.Fon)
		document.getElementById("fonCodeList").appendChild(button);
	else if (option === Options.Hisse)
		document.getElementById("hisseCodeList").appendChild(button);
}

function changeModeToHisseler() {
	document.getElementById("hisseler").style.background = selectedColor;
	document.getElementById("fonlar").style.background = deselectedColor;
	document.getElementById("fonCodeList").style.display = "none";
	document.getElementById("hisseCodeList").style.display = "block";
	selectedMode = Options.Hisse;
}

function changeModeToFonlar() {
	document.getElementById("fonlar").style.background = selectedColor;
	document.getElementById("hisseler").style.background = deselectedColor;
	document.getElementById("fonCodeList").style.display = "block";
	document.getElementById("hisseCodeList").style.display = "none";
	selectedMode = Options.Fon; 
}
