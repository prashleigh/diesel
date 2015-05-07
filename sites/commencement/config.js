/*jslint browser: true, devel: true, white: true */

/** CONFIG FILE FOR A SINGLE SITE

    Contains:
    
    - App ID
    - Message handlers (what happens if message X is received by Y?)
    - Membership
    - ID of slideshow container
    
    */

define(['jquery'], function ($) {

  'use strict';

  return {

    id: 'commencement2015',
    slideshowContainerId: 'slideshow',

    /* Message handlers - what happens if message <messageID> is received by <recipientRole> ?
     *    messageHandlers.recipientRole.messageID = <callback>
     */

    'messageHandlers': {

      'wall': {
        'do_something': function (data) {
          // Something is done here
        }
      },

      // Controller - i.e. the touch panel at the wall

      'another_monitor': {
        'do_something': function (data) {
          // Something is done here
        }
      }
    },

    // Define membership for messaging

    'membership': {
      'wall': [],
      'another_monitor': ['not_wall'],
      'yet_another_monitor': ['not_wall']
    },

    'preTransform': function (dsl) {

      // If the audience member's view, then make the slideshow root element
      //  a bootstrap container

      if (dsl.clientRole === 'audience') {
        $('#slideshow').addClass('container-fluid');
        $('#activity-1').width('100%');
      }
    },

    'postTransform': function (dsl) {
      // This fires just after the standard DSL transformation
    },

    'slideEvents': {
      'activity-1': {
        'onbegin': function () {
          // $('#google-form').attr('src', 'http://www.google.com');
          console.log('* Starting activity');
        }
      },
      'activity-2': {
        'onbegin': function () {
          
          // Google spreasheets API as described in: 
          //  * https://developers.google.com/gdata/samples/spreadsheet_sample
          //  * https://developers.google.com/gdata/docs/json
          
          var url = 'https://spreadsheets.google.com/feeds/list/1The7N7Oh9DPQoLBF95PmBELLyArL8KRhoCPMMQBZfRs/o3cghiv/public/full?alt=json-in-script&callback=?';
          $.getJSON(url).success(function(data) {
            data.feed.entry.forEach(function(formEntry) {
              console.log(formEntry);
              $('#results1').append('<p>' + formEntry.content.$t.slice('transcribetheabovenote: '.length) + '</p');
            });  
          }).error(function(message) {
              console.error('error' + message); 
          }).complete(function() {
              console.log('completed!'); 
          });
        }
      }
    }
  };
});