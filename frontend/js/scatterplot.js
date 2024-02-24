
class ScatterPlot {
    constructor(data) {
      this.data = data;
      this.setup();
    }
  
    setup() {
      this.data.forEach((d) => {
        d.x = +d.x;
        d.y = +d.y;
      });
  
      const parentDiv = document.getElementById("ScatterPlotContainer");
      const parentDivRect = parentDiv.getBoundingClientRect();
  
      this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
      this.width = parentDivRect.width - this.margin.left - this.margin.right;
      this.height = parentDivRect.height - this.margin.top - this.margin.bottom;
  
      this.scatterPlot = d3
        .select("#ScatterPlotContainer")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("id", "mds")
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  
      this.xExtent = d3.extent(this.data, (d) => d.x);
      this.yExtent = d3.extent(this.data, (d) => d.y);
  
      this.maxExtent = [
        Math.min(this.xExtent[0], this.yExtent[0]),
        Math.max(this.xExtent[1], this.yExtent[1]),
      ];
  
      this.xScale = d3.scaleLinear().domain(this.maxExtent).range([0, this.width]);
      this.yScale = d3.scaleLinear().domain(this.maxExtent).range([this.height, 0]);
  
      this.tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");
  
      this.circles = this.scatterPlot
        .append("g")
        .selectAll("circle")
        .data(this.data)
        .enter()
        .append("circle")
        .attr("cx", (d) => this.xScale(d.x))
        .attr("cy", (d) => this.yScale(d.y))
        .attr("r", 4)
        .attr("fill", "red");
  
      this.circles.on("mouseover", (event) => {
        const xPosition = this.xScale(event.x) + 5 + 7 * this.margin.left;
        const yPosition = this.yScale(event.y) - 10 + 7 * this.margin.top;
        this.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9)
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");
  
        this.tooltip.html(`<strong>${event.label}</strong>`);
      });
  
      this.circles.on("mouseout", () => {
        this.tooltip.transition().duration(500).style("opacity", 0);
      });
  
      this.xAxis = d3.axisBottom(this.xScale);
      this.yAxis = d3.axisLeft(this.yScale);
  
      this.scatterPlot
        .append("g")
        .attr("transform", `translate(0, ${this.height})`)
        .call(this.xAxis);
      this.scatterPlot.append("g").call(this.yAxis);
      this.scatterPlot
        .append("g")
        .attr("transform", `translate(0, ${this.height})`)
        .call(this.xAxis);
      this.scatterPlot.append("g").call(this.yAxis);
  
      this.setupBrush();
    }
  
    setupBrush() {
      const brush = d3
        .brush()
        .extent([
          [-20, -20],
          [this.width + 20, this.height + 20],
        ])
        .on("brush", this.brushedScatterPlot.bind(this))
        .on("end", this.brushedEndScatterPlot.bind(this));
  
      this.scatterPlot.call(brush);
    }
  
    brushedScatterPlot() {
      const event = d3.event;
      if (event && event.selection) {
        const selection = event.selection;
        // handle brush event
      }
    }
  
    brushedEndScatterPlot() {
      const event = d3.event;
      if (event && event.selection) {
        const selection = event.selection;
        const selectedData = this.data.filter(
          (d) =>
            this.xScale(d.x) >= selection[0][0] &&
            this.xScale(d.x) <= selection[1][0] &&
            this.yScale(d.y) >= selection[0][1] &&
            this.yScale(d.y) <= selection[1][1]
        );
        this.colorScatterPlot(selectedData, "black");
      }
    }
  
    colorScatterPlot(selectedData, color) {
      this.circles.attr("fill", (d) => {
        return selectedData.length > 0
          ? this.isPointInsideSelection(d, selectedData)
            ? color
            : "red"
          : "red";
      });
    }
  
    isPointInsideSelection(point, selection) {
      for (const i in selection) {
        if (point.x === selection[i].x && point.y === selection[i].y) {
          return true;
        }
      }
      return false;
    }
  }
  