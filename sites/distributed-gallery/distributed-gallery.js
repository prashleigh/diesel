
/*jslint browser: true, devel: true, white: true */
/*


From Joseph:

I've got the gallery api app working and the security relaxed enough to be useful.

https://daxdev.services.brown.edu/gallery/api/programs/

Will list all programs available and 
https://daxdev.services.brown.edu/gallery/api/programs/1/
will return a single program.

Note: I will change slides to be presentations eventually (CHANGE MADE - PR), but this gives you something to play around with.

UPDATE: Joseph has created a new presentation at: https://daxdev.services.brown.edu/gallery/api/programs/2/

Here is a sample url for accessing an item's information using the BDR apis
given a pid of bdr:263018
the url for the api is https://repository.library.brown.edu/api/items/bdr:263018/


Look to display_inline; if not, look to 

display_inline code (as of 2015/04/13):

<iframe name="contentIframe" src="https://repository.library.brown.edu/fedora/objects/bdr:263018/datastreams/DOCUMENTARY/content" width="100%" height="800" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>



[
    {
        "id": 1, 
        "name": "First Program", 
        "owner": "joseph_rhoads@brown.edu", 
        "presentations": [
            {
                "pid": "bdr:200345", 
                "durration": 300
            }, 
            {
                "pid": "bdr:89899", 
                "durration": 200
            }
        ]
    }
]

Item data: 



*/

define(['jquery', 'BDR'], function ($, BDR) { 

  'use strict';
  
  // https://daxdev.services.brown.edu/gallery/api/programs/?format=jsonp&callback=gfjkdl
  
  var ROOT_URI = 'https://daxdev.services.brown.edu/gallery/api/',
      ALL_PROGRAMS_URI = ROOT_URI + 'programs/',
      PROGRAM_URI = function (programIndex) { 
        return ALL_PROGRAMS_URI + programIndex + '/?format=jsonp&callback=?';
      },
      makeDomIdFromBDRPid,
      getProgramList, getProgram,
      getPresentationInfo,
      getProgramWithInfo,
      getProgramHTML, getPresentationHTML,
      populateDomWithProgramHTML;

  /** Get the list of all presentations and do fn() */
  
  getProgramList = function (fn) {
    
    // TEMP BELOW
    
    fn = function (programListing) {
      console.log(programListing);
    };
    console.log(ALL_PROGRAMS_URI + '?format=jsonp&callback=?');
    
    // TEMP ABOVE
    
    $.getJSON(ALL_PROGRAMS_URI + '?format=jsonp&callback=?', fn);
  };
  
  getProgram = function (programId, fn) {
    var programUri = PROGRAM_URI(programId);
    $.getJSON(programUri, fn);
  };
  
  /** Get an item's BDR metadata, clean it up, and do fn(data) */
  
  getPresentationInfo = function (id, fn) {
    
    BDR.getItemMetadata(id, function (bdrItemInfo) {
      
      var presentationBDRData = {};
      
      presentationBDRData.title = bdrItemInfo.primary_title;
      presentationBDRData.description = bdrItemInfo.brief.abstract || null;
        
      // Load creation date
      
      if (bdrItemInfo.dateCreated_ssim || bdrItemInfo.dateIssued) {
        presentationBDRData.creationDate = new Date(bdrItemInfo.dateCreated_ssim || bdrItemInfo.dateIssued);
      } else { 
        presentationBDRData.creationDate = null; 
      }
      
      // Load creator info
      
      if (bdrItemInfo.creator_string !== undefined && 
          bdrItemInfo.creator_string[0] !== undefined) {
        presentationBDRData.creator = bdrItemInfo.creator_string[0];
      } else if (bdrItemInfo.brief.contributors !== undefined 
                 && bdrItemInfo.brief.contributors[0] !== undefined) {
        presentationBDRData.creator = bdrItemInfo.brief.contributors[0];
      }
      
      // If an image, load imageURL
      // TODO: determine type? What to do if it's a video or something?
      // THIS IS PRETTY MUCH DEFUNCT
      
      if(bdrItemInfo.links !== undefined && 
         bdrItemInfo.links.content_datastreams !== undefined &&
         bdrItemInfo.links.content_datastreams.jpg !== undefined) {
        presentationBDRData.imageUrl = bdrItemInfo.links.content_datastreams.jpg;
      } else {
        presentationBDRData.imageUrl = null;
      }
      
      // Load embed code
      
      if (bdrItemInfo.display_inline !== undefined) {
        presentationBDRData.embedCode = bdrItemInfo.display_inline;
      }
      
      fn(presentationBDRData);
    });
  };
  
  /** Get a program & get additional info for each presentation, then call fn(programData) */
  
  getProgramWithInfo = function (programId, fn) {
    console.log('GO: ' + programId);
    getProgram(programId, function (programData) {
      
      var numberOfPresentations = programData.presentations.length,
          infoLoadedCount = 0;
      
      /* Go through each slide/presentation, enrich with BDR metadata
         When all slides/presentations are enriched, call fn(data) */
      
      programData.presentations.forEach(function (presentation) {

        getPresentationInfo(presentation.pid, function (presData) {
          
          presentation.programId = programId;
          presentation.title = presData.title;
          presentation.description = presData.description;
          presentation.creator = presData.creator;
          presentation.creationDate = presData.creationDate;
          presentation.imageUrl = presData.imageUrl; // DEFUNCT
          presentation.embedCode = presData.embedCode;
          presentation.duration = (presentation.durration / 10) + 's';
          
          infoLoadedCount += 1;
          console.log('Got info for ' + presentation.pid + ' count=' + infoLoadedCount);
          
          // Test to see if all the additional data for all the slides have been loaded
          
          if (infoLoadedCount === numberOfPresentations) {
            fn(programData); 
          }
        });
      });
    });
  };
  
  /** Given the presentation data, create an HTML structure of a presentation
      TODO: jQuery-ize this */
  
  getPresentationHTML = function (presData) {
    
    console.log('gfddgfgdf');
    console.log(presData);
    
    // TEMP
    //presData.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/' + 
    //                    'Men_of_the_Royal_Marines_Division_training_in_snow_during_1942.jpg';
    
    var embedCode,
        domId = makeDomIdFromBDRPid(presData.pid);
    
    if (DSL.clientRole === 'wall') {
      embedCode = '<div id="' + domId + '"' + 
              'data-timecontainer="par" data-dur="' + presData.duration + '">' +
                '<img data-role="wall" src="' + presData.imageUrl + 
                  '" data-onbegin="' + 
                    'DSL.message.send(\'goto\',\'mobile\', \'' + domId + '\');">' +
                  '</div>';
    } else {
      embedCode = '<div id="' + domId + '"' + 
              'data-timecontainer="par">' +
              '<div data-role="mobile">' + 
                '<h1>' + presData.title + '</h1>' +
                (presData.creator ? '<p><em>' + presData.creator + '</em></p>' : '') +
                (presData.description ? '<p>' + presData.description + '</p>' : '') +
              '</div>' +
              '</div>';
    }
    
    if (presData.embedCode) {
      // signView = presData.embedCode;
    }
    
    return embedCode;
  };
  
  makeDomIdFromBDRPid = function(bdrPid) {
    return 'p' + bdrPid.replace('bdr:', '');
  };
  
  /** Given the program ID, generate HTML and call fn(html) */
  
  getProgramHTML = function (programId, fn) {
    var html = '';
    getProgramWithInfo(programId, function (programData) {
      programData.presentations.forEach(function(presData) {
        html += getPresentationHTML(presData);
      });
      fn(html);
    });
  };
  
  return {
    getProgramList: getProgramList,
    getProgram: getProgram,
    getProgramWithInfo: getProgramWithInfo,
    populateDomWithProgramHTML: populateDomWithProgramHTML,
    getProgramHTML: getProgramHTML
  };
});