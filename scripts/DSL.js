
/*jslint browser: true, devel: true, white: true */

/** Defines the DSL object, which is the main application interface 
    @module */

define(['message', 'page-transform', 'jquery', 'slide-factory', 'config.js'], 
       function(getMessageObject, getPageTransformFunction, $, slideFactory, CONFIG) {

  'use strict';
 
  var returnObject = {}; // What eventually gets returned as public methods
                         // CURRENTLY NOT USED - but maybe it should be ...
  
  /** Look for the client role in the following places 
      1. from the page URL (role=<role name>)
      2. from the page URL directory (e.g. /tiger/index.html --> 'tiger')
      3. Defaults to 'wall' if unspecified 
      
      NOTE: This doesn't work as a method, because what about /diesel/sites/demo/index.html ?
            'demo' is NOT the role in this case ...
            
            
      ALL THIS NEEDS TO GET RE-THOUGHT ....
      
      */
  
  function getClientRole () { // CHANGE AND TEST THIS
    
    var role,
        pathHeirarchy,
        match1 = /role=([^&#]*)/.exec(window.location.search);
    
    if (match1 !== null) {
      role = match1[1]; 
    } else {
      /*
      // TEMP - just grab filename
      pathHeirarchy = window.location.pathname.split('/')
                            .filter(function (x) { return x !== ''; });
      role = (/^(\w+)(?:\.\w{3,4})?$/.exec(pathHeirarchy.pop()))[1];
      */
      role = 'wall'; // TEMP
    } 
    
    /********
    else if (false) { // FIX THIS - else if ... what?
      
      var pathHeirarchy = window.location.pathname.split('/'),
          pathEnd;
      
      pathHeirarchy.filter(function (x) { return (x !== ''); });
      pathEnd = pathHeirarchy.pop();
      
      if (pathEnd.indexOf('index') === 0) {
        role = pathHeirarchy.pop(); 
      } else {
        role = (/^(\w+)(?:\.\w{3,4})?$/.exec(pathEnd))[1];
      }
    } else {
      
      role = 'wall'; // magic value - - hmm
    }
    *********/
    
    console.log('* Role identified as ' + role);
    return role;
  }
  
  /** Add role name as classname on body
      If role is 'wall' but the screen is small, then add 'test' class to body */
  
  function updateContainerClass (clientRole) {
    document.body.className += ' ' + clientRole;
    if (clientRole === 'wall' && window.innerWidth < 5000) {
      document.body.className += ' test';
    }
  }
  
  /** Initialize message handlers 
      (called once DOM is loaded, timesheetsjs is loaded, and transformations are done) */

  // Q: Should this be in the message module?

  function initMessageHandlers (clientRole, messageObject, CONFIG) {

    var roleMessageHandlers, messageName, slideShowContainer, 
        containerIdToIndex = {};
    
    console.log('* Initializing message handlers'); // TEMP
    
    /* GLOBAL (DieSeL) HANDLERS */ 
    
    /* 'goto' : jump to slide id - NOTE: goto should be overrideable by non-timesheet pages */
    
    slideShowContainer = document.getElementById(CONFIG.slideshowContainerId);
    
    if (slideShowContainer !== null) {

      /* Build hash of goto targets and their indeces 
         (timesheetsjs only seems to jump to index numbers) */

      // TODO: make this better
      
      $('#slideshow *[data-timecontainer][id]').each(function (index, timeContainer) {
        // containerIdToIndex[timeContainer.id] = index;
        containerIdToIndex[timeContainer.id] = timeContainer.timing;
      });

      messageObject.onReceive('goto', function (selectId) {
        var selectedTimeContainer = containerIdToIndex[selectId];
        if (selectedTimeContainer !== undefined) {
          console.log('* Moving to slide: ' + selectId);
          console.log('  selectedTimeContainer.parentNode.selectItem(' + selectedTimeContainer + ')');
          
          x = selectedTimeContainer;
          
          selectedTimeContainer.parentNode.selectItem(selectedTimeContainer);
        }
      });
      
      // TEMP FOR DEBUGGING (although maybe this should be a method off of DSL object?)
      
      window.dslGoToSlide = function (slideId) {
        if (containerIdToIndex[slideId] !== undefined) {
          slideShowContainer.timing.selectIndex(containerIdToIndex[slideId]); 
        }
      };
      
      // ALSO TEMP
      
      window.dslSlideShowContainer = slideShowContainer;
    }

    /* ASSIGN APP HANDLERS (defined in config.js under CONFIG.messageHandlers) */

    roleMessageHandlers = CONFIG.messageHandlers[clientRole];

    for (messageName in roleMessageHandlers) {
      messageObject.onReceive(messageName, roleMessageHandlers[messageName]);
    }
  }
  
  // Create a drop down menu for navigating (mostly for debugging)
  // At the non-container level, this filters for items with either id or a title attribute
  // Otherwise, the list gets very long ...
  
  function addOnScreenNavigator() {
    
    var navDropdown = $('<select></select>'),
        navContainer = $('<div id="dsl-navigator">Go to slide:<hr /> </div>'),
        slideShowContainer = document.getElementById(CONFIG.slideshowContainerId).timing;
    
    function getOnScreenNavigatorList(timeContainer) {
      
      var heading, containingListItem,
          listContainer = $('<div></div>');
      
      // Get heading text
      // To be listed in the TOC, a timeContainer element must have
      // both an ID as well as a title
      // (this passes over elements that have IDs just for styling purposes)

      
      window.F = timeContainer.getNode();
      
      if (timeContainer.getNode().getAttribute('data-timecontainer') &&
          timeContainer.getNode().title !== undefined &&
          timeContainer.getNode().id !== undefined &&
          timeContainer.getNode().title !== '') {
        heading = timeContainer.getNode().title;
      } else if(timeContainer.getNode().id !== undefined && 
                timeContainer.getNode().getAttribute('data-timecontainer')) {
        heading = timeContainer.getNode().id;
      } else {
        heading = null;
      }

      // If the element has a heading text, then add to nav
      //  and attach a handler

      if (heading !== null) {
        containingListItem = $('<div>' + heading + '</div>');
        containingListItem.click(function () {
        // TODO: I think it needs to selectItem for the parent of the parent as well ... test this
          timeContainer.parentNode.selectItem(timeContainer);
        });
        listContainer.append(containingListItem);
      }

      // Handle children

      if (timeContainer.timeNodes !== undefined && 
          timeContainer.timeNodes.length > 0) {
        
        var subList = $('<div></div>');
        
        console.log("CHILD TIME NODES FOR ");
        console.log(timeContainer.getNode());
        console.log("IS/ARE");
        console.log(timeContainer.timeNodes);
        
        timeContainer.timeNodes.forEach(function(childTimeNode) {
          console.log("GO TO SUBLIST ITEM");
          console.log(childTimeNode);
          subList.append(getOnScreenNavigatorList(childTimeNode));
        });
        
        // If this is the 'root' TimeContainer, then just show the sublist
        // Otherwise, append to listing
        
        if (timeContainer.parentNode !== undefined) {
          listContainer.append(subList);
        } else {
          listContainer = subList;
        }
      }

      return listContainer;
    }
    
    navContainer.append(getOnScreenNavigatorList(slideShowContainer));
    $('body').append(navContainer);
  }
  
  
  /** Set up the following once DOM is loaded:
  
      - run pre-transform scripts (defined in config.js) -- TODO
      - run transformation of DOM
      - run post-transform scripts (defined in config.js) -- TODO
      - run timesheets routine against DOM
      - initialize message handlers 
      
  */
  
  function setupOnloadEvents (getPageTransformFunction, clientRole, messageObject, CONFIG) {
    
    // If there is a slideshow container ...
    
    if (document.getElementById(CONFIG.slideshowContainerId) !== null) {
      
      var transformPage = getPageTransformFunction(clientRole);
      
      $(document).ready(function () {
        
        // Generate and/or transform DOM (model)

        require(['DSL'], function (dsl) {

          // Pre-transform is the place to dynamically generate a presentation
          
          if (CONFIG.preTransform !== undefined) {
            
            /* If there is a second argument to the preTransform function,
               then this is a callback for the main transformation
               (first argument by default is the DSL object) */
            
            if (CONFIG.preTransform.length > 1) {
              CONFIG.preTransform(dsl, transformPage);
            } else {
              CONFIG.preTransform(dsl);
              transformPage();
            }
          } else {
            transformPage();
          }

          // Post-transform hook
          
          if (CONFIG.postTransform !== undefined) {
            CONFIG.postTransform(dsl);
          }
          
          // START HACK FOR DISTRIBUTED GALLERY: get current presentation for mobile

          window.setTimeout(function() {
            if (dsl.clientRole === 'mobile') {
              console.log('* Updating to current slide');
              dsl.message.send('current_presentation', 'wall', 0);
            }
          }, 1500);
          
          // END HACK FOR DISTRIBUTED GALLERY
        });

        // Run timesheets
/*
        require(['timesheets-main'], function () { 
          initMessageHandlers(clientRole, messageObject, CONFIG);
        });*/
        
        window.setTimeout(function () {
          require(['timesheets-main'], function () {
            initMessageHandlers(clientRole, messageObject, CONFIG);
          });
        }, 1000);
      });
    }
  }

  /* Load additional jQuery plugins - doesn't really need to be a function ... */
  
  function loadjQueryPlugins (pluginsArray) {
    require(pluginsArray, function () {
      console.log('* Loaded jQ plugins fittext and qrcode'); // TEMP
    });
  }
  
  console.log('* Loaded DSL module');  // TEMP
  
  /* Main routine */
  
  function init(getMessageObject, getPageTransformFunction, CONFIG) {
    
    var clientRole = getClientRole(),
        messageObject = getMessageObject(clientRole, CONFIG);
    
    updateContainerClass(clientRole);
    loadjQueryPlugins(['jquery.fittext', 'jquery.qrcode.min']);
    setupOnloadEvents(getPageTransformFunction, clientRole, messageObject, CONFIG);
    
    // Register keyboard shortcut for nav (doesn't really belong here - move later)
    
    $(document).keypress(function(e) {
      if (e.charCode === 110) {
        addOnScreenNavigator();
      }
    });
    
    // DSL object's public members
    
    return {
      clientRole: clientRole,
      message: messageObject,
      getSlide: slideFactory,
      config: CONFIG,
      addNav: addOnScreenNavigator
    };
  }

  window.DSL = init(getMessageObject, getPageTransformFunction, CONFIG);
  
  return window.DSL;
  
  // return init(getMessageObject, getPageTransformFunction, CONFIG);
});