import {parseKMBtoNumber, colorScatterPlot} from "./index.js";

class Histogram {
  constructor(data, id, container, label) {
    this.data = data;
    this.id = id;
    this.container = container;
    this.label = label;
    this.margin = { top: 10, right: 20, bottom: 50, left: 60 };
    const parentDiv = document.getElementById("mainContainer");
    const parentDivRect = parentDiv.getBoundingClientRect();
    this.width_isto = parentDivRect.width/4 - this.margin.left - this.margin.right;
    this.height_isto = 250 - this.margin.top - this.margin.bottom;
    this.max = d3.max(this.data, (d) => d.frequenza);
    this.max_value = sessionStorage.getItem(this.label);
    this.dataset = sessionStorage.getItem("dataset");

    this.xScaleIsto = d3
      .scaleLinear()
      .domain([0, this.data.length])
      .range([0, this.width_isto]);

    this.yScaleIsto = d3
      .scaleLinear() 
      .domain([0, this.max])
      .range([this.height_isto, 0]);

    this.xAxisIsto = d3.axisBottom(this.xScaleIsto).tickValues([]).tickSize(0);
    this.yAxisIsto = d3.axisLeft(this.yScaleIsto)
      .tickFormat(d3.format(",.0f"))
      .tickPadding(10);
  }

  brushedend_insto_likes = () => {
    if (d3.event.selection) {
      const [x0, x1] = d3.event.selection;
      const startIndex = Math.floor(this.xScaleIsto.invert(x0));
      const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
      const selectedData = this.data.slice(startIndex, endIndex);
      this.colorIsto(d3.select("#" + this.id), selectedData);
      console.log("Selected Data:", selectedData);
    }
  };

  brushed_insto_likes = () => {};

  colorIsto = (component, datas) => {
    component
      .selectAll("rect")
      .data(this.data)
      .style("fill", (d) => {
        if (datas.length === 0) {
          return "steelblue";
        }
        return datas.includes(d) ||
          datas.find((obj) => JSON.stringify(obj) === JSON.stringify(d))
          ? "green"
          : "steelblue";
      })
      .attr("x", (d, i) => this.xScaleIsto(i))
      .attr("width", this.width_isto / this.data.length - 1)
      .attr("y", (d) => {
        const y = this.yScaleIsto(d.frequenza);
        return isNaN(y) ? 0 : y;
      })
      .attr("height", (d) => {
        const y = this.yScaleIsto(d.frequenza);
        return isNaN(y) ? 0 : this.height_isto - y;
      });
      this.getYoutubersInInterval(datas)
  };


  getMaxRange=(interval)=>{
    let start= interval[0].start;
    let end = 0;
    interval.forEach( (i)=>{
      if(parseFloat(i.start)<start){
        start=i.start;
      }
      if(parseFloat(i.end)>end){
        end=i.end;
      }
    })
    return {start:start,end:end};
  }


  //TODO:modificare la gestione del db per inserire e rimuovere intervalli.
  getYoutubersInInterval = (interval) =>{
    const db = JSON.parse(localStorage.getItem("dataset"));
    console.log("consideredDB",db)
    let find;
    if(this.label=="Likes"){
      find="Avg. likes";
    }else if(this.label=="Comments"){
      find="Avg. comments";
    }else if (this.label=="Views"){
      find="Avg. views";
    }else if(this.label=="Followers"){
      find="Followers"
    }

    const {start, end} = this.getMaxRange(interval)

    const youtubersInInterval = db
      .filter((data) => {
        const likes =parseKMBtoNumber(data[find]);
        return likes >= start && likes <= end;
      })
      .map((data) => data["youtuber name"]);

      const subsetData = db.filter((data) => {
        const likes = parseKMBtoNumber(data["Avg. likes"]);
        return likes >= start && likes <= end;
      });

      localStorage.setItem("dataset",JSON.stringify(subsetData))

      this.colorScatterP(youtubersInInterval)

  
    return youtubersInInterval;
  }

  isPointInsideSelection = (d, youtubers) => {
    const targetYoutuber = String(d.label).toLowerCase();
    for (const i in youtubers) {
      const comparisonName = String(youtubers[i]).toLowerCase();
      if (targetYoutuber === comparisonName) {
        console.log("yes");
        return true;
      }
    }
    return false;
  }
  
  
  colorScatterP = (youtubers) => {
    // TODO: this must wait for the scatterplot to load
    const scatterplotContainer = d3.select(`#ScatterPlotContainer`);
    const scatterplot = scatterplotContainer.select('svg');
    const scatterplotGroup = scatterplot.select('g');
    const circles = scatterplotGroup.selectAll("circle");
  
    circles.attr("fill", (d) => {
      return youtubers.length > 0
        ? this.isPointInsideSelection(d, youtubers)
          ? "blue"
          : "rgba(255, 0, 0, 0.1)"
        : "red";
    });
  }
  

  renderIsto() {
    const isto_likes = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width_isto + this.margin.left + this.margin.right)
      .attr("height", this.height_isto + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("id", this.id)
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    isto_likes
      .append("g")
      .attr("transform", `translate(0, ${this.height_isto})`)
      .call(this.xAxisIsto);

    isto_likes
      .append("g")
      .call(this.yAxisIsto)
      .selectAll("text")
      .style("font-family", "Arial")
      .style("font-size", "8px");

    isto_likes
      .selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .style("fill", "steelblue")
      .attr("x", (d, i) => this.xScaleIsto(i))
      .attr("width", this.width_isto / this.data.length - 1)
      .attr("y", (d) => {
        const y = this.yScaleIsto(d.frequenza);
        return isNaN(y) ? 0 : y;
      })
      .attr("height", (d) => {
        const y = this.yScaleIsto(d.frequenza);
        return isNaN(y) ? 0 : this.height_isto - y;
      });

    isto_likes
      .selectAll(".bar-label")
      .data(this.data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .text((d, i) =>
        formatLabel(
          d.intervallo,
          this.data[i + 1]
            ? this.data[i + 1].intervallo
            : parseInt(this.max_value)
        )
      )
      .attr(
        "x",
        (d, i) =>
          this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2
      )
      .attr("y", this.height_isto + this.margin.top)
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em")
      .attr("font-size", "7px");

    isto_likes
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - this.height_isto / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Frequency");

    isto_likes
      .append("text")
      .attr(
        "transform",
        `translate(${this.width_isto / 2},${
          this.height_isto + this.margin.top + this.margin.bottom - 20
        })`
      )
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(this.label);

    const brushX = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width_isto, this.height_isto],
      ])
      .on("brush", this.brushed_insto_likes)
      .on("end", this.brushedend_insto_likes);

    isto_likes
      .append("g")
      .attr("class", "brush")
      .call(brushX)
      .selectAll("rect")
      .attr("height", this.height_isto);

    function formatLabel(label, next) {
      const absNum = Math.abs(label);
      const absNum2 = Math.abs(next);
      let start = "";
      let end = "";

      if (absNum >= 1e9) {
        start = (label / 1e9).toFixed(1) + "B";
      } else if (absNum >= 1e6) {
        start = (label / 1e6).toFixed(1) + "M";
      } else if (absNum >= 1e3) {
        start = (label / 1e3).toFixed(1) + "k";
      } else {
        start = label.toString();
      }

      const previous = next - 1;
      if (absNum2 >= 1e9) {
        end = (previous / 1e9).toFixed(1) + "B";
      } else if (absNum2 >= 1e6) {
        end = (previous / 1e6).toFixed(1) + "M";
      } else if (absNum2 >= 1e3) {
        end = (previous / 1e3).toFixed(1) + "k";
      } else {
        end = previous.toString();
      }
      return start + "-" + end;
    }
  }


  
  
}

export default Histogram;
