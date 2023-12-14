let dataset; 

document.addEventListener("DOMContentLoaded", function () {
  showLoadingMessage();

  function showLoadingMessage() {
    document.getElementById("loadingMessage").style.display = "block";
  }

  function hideLoadingMessage() {
    document.getElementById("loadingMessage").style.display = "none";
  }

  getDataAndRenderGraph();

  function getDataAndRenderGraph() {
    const requestOptions = {
      method: "GET",
      headers: {
        month: "june",
      },
    };

    fetch("http://127.0.0.1:5000/data", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        dataset=data;
        hideLoadingMessage();
        renderGraph(data);
      })
      .catch((error) => {
        hideLoadingMessage();
        console.error("Error:", error);
      });
  }

  function renderGraph(data) {
    //data=[{"x":2,"y":5}]
    data.forEach((d) => {
      d.x = +d.x;
      d.y = +d.y;
    });

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select("#GraphContainer")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(data, (d) => d.x);
    const yExtent = d3.extent(data, (d) => d.y);

    const maxExtent = [
      Math.min(xExtent[0], yExtent[0]),
      Math.max(xExtent[1], yExtent[1]),
    ];

    const xScale = d3.scaleLinear().domain(maxExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain(maxExtent).range([height, 0]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute");

    const circles = svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "red");

    circles.on("mouseover", (event) => {
      const xPosition = xScale(event.x) + 5 + 7 * margin.left;
      const yPosition = yScale(event.y) - 10 + 7 * margin.top;
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");

      tooltip.html(`<strong>${event.label}</strong>`);
    });

    circles.on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
    svg.append("g").call(yAxis);

    //brush implementation scatterplot
    const brush = d3.brush()
    .extent([[-20, -20], [width + 20, height + 20]])
    .on("brush",brushed_scatter_plot)
    .on("end",brushedend_scatter_plot)

    function brushed_scatter_plot() {
      const event= d3.event;
      if (event && event.selection) {
        const selection = event.selection;
      }
    }
    function brushedend_scatter_plot() {
      const event= d3.event;
      if (event && event.selection) {
        const selection = event.selection;
        //qui vengono mappati i dati selezionati e ti restituisce l'array con 
        //le label e la posizione dei punti selezionati
        const selectedData = data.filter(d =>
          xScale(d.x) >= selection[0][0] &&
          xScale(d.x) <= selection[1][0] &&
          yScale(d.y) >= selection[0][1] &&
          yScale(d.y) <= selection[1][1]
        );
        console.log("Selected Data:", selectedData);

      }
    }
  svg.call(brush);
  
    


}
});
