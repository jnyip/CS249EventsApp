Threads = new Mongo.Collection("threads");
Pages = new Mongo.Collection("pages");
Events = new Mongo.Collection("events");
Calendar = new Mongo.Collection("calendar");

if (Meteor.isClient) { //This code only runs on the client
	Template.body.helpers({
        homePage: function() {
            if (Pages.find().fetch().length != 0){
                return Pages.findOne().home;
            }
        },
        quickHelpPage: function() {
            if (Pages.find().fetch().length != 0){
                return Pages.findOne().quickHelp;
            }
        },
        schedulePage: function() {
            if (Pages.find().fetch().length != 0){
                return Pages.findOne().schedule;
            }
        },
		manageEventsPage: function() {
			if (Pages.find().fetch().length != 0){
                return Pages.findOne().manageEvents;
            }
		}
    });
    
    Template.body.events({
       "click #home": function() {
			var id = Pages.findOne()._id;
			Pages.update(id, {$set: {home: true}});
			Pages.update(id, {$set: {quickHelp: false}});
			Pages.update(id, {$set: {schedule: false}});
			Pages.update(id, {$set: {manageEvents: false}});
       },
         "click #quickhelp": function() {
			var id = Pages.find().fetch()[0]._id;
			Pages.update(id, {$set: {home: false}});
			Pages.update(id, {$set: {quickHelp: true}});
			Pages.update(id, {$set: {schedule: false}});
			Pages.update(id, {$set: {manageEvents: false}});
       },
        "click  #schedule": function() {
            var id = Pages.find().fetch()[0]._id;
            Pages.update(id, {$set: {schedule: true}});
            Pages.update(id, {$set: {quickHelp: false}});
            Pages.update(id, {$set: {home: false}});
			Pages.update(id, {$set: {manageEvents: false}});
        },
		"click  #manageEvents": function() {
            var id = Pages.find().fetch()[0]._id;
            Pages.update(id, {$set: {schedule: false}});
            Pages.update(id, {$set: {quickHelp: false}});
            Pages.update(id, {$set: {home: false}});
			Pages.update(id, {$set: {manageEvents: true}});
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
            var completeText = currentUserName + ": " + text;
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
		},
		newQ: function() {
			var thisThread = Threads.find(this._id).fetch();
			return (thisThread[0].responses.length==0);
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
            var userStatus = "";
            if (Meteor.user().profile.coordinator){
                userStatus = "Coordinator";
            } else {
                userStatus = "Participant";
            }
            var currentUser = Meteor.user().profile.firstName + " " 
                                + Meteor.user().profile.lastName + ", " 
                                + userStatus;
            var completeText = text + " - " + currentUser;
			Threads.update(this._id, {
                $push: {createdby: currentUser, 
                        responses: completeText}
            });
			event.target.response.value = "";
		},
		"click .done": function() {
			Threads.update(this._id, {$set: {active: !this.active}});
		}
	});
	
	Template.schedule.helpers({
		calendar: function() {
			return Calendar.find().fetch();
		},
		timeDateString: function() {
			return this.time.toLocaleDateString();
		}
	});
	
	Template.schedule.events({
        // "click .add": function(){
            // //$(".scheduleForm").css("display","initial");
            // $("#datepicker").datepicker({
                // orientation: "top auto"
            // });
        // },
        //"submit #fillSchedule": function(e){
		"click .add": function() {
			//e.preventDefault();
             //$(".scheduleForm").css("display","none");
            var eventName = document.getElementById("inputEvent").value;
            var location = document.getElementById("inputLocation").value;
            var time = document.getElementById("datepicker").value;
            var userId = Meteor.userId();
            Calendar.insert({
				event: eventName,
				location: location,
				time: new Date(time),
				createdBy: userId 
			});          
        },
		//"submit #inputEvent": function() {
		"keypress #inputEvent": function (event) {
			if (event.which == 13) {
				var eventName = document.getElementById("inputEvent").value;
				var location = document.getElementById("inputLocation").value;
				var time = document.getElementById("datepicker").value;
				var userId = Meteor.userId();
				Calendar.insert({
					event: eventName,
					location: location,
					time: new Date(time),
					createdBy: userId 
				});  
			}
		},
		"keypress #inputLocation": function (event) {
			if (event.which == 13) {
				var eventName = document.getElementById("inputEvent").value;
				var location = document.getElementById("inputLocation").value;
				var time = document.getElementById("datepicker").value;
				var userId = Meteor.userId();
				Calendar.insert({
					event: eventName,
					location: location,
					time: new Date(time),
					createdBy: userId 
				});  
			} 
		},
		"keypress #datepicker": function (event) {
			if (event.which == 13) {
				var eventName = document.getElementById("inputEvent").value;
				var location = document.getElementById("inputLocation").value;
				var time = document.getElementById("datepicker").value;
				var userId = Meteor.userId();
				Calendar.insert({
					event: eventName,
					location: location,
					time: new Date(time),
					createdBy: userId 
				});  
			} 
		},
		"click .remove": function() {
			Calendar.remove(this._id);
		}
    });
	
	Template.manageEvents.helpers({
		events: function() {
			return Events.find().fetch();
		},
		createdByUser: function() {
			return (this.createdBy == Meteor.userId());
		}
	});
	
	Template.manageEvents.events({
		"submit .eventsForm": function() {
			event.preventDefault();
			var eName = event.target.eName.value;
			var eDescript = event.target.eDescript.value;
			var startT = event.target.startTime.value;
			var endT = event.target.endTime.value;
			var userId = Meteor.userId();
			var userName = Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
			
			Events.insert({
				name: eName,
				description: eDescript,
				startTime: startT,
				endTime: endT,
				createdBy: userId,
				coordinator: userName
			});
		},
		"click .remove": function() {
			Events.remove(this._id);
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
                  console.log("Ths is the value: " + value);
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
//		}, {
//			fieldName: 'coordinator',
//			fieldLabel: 'I am a coordinator',
//			inputType: 'checkbox',
//			visible: true,
//			saveToProfile: false
		} ]
	});
}

if (Meteor.isServer) {
    if (Pages.find().fetch().length == 0) {
        Pages.insert({
            home: true, 
            quickHelp: false,
            schedule: false,
			manageEvents: false
        });
    }
	
	Meteor.methods({
	});
}
