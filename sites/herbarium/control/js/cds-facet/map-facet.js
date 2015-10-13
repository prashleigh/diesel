
define(['topojson.v1.min', 'data/europe.topo.js'], function(topojson, topo) {

  return function mapFacet(domNode, 
                    crossFilterLatitudeDimension, crossFilterLongitudeDimension,
                    updateAll) {

    var width = 500, // SHOULD BE AUTOMATIC
        height = 300, // SHOULD BE AUTOMATIC
        d3domNode = d3.select(domNode),
        projection = d3.geo.mercator(),
        path = d3.geo.path().projection(projection),
        svg,
        longLatById = {},
        brush,
        popupLabel,
        circleContainer;

    // Turn popup label on/off
    
    function hidePopupLabel() {
      popupLabel.attr('style','display:none');
      popupLabel.text('');
    }
    
    function showPopupLabel() {
      popupLabel.attr('style','');
    }
    
    // Render dots onto map

    function update() {

      var points = [], circles;

      if (svg !== undefined) {

        // TODO: compile a count of lon/lat pairs to determine circle size

        crossFilterLatitudeDimension.top(Infinity).forEach(function (i) {
          points.push(i.location.geometry.coordinates.concat(i.location.name));
        });

        svg.selectAll('circle').remove(); // THIS MAY NOT BE NECESSARY

        circles = svg.selectAll('circle')
          .data(points);

        circles.enter()
          .append('circle')
          .attr('cx', function (d) {
            return projection(d)[0];
          })
          .attr('cy', function (d) {
            return projection(d)[1];
          })
          .attr('r', '2px')
          .attr('fill', 'red')
          .on('mouseover', function (d) { 
            popupLabel.text(d[2])
                      .attr('x', this.getAttribute('cx') - 0)
                      .attr('y', this.getAttribute('cy') - 10);
          })
          .on('mouseout', function (d) {
            // popupLabel.text('');
          });
        
        circles.exit().remove();
        
        // Bring popup to top

        popupLabel.node().parentNode.appendChild(popupLabel.node());
      }
    }

    function clearFilter() {
      crossFilterLatitudeDimension.filterAll();
      crossFilterLongitudeDimension.filterAll();
      svg.selectAll('g.brush').call(brush.clear());
    }

    function initBrush() {

      var sortFunction = function(a, b) { return a - b }; 

      brush = d3.svg.brush()
                .x(d3.scale.identity().domain([0, width]))
                .y(d3.scale.identity().domain([0, height]))
                .on('brushstart.popup', hidePopupLabel)
                .on('brushend', geoFilterChanged)
                .on('brushend.popup', showPopupLabel);

      svg.append('g')
        .attr('class', 'brush')
        .call(brush);

      // This is called when brush moves

      function geoFilterChanged() {

        var extent = brush.extent();

        // If no dimension (brush's signal that the user clicked outside of the box), 
        //  clear the geographical filter

        if (extent[0][0] === extent[1][0] || extent[0][1] === extent[1][1]) {
          clearFilter();
        } else {

          var geoExtent = [ projection.invert(brush.extent()[0]),
                            projection.invert(brush.extent()[1]) ],
              latRange = [geoExtent[0][0], geoExtent[1][0]].sort(sortFunction),
              lonRange = [geoExtent[0][1], geoExtent[1][1]].sort(sortFunction);

          crossFilterLatitudeDimension.filterRange(latRange);
          crossFilterLongitudeDimension.filterRange(lonRange);
        }
        
        updateAll();
      }
    }

    function init() {

      var states = topojson.feature(topo, topo.objects.europe).features;
      projection.scale(450).center([42.473110, 40]);

      // Create svg container node

      svg = d3domNode.append('svg')
                     .attr('width', width)
                     .attr('height', height);

      // Add states from topojson

      svg.selectAll('path')
        .data(states).enter()
        .append('path')
        .attr('class', 'feature')
        .style('fill', 'steelblue')
        .attr('d', path);

      // Add popup label
      
      popupLabel = svg.append('text')
                      .attr('class','popup-label')
                      .attr('x', 100)
                      .attr('y', 100); 
      /*
      // Add circle container
      
      circleContainer = svg.append('g');*/
      
      // Render dots into map

      update();
      
      initBrush();
    }

    init();

    return {
      update: update,
      clearFilter: clearFilter
    }
  }
});
