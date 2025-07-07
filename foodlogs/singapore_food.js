const title = "Singapore";
const foods = [
	{
		"id": "10",
		"name": "Orh Luak",
		"description": "Oyster omelette",
		"allergens": "EGS"
	},
	{
		"id": "11",
		"name": "Kuey Pai Teh",
		"description": "Crunchy thing with veg inside",
		"allergens": "G"
	},
	{
		"id": "12",
		"name": "Ya Kun",
		"description": "Chain of breakfast shops. Very crispy toast with butter inside",
		"allergens": "GL"
	},

].sort( (a,b) => a.name.localeCompare(b.name) );