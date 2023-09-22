var button = document.getElementById("enter");
var input = document.getElementById("userinput");
var ul = document.querySelector("ul");
var div = document.querySelector("div");
var li = document.querySelector("li");

function inputLength() {
	return input.value.length;
}

function createListElement() {
	var div = document.createElement("div");
	var li = document.createElement("li");
	li.appendChild(document.createTextNode(input.value));
	ul.appendChild(li);
	input.value = "";

var button = document.createElement("button");
	button.appendChild(document.createTextNode("Done!"));
	li.appendChild(button);
	button.onclick=underlineParent;

var button = document.createElement("button");
	button.appendChild(document.createTextNode("Delete!"));
	li.appendChild(button);
	button.onclick=removeParent;
}

function underlineParent(event) {
	event.target.parentNode.classList.toggle("done");
}

function removeParent(event) {
	event.target.parentNode.remove();
}

function toggleAfterClick() {
	document.querySelector("li").classList.toggle("done");
}

function addListAfterClick() {
	if (inputLength() > 0) {
		createListElement();
	}
}

function addListAfterKeypress(event) {
	if (inputLength() > 0 && event.keyCode === 13) {
		createListElement();
	}
}

button.addEventListener("click", addListAfterClick);

li.addEventListener("click", toggleAfterClick);

input.addEventListener("keypress", addListAfterKeypress);