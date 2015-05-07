
/*jslint browser: true, devel: true, white: true */

/** CONFIG FILE FOR APP - e.g. herbarium @module

    TODO: This should be moved to a local (app) directory, not in the main DSL scripts directory
          Should this just be a JSON file? (maybe not - needs jQuery)
    
    Contains:
    
    - App ID
    - Message handlers (what happens if message X is received by Y?)
    - Membership
    - ID of slideshow container
    
    */
    
define(['jquery'], function ($) {
  
  'use strict';
  
  return {
  
    id: 'demo',
    slideshowContainerId: 'slideshow',
    
    /* Message handlers - what happens if message <messageID> is received by <recipientRole> ?
     *    messageHandlers.recipientRole.messageID = <callback> 
     */
    
    'messageHandlers': {
    
      'wall': {
        'show_details': function (data) {
          console.log('Wall received signal to show details for: ' + data);
        },
        'change_choice': function (data) {
          document.getElementById('distributed-control')
                  .getElementsByClassName('distributed-control-background')[0]
                  .style.backgroundColor = data;
        }
      },
      
      // Controller - i.e. the touch panel at the wall
      
      'controller' : {
        'show_details': function (data) { 
          console.log('Controller received signal to show details for ' + data);
        }
      },
      
      // Viewer's personal device
      
      'mobile': {
        'show_details': function (data) { 
          console.log('Mobile received signal to show details for ' + data);
        } 
      }
    },
    
    // Define membership for messaging
    
    'membership': {
      'wall' : ['this', 'is', 'a', 'test'],
      'cart-1' : ['carts', 'secondary'],
      'cart-2' : ['carts', 'secondary'],
      'mobile' : ['secondary']
    },
    
    'preTransform': function (dsl) {
      // This fires just before the standard DSL transformation
      console.log('************** PRE!! ************');
    },
    
    'postTransform': function (dsl) {
      // This fires just after the standard DSL transformation
      $('#distributed-control .choice').click(function () {
        console.log(this.style);
        dsl.message.send('change_choice', 'wall', this.style.color);
      });
    }
  };
});