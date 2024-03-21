function post_init() {

    $("#mode").val("classic");

}

function bot_classic() {

    $("#log").prepend("\n");
    $("#log").prepend("🤖");

    var target = null;

    var data_free = [];
    $("#board button:not(.activated)").each(function () {
        var index = $(this).index("button");
        data_free.push(index);
    });

    var data_x = [];
    $("#board button.x").each(function () {
        var index = $(this).index("button");
        data_x.push(index);
    });

    var data_o = [];
    $("#board button.o").each(function () {
        var index = $(this).index("button");
        data_o.push(index);
    });


    // WILL I WIN?

    if (target == null) {

        if (data_o.length > 0) {

            $.each(win_sequence, function (i, seq) {

                var intersect_o = seq.filter(value => data_o.includes(value));

                if (intersect_o.length == 2) {

                    var free_tiles = data_free.filter(value => seq.includes(value));
                    if (free_tiles.length > 0) {
                        target = free_tiles[0];
                        $("#log").prepend("\n");
                        $("#log").prepend("WINNING: " + target);
                    }

                }

            });

        }

    }


    // WILL HUMAN WIN?

    if (target == null) {

        $.each(win_sequence, function (i, seq) {

            var intersect_x = seq.filter(value => data_x.includes(value));

            if (intersect_x.length == 2) {

                var not_intersect_x = seq.filter(value => !data_x.includes(value));
                var free_tiles = data_free.filter(value => not_intersect_x.includes(value));

                if (free_tiles.length > 0) {
                    target = free_tiles[0]
                    $("#log").prepend("\n");
                    $("#log").prepend("DISRUPTING: " + target);
                }

            }

        });

    }

    // SELECT CENTER OR CORNERS

    if (target == null) {

        if (data_free.indexOf(4) > -1) {

            target = 4;
            $("#log").prepend("\n");
            $("#log").prepend("CENTER : " + target);

        } else {

            if (data_free.indexOf(0) > -1) {
                target = 0;
            } else if (data_free.indexOf(2) > -1) {
                target = 2;
            } else if (data_free.indexOf(6) > -1) {
                target = 6;
            } else if (data_free.indexOf(8) > -1) {
                target = 8;
            }

            $("#log").prepend("\n");
            $("#log").prepend("CORNER : " + target);

        }

    }

    // SELECT WHATEVER IS AVAILABLE

    if (target == null) {
        target = data_free[Math.floor(Math.random() * data_free.length)];
        $("#log").prepend("\n");
        $("#log").prepend("ANY : " + target);
    }

    $("#board button:eq(" + target + ")").click();



    // GOOD TO BEST
    // 1. IF THERE ARE NO OTHER TILES, GO FOR ANYTHING!
    // 2. GO FOR CORNER OR CENTER TILES
    // 3. IF OPPONENT IS ABOUT TO WIN, DISRUPT!
    // 4. IF YOU CAN WIN NOW, WIN!



}

function bot_gpt() {

    var data_current = [];

    $("#board button").each(function () {
        var text = $(this).text();
        if (text != "X" && text != "O") {
            text = null;
        }
        data_current.push(text);
    });


    const query = "Tell me O's next move for tic-tac-toe based on the following array. Return the output as an array index number. Do not say anything else. Only choose one of the null values. " + JSON.stringify(data_current);

    $("#log").prepend("\n");
    $("#log").prepend("You say: " + query);

    $.ajax({
        url: 'https://code.schoolofdesign.ca/api/openai/v1/chat/completions',
        crossDomain: true,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            'model': 'gpt-4-turbo-preview',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a tic-tac-toe playing machine. Do not speak in complete sentences. Only give me a number.'
                },
                {
                    'role': 'user',
                    'content': query
                }
            ]
        })
    }).done(function (response) {

        var reply = response.choices[0].message.content;

        $("#log").prepend("\n");
        $("#log").prepend("GPT says: " + reply);

        if (isNaN(reply) !== false) {
            // IGNORE IF NOT NUMBER
        } else {

            if ($("#board button:eq(" + reply + ")").hasClass("activated")) {

                alert("This tile is taken up already!");

            } else {

                $("#board button:eq(" + reply + ")").click();

            }

        }

    });


    $("#log").prepend("\n");
    $("#log").prepend("💬");

}