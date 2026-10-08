var STORAGE_KEY = "shoppinglist.items";

var form = document.getElementById("addForm");
var input = document.getElementById("userinput");
var ul = document.getElementById("list");
var doneUl = document.getElementById("doneList");
var doneTitle = document.getElementById("doneTitle");
var empty = document.getElementById("empty");
var summary = document.getElementById("summary");
var greeting = document.getElementById("greeting");
var progressBar = document.getElementById("progressBar");
var chips = document.getElementById("chips");
var clearDone = document.getElementById("clearDone");

// Stichwort -> Emoji (erster Treffer gewinnt)
var EMOJIS = [
	["milch", "🥛"], ["käse", "🧀"], ["joghurt", "🥣"], ["butter", "🧈"],
	["brot", "🍞"], ["brötchen", "🥐"], ["toast", "🍞"], ["nudel", "🍝"], ["pasta", "🍝"],
	["reis", "🍚"], ["mehl", "🌾"], ["zucker", "🍬"], ["salz", "🧂"],
	["apfel", "🍎"], ["äpfel", "🍎"], ["banane", "🍌"], ["birne", "🍐"], ["zitrone", "🍋"],
	["orange", "🍊"], ["erdbeer", "🍓"], ["traube", "🍇"], ["kirsch", "🍒"], ["melone", "🍉"],
	["tomate", "🍅"], ["gurke", "🥒"], ["salat", "🥬"], ["spinat", "🥬"], ["brokkoli", "🥦"],
	["karotte", "🥕"], ["möhre", "🥕"], ["kartoffel", "🥔"], ["zwiebel", "🧅"], ["knoblauch", "🧄"],
	["paprika", "🫑"], ["pilz", "🍄"], ["avocado", "🥑"], ["mais", "🌽"],
	["hähnchen", "🍗"], ["huhn", "🍗"], ["fleisch", "🥩"], ["steak", "🥩"], ["hack", "🥩"],
	["wurst", "🌭"], ["schinken", "🥓"], ["speck", "🥓"], ["fisch", "🐟"], ["lachs", "🐟"],
	["kaffee", "☕"], ["tee", "🍵"], ["wasser", "💧"], ["saft", "🧃"], ["bier", "🍺"],
	["wein", "🍷"], ["cola", "🥤"], ["schoko", "🍫"], ["keks", "🍪"], ["kuchen", "🍰"],
	["torte", "🎂"], ["chips", "🥨"], ["pizza", "🍕"], ["honig", "🍯"],
	["öl", "🫒"], ["klopapier", "🧻"], ["toilettenpapier", "🧻"], ["küchenrolle", "🧻"],
	["seife", "🧼"], ["shampoo", "🧴"], ["zahnpasta", "🪥"], ["spül", "🧽"], ["waschmittel", "🧺"],
	["kerze", "🕯️"], ["batterie", "🔋"], ["blume", "💐"], ["hund", "🐶"], ["katze", "🐱"],
	// kurze Stichwörter zuletzt, damit z. B. "Wein" nicht als Ei erkannt wird
	["eis", "🍦"], ["ei", "🥚"]
];

var SUGGESTIONS = ["Milch", "Brot", "Eier", "Bananen", "Kaffee", "Käse", "Tomaten", "Nudeln", "Wasser", "Butter"];

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

function emojiFor(text) {
	var lower = text.toLowerCase();
	for (var i = 0; i < EMOJIS.length; i++) {
		if (lower.indexOf(EMOJIS[i][0]) !== -1) {
			return EMOJIS[i][1];
		}
	}
	return "🛍️";
}

function setGreeting() {
	var h = new Date().getHours();
	var text = h < 11 ? "Guten Morgen ☀️" : h < 18 ? "Hallo 👋" : "Guten Abend 🌙";
	var date = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
	greeting.textContent = text + " · " + date;
}

function buildItem(item, isNew) {
	var li = document.createElement("li");
	if (item.done) {
		li.classList.add("done");
	}
	if (isNew) {
		li.classList.add("pop");
	}

	var check = document.createElement("button");
	check.className = "check";
	check.setAttribute("aria-label", item.done ? "Als offen markieren" : "Als erledigt markieren");

	var icon = document.createElement("span");
	icon.className = "icon";
	icon.textContent = emojiFor(item.text);

	var text = document.createElement("span");
	text.className = "text";
	text.textContent = item.text;

	var del = document.createElement("button");
	del.className = "delete";
	del.setAttribute("aria-label", "Löschen");
	del.textContent = "✕";

	check.onclick = icon.onclick = text.onclick = function () { toggleItem(item.id, li); };
	del.onclick = function () { removeItem(item.id, li); };

	li.appendChild(check);
	li.appendChild(icon);
	li.appendChild(text);
	li.appendChild(del);
	return li;
}

function render(newId) {
	ul.innerHTML = "";
	doneUl.innerHTML = "";

	var open = items.filter(function (i) { return !i.done; });
	var done = items.filter(function (i) { return i.done; });

	open.forEach(function (item) { ul.appendChild(buildItem(item, item.id === newId)); });
	done.forEach(function (item) { doneUl.appendChild(buildItem(item, false)); });

	if (items.length) {
		summary.textContent = open.length === 0
			? "Alles im Wagen – super! 🎉"
			: open.length + (open.length === 1 ? " Artikel" : " Artikel") + " noch zu holen";
	} else {
		summary.textContent = "Deine Liste ist leer";
	}
	progressBar.style.width = (items.length ? Math.round(done.length / items.length * 100) : 0) + "%";

	empty.hidden = open.length > 0;
	doneTitle.hidden = done.length === 0;
	clearDone.hidden = done.length === 0;
	renderChips();
}

function renderChips() {
	chips.innerHTML = "";
	var existing = items.map(function (i) { return i.text.toLowerCase(); });
	SUGGESTIONS.filter(function (s) { return existing.indexOf(s.toLowerCase()) === -1; })
		.slice(0, 6)
		.forEach(function (s) {
			var chip = document.createElement("button");
			chip.type = "button";
			chip.className = "chip";
			chip.textContent = emojiFor(s) + " " + s;
			chip.onclick = function () { addItem(s); };
			chips.appendChild(chip);
		});
	chips.hidden = chips.children.length === 0;
}

function addItem(text) {
	var id = Date.now() + Math.random();
	items.push({ id: id, text: text, done: false });
	saveItems();
	render(id);
}

function toggleItem(id, li) {
	items.forEach(function (i) {
		if (i.id === id) {
			i.done = !i.done;
		}
	});
	saveItems();
	li.classList.add("leaving");
	setTimeout(render, 180);
}

function removeItem(id, li) {
	items = items.filter(function (i) { return i.id !== id; });
	saveItems();
	li.classList.add("leaving");
	setTimeout(render, 180);
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

setGreeting();
render();

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("sw.js");
}
