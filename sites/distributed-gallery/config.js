
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
    
define(['jquery', 'distributed-gallery.js'], function ($, DG) {
  
  'use strict';
  
  window.DG = DG;
  
  return {
  
    id: 'dg-2',
    slideshowContainerId: 'slideshow',
    
    /* Message handlers - what happens if message <messageID> is received by <recipientRole> ?
     *    messageHandlers.recipientRole.messageID = <callback> 
     */
    
    'messageHandlers': {},
    
    // Define membership for messaging
    
    'membership': {
      'wall' : ['this', 'is', 'a', 'test'],
      'cart-1' : ['carts', 'secondary'],
      'cart-2' : ['carts', 'secondary'],
      'mobile' : ['secondary']
    },
    
    'preTransform': function (dsl, doTransform) {
      
      // This fires just before the standard DSL transformation
      
      console.log('* distributed-gallery/config is doing pre-transform');
      
      // Set up handler for responding with the presentation we're currently on
      
      if (dsl.clientRole === 'wall') {
        dsl.message.onReceive('current_presentation', function () {
          
          var ss = document.getElementById('slideshow').timing,
              currIndex = ss.currentIndex;
          
          dsl.message.send('goto', 'mobile', ss.timeNodes[currIndex].getNode().id);
        });
      }
      
      var ss = $('#' + dsl.config.slideshowContainerId), i;
      
      DG.getProgramHTML(2, function (html) {
        ss.append(html);
        
        // Delay the transform so that the DOM updates
        //  prior to TimesheetsJS doing its thing
        // (there's got to be a better way)
        window.setTimeout(doTransform, 8000);
        // doTransform();
      });
      
      /*
      for (i = 0; i < 10; i += 1) {
        ss.append('<div data-role="wall" data-timecontainer="par" class="fullscreen-textpanel"' +
                  ' style="background-color: ' + ['red','green','yellow','blue'][i % 3] + '"' +
                  '>' +
                  '<span>Slide ' + i + '</span></div>');
      } */
    },
    
    'postTransform': function (dsl) {
      // This fires just after the standard DSL transformation
    }
  };
});