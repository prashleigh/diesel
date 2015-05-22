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
    
    // Some ad-hoc routines ...
    
    setTimelineTo: function (offset) {
      document.getElementById('timeline-count-line').style.strokeDashoffset = offset;
    },
    
    // Load all the points onto the map
    
    loadMapPoints: function () {
    
      var getX = function (x) { return 1900 - ((-114.90157671276563 * x) - 7505.273581531246) },
          getY = function (y) { return (-340.42870631023067 * y) + 16665.39316481322 },
          svg = document.getElementById('timeline-map-points'),
          JITTER_AMOUNT = 100,
          jitterDistance, jitterAngle,
          use;
      
      timelineMapPoints.forEach(function (p) {

        use = document.createElementNS('http://www.w3.org/2000/svg','use');
        
        jitterDistance = Math.random() * JITTER_AMOUNT;
        jitterAngle = Math.random() * Math.PI * 2;
        
        use.setAttribute('x', getX(p.x) + (jitterDistance * Math.cos(jitterAngle)));
        use.setAttribute('y', getY(p.y) + (jitterDistance * Math.sin(jitterAngle)));
        use.setAttributeNS('http://www.w3.org/1999/xlink','href','#timeline-map-point');
        use.style.visibility = 'hidden';

        svg.appendChild(use);
        
        p.node = use;
        p.startDate = new Date(p.startDate);
      });
    },
    
    // Toggle point visibility depending on where they fall 
    // relative to a date threshold
    
    showMapPointsTo: function (dateString) {
    
      var cutoffDate = new Date(dateString);
      
      timelineMapPoints.forEach(function (p, i) {
      
        if (p.startDate < cutoffDate) {
          setTimeout( function() { 
            p.node.style.visibility = 'visible';
          }, (cutoffDate - p.startDate) / 500000000);
          console.log('time: ' + (cutoffDate - p.startDate) / 500000000);
        } else {
          p.node.style.visibility = 'hidden';
        }
      });
    },

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
      'cat-swamp-map': {
        'onbegin': function () {
          if (DSL.clientRole === 'wall') {
            $('body').css('background-color','black');
          }
        }
      },
      'cat-swamp-map-satellite': {
        'onbegin': function () {
          // $('#cat-swamp-map-contemporary-2').css('transform','rotateX(45deg)');
        }
      },
      'activity-1': {
        'onbegin': function () {
          var iframe = $('#treemap-iframe');
          iframe.attr('src', iframe.attr('data-src'));
        },
        'onend': function () {
          $('#treemap-iframe').attr('src', '');
        }
      },
      'activity-2': {
        'onbegin': function () {

          var resultsPageIframe, resultsNumber;

          // Load all the results pages

          for (resultsNumber = 1; resultsNumber < 5; resultsNumber++) {
            resultsPageIframe = $('#results' + resultsNumber);
            resultsPageIframe.attr('src', resultsPageIframe.attr('data-src'));            
          };

          /*
          // Google spreasheets API as described in: 
          //  * https://developers.google.com/gdata/samples/spreadsheet_sample
          //  * https://developers.google.com/gdata/docs/json
          
          var url = 'https://spreadsheets.google.com/feeds/list/' + 
                    '1The7N7Oh9DPQoLBF95PmBELLyArL8KRhoCPMMQBZfRs/o3cghiv/' + 
                    'public/full?alt=json-in-script&callback=?';
          
          $.getJSON(url).success(function(data) {
            data.feed.entry.forEach(function(formEntry) {
              console.log(formEntry);
              $('#results1').append('<p>' + formEntry.content.$t.slice('transcribetheabovenote: '.length) + '</p');
            });  
          }).error(function(message) {
              console.error('error' + message); 
          }).complete(function() {
              console.log('completed!'); 
          }); */
        }
      },
      'treemap': {
        'onbegin': function () {
          var iframe = $('#treemap-iframe');
          iframe.attr('src', iframe.attr('data-src'));
        },
        'onend': function () {
          $('#treemap-iframe').attr('src', '');
        }
      }
    }
  };
});