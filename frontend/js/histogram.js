 class Histogram{

    constructor(data,id,container){
        this.data=data;
        this.id=id;
        this.container=container;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.width_isto = 300 - this.margin.left - this.margin.right;
        this.height_isto = 200 - this.margin.top - this.margin.bottom;
        this.max = d3.max(this.data, (d) => d.frequenza);
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
      

    renderIsto(){  
          const isto_likes = d3
            .select(this.container)
            .append("svg")
            .attr("width", this.width_isto + this.margin.left + this.margin.right)
            .attr("height", this.height_isto + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("id",this.id)
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
      
          isto_likes
            .append("g")
            .attr("transform", `translate(0, ${this.height_isto})`)
            .call(this.xAxisIsto);
      
          isto_likes.append("g").call(this.yAxisIsto);
      
          isto_likes
            .selectAll("rect")
            .data(this.data)
            .enter()
            .append("rect")
            .style("fill", "steelblue")
            .attr("x", (d, i) => this.xScaleIsto(i))  
            .attr("width", this.width_isto / this.data.length - 1)
            .attr("y", (d) => this.yScaleIsto(d.frequenza))  
            .attr("height", (d) => this.height_isto - this.yScaleIsto(d.frequenza)); 

            isto_likes
            .selectAll(".bar-label")
            .data(this.data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .text((d) => d.intervallo)
            .attr("x", (d, i) => this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2)
            .attr("y", this.height_isto + this.margin.top)
            .attr("text-anchor", "middle")
            .attr("dy", "0.5em")
            .attr("font-size", "10px");
      
          isto_likes
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left)
            .attr("x", 0 - this.height_isto / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency");
      
          d3.select("#IstoLikes")
            .append("text")
            .text("Likes")
            .attr("x", this.width_isto / 2)
            .attr("y", this.height_isto + this.margin.top + this.margin.bottom)
            .attr("dy", "2em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "black");
      
          
          const brushX = d3.brushX()
            .extent([[0, 0], [this.width_isto, this.height_isto]])
            .on("brush", this.brushed_insto_likes)
            .on("end",this.brushedend_insto_likes)
          
          isto_likes.append("g")
            .attr("class", "brush")
            .call(brushX);
      
        }
}

export default Histogram;