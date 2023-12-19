 class Histogram{

    constructor(data,id,container,label){
        this.data=data;
        this.id=id;
        this.container=container;
        this.label=label;
        this.margin = { top: 10, right: 20, bottom: 50, left: 60 };
        this.width_isto = 350 - this.margin.left - this.margin.right;
        this.height_isto = 250 - this.margin.top - this.margin.bottom;
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
        this.max_value=sessionStorage.getItem(this.label);
        //console.log("Construct",this.data,this.id,this.container,this.label,this.max_value)

        
    }

    brushedend_insto_likes = () => {
        if (d3.event.selection) {
          const [x0, x1] = d3.event.selection;
          const startIndex = Math.floor(this.xScaleIsto.invert(x0));
          const endIndex = Math.ceil(this.xScaleIsto.invert(x1));
          const selectedData = this.data.slice(startIndex, endIndex );
          this.colorIsto(d3.select("#"+this.id), selectedData);
          console.log("Selected Data:", selectedData);
        }
      }

      brushed_insto_likes=()=>{
      
      }

      //this function handle the color of the selected parts of the histogram 
      colorIsto = (component, datas) => {
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
      

          isto_likes.append("g").call(this.yAxisIsto)
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
            .attr("y", (d) => this.yScaleIsto(d.frequenza))  
            .attr("height", (d) => this.height_isto - this.yScaleIsto(d.frequenza)); 

            isto_likes
            .selectAll(".bar-label")
            .data(this.data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .text((d,i) => formatLabel(d.intervallo, this.data[i+1] ? 0 : parseInt(this.max_value) ))  
            .attr("x", (d, i) => this.xScaleIsto(i) + (this.width_isto / this.data.length - 1) / 2)
            .attr("y", this.height_isto + this.margin.top)
            .attr("text-anchor", "middle")
            .attr("dy", "0.5em")
            .attr("font-size", "8px");
      
          //Axies label
          isto_likes
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left )
            .attr("x", 0 - this.height_isto / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Frequency");
            
      
          isto_likes
            .append("text")
            .attr("transform", `translate(${this.width_isto / 2},${this.height_isto + this.margin.top + this.margin.bottom - 20})`)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(this.label);
          //
      
          
          const brushX = d3.brushX()
            .extent([[0, 0], [this.width_isto, this.height_isto]])
            .on("brush", this.brushed_insto_likes)
            .on("end",this.brushedend_insto_likes)
          
          isto_likes.append("g")
            .attr("class", "brush")
            .call(brushX);

            function formatLabel(label,next) {
              console.log("formatLabel",label,"next",next)
              const absNum = Math.abs(label);
              const absNum2 = Math.abs(next);
              let start="";
              let end="";
            
              if (absNum >= 1e9) {
                 start= (label / 1e9).toFixed(1) + "B";
              } else if (absNum >= 1e6) {
                start= (label / 1e6).toFixed(1) + "M";
              } else if (absNum >= 1e3) {
                start= (label / 1e3).toFixed(1) + "k";
              }
              else {
                start= label.toString();
              }

              if (next!=0) {
                if (absNum2 >= 1e9) {
                    end= ((next-1) / 1e9).toFixed(1) + "B";
                } else if (absNum2 >= 1e6) {
                  end= ((next-1) / 1e6).toFixed(1) + "M";
                } else if (absNum2 >= 1e3) {
                  end= ((next-1) / 1e3).toFixed(1) + "k";
                }
                else {
                  end= (next-1).toString();
                }
                return start + " - " + end;
              } 

              return start;
              }
            
            
          
      
        }
}

export default Histogram;