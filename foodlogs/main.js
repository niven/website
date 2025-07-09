const fake_loc = {
	"coords": {
		"longitude": 0,
		"latitude": 0,
		"accuracy": 0
	}
};

const allergen_map = {
	"E": "egg",
	"G": "gluten",
	"L": "lactose",
	"N": "nuts",
	"S": "shellfish"
};

let food_list, current_food, fn, fd, fa, fr, food_index, notes, ratings;
function init() {
	document.title = title;
	food_list = document.querySelector("#foods");
	fn = document.querySelector("#name");
	fd = document.querySelector("#description");
	fr = document.querySelector("#rating");
	notes = document.querySelector("#notes");
	ratings = document.querySelectorAll("#ratings li");
	
	for( const [key,value] of Object.entries(allergen_map) ) {
		allergen_map[key] = document.querySelector("#allergens #"+value);
	}

	const template = document.querySelector("#food");
	foods.forEach( f => {
		let li = template.content.cloneNode(true).querySelector("li");;
		li.id = `food_${f.id}`;
		li.value = f.id;
		li.appendChild( document.createTextNode(f.name) );
		food_list.appendChild( li );
	});

}
function toggle_current() {
	if( current_food ) {
		let food = document.querySelector("#food_" + current_food.id);
		food.setAttribute("class", food.getAttribute("class") == "selected" ? "" : "selected" );
	}
}
function select_food() {
	toggle_current();
	food_index = event.target.value;
	notes.value = "";
	check_rating("none");
	set_pin( null, null );

	current_food = foods.find( f => f.id == food_index );
	toggle_current();
	fn.textContent = current_food.name;
	fd.textContent = current_food.description;
	set_allergens(current_food.allergens);

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
	store( "rating", event.target.id );
	check_rating(event.target.id);
}

function check_rating(target) {
	ratings.forEach( r => r.setAttribute("class", r.id == target ? "check" : "") );
}

function set_allergens( str ) {
	for (const [key, value] of Object.entries(allergen_map)) {
		value.style.display = str.includes(key) ? "inline" : "none";
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
