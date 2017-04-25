/* Create a barchart of drinking patterns*/
$(function () {



    // Read in prepped_data file
    d3.csv('data/EPL2015_2016.csv', function (error, allData) {
        // Track the sex (male, female) and drinking type (any, binge) in variables
        var team = 'Chelsea';
        var type = 'home';

        // Margin: how much space to put in the SVG for axes/titles
        var margin = {
            left: 70,
            bottom: 100,
            top: 50,
            right: 50
        };

        // Height and width of the total area
        var height = 600;
        var width = 1000;

        // Height/width of the drawing area for data symbolscl
        var drawHeight = height - margin.bottom - margin.top;
        var drawWidth = width - margin.left - margin.right;

        // Select SVG to work with, setting width and height (the vis <div> is defined in the index.html file)
        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        // Append a 'g' element in which to place the rects, shifted down and right from the top left corner
        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('height', drawHeight)
            .attr('width', drawWidth);

        // Append text to label the y axis (don't specify the text yet)
        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
            .attr('class', 'title');

        // Append text to label the y axis (don't specify the text yet)
        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
            .attr('class', 'title');

        // Define xAxis using d3.axisBottom(). Scale will be set in the setAxes function.
        var xAxis = d3.axisBottom();

        // Define yAxis using d3.axisLeft(). Scale will be set in the setAxes function.
        var yAxis = d3.axisLeft()
            .tickFormat(d3.format('.0f'));

        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top) + ')')
            .attr('class', 'axis');

        // Append a yaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        // Define an xScale with d3.scaleBand. Domain/rage will be set in the setScales function.
        var xScale = d3.scaleBand();

        // Define a yScale with d3.scaleLinear. Domain/rage will be set in the setScales function.
        var yScale = d3.scaleLinear();

        var z = d3.scaleOrdinal()
            .range(["#034694", "rgba(233, 168, 1, 0.63)"]);

        var setScales = function (data) {
            // Get the unique values of states for the domain of your x scale
            var opponents = data.map(function (d) {
                if (type === "home") {
                    return d.away_team;
                } else {
                    return d.home_team;
                }

            });

            // Set the domain/range of your xScale
            xScale.range([0, drawWidth])
                .padding(0.1)
                .domain(opponents);

            var yMin = 0;

            var yMax = d3.max(data, function (d) {
                let goals = 0;
                if (type === 'home') {
                    goals = +d.home_team_goal;
                } else {
                    goals = +d.away_team_goal;
                }

                if (d.goal_differential < 0) {
                    goals = goals + Math.abs(d.goal_differential);
                }
                return goals + 1;
            });
            // Set the domain/range of your yScale
            yScale.range([drawHeight, 0])
                .domain([0, yMax]);
        };

        var setAxis = function () {

            // Set the scale of your xAxis object
            xAxis.scale(xScale);

            // Set the scale of your yAxis object
            yAxis.scale(yScale);

            // Render (call) your xAxis in your xAxisLabel
            xAxisLabel.transition().duration(1000)
                .call(xAxis)
                .selectAll('text')
                .style("text-anchor", "end")
                .attr("y", 8)
                .attr("x", -8)
                .attr("transform", "rotate(-45)");

            // Render (call) your yAxis in your yAxisLabel
            yAxisLabel.transition().duration(1000).call(yAxis);

            // Update xAxisText and yAxisText labels
            xAxisText.text('Opponent')
                .attr('transform', 'translate(' + (margin.left - margin.right + drawWidth / 2) + ',' + (drawHeight + margin.top + 90) + ')')
                .attr('class', 'axis-label');


            yAxisText.text('Goals Scored (' + type + ' games)');

        };

        //Returns coorect pluraility for # goals
        var goal_format = function (goals) {
            if (goals == 1) {
                return " goal";
            } else {
                return " goals";
            }
        }

        // Add tip
        var tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
            let html = "";
            if (type === "home") {
                html = d.home_team + " scored: " + d.home_team_goal + goal_format(d.home_team_goal);
                html = html + "</br>" + d.away_team + " scored: " + d.away_team_goal + goal_format(d.away_team_goal);
            } else {
                html = d.away_team + " scored: " + d.away_team_goal + goal_format(d.away_team_goal);
                html = html + "</br>" + d.home_team + " scored: " + d.home_team_goal + goal_format(d.home_team_goal);

            }
            return html
        });
        g.call(tip);

        var draw = function (data) {
            setScales(data);
            setAxis();

            // Store the data-join in a function: make sure to set the scales and update the axes in your function.
            // Select all rects and bind data
            var bars = g.selectAll('rect').data(data);

            // Use the .enter() method to get your entering elements, and assign initial positions
            bars.enter().append('rect')
                .attr('x', function (d) {
                    if (type === "home") {
                        return xScale(d.away_team);
                    } else {
                        return xScale(d.home_team);
                    }
                })
                .attr('class', 'bar')
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr('width', xScale.bandwidth())
                .merge(bars)
                .transition()
                .duration(function (d, i) {
                    return i / 2 * 50;
                })
                .delay(function (d, i) {
                    return i * 50;
                })
                .attr('y', function (d) {
                    return yScale(d.home_team_goal);
                })
                .attr('height', function (d) {
                    return drawHeight - yScale(d.home_team_goal);

                })
                .style('fill', '#034694');

            bars.exit().remove();
        };

        var filterData = function () {
            var filteredData = allData.filter(function (d) {
                    if (type === "home") {
                        return d.home_team === team;
                    } else {
                        return d.away_team === team;
                    }
                })
                // Sort the data chronologically
                .sort(function (a, b) {
                    if (a.id < b.id) return -1;
                    if (a.id > b.id) return 1;
                    return 0;
                });
            return filteredData;
        };

        $(".input").on('change', function () {
            var val = $(this).val();
            var isType = $(this).hasClass('type');
            if (isType) {
                type = val;
            } else {
                team = val;
            }
            var filteredData = filterData();
            draw(filteredData);
        });
        var filteredData = filterData();
        draw(filteredData);
    });
});
