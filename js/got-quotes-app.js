let counter = 0;
const quotes  = [
    ["The man who passes the sentence should swing the sword.", "Eddard Stark"],
    ["The things I do for love.", "Jaime Lannister"],
    ["The next time you raise a hand to me will be the last time you have hands!", "The Khaleesi"],
    ["It's the family name that lives on. It's all that lives on.", "Tywin Lannister"],
    ["When you play the game of thrones, you win or die.", "Cersei Lannister"],
    ["A girl gives a man his own name?","Jaqen H'ghar"],
    ["Burn them all!", "The Mad King"],
    ["Chaos isn't a pit. Chaos is a ladder.", "Littlefinger"],
    ["You know nothing Jon Snow.", "Ygritte"]
];

function changeColor() {
    const $bodyGrab =  $(".box");
    const $quoteButtonGrab = $(".newQuoteButton");
    if(counter===9) { counter = 0; }
    switch(counter) {
        case 0:
            $bodyGrab.css("background-color", "Blue");
            $quoteButtonGrab.css("background-color", "Orange");
            break;
        case 1:
            $bodyGrab.css("background-color", "Yellow");
            $quoteButtonGrab.css("background-color", "Red");
            break;
        case 2:
            $bodyGrab.css("background-color", "Red");
            $quoteButtonGrab.css("background-color", "Gold");
            break;
        case 3:
            $bodyGrab.css("background-color", "BurlyWood");
            $quoteButtonGrab.css("background-color", "Grey");
            break;
        case 4:
            $bodyGrab.css("background-color", "DarkTurquoise");
            $quoteButtonGrab.css("background-color", "Red");
            break;
        case 5:
            $bodyGrab.css("background-color", "Gold");
            $quoteButtonGrab.css("background-color", "DarkTurquoise");
            break;
        case 6:
            $bodyGrab.css("background-color", "Moccasin");
            $quoteButtonGrab.css("background-color", "Green");
            break;
        case 7:
            $bodyGrab.css("background-color", "Peru");
            $quoteButtonGrab.css("background-color", "Pink");
            break;
        case 8:
            $bodyGrab.css("background-color", "SaddleBrown");
            $quoteButtonGrab.css("background-color", "Orange");
            break;
    }
    counter++;
}


$(document).ready(function() {

	$("#newQuote").on("click", function() {
		$(".quoteBox")
			.stop(true, true)
			.animate({opacity: 0}, 100, function() {
				$(".quoteBox").text(quotes[counter][0]);
			})
			.animate({opacity: 1}, 1500);
		$(".authorBox")
			.stop(true, true)
			.animate({opacity: 0}, 100, function() {
				$(".authorBox").text(quotes[counter][1]);
			})
			.animate({opacity: 1}, 2500);

		changeColor();
	});
});
