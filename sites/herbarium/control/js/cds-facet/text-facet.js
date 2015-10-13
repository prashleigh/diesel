
/*

  Given a domNode (a container), a dimension (which provides the facet data), 
  and updateAll (a function that draws all the facets on the page)
  
  Creates a clear button within the container
  
  Creates a container within the container for the listing of facets
  
  Creates the listing 
  
  Returns an object with an update() method that draws the facet, using the dimension, 
  to the domNode
  
*/

define(function() { 

  // Return a constructor
  
  return function (domNode, crossFilterDimension, updateAll) {

    var facetGroup = crossFilterDimension.group(function(textLabel) { 
          return textLabel 
        }),
        $domNode = $(domNode),
        $facetListingContainer,
        activeFilterList = {};

    function applyFilterList() {

      // Convert activeFilterList hash into an array

      var filterArray = [];
      for (f in activeFilterList) { filterArray.push(f); }

      // Apply filters to dimensions

      if (filterArray.length === 0) {
        crossFilterDimension.filterAll(); 
      } else {
        crossFilterDimension.filterFunction(function (d) {
          return ! (filterArray.indexOf(d) === -1);
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
      // $facetListingContainer = $('<div class="facet-container"></div>');
      $facetListingContainer = $('<div class="facet-container"></div>');
      $domNode.append($facetListingContainer);
    }

    // Update facet listing -- this is the main draw routine
    //  Draw content straight to the DOM node

    function update() {

      // Clear what's there

      $facetListingContainer.empty();

      facetGroup.all().forEach(function (facet) {

        var newNode,
            newNodeStyle = 'margin-right: 0.1em; margin-bottom: 0.1em',

            // addFilter handler for when a facet is clicked

            addFilter = function () {
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
      });
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


