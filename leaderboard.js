/**
 * Created by stryk9 on 3/17/17.
 */
//Creates new Mongo Collection named players
PlayersList = new Mongo.Collection('players');

//Checks if code is running on client
if (Meteor.isClient) {

    Template.leaderboard.helpers({
        'player': function(){
            //Returns all players in Mongo PlayersList and sorts by score, then alphabet
            return PlayersList.find({}, {sort: {score: -1, name: 1}});
        },

        'selectedClass': function(){

            //declare local vars
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');

            if(playerId == selectedPlayer) {
                return "selected";
                }

        },

        'selectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne({_id: selectedPlayer});
        }
    });

    Template.leaderboard.events({

        'mouseenter .player':function(event) {
            if( $(event.target).hasClass('selected')){
                $(event.target).addClass('selectedHover');
            }

            else {
                $(event.target).addClass('hover');
            }
        },

        'mouseleave .player':function(event) {
            if( $(event.target).hasClass('selectedHover')) {
                $(event.target).removeClass('selectedHover');
            }
            else
            {
                $(event.target).removeClass('hover');
            }
        },

        'click .player': function(event) {
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);

            $(event.target).addClass('selectedHover');
            $(event.target).removeClass('hover');
            //console.log("mouse", event);



        },

        'click .increment': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({ _id: selectedPlayer}, {$inc: {score: 5}});
        },

        'click .decrement': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({ _id: selectedPlayer}, {$inc: {score: -5}});
        },

        'click .remove': function () {

            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.remove({_id: selectedPlayer});

        }


    });

    Template.addPlayerForm.events({
        'submit form': function (event) {
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            PlayersList.insert({name: playerNameVar, score: 0});
            event.target.playerName.value = "";



        }
    });
}

//checks if code is running on server
if (Meteor.isServer) {

}