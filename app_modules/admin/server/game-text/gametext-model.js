/* eslint quotes: off, no-console:off */

import { GameText } from './../../../../collections/collections.js';
import _ from 'underscore';

function gameText() {
    var api = { insert, textType };

    /**
     * Inerting texts into db if they are nit already there
     * @return {[type]} [description]
     */
    function insert() {
        console.log('insert text started');
        var tt = textType();
        /* the idea of macros is to wrap certain parts of stored text into spans that can be edited with css */
        /* each macro is actually a function */
        var macros = { //move this client level. use a render text method for db text
            south_park: {text: "throwing money", url: "https://www.youtube.com/watch?v=wz-PtEJEaqY" }
        };
        var texts = [
            { tt: tt.finance_advertising, o: 1, v: 1, text: "Everyone you know is selling ads to stay afloat. You are wondering how much can you make by putting your cat on Youtube. But she looks grumpy, so you dismiss it."},
            { tt: tt.finance_advertising, o: 2, v: 1, text: "The phone bill might end up being bigger than your current budget, but ad sales have been great this week!"},
            { tt: tt.finance_advertising, o: 3, v: 1, text: "The corner shop ran out of energy drinks. Sales execs are doing overtime, but it pays."},
            { tt: tt.finance_advertising, o: 4, v: 1, text: "Everybody looking sharp, business as usual, sales are on graphic."},
            { tt: tt.finance_advertising, o: 5, v: 1, text: "Some of your sales people have been busy rewatching 'The Wolf of Wallstreet'. They'd do better if they'd have more pressure."},
            { tt: tt.finance_advertising, o: 6, v: 1, text: "Your sales team is on holiday. All those bonuses need to be spent somehow, right?"},
            { tt: tt.finance_advertising, o: 7, v: 1, text: "Rumors say there's a dragon guarding your bank account, as there is no tressure bigger than that. With this in mind, and after too much partying, your sales execs are taking no risks working."},

            { tt: tt.finance_sponsors, o: 1, v: 1, text: "You are unknown yet, but some sponsors decided to help, hoping you'd get big one day."},
            { tt: tt.finance_sponsors, o: 2, v: 1, text: "The season is young, sponsors know too little, so they're cautiously throwing money at all of you."},
            { tt: tt.finance_sponsors, o: 3, v: 1, text: "Sponsors are running away from you. Luckily you had some good lawyer making those contracts pay even in moments like these."},
            { tt: tt.finance_sponsors, o: 4, v: 1, text: "Nobody wants your sponsor's products, but not many want to sponsor your relegation fight, so you can't be picky. It's match made in heaven."},
            { tt: tt.finance_sponsors, o: 5, v: 1, text: "The sponsors would like to see more from you before pouring some serious cash."},
            { tt: tt.finance_sponsors, o: 6, v: 1, text: "You see a glimmer of excitement in your sponsors eyes. Their bet on the underdog can turn into a big payday. Keep up the good work."},
            { tt: tt.finance_sponsors, o: 7, v: 1, text: "You have more friends than ever. Success is a money magnet but you find yourself yelling 'SHOW ME THE MONEY' in awkward situations."},

            { tt: tt.arena_cheerleaders, o: 1, v: 1, text: "Cheerleaders? What cheerleaders? I can cheer you all myself"},
            { tt: tt.arena_cheerleaders, o: 2, v: 1, text: "You've kept telling those girls that less is more. So now they only know one move. The spectators are not impressed."},
            { tt: tt.arena_cheerleaders, o: 3, v: 1, text: "You've found the perfect balance between not paying much, but keeping those cheerleaders happy. Their costumes look a bit outdated though."},
            { tt: tt.arena_cheerleaders, o: 4, v: 1, text: "Your cheerleaders are known to be among the best. If your players would be as good, you'd take them straight out of Basketsim to NBA."},
            { tt: tt.arena_cheerleaders, o: 5, v: 1, text: "Maybe it's time to cut from that food expenses, some cheerleaders are not as flexible as they used to be."},
            { tt: tt.arena_cheerleaders, o: 6, v: 1, text: "If you'd have a dollar for every time you've seen the cheerleaders training, you'd still have no dollars, 'cos you're spending them all on them. Slow down."},
            { tt: tt.arena_cheerleaders, o: 7, v: 1, text: "Your wife wants a divorce and all your cheerleaders are out there partying with your money. Is this how you want your life to be?"},
            { tt: tt.arena_cheerleaders, o: 8, v: 1, text: "Hold your horses, you're not Dan Bilzerian! If you want your cheerleaders to actually attend the games, maybe stop buying each of them a new car each week?"}
        ];

        var currentTexts = GameText.find({}).fetch();

        texts.forEach(function (text) {
            let exists = _.findWhere(currentTexts, {
                tt: text.tt,
                o: text.o,
                v: text.v
            });

            if (!exists) GameText.insert(text);
        });
        console.log('insert text ended');
    }

    function textType() {
        var tt = {
            finance_advertising: 1,
            finance_sponsors: 2,
            arena_cheerleaders: 3
        };

        return tt;
    }

    return api;
}

export default gameText();

