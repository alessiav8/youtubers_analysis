// Load the Excel data
const likesData = d3.csv("./likes.csv");
const commentsData = d3.csv("./comments.csv");
const viewsData = d3.csv("./views.csv");
const followersData = d3.csv("./followers.csv");

// Select the scatterplot elements
const scatterplots = d3.selectAll(".scatterplot");

// Create a function to draw a scatterplot
function drawScatterplot(data, scatterplot) {
  // Create the SVG element
  const svg = d3.select(scatterplot)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Create the scatterplot
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.size; })
    .attr("fill", function(d) { return d.color; });
}

// Draw the scatterplots
likesData.then(function(data) {
  drawScatterplot(data, scatterplots[0]);
});

commentsData.then(function(data) {
  drawScatterplot(data, scatterplots[1]);
});

viewsData.then(function(data) {
  drawScatterplot(data, scatterplots[2]);
});

followersData.then(function(data) {
  drawScatterplot(data, scatterplots[3]);
});
