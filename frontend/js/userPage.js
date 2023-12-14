const username = window.location.pathname.split('/').pop();

let youtuberData; // Declare youtuberData outside of the fetch block

// Make an AJAX request to the server to get data
fetch(`/getData/${username}`)
  .then(response => response.json())
  .then(data => {
    // Process data and create D3 visualizations here
    youtuberData = data;
    console.log(youtuberData)



    // Create a line chart to show the YouTuber's follower growth over time
  var margin = { top: 20, right: 20, bottom: 30, left: 50 };
  var width = 500 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear()
    .domain([d3.min(youtuberData, function(d) { return new Date(d["Date"]); }), d3.max(youtuberData, function(d) { return new Date(d["Date"]); })])
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(youtuberData, function(d) { return +d["Followers"]; })])
    .range([height, 0]);

  var line = d3.line()
    .x(function(d) { return xScale(new Date(d["Date"])); })
    .y(function(d) { return yScale(d["Followers"]); });

  svg.append("path")
    .datum(youtuberData)
    .attr("class", "line")
    .attr("d", line);

  // Add text labels to the chart
  svg.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .text(youtuberData[0]["Youtube channel"]);

  svg.append("text")
    .attr("class", "country")
    .attr("x", margin.left)
    .attr("y", margin.top + 20)
    .text("Country: " + youtuberData[0]["Country"]);

  svg.append("text")
    .attr("class", "avg-views")
    .attr("x", margin.left)
    .attr("y", margin.top + 40)
    .text("Average views: " + youtuberData[0]["Avg. views"]);

  svg.append("text")
    .attr("class", "avg-likes")
    .attr("x", margin.left)
    .attr("y", margin.top + 60)
    .text("Average likes: " + youtuberData[0]["Avg. likes"]);

  svg.append("text")
    .attr("class", "avg-comments")
    .attr("x", margin.left)
    .attr("y", margin.top + 80)
    .text("Average comments: " + youtuberData[0]["Avg. comments"]);



    // Rest of the D3.js code can be outside the fetch block
  })
  .catch(error => console.error('Error fetching data:', error));

  

  
  