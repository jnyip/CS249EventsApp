Threads = new Mongo.Collection("threads");
Pages = new Mongo.Collection("pages");
Events = new Mongo.Collection("events");
Calendar = new Mongo.Collection("calendar");

if (Meteor.isClient) { //This code only runs on the client
    Session.set('home',false);
    Session.set('quickHelp', false);
    Session.set('schedule', false);
    Session.set('addEvents', true);
	Session.set('attendEvent', false);
	Session.set('currentEvent', null);
	
	Template.body.helpers({
        homePage: function() {
            return Session.get('home');
        },
        quickHelpPage: function() {
            return Session.get('quickHelp');
        },
        schedulePage: function() {
            return Session.get('schedule');
        },
		addEventsPage: function() {
			 return Session.get('addEvents');
		},
		attendEventPage: function() {
			return Session.get('attendEvent');
		}

    })
    
    Template.body.events({
 
       "click #home": function() {
			Session.set('home', true);
			Session.set('quickHelp', false);
			Session.set('schedule', false);
			Session.set('addEvents', false);
			Session.set('attendEvent', false);
       },
         "click #quickhelp": function() {
			Session.set('home', false);
			Session.set('quickHelp', true);
			Session.set('schedule', false);
			Session.set('addEvents', false);
			Session.set('attendEvent', false);
       },
        "click  #schedule": function() {
            Session.set('home', false);
			Session.set('quickHelp', false);
			Session.set('schedule', true);
			Session.set('addEvents', false);
			Session.set('attendEvent', false);
        },
		"click  #addEvents": function() {
            Session.set('home', false);
			Session.set('quickHelp', false);
			Session.set('schedule', false);
			Session.set('addEvents', true);
			Session.set('attendEvent', false);
        },
		"click  #attendEvent": function() {
            Session.set('home', false);
			Session.set('quickHelp', false);
			Session.set('schedule', false);
			Session.set('addEvents', false);
			Session.set('attendEvent', true);
        }
    });
	
	Template.currentEvent.helpers({
		currentEvent: function() {
			var id = Session.get("currentEvent");
            return Events.findOne({"_id": id}).name;
		},
		isNull: function() {
			return (Session.get("currentEvent")==null);
		}
	});
	
	Template.currentEvent.events({
		"click #attendEvent": function() {
            Session.set('home', false);
			Session.set('quickHelp', false);
			Session.set('schedule', false);
			Session.set('addEvents', false);
			Session.set('attendEvent', true);
		}
	});
    
    Template.quickHelp.helpers({
		threads: function () {
			return Threads.find({current:Session.get("currentEvent")}, {sort: {createdAt: -1}});
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
                initialCreatedBy: currentUserId,
				responses: [],
				active: true,
                current: Session.get("currentEvent")
//                user: this.userID;
			});
			e.target.thread.value = ""; //clear form
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
		"submit .new-response": function(e){
			e.preventDefault();
			var text = et.target.response.value;
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
	
    Template.addEvents.helpers({
		events: function() {
			return Events.find().fetch();
		},
		createdByUser: function() {
			return (this.createdBy == Meteor.userId());
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
            
	
	Template.attendEvent.helpers({
		events: function() {
			return Events.find().fetch();
		},
		createdByUser: function() {
			return (this.createdBy == Meteor.userId());
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
