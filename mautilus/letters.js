// Letters object - constructor
var Letters = function () {
    // Variable - total points
    this.points = 0;

    // Method - reset the game
    this.reset = function () {
        points = 0;
    };

    // Method - add point
    this.addPoint = function () {
        this.points += 1;
        $('#score').text(this.points);
    };

    // Method - take point
    this.subPoint = function () {
        this.points -= 1;
        $('#score').text(this.points);
    };

    this.stop = function () {
        console.log('Game ended, total points = ' + points);
    };

    this.init = function () {
        // Initialize board
        var w = $(document).width();
        var h = $(document).height();

        var mw = Math.ceil(0.9 * w);
        var mh = Math.ceil(0.9 * h);

        // Playable width
        this.pw = mw - 80;
        this.ph = mh;

        $('#board').css('height', mh);
        $('#board').css('width', mw);
    };
};

Letters.prototype.start = function () {
	for (var i=1; i <= 50; i++) {

        // Generate random div size + position + add to the board
        var ds = Math.floor((Math.random() * 20) + 20) * 2;
        var $element = $('<div class="letter" style="top: -' + ds + 'px; left: ' +  Math.floor((Math.random() * this.pw) + ds)  + 'px; width: ' + ds + 'px; height: ' + ds +'px;"/>');
        $element.appendTo("#board");

        // Random letter - create class from it and append it to the element
        var l = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 1);
        $element.addClass(l);
        var $l = $('<p style="text-align: center;">');
        $l.text(l);
        $l.appendTo($element);

		duration = Math.floor((Math.random() * (20000-15000)) + 15000); 
        timeout = 0 + Math.floor((Math.random() * (10000-250)) + 250);
		console.log(timeout);
		$element.delay(timeout).animate({ top: this.ph}, {
			duration: duration,
			easing: 'linear',
			complete: function() {
                game.subPoint();
				$(this).remove();
			}
		});
	}
}

$("#startstop").click(function () {
    game.start();
});

$(document).keypress(function (e) {
    // Pressed character
    var c = String.fromCharCode(e.which);

    // Check amount of letters on the board
    var lb = $("." + c);

    if (lb.length > 1)
    {
        // Add points + remove elements
        game.addPoint();
        lb.each(function () {
            $(this).remove();
        });
    }
    else
    {
        // Subtract points
        game.subPoint();
    }
});

// When document is ready for use
$(document).ready(function () {
    // Initialize new game
    game = new Letters();

    game.init();

    // Show the board
    $('#game').removeClass('hidden');
    $('#message').addClass('hidden');
});