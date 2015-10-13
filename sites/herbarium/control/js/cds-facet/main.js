'use strict';

requirejs([ 'jquery-2.1.4.min', 'crossfilter.min', 'd3.min',
            'barchart-facet', 'h-barchart-facet',
            'text-facet', 'map-facet', 'scene-facet', 'data/gre-data.js'],
          
  function () {

    var barChartFacet = arguments[3],
        horizontalBarChartFacet = arguments[4], 
        textFacet = arguments[5], 
        mapFacet = arguments[6], 
        sceneFacet = arguments[7],
        resources = arguments[8].data;
  
    $(function () {

      // Some constants

      var INIT_LISTING_COUNT = 50,
          RESOURCE_URL_BASE = 'https://search.library.brown.edu/catalog/',
          SCENE_URL_BASE = 'http://library.brown.edu/cds/garibaldi/latest-scene/#/scene/';

      // Convert publication years into date objects

      resources.forEach(function (r) {
        r.year = new Date(r.year + '-01-01');
      });

      // START PLAY
      
      if (false) { // START PLAYING with dimensions generated from attributes
                   // PROBLEM: How to handle dual dimensions, e.g. lon/lat?
                   // Maybe make it semicolon-delimited? 'a.b.c;a.b.d'
                   //  then return an array
        
        // Given the accessor code as string (e.g. 'a.b.c')
        //  return an accessor function -- e.g. function(x) { return x.a.b.c }

        function createDataAccessFunction(code) {

          // return eval('(function() { return function(d) { return d.' + code + ' } })()');
          
          var codes = code.split(';')
                          .map(function(c) { return 'd.' + c })
                          .join(',');

          return eval('(function() { return function(d) { return [' + 
                      codes + '] } })()');
        }

        var facetList = [];

        $('.facet').each(function(i, node) {
          facetList.push( makeFacet(
            node.getAttribute('data-facet-type'), 
            node, 
            createDataAccessFunction(node.getAttribute('data-dimension'))
          ));
        });
      } // END PLAY
      
      // Create the crossfilter for the relevant dimensions and groups.
      
      var resourceCrossfilter = crossfilter(resources),
          // all = resourceCrossfilter.groupAll(),
          yearDimension = resourceCrossfilter.dimension(function (d) {
            return d.year;
          }),
          languageDimension = resourceCrossfilter.dimension(function (d) {
            return d.language;
          }),
          sceneDimension = resourceCrossfilter.dimension(function (d) {
            return d.scene;
          }),
          latitudeDimension = resourceCrossfilter.dimension(function (d) {
            return d.location.geometry.coordinates[0];
          }),
          longitudeDimension = resourceCrossfilter.dimension(function (d) {
            return d.location.geometry.coordinates[1];
          }),
          facetList = [];
      
      resourceCrossfilter.refreshAll = function () {
        updateResultsListing();
      };

      $('.facet').each(function(i, node) {
        facetList.push( makeFacet(node.getAttribute('data-facet-type'), 
                                  node, 
                                  node.getAttribute('data-dimension')));
      });
      
      // This is called by the facets when there's a change
      // All facets must have an update() method

      function updateAll() {
        facetList.forEach(function (facet) {
          facet.update();
        });
        updateResultsListing();
      }

      function clearAll() {
        facetList.forEach(function (facet) {
          facet.clearFilter();
        });
        updateAll();
      }

      // Call appropriate facet-generators

      function makeFacet(facetType, domNode, dimension) {
        if (facetType === 'text')
          // return textFacet(domNode, dimension, updateAll);
          return textFacet(domNode, languageDimension, updateAll);
          // TODO: the dimension has to get dynamically generated
        else if (facetType === 'year')
          // return barChartFacet(domNode, dimension, updateAll);
          return barChartFacet(domNode, yearDimension, updateAll);
          // return horizontalBarChartFacet(domNode, yearDimension, updateAll);
          // TODO: the dimension has to get dynamically generated
        else if (facetType === 'geo')
          return mapFacet(domNode, latitudeDimension, longitudeDimension, updateAll);
        else if (facetType === 'scene')
          return sceneFacet(domNode, sceneDimension, updateAll);
        else
          return { update: function () { return true; } };
      }

      // Routine to update the listing of results
      // TODO: turn this into a facet, like the others

      function updateResultsListing() {

        var listingText,
            allItems = yearDimension.top(Infinity),
            makeSceneLink = function (scene) {
              if (scene !== '[Non-panorama history]')
                return '<a target="_blank" href="' + 
                       SCENE_URL_BASE + scene + '">' + scene + 
                       '</a>';
              else return scene;
            };

        // Update results count

        $('#active').text(allItems.length);

        // List entries in results box

        $('#resource-list').empty();

        yearDimension.top(INIT_LISTING_COUNT).forEach(function (item) {
          listingText = '<p>' +
            '<strong>' +
            '<a href="' + RESOURCE_URL_BASE + item.URLID + '" target="_BLANK">' + 
              item.short_title + '</a>' +
            '</strong>' +
            ' (' + item.year.getFullYear() + ')<br />' +
            (item.author ? item.author + '<br />' : '') +
            'Scenes: ' + item.scene.map(makeSceneLink).join(', ') +
            '</p>';
          $('#resource-list').append(listingText); 
        }); 
      }

      $('#clear-filters-button').click(clearAll);

      updateAll();
    });
  }
);
