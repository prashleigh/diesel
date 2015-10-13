
/*

  Given a domNode (a container), a dimension (which provides the facet data), 
  and updateAll (a function that draws all the facets on the page)
  
  Creates a clear button within the container
  
  Creates a container within the container for the listing of facets
  
  Creates the listing 
  
  Returns an object with an update() method that draws the facet, using the dimension, 
  to the domNode
  
  
  USE FILTERFUNCTION
  
  Filters records such that the specified function 
  returns truthy when called with this dimension's value, 
  and returns this dimension.
  
  Could use this -- given a click on a scene, we have scene s
  
  var s = 12;
  
  sceneCrossFilterDimension.filterFunction(function(d) { 
    return (d.indexOf(s) !== -1);
  });
  
*/

define(function () { 

  // Return a constructor
  
  return function (domNode, crossFilterDimension, updateAll) {

    var facetGroup = crossFilterDimension.group(function (textLabel) { 
          return textLabel 
        }),
        $domNode = $(domNode),
        $facetListingContainer,
        activeFilterList = {};

    function applyFilterList() {

      // Convert activeFilterList hash into an array of numbers
      //  (unless it's a non-numeric string, e.g. "[Non-panorama history]")

      var filterArray = [];
      
      for (scene in activeFilterList) { 
        filterArray.push(isNaN(Number(scene)) ? scene : Number(scene)); 
      }
      
      // Apply filters to dimensions

      if (filterArray.length === 0) {
        crossFilterDimension.filterAll(); 
      } else {
        crossFilterDimension.filterFunction(function (d) {
          
          var include = false;
          
          // return ! (filterArray.indexOf(d) === -1);
          // return (d !== undefined && d.indexOf(sceneAsNumber) !== -1);
          
          // Go through each filter-selected scene ... 
          
          filterArray.forEach(function (selectedScene) {
            
            // And if it's found in the list of scenes 
            //  associated with an item, return true
            
            if (d !== undefined && d.indexOf(selectedScene) !== -1) {
              include = true;
            }
          });
          
          // If none of the selected scenes are found in the item's
          //  associated scenes, then return false
          
          return include;
        });  
      }

      updateAll(); 
    }

    // Add clear button

    function addClearButton() {
      $('<button>Clear</button>').click(function () { 
        clearFilter();
        updateAll();
      }).appendTo($domNode);
    }

    function addFacetListingContainer() {
      $facetListingContainer = $('<div class="facet-container"></div>');
      $domNode.append($facetListingContainer);
    }

    // Update facet listing -- this is the main draw routine
    //  Draw content straight to the DOM node

    function update() {

      // Clear what's there

      $facetListingContainer.empty();

      // PLAY SPACE
      
      // Collect scenes
      
      var sceneList = {}, 
          highestFacetCount = 0;
      
      facetGroup.all().forEach(function (facet) {
        facet.key.forEach(function(scene) {
          if (sceneList[scene] === undefined) { 
            sceneList[scene] = 0;
          }
          sceneList[scene] += facet.value;
          if (sceneList[scene] > highestFacetCount)
            highestFacetCount = sceneList[scene];
        });
      });
      
      // Order them for display
      
      var scenesInOrder = Object.keys(sceneList)
                                .sort( function(a, b) { 
                                  if (isNaN(a))
                                    return 1
                                  else if (isNaN(b))
                                    return -1;
                                  else
                                    return Number(a) - Number(b); 
                                });

      // Go through each and create a button
      
      scenesInOrder.forEach(function (scene) {

        // If there are entries ...
        
        if (sceneList[scene] !== 0 || true) {

          var sceneAsNumber = isNaN(Number(scene)) ? scene : Number(scene),
              newNodeStyle = 'margin-right: 0.1em; margin-bottom: 0.1em;' + 
                             'opacity:' + (sceneList[scene] === 0 ? 0.3 : 1),
              newNode = $('<button class="btn btn-sm" style="' + 
                          newNodeStyle + '" ' +  
                          '>' + scene + 
                          '</button> '),
              addFilter = function () {
                activeFilterList[scene] = 1;
                console.log(activeFilterList);
                applyFilterList();
              },
              removeFilter = function () {
                delete(activeFilterList[scene]);
                applyFilterList();
              };
          
          // Set class according to status

          if (activeFilterList[scene] !== undefined)
            newNode.addClass('btn-primary')
          else {
            newNode.addClass('btn-default');
            // newNode.addClass('active');
          }
          
          // On/off toggle click events

          if (activeFilterList[scene] !== undefined) {
            newNode.addClass('btn-primary');
            // if (sceneList[scene] !== 0) 
              newNode.click(removeFilter);
          } else {
            newNode.click(addFilter); 
          }
          
          $facetListingContainer.append(newNode);
        }
      });
      
      // END PLAY SPACE
      
      /*
      
      facetGroup.all().forEach(function (facet) {

        var newNode,
            newNodeStyle = 'margin-right: 0.1em; margin-bottom: 0.1em',

            // addFilter handler for when a facet is clicked

            addFilter = function () {
              alert('Clicked ' + facet.key);
              activeFilterList[facet.key] = 1;
              applyFilterList();
            },

            // removeFilter handler for when a previously-selected facet is clicked

            removeFilter = function () {
              delete(activeFilterList[facet.key]);
              applyFilterList();
            };

        newNode = $('<span class="btn btn-sm" style="' + newNodeStyle + '">' + 
                    facet.key +
                    ' <span class="badge">' + facet.value + '</span></span> ');

        if (activeFilterList[facet.key] !== undefined)
          newNode.addClass('btn-primary')
                 .click(removeFilter);
        else
          newNode.click(addFilter); 

        $facetListingContainer.append(newNode);
      });     */
      
    }


    function clearFilter() {
      crossFilterDimension.filterAll(); 
      activeFilterList = {};
    }

    // Initialize

    function init() {
      // addClearButton();
      addFacetListingContainer();
      update();    
    }

    init();

    return {
      update: update,
      clearFilter: clearFilter
    };
  }
});


