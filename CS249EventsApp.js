Threads = new Mongo.Collection("threads");
Pages = new Mongo.Collection("pages");


if (Meteor.isClient) { //This code only runs on the client
    
 
    
	Template.body.helpers({
        homepage: function() {
            if (Pages.find().fetch().length != 0){
                return Pages.findOne().home;
            }
        },
        quickHelpPage: function() {
            if (Pages.find().fetch().length != 0){
                return Pages.findOne().quickHelp;
            }
        }
    });
    
    Template.body.events({
       "click #home": function() {
            var id = Pages.find().fetch()[0]._id;
            Pages.update(id, {$set: {home: true}});
           Pages.update(id, {$set: {quickHelp: false}});
       },
         "click #quickhelp": function() {
            var id = Pages.find().fetch()[0]._id;
            Pages.update(id, {$set: {home: false}});
           Pages.update(id, {$set: {quickHelp: true}});
       }
    });
    
    Template.quickHelp.helpers({
		threads: function () {
			return Threads.find({}, {sort: {createdAt: -1}});
		}
	});
	
    
	Template.quickHelp.events({
		"submit .new-thread": function(event){
			event.preventDefault(); //prevents default form submit
			var text = event.target.thread.value;
            var currentUserId = Meteor.userId();
            var currentUserName = Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
            var completeText = text + " - " + currentUserName;
			Threads.insert({
				text: completeText,
				createdAt: new Date(), // current time
                initialCreatedBy: currentUserId,
				responses: [],
				active: true,
//                user: this.userID;
			});
			event.target.thread.value = ""; //clear form
			//return false; //prevents default form submit, but won't work if error above
		}
	});
	
	Template.oneThread.helpers({
		responses: function() {
			var thisThread = Threads.find(this._id).fetch();
			return thisThread[0].responses;
		},
		active: function() {
			var thisThread = Threads.find(this._id).fetch();
			return thisThread[0].active;
		}
		
	});

	Template.oneThread.events({
		// "click .toggle-checked": function () {
			// // Set the checked property to the opposite of its current value
			// Threads.update(this._id, {$set: {checked: ! this.checked}});
		// },
		"click .delete": function () {
			Threads.remove(this._id);
		},
		"submit .new-response": function(event){
			event.preventDefault();
			var text = event.target.response.value;
            var currentUserId = Meteor.userId();
            var currentUserName = Meteor.user().profile.firstName;
            var completeText = text + " - " + currentUserName;
			Threads.update(this._id, {$push: {createdby: currentUserId, responses: completeText}});
			event.target.response.value = "";
		},
		"click .done": function() {
			Threads.update(this._id, {$set: {active: !this.active}});
		}
	});

	Accounts.ui.config({
		requestPermissions: {},
		extraSignupFields: [{
			fieldName: 'firstName',
			fieldLabel: 'First name',
			inputType: 'text',
			visible: true,
			validate: function(value, errorFunction) {
			  if (!value) {
				errorFunction("Please write your first name");
				return false;
			  } else {
				return true;
			  }
			}
		}, {
			fieldName: 'lastName',
			fieldLabel: 'Last name',
			inputType: 'text',
			visible: true,
		}, {
			fieldName: 'coordinator',
			fieldLabel: 'I am a coordinator',
			inputType: 'checkbox',
			visible: true,
			saveToProfile: true
		} ]
	});
}

if (Meteor.isServer) {
          if (Pages.find().fetch().length == 0) {
        Pages.insert({
            home: true, 
            quickHelp: false
        });
    }
 
}
