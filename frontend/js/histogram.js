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
    this.originalDB=data;
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
    this.originalIntervals = this.data.map((d) => ({ ...d }));
  }

  getSubsetByYoutuberNames = (youtuberNamesSubset) => {
    // Get data from localStorage
    let originalDatasetString = localStorage.getItem('datasetFull');
  
    // Parse the string into an object or array
    let originalDataset;
    try {
      originalDataset = JSON.parse(originalDatasetString);
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      return [];
    }
  
    // Check if the parsed data is an array
    if (Array.isArray(originalDataset)) {
      return originalDataset.filter((data) => youtuberNamesSubset.includes(data["youtuber name"]));
    } else {
      console.error('Invalid data format in localStorage. Please provide an array.');
      return [];
    }
  };

  //this function compute the intersection of the selected database and 
  //the currently database stored in the localStorage
  intersectFunction = (db2) => {
    const db1 = JSON.parse(localStorage.getItem('dataset'));
    console.log("Primo dataset completo", db1, "\n\n", "Secondo dataset", db2);
    const db2Map = new Map(db2.map(item => [`${item["Youtube channel"]} - ${item["youtuber name"]}`, item]));
    const intersection = db1.filter(item => db2Map.has(`${item["Youtube channel"]} - ${item["youtuber name"]}`));
    console.log("Intersezione", intersection);
    return intersection;
}

  names=(data)=>{
    const uniqueYoutuberNames = new Set();
    data.forEach(entry => {
      uniqueYoutuberNames.add(entry["youtuber name"]);
    });
    const resultArray = Array.from(uniqueYoutuberNames);
    return resultArray;
    console.log("Unique Youtuber Names:", resultArray);
  }

  brushedend_insto_likes = () => {
    if (d3.event.selection) {
      const [x0, x1] = d3.event.selection;
      const startIndex = Math.floor(this.xScaleIsto.invert(x0));
      const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
      const selectedData = this.data.slice(startIndex, endIndex);

      //this will trigger the color of the scatterplot
      let YTinterval=this.getYoutubersInInterval(selectedData)

      //compute the subset
      let sub=this.getSubsetByYoutuberNames(YTinterval);
      const intersection = this.intersectFunction(sub);
      localStorage.setItem('dataset', JSON.stringify(intersection));
      
      const set_names=this.names(intersection)
      console.log("Selected data", selectedData, "\n\n", "Int", intersection)

      
      if (intersection.length==0){
        window.alert("No intersections found,Reload");
      }
      if (intersection.length==1){
        const confirmation = window.confirm("One youtuber found. Move to see specific data?");
        if (confirmation){
          const username = intersection[0]["Youtube channel"];
          window.location.href = `/userPage.html?username=${encodeURIComponent(username)}`;
        }
      }

      this.colorScatterP(set_names);

      const histograms=["isto_like","isto_view","isto_comment","isto_follower"];

      for (let i in histograms) {
        if(histograms[i]!=this.id){
          if(histograms[i]=="isto_view"){
            const histogramViews = new Histogram(this.originalDB, 'isto_view', '#IstoViews', 'Views');
            const selectedViews= this.findIntervalsForCategory(intersection, histogramViews.data, "Views");
            histogramViews.colorIsto(d3.select("#isto_view"), selectedViews);
          }
          else if(histograms[i]=="isto_comment"){

            const histogramComments = new Histogram(this.originalDB, 'isto_comment', '#IstoComments', 'Comments');
            const selectedComments= this.findIntervalsForCategory(intersection, histogramComments.data, "Comments");
            histogramComments.colorIsto(d3.select("#isto_comment"), selectedComments)
          }
          else if(histograms[i]=="isto_like"){

            const histogramLikes = new Histogram(this.originalDB, 'isto_like', '#IstoLikes', 'Likes');
            const selectedLikes= this.findIntervalsForCategory(intersection, histogramLikes.data, "Likes");
            histogramLikes.colorIsto(d3.select("#isto_like"), selectedLikes)
          }
          else if(histograms[i]=="isto_follower"){
            const histogramFollowers = new Histogram(this.originalDB, 'isto_follower', '#IstoFollowers', 'Followers');
            const selectedFollowers= this.findIntervalsForCategory(intersection, histogramFollowers.data, "Followers");
            histogramFollowers.colorIsto(d3.select("#isto_follower"), selectedFollowers)
          }
        }
        else{

          this.colorIsto(d3.select("#" + this.id), selectedData);  
        }
      }
    }
  };


  brushed_insto_likes = () => {
  };

  //this function takes a string of the tipe 137.K and converts it into a number
  fromStringToNumber = (string) =>{
    if (string != "N/A'" && string!= "N/A" && string!= null) {
      for (let l in string){
        if(string[l]=="K"){
          const new_string= String(string).slice(0,-1);
          return parseFloat(new_string)*1000;
        }
        else if(string[l]=="M"){
          const new_string= String(string).slice(0,-1);
          return parseFloat(new_string)*1000000;
        }
        else if(string[l]=="B"){
          const new_string= String(string).slice(0,-1);
          return parseFloat(new_string)*1000000000;
        }
      }
    }
    else {
      return 0;
    }
}

  //this function takes the object influencer and the type of the selected range 
  //and returns the value of the category 
  //ex. selected range is "Likes" the result will be the value contained in the column "Avg. likes" of the influencer
  getCategoryValue = (influencer, type) => {
    let valueString;
    let result;
    if (type === "Likes") {
      valueString = influencer["Avg. likes"];
      if (typeof(valueString)=="string") {
        result=this.fromStringToNumber(valueString);
      }
      else{
        result=valueString;
      }      
    } else if (type === "Views") {
      valueString = influencer["Avg. views"];
      if (typeof(valueString)=="string") {
        result=this.fromStringToNumber(valueString);
      }
      else{
        result=valueString;
      }
    } else if (type === "Comments") {
      valueString = influencer["Avg. comments"];
      if (typeof(valueString)=="string") {
        result=this.fromStringToNumber(valueString);
      }
      else{
        result=valueString;
      }      

      
    } else if (type === "Followers") {
      valueString = influencer["Followers"];
      if (typeof(valueString)=="string") {
        result=this.fromStringToNumber(valueString);
      }
      else{
        result=valueString;
      }      
    }
    else {
      result = 0;
    }
    return result;
  };
  

  //to find the intervals for the other categories
  findIntervalsForCategory=(subset, categoryData, type) =>{
    console.log("The subset",subset,"called from",type);
    const resultArray = [];
    subset.forEach((influencer) => {
      const categoryValue = this.getCategoryValue(influencer, type);

      const matchedInterval = categoryData.find((interval) => {
        const startValue = parseFloat(interval.start);
        const endValue = parseFloat(interval.end);
        return categoryValue >= startValue && categoryValue <= endValue;
      });  

      if (matchedInterval && !resultArray.some(item => item.intervallo === matchedInterval.intervallo)) {
        resultArray.push({
          intervallo: matchedInterval.intervallo,
          frequenza: matchedInterval.frequenza,
          start: matchedInterval.start,
          end: matchedInterval.end,
        });
      }
    });
  
    return resultArray;
  }
  
  

  //this function handle the color of the selected parts of the histogram
  //component is the isto component
  //datas is the subset of data you want to color 
  //data is the entire dataset
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
        const y = Math.max(0, this.yScaleIsto(d.frequenza)); // Set a minimum value of 0
        return isNaN(y) ? 0 : y;
      })
      
      .attr("height", (d) => {
        const y = this.yScaleIsto(d.frequenza);
        return isNaN(y) ? 0 : this.height_isto - y;
      });
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

    const db = JSON.parse(localStorage.getItem("datasetFull"));
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
    //localStorage.setItem("dataset", JSON.stringify(subsetData));
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
