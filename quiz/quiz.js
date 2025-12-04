const quizes = [];

let current_quiz, current_question;


function main() {

	const players = document.querySelector("#players");
	
	const quiz_select = document.querySelector("#quiz_selector");
	const template_quiz_item = document.querySelector("#template_quiz_item")
	quizes.forEach( q => {
		let item = template_quiz_item.content.cloneNode(true).querySelector("li");
		dom_text( item, q.name );
		item.setAttribute("quiz_id", q.id);
		quiz_select.appendChild( item );
	});

	// test();
}

function test() {
	render_quiz_by_id("ECO_000");
	add_player("Chris");
	add_player("Bharti");
	add_player("Vincent");
	add_player("Giel");
	add_player("Dirk");
	score_add( document.querySelector("#players").querySelector("li"), 10 );

}

function render_quiz() {
	render_quiz_by_id( event.target.getAttribute("quiz_id") );
}

function render_quiz_by_id( id ) {
	current_quiz = quizes.find( q => q.id == id );
	console.log(current_quiz);
	current_question = 0;

	render_current_question();

	document.querySelector("#quiz_selector").style.display = "none";
	document.querySelector("#qa").style.display = "flex";
}


function render_progress() {
	let stars = "⭐".repeat(current_quiz.questions[current_question].points);
	document.querySelector("#progress").innerText = `Question ${ current_question + 1 } / ${ current_quiz.questions.length } ${stars} `;
}

function render_current_question() {
	document.querySelector("#question").innerText = current_quiz.questions[current_question].question;
	document.querySelector("#answer").innerHTML = current_quiz.questions[current_question].answer;
	render_progress();
}

function question( distance ) {


	if( distance > 0  && (current_question + distance == current_quiz.questions.length) ) {
		return;
	}
	if( distance < 0  && current_question == 0 ) {
		return;
	}

	current_question += distance;

	render_current_question();
}

function add_player( name ) {
	const template_player = document.querySelector("#template_player");
	let new_player = template_player.content.cloneNode(true).querySelector("li");

	if( name != null ) {
		new_player.querySelector("input").value = name;
		recolor( new_player, name );
	}
	players.insertBefore( new_player, players.lastChild );
}

function recolor( element, name ) {
	let hue = 0;
	for( let i=0; i<name.length; i++) {
		hue += name.charCodeAt(i);
	}
	hue %= 360;
	element.style.backgroundColor = `hsl(${hue}, 50%, 70%)`;
}

function recolor_trigger() {
	recolor( event.target.parentElement, event.target.value );
}

function score_add_trigger( value ) {
	score_add( event.target.parentElement, value );
}

function score_add( element, value ) {
	element.setAttribute("score", value + parseInt(element.getAttribute("score")) );
	element.querySelector("span").innerText = element.getAttribute("score");
	// sort by score
	const ul = document.querySelector("#players");
	[...ul.children]
  		.sort((a, b) => parseInt(a.getAttribute("score")) < parseInt(b.getAttribute("score")) ? 1 : -1)
  		.forEach(node => ul.appendChild(node));
	console.log(ul);
}

function Q(question, answer, points = 1) {
	return {
		"question": question,
		"answer": answer,
		"points": points
	};
}


// utils
function dom_text( element, str ) {
	element.appendChild( document.createTextNode( str ) );
}