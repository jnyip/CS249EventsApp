//our MongoDB collections
Threads = new Mongo.Collection("threads");
Events = new Mongo.Collection("events");
Calendar = new Mongo.Collection("calendar");

if (Meteor.isClient) {
	Session.set('currentPage', 'addEvents');
	Session.set('currentEvent', null);
	
	/*******************************************************************************
	 * TEMPLATE BODY: only takes care of the navbar
	 *******************************************************************************/
	Template.body.helpers({
        homePage: function() {return Session.get('currentPage')=='home';},
        quickHelpPage: function() {return Session.get('currentPage')=='quickHelp';},
        schedulePage: function() {return Session.get('currentPage')=='schedule';},
		addEventsPage: function() {return Session.get('currentPage')=='addEvents';},
		attendEventPage: function() {return Session.get('currentPage')=='attendEvent';}
    });
    
    Template.body.events({
		"click #home": function() {Session.set('currentPage', 'home');},
		"click #quickHelp": function() {Session.set('currentPage', 'quickHelp');},
		"click  #schedule": function() {Session.set('currentPage', 'schedule');},
		"click  #addEvents": function() {Session.set('currentPage', 'addEvents');},
		"click  #attendEvent": function() {Session.set('currentPage', 'attendEvent');}
    });
	
	/*******************************************************************************
	 * TEMPLATE CURRENTEVENT: displays selected events OR prompts user to select one
	 *******************************************************************************/
	Template.currentEvent.helpers({
		currentEvent: function() {
            return Events.findOne({"_id": Session.get("currentEvent")}).name;
		},
		noCurrentEvent: function() {
			return (Session.get("currentEvent")==null);
		}
	});
	
	Template.currentEvent.events({
		"click #attendEvent": function() {
			Session.set("currentPage", 'attendEvent');
		}
	});
    
	/*******************************************************************************
	 * TEMPLATE QUICKHELP: displays the quick help board (multiple threads)
	 *******************************************************************************/
    Template.quickHelp.helpers({
		threads: function () {
			return Threads.find({current:Session.get("currentEvent")}, {sort: {createdAt: -1}}).fetch();
		}
	});
	
	Template.quickHelp.events({
		"submit .new-thread": function(e){
			e.preventDefault(); //prevents default form submit
			var text = e.target.thread.value;
            var currentUserId = Meteor.userId();
            var currentUserName = Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
            var completeText = currentUserName + ": " + text;
			Threads.insert({
				text: completeText,
				createdAt: new Date(), // current time
                createdBy: currentUserId,
				responses: [],
				active: true,
                current: Session.get("currentEvent")
			});
			e.target.thread.value = ""; //clear form
		}
	});
	
	/*******************************************************************************
	 * TEMPLATE ONETHREAD: displays a single thread with responses (allows user to respond)
	 *******************************************************************************/
	Template.oneThread.helpers({
		newQ: function() {
			return this.responses.length==0;
		}
	});

	Template.oneThread.events({
		"click .delete": function () {
			Threads.remove(this._id);
		},
		"submit .new-response": function(e){
			e.preventDefault();
			var text = e.target.response.value;
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
			e.target.response.value = "";
		},
		"click .done": function() {
			Threads.update(this._id, {$set: {active: !this.active}});
		}
	});
	
	/*******************************************************************************
	 * TEMPLATE SCHEDULE: allows user to view (or add) to schedule for the selected event
	 *******************************************************************************/
	Template.schedule.helpers({
		calendar: function() {
			return Calendar.find({current:Session.get("currentEvent")}).fetch();
		},
		timeDateString: function() {
			return this.time; //.toLocaleDateString();
		}
	});
	
	Template.schedule.events({
		"click .add": function() {
            var eventName = document.getElementById("inputEvent").value;
            var location = document.getElementById("inputLocation").value;
            var time = document.getElementById("dateinput").value;
            var userId = Meteor.userId();
            Calendar.insert({
				task: eventName,
				location: location,
				time: time,
				createdBy: userId,
                current: Session.get("currentEvent")
			});          
        },
		"click .remove": function() {
			Calendar.remove(this._id);
		}
    });
	
	/*******************************************************************************
	 * TEMPLATE ADDEVENTS: users can add, manage, and share access to events
	 *******************************************************************************/
    Template.addEvents.helpers({
		usersEvents: function() {
			return Events.find({'createdBy': Meteor.userId()}).fetch();
		}
	});
	
    Template.addEvents.events({
		"submit .eventsForm": function(event) {
			event.preventDefault();
			var eName = event.target.eName.value;
			var eDescript = event.target.eDescript.value;
			var startT = event.target.startTime.value;
			var endT = event.target.endTime.value;
			var userId = Meteor.userId();
			var userName = Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
            var share= event.target.eShare.value;
            var cleanedShare=share.split(';');
            for (var i in cleanedShare){
                cleanedShare[i]=cleanedShare[i].trim();
            }
            $(".eventsForm")[0].reset();
			Events.insert({
				name: eName,
				description: eDescript,
				startTime: startT,
				endTime: endT,
				createdBy: userId,
                sharedWith: cleanedShare,
				coordinator: userName
			});
		},
		"click .remove": function() {
			Events.remove(this._id);
		}
	});            
            
	/*******************************************************************************
	 * TEMPLATE ATTENDEVENT: allows user to select an event to "attend"
	 *******************************************************************************/
	Template.attendEvent.helpers({
		events: function() {
			return Events.find().fetch();
		}
	});
	
	Template.attendEvent.events({
		"click .remove": function() {
			Events.remove(this._id);
		},
		"click .selectEvent": function() {
			Session.set("currentEvent", this._id);
		}
	});

	/*******************************************************************************
	 * ACCOUNTS: manages accounts and passwords and stuff
	 *******************************************************************************/
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
		} ]
	});    
}

if (Meteor.isServer) {
  
}
