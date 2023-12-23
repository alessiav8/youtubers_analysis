 class Histogram{

    constructor(data,id,container,label){
        this.data=data;
        this.id=id;
        this.container=container;
        this.margin = { top: 20, right: 20, bottom: 100, left: 40 };
        this.max = d3.max(this.data, (d) => d.frequenza);
        const parentDiv = document.getElementById("mainContainer");
        const parentDivRect = parentDiv.getBoundingClientRect();
        this.width_isto = parentDivRect.width/4 - this.margin.left - this.margin.right;
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
        this.label=label
        
    }

    brushedend_insto_likes = () => {
        if (d3.event.selection) {
          const [x0, x1] = d3.event.selection;
      
          const startIndex = Math.floor(this.xScaleIsto.invert(x0));
          console.log("start", startIndex);
          const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
          console.log("end", endIndex);
  
          const selectedData = this.data.slice(startIndex, endIndex );
  
      
          this.colorIsto(d3.select("#"+this.id), selectedData);
  
          console.log("Selected Data:", selectedData);
        }
      }

      brushed_insto_likes=()=>{
      
      }

      //this function handle the color of the selected parts of the histogram 
      colorIsto = (component, datas) => {
        console.log("color",datas.includes(d) || datas.find(obj => JSON.stringify(obj) === JSON.stringify(d)))
        component
          .selectAll("rect")
          .data(this.data)
          .style("fill", (d) => {
            if (datas.length === 0) {
              return "steelblue";
            }
            return datas.includes(d) || datas.find(obj => JSON.stringify(obj) === JSON.stringify(d)) ? "green" : "steelblue";
          })
          .attr("x", (d, i) => this.xScaleIsto(i))
          .attr("width", this.width_isto / this.data.length - 1)
          .attr("y", (d) => this.yScaleIsto(d.frequenza))
          .attr("height", (d) => this.height_isto - this.yScaleIsto(d.frequenza));
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
    
          //labels for x ranges 
        isto_likes
          .selectAll(".bar-label")
          .data(this.data)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .text((d, i) =>
            formatLabel(d,i))
          .attr(
            "x",
            (d, i) =>
              this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2
          )
          .attr("y", this.height_isto + this.margin.top)
          .attr("text-anchor", "middle")
          .attr("dy", "0.2em")
          .attr("font-size", "7px");
    
          //label y 
        isto_likes
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - this.margin.left)
          .attr("x", 0 - this.height_isto / 2)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("font-size", "8px")
          .text("Frequency");
    
          //label views,comments...
          isto_likes
            .append("text")
            .attr(
              "transform",
              `translate(${this.width_isto / 2}`
            )
            .style("text-anchor", "middle")
            .style("font-size", "9px")
            .text(this.label)
            .attr("x", this.width_isto / 2)
            .attr("y", this.height_isto + this.margin.top + this.margin.bottom - 80);

          
    
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
    
        function formatLabel(label,i) {
          const absNum = Math.abs(label.start);
          let start = "";
          let end="";
          if (absNum >= 1e9) {
            start = (label.start / 1e9).toFixed(1) + "B";
          } else if (absNum >= 1e6) {
            start = (label.start / 1e6).toFixed(1) + "M";
          } else if (absNum >= 1e3) {
            start = (label.start / 1e3).toFixed(1) + "k";
          } else {
            start = label.start.toString();
          }
          if(i==5){
            const absNum2=Math.abs(label.end);
            if (absNum2 >= 1e9) {
              end = (label.end / 1e9).toFixed(1) + "B";
            } else if (absNum2 >= 1e6) {
              end = (label.end / 1e6).toFixed(1) + "M";
            } else if (absNum2 >= 1e3) {
              end = (label.end / 1e3).toFixed(1) + "k";
            } else {
              end = label.end.toString();
            }
            return start + ""+end;

          }
    
        
          return start;
        
      }
    }
    
    
      
      
    }
    
    export default Histogram;