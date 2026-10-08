var STORAGE_KEY = "shoppinglist.items";

var form = document.getElementById("addForm");
var input = document.getElementById("userinput");
var ul = document.getElementById("list");
var empty = document.getElementById("empty");
var summary = document.getElementById("summary");
var clearDone = document.getElementById("clearDone");

var items = loadItems();

function loadItems() {
	try {
		var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
		if (Array.isArray(saved)) {
			return saved;
		}
	} catch (e) {}
	return [];
}

function saveItems() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch (e) {}
}

function render() {
	ul.innerHTML = "";

	// Offene Artikel zuerst, erledigte ans Ende
	var sorted = items.filter(function (i) { return !i.done; })
		.concat(items.filter(function (i) { return i.done; }));

	sorted.forEach(function (item) {
		var li = document.createElement("li");
		if (item.done) {
			li.classList.add("done");
		}

		var check = document.createElement("button");
		check.className = "check";
		check.setAttribute("aria-label", item.done ? "Als offen markieren" : "Als erledigt markieren");
		check.onclick = function () { toggleItem(item.id); };

		var text = document.createElement("span");
		text.className = "text";
		text.textContent = item.text;
		text.onclick = function () { toggleItem(item.id); };

		var del = document.createElement("button");
		del.className = "delete";
		del.setAttribute("aria-label", "Löschen");
		del.textContent = "✕";
		del.onclick = function () { removeItem(item.id); };

		li.appendChild(check);
		li.appendChild(text);
		li.appendChild(del);
		ul.appendChild(li);
	});

	var open = items.filter(function (i) { return !i.done; }).length;
	var doneCount = items.length - open;
	summary.textContent = items.length ? open + " offen · " + doneCount + " erledigt" : "";
	empty.hidden = items.length > 0;
	clearDone.hidden = doneCount === 0;
}

function addItem(text) {
	items.push({ id: Date.now() + Math.random(), text: text, done: false });
	saveItems();
	render();
}

function toggleItem(id) {
	items.forEach(function (i) {
		if (i.id === id) {
			i.done = !i.done;
		}
	});
	saveItems();
	render();
}

function removeItem(id) {
	items = items.filter(function (i) { return i.id !== id; });
	saveItems();
	render();
}

form.addEventListener("submit", function (event) {
	event.preventDefault();
	var text = input.value.trim();
	if (text.length > 0) {
		addItem(text);
		input.value = "";
	}
	input.focus();
});

clearDone.addEventListener("click", function () {
	items = items.filter(function (i) { return !i.done; });
	saveItems();
	render();
});

render();

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("sw.js");
}
