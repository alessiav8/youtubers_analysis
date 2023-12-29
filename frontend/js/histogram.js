import {parseKMBtoNumber,colorScatterPlot} from "./index.js";

function formatData(data, type) {
  let formattedData;
  const numBins = 5;

  if (type === "Likes") {
    // Likes
    const likesData = data
      .filter((d) => !isNaN(parseKMBtoNumber(d["Avg. likes"])))
      .map((d) => parseKMBtoNumber(d["Avg. likes"]));
    const maxLikes = d3.max(likesData);
    sessionStorage.setItem('Likes', maxLikes);
    const logScaleLikes = d3.scaleLog()
      .domain([1, maxLikes])
      .range([0, maxLikes / 10]);
    const histogramLikes = d3.histogram()
      .domain([0, maxLikes])
      .thresholds(d3.range(1, numBins + 2).map(d => logScaleLikes(d)))
      (likesData);
    formattedData = histogramLikes.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
      start: `${bin.x0}`,
      end: `${bin.x1}`,
    }));
  }
  else if (type === "Views") {
    // Views
    const viewsData = data
      .filter((d) => !isNaN(parseKMBtoNumber(d["Avg. views"])))
      .map((d) => parseKMBtoNumber(d["Avg. views"]));
    const maxViews = d3.max(viewsData);
    sessionStorage.setItem('Views', maxViews)
    const logScaleViews = d3.scaleLog()
      .domain([1, maxViews])
      .range([0, maxViews / 10]);
    const histogramViews = d3.histogram()
      .domain([0, maxViews])
      .thresholds(d3.range(1, numBins + 2).map(d => logScaleViews(d)))
      (viewsData);
    formattedData = histogramViews.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
      start: `${bin.x0}`,
      end: `${bin.x1}`,
    }));
  }
  else if (type === "Comments") {
    // Comments
    const commentsData = data
      .filter((d) => !isNaN(parseKMBtoNumber(d["Avg. comments"])))
      .map((d) => parseKMBtoNumber(d["Avg. comments"]));
    const maxComments = d3.max(commentsData);
    sessionStorage.setItem('Comments', maxComments)
    const logScaleComments = d3.scaleLog()
      .domain([1, maxComments])
      .range([0, maxComments / 10]);
    const histogramComments = d3.histogram()
      .domain([0, maxComments])
      .thresholds(d3.range(1, numBins + 2).map(d => logScaleComments(d)))
      (commentsData);
    formattedData = histogramComments.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
      start: `${bin.x0}`,
      end: `${bin.x1}`,
    }));
  }
  else if (type === "Followers") {
    // Followers
    const followersData = data
      .filter((d) => !isNaN(parseKMBtoNumber(d["Followers"])))
      .map((d) => parseKMBtoNumber(d["Followers"]));
    const maxFollowers = d3.max(followersData);
    sessionStorage.setItem("Followers", maxFollowers);
    const logScaleFollowers = d3.scaleLog()
      .domain([1, maxFollowers])
      .range([0, maxFollowers / 1]);
    const histogramFollowers = d3.histogram()
      .domain([0, maxFollowers])
      .thresholds(d3.range(1, numBins + 2).map(d => logScaleFollowers(d)))
      (followersData);
    formattedData = histogramFollowers.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
      start: `${bin.x0}`,
      end: `${bin.x1}`,
    }));
    const minFollowers = d3.min(followersData);
  }

  return formattedData;
}

class Histogram {
  constructor(data, id, container, label) {
    this.data = formatData(data, label);
    this.id = id;
    this.container = container;
    this.margin = { top: 20, right: 40, bottom: 50, left: 40 };
    this.max = d3.max(this.data, (d) => d.frequenza);
    const parentDiv = document.getElementById("mainContainer");
    const parentDivRect = parentDiv.getBoundingClientRect();
    this.width_isto =
      parentDivRect.width / 4 - this.margin.left - this.margin.right;
    this.height_isto = 250 - this.margin.top - this.margin.bottom;
    this.xScaleIsto = d3
      .scaleLinear()
      .domain([0, this.data.length])
      .range([0, this.width_isto]);

    this.yScaleIsto = d3
      .scaleLinear()
      .domain([0, this.max])
      .range([this.height_isto, 0]);

    this.xAxisIsto = d3.axisBottom(this.xScaleIsto).tickValues([]).tickSize(0);
    this.yAxisIsto = d3.axisLeft(this.yScaleIsto);
    this.label = label;
  }

  brushedend_insto_likes = () => {
    if (d3.event.selection) {
      const [x0, x1] = d3.event.selection;
      const startIndex = Math.floor(this.xScaleIsto.invert(x0));
      const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
      const selectedData = this.data.slice(startIndex, endIndex);
      this.colorIsto(d3.select("#" + this.id), selectedData);      
      this.getYoutubersInInterval(selectedData)
    }
  };

  brushed_insto_likes = () => {
  };

  //this function handle the color of the selected parts of the histogram
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
      .attr("y", (d) => this.yScaleIsto(d.frequenza))
      .attr("height", (d) => this.height_isto - this.yScaleIsto(d.frequenza));
    
  };

  //get a set of intervals return the minimum start and the maximum end of the interval
  getMaxRange = (interval) => {
    let start = interval[0].start;
    let end = 0;
    interval.forEach((i) => {
      if (parseFloat(i.start) < start) {
        start = i.start;
      }
      if (parseFloat(i.end) > end) {
        end = i.end;
      }
    });
    return { start: start, end: end };
  };

  //TODO:modificare la gestione del db per inserire e rimuovere intervalli.
  //Given a certain interval(I), return the youtubers in that interval
  //the function generate the set of labels related to the interval youtubers(O) (we need it to color the related circles in the scatterplot)
  //and it produces the subset of the dataset containing the youtubers in that interval(O)
  getYoutubersInInterval = (interval) => {

    const db = JSON.parse(localStorage.getItem("dataset"));
    console.log("consideredDB", db);
    let find;
    if (this.label == "Likes") {
      find = "Avg. likes";
    } else if (this.label == "Comments") {
      find = "Avg. comments";
    } else if (this.label == "Views") {
      find = "Avg. views";
    } else if (this.label == "Followers") {
      find = "Followers";
    }

    const { start, end } = this.getMaxRange(interval);

    const youtubersInInterval = db
      .filter((data) => {
        const likes = parseKMBtoNumber(data[find]);
        return likes >= start && likes <= end;
      })
      .map((data) => data["youtuber name"]);

    const subsetData = db.filter((data) => {
      const likes = parseKMBtoNumber(data["Avg. likes"]);
      return likes >= start && likes <= end;
    });

    localStorage.setItem("dataset", JSON.stringify(subsetData));

    this.colorScatterP(youtubersInInterval);

    return youtubersInInterval;
  };

  updateTheDataset=(dataset)=>{

  }

  //auxiliary function to check if a point is inside a set of youtubers
  isPointInsideSelection = (d, youtubers) => {
    const targetYoutuber = String(d.label).toLowerCase();
    for (const i in youtubers) {
      const comparisonName = String(youtubers[i]).toLowerCase();
      if (targetYoutuber === comparisonName) {
        return true;
      }
    }
    return false;
  };

  //this function handle the color of the selected parts of the scatterplot
  colorScatterP = (youtubers) => {
    // TODO: this must wait for the scatterplot to load
    const scatterplotContainer = d3.select(`#ScatterPlotContainer`);
    const scatterplot = scatterplotContainer.select("svg");
    const scatterplotGroup = scatterplot.select("g");
    const circles = scatterplotGroup.selectAll("circle");

    circles.attr("fill", (d) => {
      return youtubers.length > 0
        ? this.isPointInsideSelection(d, youtubers)
          ? "green"
          : "rgba(70, 130, 180, 0.1)"
        : "steelblue";
    });
  };


  //this function handle the renderization of the histogram
  renderIsto() {
    const histo = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width_isto + this.margin.left + this.margin.right)
      .attr("height", this.height_isto + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("id", this.id)
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    histo
      .append("g")
      .attr("transform", `translate(0, ${this.height_isto})`)
      .call(this.xAxisIsto);

    histo
      .append("g")
      .call(this.yAxisIsto)
      .selectAll("text")
      .style("font-family", "Arial")
      .style("font-size", "8px");

    histo
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

    // Etichetta all'inizio
    histo
    .selectAll(".bar-label-start")
    .data(this.data)
    .enter()
    .append("text")
    .attr("class", "bar-label-start")
    .text((d, i) => (i === 5 ? formatLabel(d.start, i) : formatLabel(d.start, i)))
    .attr("x", (d, i) => i==0?  this.xScaleIsto(i)  + (this.width_isto / this.data.length - 1) / 500 : this.xScaleIsto(i) -7 + (this.width_isto / this.data.length - 1) / 500)
    .attr("y", this.height_isto + this.margin.top)
    .attr("font-size", "8px");

    // Etichetta alla fine
    histo
    .selectAll(".bar-label-end")
    .data(this.data)
    .enter()
    .append("text")
    .attr("class", "bar-label-end")
    .text((d, i) => (i === 5 ? formatLabel(d.end, i) : ""))
    .attr("x", (d, i) => (i === 5 ? (this.xScaleIsto(i)-10 + (this.width_isto / this.data.length - 1) ) : (this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2)))
    .attr("y", (d, i) => this.height_isto + this.margin.top ) 
    .attr("font-size", "8px");


    //label y
    histo
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - this.height_isto / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "8px")
      .text("Frequency");

    //label views,comments...
    histo
      .append("text")
      .attr("transform", `translate(${this.width_isto / 2})`)
      .style("text-anchor", "middle")
      .style("font-size", "9px")
      .text(this.label)
      .attr("x", this.width_isto / 2-100)
      .attr("y", this.height_isto + this.margin.top + this.margin.bottom - 30);

    const brushX = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width_isto, this.height_isto],
      ])
      .on("brush", this.brushed_insto_likes)
      .on("end", this.brushedend_insto_likes);

    histo
      .append("g")
      .attr("class", "brush")
      .call(brushX)
      .selectAll("rect")
      .attr("height", this.height_isto);

      function formatLabel(label, i) {
        const absNum = Math.abs(label);
        let start = "";
        let end = "";
      
        const roundedValue = Math.floor(label);
      
        if (absNum >= 1e9) {
          start = (roundedValue / 1e9).toFixed(1) + "B";
        } else if (absNum >= 1e6) {
          start = (roundedValue / 1e6).toFixed(1) + "M";
        } else if (absNum >= 1e3) {
          start = (roundedValue / 1e3).toFixed(1) + "k";
        } else {
          start = roundedValue.toString();
        }
      
        return start;
      }


      //this function handle the click on the histogram outside/inside.
      const container_isto = document.getElementById('Isto' + this.label);
      console.log("container", "Isto" + this.label);
      
      container_isto.addEventListener('click', function(event) {
          const isClicInsideIstogramma = event.target.id === 'histo';
      
          if (isClicInsideIstogramma) {
              console.log("inside");
          } else {
              console.log("outside");
          }
      });
      

}
}

export default Histogram;
