// simple-todos.js
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  });
    // Inside the if (Meteor.isClient) block, right after Template.body.helpers:
Template.body.events({
  "submit .new-task": function(event){
    // This function is called when the new task form is submitted

    var text = event.target.text.value;

    Tasks.insert({
      text: text,
      createdAt: new Date() // current time
    });

    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  },
 "submit .new-reply": function(event){
     var value=event.target.text.value;
     console.log(value);
     return false;
 }
    
    
});
Template.quickHelp.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Tasks.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    Tasks.remove(this._id);
  }
});

    console.log("HELLO. PRISCILLA WAS HERE");
    Accounts.ui.config({
        requestPermissions: {},
        extraSignupFields: [{
            fieldName: 'first-name',
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
            fieldName: 'last-name',
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
    
}
