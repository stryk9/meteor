/**
 * Created by g77210 on 6/23/2017.
 */
//Shared Functions
Todos = new Meteor.Collection('todos');
Lists = new Meteor.Collection('lists');
//Routing
Router.configure({
    layoutTemplate: 'main'
});
Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/register');
Router.route('/login');
Router.route('/list/:_id', {
    name: 'listPage',
    template: 'listPage',
    data: function () {
        var currentList = this.params._id;
        var currentUser = Meteor.userId();
        return Lists.findOne({_id: currentList, createdBy: currentUser});
    },

    onBeforeAction: function () {
        var currentUser = Meteor.userId();
        if (currentUser) {
            this.next();
        } else {
            this.render("login");
        }
    }

});

if (Meteor.isClient) {

    $.validator.setDefaults({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "You must enter an email address.",
                email: "You've entered an invalid email address."
            },
            password: {
                required: "You must enter a password.",
                minlength: "Your password must be at least {0} characters."
            }
        }
    });

    Template.todos.helpers({
        /***
         *
         * @returns {Cursor}
         */
        'todo': function () {
            var currentUser = Meteor.userId();
            var currentList = this._id;
            return Todos.find({listId: currentList, createdBy: currentUser}, {sort: {createdAt: -1}});
        },


    });

    Template.todos.events({
        /***
         *
         * @param event
         */
        'click .delete-todo': function (event) {
            event.preventDefault();

            let documentId = this._id;
            let confirm = window.confirm("Delete this task?");

            if (confirm) {
                Todos.remove({_id: documentId});
            }

        },
        /***
         * Event for inline editing of Todo Items
         * @param event
         */
        'keyup [name=todoItem]': function (event) {

            if (event.which === 13 || event.which === 27) {
                $(event.target).blur();
            }
            else {
                let documentId = this._id;
                let todoItem = $(event.target).val();
                Todos.update({_id: documentId}, {$set: {name: todoItem}});

            }

        },
        /***
         *
         */
        'change [type=checkbox]': function () {
            var documentId = this._id;
            var isCompleted = this.completed;
            if (isCompleted) {
                Todos.update({_id: documentId}, {$set: {completed: false}});
                console.log("changed to false");
            }
            else {
                Todos.update({_id: documentId}, {$set: {completed: true}});
                console.log("changed to true");
            }

        }


    });

    Template.todoItem.helpers({
        'checked': function () {

            var isCompleted = this.completed;

            if (isCompleted) {
                return "checked";
            }
            else {
                return "";
            }
        }


    });

    Template.addTodo.events({
        'submit form': function (event) {
            event.preventDefault();
            let todoName = $('[name="todoName"]').val();
            let currentUser = Meteor.userId();
            let currentList = this._id;
            Todos.insert({
                name: todoName,
                completed: false,
                createdAt: new Date(),
                createdBy: currentUser,
                listId: currentList
            });

            $('[name="todoName"]').val('');
        }
    });

    Template.todosCount.helpers({
        'totalTodos': function () {
            let currentList = this._id;
            return Todos.find({listId: currentList}).count();
        },

        'completedTodos': function () {
            let currentList = this._id;
            return Todos.find({listId: currentList, completed: true}).count();
        }
    });

    Template.lists.helpers({
        'list': function () {
            let currentUser = Meteor.userId();
            return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
        }
    });

    Template.addList.events({
        /***
         * addList Form Submit event
         * @param event
         */
        'submit form': function (event) {
            event.preventDefault();
            var listName = $('[name=listName]').val();
            var currentUser = Meteor.userId();
            Lists.insert({
                    name: listName,
                    createdBy: currentUser
                },
                /***
                 * Callback function to return the ID of the list after it is inserted
                 * @param error
                 * @param results
                 */
                function (error, results) {
                    Router.go('listPage', {_id: results});
                });
            $('[name=listName]').val("");
        }
    });

    Template.register.events({
        'submit form': function (event) {
            event.preventDefault();
            /*
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function (error) {
                if (error) {
                    console.log(error.reason);
                }
                else {
                    Router.go('home');
                }
            });
*/
        }
    });

    Template.register.onRendered(function(){
        var validator = $('.register').validate({
            submitHandler: function(event) {

                 var email = $('[name=email]').val();
                 var password = $('[name=password]').val();
                 Accounts.createUser({
                 email: email,
                 password: password
                 }, function (error) {
                     if(error){
                         if(error.reason === "Email already exists."){
                             validator.showErrors({
                                 email: "That email already belongs to a registered user."
                             });
                         }
                     }

                     else {
                 Router.go('home');
                 }
                 });
            }
        });
    });

    Template.navigation.events({
        'click .logout': function (event) {
            event.preventDefault();
            Meteor.logout();
            Router.go('login');

        }
    });

    Template.login.onRendered(function(){
        console.log("The 'login' template was just rendered.");
        var validator = $('.login').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                Meteor.loginWithPassword(email, password, function (error) {
                    if (error) {
                        if(error.reason === "User not found") {
                            validator.showErrors({
                                email: "That email doesn't belong to a registered user."
                            });
                        }
                        if(error.reason === "Incorrect password") {
                            validator.showErrors({
                                password: "You entered an incorrect password."
                            });
                        }


                    }
                    else {
                        var currentRoute = Router.current().route.getName();
                        if(currentRoute == "login"){
                            Router.go('home');
                        }

                    }
                });

            }
        });
    });

    Template.login.events({

        'submit form': function (event) {
            event.preventDefault();
            /*
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function (error) {
                if (error) {
                    console.log(error.reason);
                }
                else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login"){
                        Router.go('home');
                    }

                }
            });*/
        }
    });
}

if (Meteor.isServer) {

}