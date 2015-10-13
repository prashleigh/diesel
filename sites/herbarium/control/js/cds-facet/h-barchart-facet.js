

define(function() { 
  
  return function (domNode, crossFilterDimension, updateAll) {

    var width = 400, 
        height = 150, // TODO: make these dynamic, not hard-coded
        margin = { top: 50, left: 20, right: -20, bottom: 50 },
        AXIS_BAR_MARGIN = 5, // space between axis ticks and bars
        AXIS_WIDTH = 0,
        d3domNode = d3.select(domNode), 
        g,
        gBrush,
        clipPathId = 'clip-' + Math.random().toString().slice(2),
        brush = d3.svg.brush(),
        group = crossFilterDimension.group(function (x) {
          return Math.floor(x / 10) * 10;
        }),
        axis = d3.svg.axis().orient('left'),
        xScaleFunction,
        yScaleFunction = d3.scale.linear()
                                 .domain([0, 550]) // This should be the max value
                                 .range([0, width]);

    xScale( d3.time.scale()
              .domain([new Date(1800, 0, 1), new Date(1900, 0, 1)])
              .range([0, height]));

    function xScale(_) {
      if (!arguments.length) { return xScaleFunction; }
      xScaleFunction = _;
      axis.scale(xScaleFunction); // set the scale for the axis
      brush.y(xScaleFunction); // set the scale associated with the brush
    }

    // Set up brush handle event handlers

    function setBrushEventHandlers() {

      var round = false;

      brush.on('brushstart.chart', function () {
        console.log('START');
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select('.title a').style('display', null);
      });

      brush.on('brush.chart', function () {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) {
          g.select('.brush')
            .call(brush.extent(extent = extent.map(round)))
            .selectAll('.resize')
            .style('display', null);
        }

        g.select('#' + clipPathId + ' rect')
            .attr('y', xScaleFunction(extent[0]))
            .attr('height', xScaleFunction(extent[1]) - xScaleFunction(extent[0]));

        crossFilterDimension.filterRange(extent);
        // TODO: have a readout of filter years - - by heading?
      });

      brush.on('brushend.chart', function () {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select('.title a').style('display', 'none');
            div.select('#' + clipPathId + ' rect').attr('y', null).attr('height', '100%');
            crossFilterDimension.filterAll();
        }
        updateAll();
      });
    }

    // Generate chart brush handle as SVG path

    function getResizeHandlePath(d) {

        var e = +(d == 'e'),
            x = e ? 1 : -1,
            y = height / 3;

        return 'M' + (.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 
               'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y) + 'Z' + 
               'M' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) + 
               'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8);
    }

    // Generate a SVG path for the bars
    // I believe groups is taken from what's set via the .datum method
    //  above -- g.selectAll(".bar").datum(group.all());

    function getPathForBars(groups) {

      var path = [],
          i = -1,
          n = groups.length,
          d,
          rightwardShift = margin.left + AXIS_WIDTH;

      while (++i < n) {
        d = groups[i];
        if (d.value > 0)
          path.push('M', 0 + rightwardShift, ',', xScaleFunction(d.key),
                    'H', yScaleFunction(d.value) + rightwardShift, 'v9H', 0 + rightwardShift);
        // M = move to (absolute), V = vertical line (absolute), h = horizontal line (relative)
      }

      return path.join('');
    }

    // Create container for facet bar chart
    //  A group within <svg>

    function addFacetContainer() {

      var id = Math.random(),
          g = d3domNode.append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .attr('class','facet-barchart-container')
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Clip path to clip the foreground (blue) bars, revealing the 
      //  background (grey) bars

      g.append('clipPath')
        .attr('id', clipPathId)
        .append('rect')
        .attr('width', width)
        .attr('height', height + margin.top)
        .attr('y', margin.top * -1);

      // Two SVG path elements - both for the same
      //  data, but one is blue for selection, one is 
      //  grey for the not-selected
      // The 'data' in this case is just for generating
      //  the class attributes 'background bar' and 
      //  'foreground bar'
      // I think the data that is used to create the bars
      //  is set via .datum() -- and group is assigned via the chart.group()
      //  method -- which is called when the chart instance is initialized

      g.selectAll('.bar')
        .data(['background', 'foreground'])
        .enter().append('path')
        .attr('class', function (d) {
          return d + ' bar';
        })
        .datum(group.all());

      // Assign clip path to foreground bars path 
      //  (the one we just created)
      //  according to chart id

      g.selectAll('.foreground.bar')
        // .attr('clip-path', 'url(#clip-' + id + ')');
        .attr('clip-path', 'url(#' + clipPathId + ')');

      // Add chart axis

      g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + margin.left + ',0)')
        .call(axis);

      // Initialize the brush component with pretty resize handles

      gBrush = g.append('g').attr('class', 'brush').call(brush);
      gBrush.selectAll('rect').attr('width', width)
                              .attr('x', margin.left);
      // gBrush.selectAll('.resize').append('path').attr('d', getResizeHandlePath);

      return g;
    }

    // Update facet listing -- this is the main draw routine
    //  Draw content straight to the DOM node

    function update() {

      // Get the foreground and background bar paths
      //  and shape it -- this is performed in getPathForBars(),
      //  defined above

      g.selectAll('.bar').attr('d', getPathForBars);

    }

    function clearFilter() {

      crossFilterDimension.filterAll();

      // Clear brush and blue highlighting

      g.selectAll('g.brush').call(brush.clear());
      d3.select('#' + clipPathId + ' rect')
        .attr('x', null)
        .attr('width', '100%');
    }

    function init() {  
      // addClearButton();
      g = addFacetContainer();
      setBrushEventHandlers();
    }

    init();

    return {
      update: update,
      clearFilter: clearFilter
    }
  }
});
