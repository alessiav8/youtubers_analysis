import { parseKMBtoNumber, colorScatterPlot, recomputeIntersection } from "./index.js";
import { Data } from './index.js';
import { updateText } from './index.js';
const minFontSize = Math.max(6.4, window.innerHeight * 0.000000005);

document.addEventListener("DOMContentLoaded", function() {
  var buttonsLinear = document.querySelectorAll(".linearbottom");
  buttonsLinear.forEach(function(button) {
      button.addEventListener("click", function() {
          const id_button=button.id;
          if(id_button=="linear_likes"){
            sessionStorage.setItem("LikesScale","linear");
            removeDiv("#IstoLikes");
            reRenderHisto("Likes", "linear");
          }
          else if(id_button=="linear_comments"){
            sessionStorage.setItem("CommentsScale","linear");
            removeDiv("#IstoComments");
            reRenderHisto("Comments", "linear");
          }
          else if(id_button=="linear_views"){
            sessionStorage.setItem("ViewsScale","linear");
            removeDiv("#IstoViews");
            reRenderHisto("Views", "linear");
          }
          else if(id_button=="linear_followes"){
            sessionStorage.setItem("FollowersScale","linear");
            removeDiv("#IstoFollowers");
            reRenderHisto("Followers", "linear");
          }
      });
  });

  /*function triggerColorChange(type) {
    const intersection= JSON.parse(localStorage.getItem("datasetAfterHisto"));
    const dataHisto= formatData(JSON.parse(localStorage.getItem("dataset")),type,sessionStorage.getItem(type+"Scale"));

    const dataToPass = 
    const selectedLikes = this.findIntervalsForCategory(
      intersection,
      histogramLikes.data,
      "Likes"
    );
    histogramLikes.colorIsto(d3.select("#isto_like"), selectedLikes);
  }*/

  var buttonsLog = document.querySelectorAll(".logbottom");
  buttonsLog.forEach(function(button) {
      button.addEventListener("click", function() {
        const id_button=button.id;
        if(id_button=="log_likes"){
          sessionStorage.setItem("LikesScale","log");
          removeDiv("#IstoLikes");
          reRenderHisto("Likes", "log");
        }
        else if(id_button=="log_comments"){
          sessionStorage.setItem("CommentsScale","log");
          removeDiv("#IstoComments");
          reRenderHisto("Comments", "log");
        }
        else if(id_button=="log_views"){
          sessionStorage.setItem("ViewsScale","log");
          removeDiv("#IstoViews");
          reRenderHisto("Views", "log");
        }
        else if(id_button=="log_followers"){
          sessionStorage.setItem("FollowersScale","log");
          removeDiv("#IstoFollowers");
          reRenderHisto("Followers", "log");
        }
      });
  });
});

function removeDiv(div){
  var containerDiv = d3.select(div);
  containerDiv.selectAll("*").remove();
}

function reRenderHisto(type,scale_type){
  //data considered by the Histo
  const data = JSON.parse(localStorage.getItem("dataset"+type)) ? JSON.parse(localStorage.getItem("dataset"+type)) : JSON.parse(localStorage.getItem("dataset"));
  //data selected in the histo
  let to_color = localStorage.getItem("filteredOnHistos") == "true" ? JSON.parse(sessionStorage.getItem("NoSub"+type)) : false;
  if(localStorage.getItem("scatterTriggered") == "true"){
    to_color = JSON.parse(localStorage.getItem("datasetAfterHisto"))
  }
  let id;
  if(type=="Likes") id="isto_like";
  else if(type=="Comments") id="isto_comment";
  else if(type=="Views") id="isto_view";
  else if(type=="Followers") id="isto_follower";

  const Isto= "#Isto"+type;
  const histo = new Histogram(data, id, Isto, type, scale_type,JSON.parse(localStorage.getItem("NoSub"+type)));
  histo.renderIsto()

  //const format_to_color=formatData(to_color, type, scale_type);
  if(to_color!=false){
    const format_to_color= histo.findIntervalsForCategory(to_color, formatData(data,type,scale_type), type);
    histo.colorIsto(d3.select("#"+id), format_to_color);
  }
}

function formatData(data, type, scale_type) {
  let formattedData;
  const numBins = 6;
  let divisor = 10;

  let key;
  let filterKey;
  let scaleType=scale_type;

  if (type === "Likes") {
    key = "Avg. likes";
    filterKey = "Likes";
  } else if (type === "Views") {
    key = "Avg. views";
    filterKey = "Views";
  } else if (type === "Comments") {
    key = "Avg. comments";
    filterKey = "Comments";
  } else if (type === "Followers") {
    key = "Followers";
    filterKey = "Followers";
  }

  const filteredData = data
    .filter((d) => !isNaN(parseKMBtoNumber(d[key])))
    .map((d) => parseKMBtoNumber(d[key]));

  const maxData = d3.max(filteredData);
  const minData = d3.min(filteredData);

  let tot= maxData / 1000000;
  
  if (tot > 1 ){
    if(tot >= 100){
      divisor = 1;
    }
    else if (tot >= 10){
      divisor = 20;

    }
    else if (tot >= 1){
      divisor=30;

    }
    else{
      divisor = 20;
    }
  }
  else{
    tot= maxData / 1000;
    if(tot < 100){
      //scaleType="linear"
    }
    else{
      divisor = 20; 
    }
  }

  if (data.length < 50){
    //scaleType="linear"
  }
  if(minData >= maxData/10){
    //scaleType="linear"
  }

  const scale = scaleType === "log"
    ? d3.scaleLog().domain([1, maxData]).range([0, maxData / divisor])
    : d3.scaleLinear().domain([1, maxData]).range([0, maxData]);        

  let histogram;
    if (scaleType === "log"){
       histogram = d3.histogram()
      .domain([0, maxData])
      .thresholds(d3.range(1, numBins+1).map((d) => scale(d)))
      (filteredData);
    }
    else{
      const binWidth = (maxData - minData) / numBins;
      const thresholdsLinear = [];
      for (let i = 0; i < numBins; i++) {
        thresholdsLinear.push(minData + binWidth * i);
      }
      
    histogram = d3.histogram()
        .domain([minData, maxData])
        .thresholds(thresholdsLinear)
        (filteredData);
      

    }
  sessionStorage.setItem(filterKey, maxData);

  formattedData = histogram.map((bin) => ({
    intervallo: bin.x0,
    frequenza: bin.length,
    start: `${bin.x0}`,
    end: `${bin.x1}`,
  }));



  return formattedData;
}
const margin = { top: 20, right: 20, bottom: 70, left: 20 };

const parentDiv = document.getElementById("IstoContainer");
const pixels = (window.innerHeight * 25) / 100;


class Histogram {
  constructor(data, id, container, label, scale_type) {
    this.scale=scale_type ? scale_type : "log";
    this.data = formatData(data, label,scale_type);
    this.originalDB = data;
    this.id = id;
    this.container = container;
    this.margin = { top: 20, right: 70, bottom: 50, left: 30};
    this.max = d3.max(this.data, (d) => d.frequenza);
    const parentDiv = document.getElementById("mainContainer");
    const parentDivRect = parentDiv.getBoundingClientRect();
    this.width_isto =
      (parentDivRect.width / 4 - this.margin.left - this.margin.right) - 30 ;
    this.height_isto = pixels - this.margin.top - this.margin.bottom;
    this.xScaleIsto = d3
      .scaleLinear()
      .domain([0, this.data.length])
      .range([0, this.width_isto]);

    /*this.yScaleIsto = d3
      .scaleLinear()
      .domain([0, this.max])
      .range([this.height_isto, 0]);*/

      this.yScaleIsto = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.frequenza)]) 
      .range([this.height_isto, 0]);

      this.xAxisIsto = d3.axisBottom(this.xScaleIsto);
      this.yAxisIsto = d3.axisLeft(this.yScaleIsto);

      const maxFrequenza = d3.max(this.data, d => d.frequenza);
      const tickValuesY = d3.ticks(0, Math.ceil(maxFrequenza), Math.min(10, Math.ceil(maxFrequenza))); // Genera tick interi
      this.yAxisIsto.tickValues(tickValuesY);

      this.yAxisIsto.tickFormat(d3.format(".0f"));
      this.xAxisIsto.tickSize(5);
      this.yAxisIsto.tickSize(5);

      this.xAxisIsto.tickValues([]);
      this.label = label;
      this.originalIntervals = this.data.map((d) => ({ ...d }));
    }

 
  getSubsetByYoutuberNames = (youtuberNamesSubset) => {
    // Get data from localStorage
    let originalDatasetString = localStorage.getItem("datasetFull");
    // Parse the string into an object or array
    let originalDataset;
    try {
      originalDataset = JSON.parse(originalDatasetString);
    } catch (error) {
      console.error("Error parsing data from localStorage:", error);
      return [];
    }

    // Check if the parsed data is an array
    if (Array.isArray(originalDataset)) {
      const sub = originalDataset.filter((data) =>
        youtuberNamesSubset.includes(data["youtuber name"])
      );

    } else {
      console.error(
        "Invalid data format in localStorage. Please provide an array."
      );
      return [];
    }
  };


  //this function compute the intersection of the selected database and
  //the currently database stored in the localStorage
 intersectFunction = (db2) => {
    //orginal database
    const scatterTriggered = localStorage.getItem('scatterTriggered');
    const db = scatterTriggered == true ? JSON.parse(localStorage.getItem("dataContainedInScatterArea")) : JSON.parse(localStorage.getItem("dataset"));

    const histos = ["Likes", "Comments", "Views", "Followers"];
    let n = [3, 4, 5];
    const dynamicDatabases = {};

    for (let i in histos) {
      if (histos[i] !== this.label) {
        let variable = n.pop();
        const my_db = "db" + variable;
        // Associo il valore della sessionStorage all'oggetto dynamicDatabases
        dynamicDatabases[my_db] = JSON.parse(
          sessionStorage.getItem("NoSub" + histos[i])
        );
      }
    }

    var intersection = db.filter(item=>{
      if(dynamicDatabases.db3.some(int=>int["Youtube channel"]==item["Youtube channel"])&& dynamicDatabases.db4.some(int=>int["Youtube channel"]==item["Youtube channel"])&& 
      dynamicDatabases.db5.some(int=>int["Youtube channel"]==item["Youtube channel"])&& db2.some(int=>int["Youtube channel"]==item["Youtube channel"])){
        return item;
      }
    })

    const parentDiv = document.getElementById("ScatterPlotContainer");
    const parentDivRect = parentDiv.getBoundingClientRect();
  
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = (parentDivRect.width/12)*11 - margin.left - margin.right;
    const height = (parentDivRect.height/15)*14 - margin.top - margin.bottom;
    
    const xExtent = d3.extent(Data, (d) => d.x);
    const yExtent = d3.extent(Data, (d) => d.y);
    
    const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);
  

    
    /*se ci sono problemi:
    const xExtent = d3.extent(Data, (d) => d.x);
    const yExtent = d3.extent(Data, (d) => d.y);
  
    const maxExtent = [
      Math.min(xExtent[0], yExtent[0]),
      Math.max(xExtent[1], yExtent[1]),
    ];
  
    const xScale = d3.scaleLinear().domain(maxExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain(maxExtent).range([height, 0]);
    */
   
    var filteredScatter=Data.filter(
      (d) =>
        xScale(d.x) >= localStorage.getItem("pt1x") &&
        xScale(d.x) <= localStorage.getItem("pt2x") &&
        yScale(d.y) >= localStorage.getItem("pt1y") &&
        yScale(d.y) <= localStorage.getItem("pt2y")
    );


    var commonItems = intersection.filter((intersectionItem) => {
      // Create a key for comparison (assuming 'Youtube channel' for intersection)
      const intersectionKey = `${intersectionItem["Youtube channel"]}`;
    
      // Check if the key exists in the 'filteredScatter' array based on 'label'
      return filteredScatter.some((scatterItem) => {
        const scatterKey = scatterItem.label;
        return scatterKey === intersectionKey;
      });
    });

    localStorage.setItem("datasetAfterHisto", JSON.stringify(intersection));
    localStorage.setItem("datasetAfterScatter", JSON.stringify(intersection));
    updateText()

    return commonItems;
  };

  names = (data) => {
    const uniqueYoutuberNames = new Set();
    data.forEach((entry) => {
      uniqueYoutuberNames.add(entry["Youtube channel"]);
    });
    const resultArray = Array.from(uniqueYoutuberNames);
    return resultArray;
  };

  brushedend_insto_likes = () => {
    if (d3.event.selection) {
      //signal the fact that the histo has been filtered
      localStorage.setItem("filteredOnHistos", true);
      const scatterTriggered = localStorage.getItem("scatterTriggered") && JSON.parse(localStorage.getItem("scatterTriggered")) == true ? true : false;
      const [x0, x1] = d3.event.selection;
      const startIndex = Math.floor(this.xScaleIsto.invert(x0));
      const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
      const selectedData = this.data.slice(startIndex, endIndex);

      const selectedAreaScatter = scatterTriggered==true? JSON.parse(localStorage.getItem("dataContainedInScatterArea")) : JSON.parse(localStorage.getItem("dataset"));
      
      let { youtubersInInterval: YTinterval, new_sub: sub } = this.getYoutubersInInterval(selectedData);
      //compute the subset
      //in this case is the subset i have selected by the brush

      sessionStorage.setItem("NoSub"+this.label,JSON.stringify(sub));

      //if it was applied a filter by the use of the scatter
      //i compute the intersection between what i selected in the scatter and what i selected in the histo 
      sub = recomputeIntersection(selectedAreaScatter);
      sessionStorage.setItem("dataset" + this.label, JSON.stringify(sub));
      //this.intersectFunction(sub);
      let intersection = JSON.parse(localStorage.getItem("datasetAfterHisto"));


      if (intersection.length == 0) {
        const confirmation = window.confirm(
          "No intersections found,Reload "      
          );
        if (confirmation) {
          location.reload();

        }      
      }
      if (intersection.length == 1) {
        const confirmation = window.confirm(
          "One youtuber found. Move to see specific data?"
        );
        if (confirmation) {
          const username = intersection[0]["Youtube channel"];
          window.open(`/detail/${encodeURIComponent(username)}`, '_blank');
        }
      }

      //to color the scatterplot i pass the array of youtube channels
      const set_names = this.names(intersection);
      this.colorScatterP(set_names);
      this.reRenderHistos(intersection);
    }
  };


  //Points to color
  checkIntersectionWithScatter = (subset) => {
    const subScatter = JSON.parse(localStorage.getItem("dataContainedInScatterArea"));
    //const afterHistos = JSON.parse(localStorage.getItem("datasetAfterHisto"));
    const newVersion = subScatter.filter((data) => {
      const foundChannel = subset.find(item => item['Youtube channel'] === data["Youtube channel"]) 
      if (foundChannel){
        return data;
      }
    });
    localStorage.setItem("datasetAfterScatter",newVersion);
    return newVersion;
  }

  //selectedData removed here 
  reRenderHistos = (intersection) => {
    const histograms = [
      "isto_like",
      "isto_view",
      "isto_comment",
      "isto_follower",
    ];

    for (let i in histograms) {
        if (histograms[i] == "isto_view") {
          const histogramViews = new Histogram(
            this.originalDB,
            "isto_view",
            "#IstoViews",
            "Views",
            sessionStorage.getItem("ViewsScale")
          );
          const selectedViews = this.findIntervalsForCategory(
            intersection,
            histogramViews.data,
            "Views"
          );
          histogramViews.colorIsto(d3.select("#isto_view"), selectedViews);
        } else if (histograms[i] == "isto_comment") {
          const histogramComments = new Histogram(
            this.originalDB,
            "isto_comment",
            "#IstoComments",
            "Comments",sessionStorage.getItem("CommentsScale")
          );
          const selectedComments = this.findIntervalsForCategory(
            intersection,
            histogramComments.data,
            "Comments"
          );
          histogramComments.colorIsto(
            d3.select("#isto_comment"),
            selectedComments
          );
        } else if (histograms[i] == "isto_like") {
          const histogramLikes = new Histogram(
            this.originalDB,
            "isto_like",
            "#IstoLikes",
            "Likes",
            sessionStorage.getItem("LikesScale")
          );
          const selectedLikes = this.findIntervalsForCategory(
            intersection,
            histogramLikes.data,
            "Likes"
          );
          histogramLikes.colorIsto(d3.select("#isto_like"), selectedLikes);
        } else if (histograms[i] == "isto_follower") {
          const histogramFollowers = new Histogram(
            this.originalDB,
            "isto_follower",
            "#IstoFollowers",
            "Followers",
            sessionStorage.getItem("FollowersScale")
          );
          const selectedFollowers = this.findIntervalsForCategory(
            intersection,
            histogramFollowers.data,
            "Followers"
          );
          histogramFollowers.colorIsto(
            d3.select("#isto_follower"),
            selectedFollowers
          );
        }
      }
  };

  brushed_insto_likes = () => {};

  //this function takes a string of the tipe 137.K and converts it into a number
  fromStringToNumber = (string) => {
    if (string != "N/A'" && string != "N/A" && string != null) {
      for (let l in string) {
        if (string[l] == "K") {
          const new_string = String(string).slice(0, -1);
          return parseFloat(new_string) * 1000;
        } else if (string[l] == "M") {
          const new_string = String(string).slice(0, -1);
          return parseFloat(new_string) * 1000000;
        } else if (string[l] == "B") {
          const new_string = String(string).slice(0, -1);
          return parseFloat(new_string) * 1000000000;
        }
      }
    } else {
      return 0;
    }
  };

  //this function takes the object influencer and the type of the selected range
  //and returns the value of the category
  //ex. selected range is "Likes" the result will be the value contained in the column "Avg. likes" of the influencer
  getCategoryValue = (influencer, type) => {
    let valueString;
    let result;
    if (type === "Likes") {
      valueString = influencer["Avg. likes"];
      if (typeof valueString == "string") {
        result = this.fromStringToNumber(valueString);
      } else {
        result = valueString;
      }
    } else if (type === "Views") {
      valueString = influencer["Avg. views"];
      if (typeof valueString == "string") {
        result = this.fromStringToNumber(valueString);
      } else {
        result = valueString;
      }
    } else if (type === "Comments") {
      valueString = influencer["Avg. comments"];
      if (typeof valueString == "string") {
        result = this.fromStringToNumber(valueString);
      } else {
        result = valueString;
      }
    } else if (type === "Followers") {
      valueString = influencer["Followers"];
      if (typeof valueString == "string") {
        result = this.fromStringToNumber(valueString);
      } else {
        result = valueString;
      }
    } else {
      result = 0;
    }
    return result;
  };

  //to find the intervals for the other categories
  findIntervalsForCategory = (subset, categoryData, type) => {
    const resultArray = [];
    subset.forEach((influencer) => {
      const categoryValue = this.getCategoryValue(influencer, type);

      const matchedInterval = categoryData.find((interval) => {
        const startValue = parseFloat(interval.start);
        const endValue = parseFloat(interval.end);
        return categoryValue >= startValue && categoryValue <= endValue;
      });
      if (
        matchedInterval &&
        !resultArray.some(
          (item) => item.intervallo === matchedInterval.intervallo
        )
      ) {
          
        resultArray.push({
          intervallo: matchedInterval.intervallo,
          frequenza: matchedInterval.frequenza,
          start: matchedInterval.start,
          end: matchedInterval.end,
        });
      }
    });
    return resultArray;
  };

  //this function handle the color of the selected parts of the histogram
  //component is the isto component
  //datas is the subset of data you want to color formatted as the set of intervals selected
  //data is the entire dataset
  colorIsto = (component, datas) => {
    const dataSelected = JSON.parse(localStorage.getItem('datasetAfterHisto'));
    
    component
      .selectAll("rect.gray-rect") 
      .style("fill", "rgb(128, 128, 128, 0.2)"); 

    component.selectAll("rect.blue-rect").remove();
    
    const blueRectangles = component.selectAll("rect.blue-rect") 
        .data(this.data)
        .enter()
        .append("rect")
        .attr("class", "blue-rect")
        .style("fill", (d) => {
            if (datas.length === 0) {
                return "gray";
            }
            return datas.includes(d) ||
                datas.find((obj) => JSON.stringify(obj) === JSON.stringify(d))
                ? "rgb(33, 150, 255)"
                : "gray";
        })
        .attr("x", (d, i) => this.xScaleIsto(i))
        .attr("width", this.width_isto / this.data.length - 1)
        .attr("y",(d) => {
          const percentage = this.calculateHeight(d, this.label, dataSelected, this.height_isto);
          const y = this.yScaleIsto(d.frequenza);
          return isNaN(percentage) ? 0 : this.height_isto - (this.height_isto - y) * percentage; 
      })  
        .attr("height", (d) => {
            const percentage = this.calculateHeight(d, this.label, dataSelected, this.height_isto);
            const y = this.yScaleIsto(d.frequenza);
            return isNaN(percentage) ? 0 : (this.height_isto-y) * percentage;
        });
        const brushContainer = component.select(".brush").remove();
        component.node().appendChild(brushContainer.node());

  };

   calculateHeight=(d, label, subset, totalHeight) =>{
    const totalInstances=d.frequenza;
    if (totalInstances === 0) return 0;

    let realNumberInstancer=0;

    const start = parseFloat(d.start);
    const end = parseFloat(d.end);
    let find;
    if (label == "Likes") {
      find = "Avg. likes";
    } else if (label == "Comments") {
      find = "Avg. comments";
    } else if (label == "Views") {
      find = "Avg. views";
    } else if (label == "Followers") {
      find = "Followers";
    }
    for (let i=0;i<subset.length;i++){
      if(parseKMBtoNumber(subset[i][find]) >= start && parseKMBtoNumber(subset[i][find]) <=end ){
        realNumberInstancer++;
      }
    }
    return realNumberInstancer/totalInstances;
}

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

    let youtubersInInterval = db
      .filter((data) => {
        const likes = parseKMBtoNumber(data[find]);
        return likes >= start && likes <= end;
      })
      .map((data) => data["youtuber name"]);

    youtubersInInterval.filter(item=>{
      if(!db.some(i => i["youtuber name"] === item["youtuber name"] && parseKMBtoNumber(i[find]) > end) ){
        return item;
      }
    })

    let new_sub = db.filter(item => {
      if( youtubersInInterval.some(i => i === item["youtuber name"]) && parseKMBtoNumber(item[find]) <= end){
        return item;
      }
    })

    return {youtubersInInterval, new_sub};
  };

  updateTheDataset = (dataset) => {};

  //auxiliary function to check if a point is inside a set of youtubers
  isPointInsideSelection = (d, youtubers) => {
    const targetYoutuber = String(d.label);
    for (const i in youtubers) {
      const comparisonName = youtubers[i];
      if (targetYoutuber === comparisonName) {
        return true;
      }
    }
    return false;
  };

  //this function handle the color of the selected parts of the scatterplot
  colorScatterP = (youtubers) => {
    const scatterplotContainer = d3.select(`#ScatterPlotContainer`);
    const scatterplot = scatterplotContainer.select("svg");
    const scatterplotGroup = scatterplot.select("g");
    const circles = scatterplotGroup.selectAll("circle");

    circles.attr("opacity", (d) => {
      return youtubers.length > 0
        ? this.isPointInsideSelection(d, youtubers)
          ? 1
          : 0.05
        : 0.05;
    });

    circles.sort((a, b) => d3.descending(a.opacity, b.opacity));

    circles.attr("fill", (d) => {
      return youtubers.length > 0
        ? this.isPointInsideSelection(d, youtubers)
          ? "rgb(33, 150, 255)"
          : "gray"
        : "gray";
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

    // Ticks sull'asse x
    histo
      .selectAll(".tick-line")
      .data(this.data)
      .enter()
      .append("line")
      .attr("class", "tick-line")
      .attr("x1", (d, i) => this.xScaleIsto(i) + this.width_isto / ( this.data.length))
      .attr("x2", (d, i) => this.xScaleIsto(i) + this.width_isto / (this.data.length))
      .attr("y1", this.height_isto)
      .attr("y2", this.height_isto + 5)
      .style("stroke", "black"); 



    histo
      .append("g")
      .call(this.yAxisIsto)
      .selectAll("text")
      .style("font-family", "Arial")
      .style("font-size", minFontSize + "px");

    histo
      .selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "gray-rect")
      .style("fill", "rgb(128,128,128,0.7)")
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
      .text((d, i) =>
        i === 5 ? formatLabel(d.start, i) : formatLabel(d.start, i)
      )
      .attr("x", (d, i) =>
        i == 0
          ? this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 500
          : this.xScaleIsto(i) -
            7 +
            (this.width_isto / this.data.length - 1) / 500
      )
      .attr("y", this.height_isto + this.margin.top)
      .attr("font-size", minFontSize + "px");

    // Etichetta alla fine
    histo
      .selectAll(".bar-label-end")
      .data(this.data)
      .enter()
      .append("text")
      .attr("class", "bar-label-end")
      .text((d, i) => (i === 5 ? formatLabel(d.end, i)  : ""))
      .attr("x", (d, i) =>
        i === 5
          ? this.xScaleIsto(i) - 12 + (this.width_isto / this.data.length - 1) + 5
          : (this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2) + 5
      )
      .attr("y", (d, i) => this.height_isto + this.margin.top)
      .attr("font-size", minFontSize + "px");

    //label y
    histo
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - this.height_isto / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", minFontSize + "px")
      .text("Frequency");

    //label views,comments...
    histo
      .append("text")
      .attr("transform", `translate(${this.width_isto / 2})`)
      .style("text-anchor", "middle")
      .style("font-size", 8 + "px")
      .text(this.label)
      .attr("x", this.width_isto / 2 -80)
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

   

  }
}

export default Histogram;
