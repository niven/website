const main_tmpl = `
	<div id="left" style="height: 90vh; overflow: auto;">
		<ul id="filter_labels" onclick="select_filter(); return false;">
		</ul>
		<template id="label">
	  		<li></li>
		</template>
		<ul id="foods" onclick="select_food(); return false;"></ul>
		<template id="food">
	  		<li></li>
		</template>
		<a href="#" id="cog" onclick="export_log(); return false;">⚙️</a>
	</div>

	<div id="content">
		<h1 id="name">Select food</h1>
		<ul id="food_labels">
		</ul>
		<p id="description">...</p>
		<ol id="ratings" onclick="rate(event);">
			<li id="r_0">🤢</li>
			<li id="r_1">😕</li>
			<li id="r_2">😐</li>
			<li id="r_3">🤤</li>
			<li id="r_4">😍</li>
		</ol>
		<textarea id="notes" onchange="save_note();" rows="5" placeholder="Where did you eat, what did you think?"></textarea>
		<div id="location">
			<div class="tap" href="#" id="pin" onclick="get_location(); return false;">📍 Save location</div>
			<div class="tap" id="maplink"></div>
		</div>
	</div>
`;

const fake_loc = {
	"coords": {
		"longitude": 0,
		"latitude": 0,
		"accuracy": 0
	}
};

const label_map = {
	"A": { "name": "alcohol", 	"icon": "🍷" },
	"B": { "name": "beef", 		"icon": "🐄" },
	"C": { "name": "chicken", 	"icon": "🐓" },
	"D": { "name": "duck", 		"icon": "🦆" },
	"E": { "name": "egg", 		"icon": "🥚" },
	"F": { "name": "fish", 		"icon": "🐟" },
	"G": { "name": "gluten", 	"icon": "🌾" },
	"L": { "name": "lactose", 	"icon": "🥛" },
	"M": { "name": "mutton", 	"icon": "🐑" },
	"N": { "name": "nuts", 		"icon": "🥜" },
	"P": { "name": "pork", 		"icon": "🐖" },
	"S": { "name": "shellfish", "icon": "🦐" },
	"X": { "name": "spicy", 	"icon": "🌶️" }
};

let food_list, food_labels, filter, filter_labels, current_food, fn, fd, fa, fr, food_index, notes, ratings;
function init() {
	document.title = title;

	const t = document.createElement('template');
    t.innerHTML = main_tmpl;
	document.querySelector("body").appendChild(t.content);

	filter_labels = document.querySelector("#filter_labels");
	food_list = document.querySelector("#foods");
	food_labels = document.querySelector("#food_labels");
	fn = document.querySelector("#name");
	fd = document.querySelector("#description");
	fr = document.querySelector("#rating");
	notes = document.querySelector("#notes");
	ratings = document.querySelectorAll("#ratings li");
	
	// Process all the labels:
	// - Create an item for the filter
	// - Add every label to the filter to initially show everything
	// - Cfreate an item in the content field so it can be turned on/off later
	const label_template = document.querySelector("#food");
	filter = {};
	for( const [key,value] of Object.entries(label_map) ) {
		filter[key] = true;

		let li = label_template.content.cloneNode(true).querySelector("li");
		li.id = `label_${key}`;
		li.appendChild( document.createTextNode(label_map[key].icon) );
		food_labels.appendChild( li );

		let filter_label = li.cloneNode(true);
		filter_label.id= `filter_label_${key}`;
		filter_label.setAttribute("label", key);
		filter_labels.appendChild( filter_label );
	}

	const template = document.querySelector("#food");
	foods.forEach( f => {
		let li = template.content.cloneNode(true).querySelector("li");
		li.id = `food_${f.id}`;
		li.value = f.id;
		if( retrieve(f.id, "rating") ) {
			li.classList.add("rated");
		}
		li.appendChild( document.createTextNode(f.name) );
		food_list.appendChild( li );
	});

}
function toggle_current() {
	if( current_food ) {
		let food = document.querySelector("#food_" + current_food.id);
		if( food.classList.contains("selected") ) {
			food.classList.remove("selected");
		} else {
			food.classList.add("selected");
		}
	}
}


function apply_filter() {
	const active_label_count = Object.keys(filter).filter( f => filter[f] ).length;
	foods.forEach( f => document.querySelector("#food_"+f.id).style.display = "none");
	// Must match ALL filters, so iterate over the foods
	foods.forEach( f => {
		const count = f.allergens.split("").reduce( (acc, cur) => filter[cur] ? acc+1 : acc, 0);
		if( count == active_label_count ) {
			document.querySelector("#food_" + f.id).style.display = "block";
		}
	});
}

function select_filter() {
	let filter_label_id = event.target.id;
	let element = document.querySelector( "#"+filter_label_id );

	if( element.classList.contains("on") ) {
		element.classList.remove("on");
		filter[element.getAttribute("label")] = false;
	} else {
		element.classList.add("on");
		// If nothing is selected, then we show everything.
		// In that case, first set everything to false
		if( !Object.values(filter).includes(false) ) {
			for( const key in filter ) {
				filter[key] = false;
			}
		}
		filter[element.getAttribute("label")] = true;
	}
	apply_filter();
}

function select_food() {
	document.querySelector("#content").style.display = "block";
	toggle_current();
	food_index = event.target.value;
	notes.value = "";
	check_rating("none");
	set_pin( null, null );

	current_food = foods.find( f => f.id == food_index );
	toggle_current();
	fn.textContent = current_food.name;
	fd.textContent = current_food.description;
	set_labels(current_food.allergens);

	let note = retrieve( food_index, "note" );
	if( note ) {
		notes.value = note;
	}
	let rating = retrieve( food_index , "rating" );
	if( rating ) {
		check_rating( rating );
	}
	let pos = JSON.parse(retrieve( food_index , "pos" ));
	if( pos ) {
		set_pin( pos.latitude, pos.longitude );
	}

}

function store( key, value ) {
	if( food_index ) {
		localStorage.setItem("f_" + food_index + "_" + key, value);
	}	
}
function retrieve( id, key ) {
	return localStorage.getItem( "f_" + id + "_" + key );
}

function save_note() {
	store( "note", notes.value );
}

function rate( event ) {
	if( food_index ) {
		document.querySelector("#food_" + food_index).classList.add("rated");
	}
	store( "rating", event.target.id );
	check_rating(event.target.id);
}

function check_rating(target) {
	ratings.forEach( r => r.setAttribute("class", r.id == target ? "check" : "") );
}

function set_labels( str ) {
	for (const key of Object.keys(label_map)) {
		document.querySelector("#label_" + key).style.display = str.includes(key) ? "inline" : "none";
	}
}

function export_log() {
	let result = [];
	foods.forEach( f => {
		let pos = JSON.parse(retrieve( f.id, "pos" ));
		if( pos == null ) {
			pos = fake_loc;
		}
		result.push( [f.id, retrieve( f.id, "rating" ), retrieve( f.id, "note" ), pos.latitude, pos.longitude, pos.accuracy ] );
	});
	navigator.clipboard.writeText( JSON.stringify(result) );
}


function get_location() {
    navigator.geolocation.getCurrentPosition(geo_ok, function(){ geo_ok(fake_loc); });
}

function set_pin(lat, lon) {
	let maplink = document.querySelector("#maplink");
	if( lat == null ) {
		document.querySelector("#pin").textContent = "📍 Save location";
		maplink.style.display = "none";
		return;
	}
	maplink.setAttribute("onclick", `window.open("http://maps.google.com/maps/place/${lat},${lon}",'_blank');`);
	maplink.textContent = `🌐 Open location`;
	maplink.style.display = "inline-block";

	document.querySelector("#pin").textContent = "📍 Update location";
}
function geo_ok(position) {
	let g = {
		"longitude": position.coords.longitude,
		"latitude": position.coords.latitude,
		"accuracy": Math.floor(position.coords.accuracy)
	};
	set_pin(g.latitude, g.longitude);
	store( "pos", JSON.stringify(g) );	
}
