/**
 * Created by stryk9 on 3/17/17.
 */
//Creates new Mongo Collection named players
PlayersList = new Mongo.Collection('players');

Meteor.methods({

    'createPlayer': function (playerNameVar) {
        check(playerNameVar, String);
        var currentUserId = Meteor.userId();
        if(currentUserId) {
            PlayersList.insert({name: playerNameVar, score: 0, createdBy: currentUserId});
        }
    },

    'updateScore': function (selectedPlayer, scoreValue, selectedPlayerScore) {
        check(selectedPlayer, String);
        check(scoreValue, Number);
        var currentUserId = Meteor.userId();
        if(currentUserId && selectedPlayerScore.score > 0 && scoreValue === -5 || currentUserId && scoreValue === 5) {
            PlayersList.update({_id: selectedPlayer, createdBy: currentUserId}, {$inc: {score: scoreValue}});
        }
    },

    'removePlayer': function (selectedPlayer) {
        check(selectedPlayer, String);
        var currentUserId = Meteor.userId();
        if(currentUserId) {
            PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
        }
    }

});

//Checks if code is running on client
if (Meteor.isClient) {

    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        'player': function(){
            var currentUserId = Meteor.userId();
            //Returns all players in Mongo PlayersList and sorts by score, then alphabet
            return PlayersList.find({createdBy: currentUserId}, {sort: {score: -1, name: 1}});
        },

        'selectedClass': function(){

            //declare local vars
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');

            if(playerId === selectedPlayer) {
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
            var selectedPlayerScore = PlayersList.findOne({_id: selectedPlayer}, {fields: {'score':1}});
            Meteor.call('updateScore', selectedPlayer, 5, selectedPlayerScore);

        },

        'click .decrement': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            var selectedPlayerScore = PlayersList.findOne({_id: selectedPlayer}, {fields: {'score':1}});
            Meteor.call('updateScore', selectedPlayer, -5, selectedPlayerScore);
        },

        'click .remove': function () {

            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('removePlayer', selectedPlayer);

        }


    });

    Template.addPlayerForm.events({
        'submit form': function (event) {
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            Meteor.call('createPlayer', playerNameVar);
            event.target.playerName.value = "";



        }
    });
}

//checks if code is running on server
if (Meteor.isServer) {
    Meteor.publish('thePlayers', function () {
        var currentUserId = this.userId;
        return PlayersList.find({createdBy: currentUserId});

    });
}