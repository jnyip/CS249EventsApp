if (Meteor.isClient) {
//  // counter starts at 0
//  Session.setDefault('counter', 0);
//  
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
//
//  Template.hello.helpers({
//    counter: function () {
//      return Session.get('counter');
//    }
//  });
//
//  Template.hello.events({
//    'click button': function () {
//      // increment the counter when button is clicked
//      Session.set('counter', Session.get('counter') + 1);
//    }
//  });
}

if (Meteor.isServer) {

////  Meteor.startup(function () {
////    // code to run on server at startup
////  });
//    Template._loginButtonsLoggedInDropdown.events({
//        'click #login-buttons-edit-profile': function(event) {
//            Router.go('profileEdit');
//        }
//    });
//    
//    Accounts.ui.config({
//    requestPermissions: {},
//    extraSignupFields: [{
//        fieldName: 'first-name',
//        fieldLabel: 'First name',
//        inputType: 'text',
//        visible: true,
//        validate: function(value, errorFunction) {
//          if (!value) {
//            errorFunction("Please write your first name");
//            return false;
//          } else {
//            return true;
//          }
//        }
//    }, {
//        fieldName: 'last-name',
//        fieldLabel: 'Last name',
//        inputType: 'text',
//        visible: true,
//    }, {
//        fieldName: 'terms',
//        fieldLabel: 'I accept the terms and conditions',
//        inputType: 'checkbox',
//        visible: true,
//        validate: function(value, errorFunction){
//          if (value != 'true') {
//            errorFunction("You must accept the terms and conditions.");
//            return false;
//          } else {
//            return true;
//          }
//        },
//        saveToProfile: false
//    }]
//});
}
