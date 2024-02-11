
const dataset = JSON.parse(localStorage.getItem("dataset"));
const usernames = dataset.map(item => item["Youtube channel"]);
const colours = ["blue","red","green","fuchsia","black"]
var username;
var [followersTotal, likesTotal, commentsTotal, viewsTotal] = [[], [], [], []];
var monthPosition=[];
var asd=[]
var countDisplay=0


//crea 4 array di array (1 per ogni grafico), ognuno contiene k youtuber e per ogni youtuber 4 campi per i mesi
//il fetch va loopato e i dati inseriti negli array di array. La chiamata a scatter plot creation va fatta fuori dal loop
//la funzione per scatterplot deve loopare su ogni youtuber, cambiando colore con array colours


let youtuberData; // Declare youtuberData outside of the fetch block

function convertToInt(value) {

  if (typeof value === 'string') {
      if (value==="N/A'"||value==="N/A") {
        return -1;
      }
      if (value.includes('M')) {
          return parseInt(parseFloat(value.replace('M', '')) * 1e6);
      } else if (value.includes('K')) {
          return parseInt(parseFloat(value.replace('K', '')) * 1e3);
      } else {
          return parseInt(value);
      }
  } else {
    return value;
}
}

function formatNumber(value) {
  if (typeof value !== 'number') {
    throw new Error('Input must be a number');
  }

  if (value >= 1e6) {
    // Convert to millions with one decimal place
    return (value / 1e6).toFixed(1) + 'M';
  } else if (value >= 1e3) {
    // Convert to thousands with no decimal places
    return Math.round(value / 1e3) + 'K';
  } else {
    // Leave small values as is
    return value.toString();
  }
}

var [followers, likes, comments, views] = [[], [], [], []];


var c=0
var value
const fetchPromises = usernames.map(currentUsername => {
  return fetch(`/getData/${currentUsername}`)
    .then(response => response.json())
    .then(data => {
      asd=[]
      for (let i = 0; i < data.length; i++) {
        const startMonth=data[i]["month"];
          switch (startMonth.toLowerCase()) {
            case "june":
              asd[i] = 0;
              break;
            case "september":
              asd[i] = 1;
              break;
            case "november":
              asd[i] = 2;
              break;
            case "december":
              asd[i] = 3;
              break;
            default:
              // Handle unexpected input
              console.log("Invalid start month");
          }
          //console.log("asd: "+asd)
        }
      monthPosition[c]=asd
      c++
      // Process data and push to respective arrays
      const followers = data.map(entry => convertToInt(entry["Followers"]));
      const likes = data.map(entry => convertToInt(entry["Avg. likes"]));
      const comments = data.map(entry => convertToInt(entry["Avg. comments"]));
      const views = data.map(entry => convertToInt(entry["Avg. views"]));

      followersTotal.push(followers);
      likesTotal.push(likes);
      commentsTotal.push(comments);
      viewsTotal.push(views);
    })
    .catch(error => console.error('Error fetching data:', error));
});

  
Promise.all(fetchPromises)
  .then(() => {
    // All fetch operations completed, create scatter plots
    createScatterPlot(followersTotal, 'Followers', "#container1");
    createScatterPlot(likesTotal, 'Likes', "#container1");
    createScatterPlot(commentsTotal, 'Comments', "#container2");
    createScatterPlot(viewsTotal, 'Views', "#container2");
    createLegend(usernames, colours)
    //console.log("monthPosition: "+monthPosition)

  })
  .catch(error => console.error('Error:', error));















  function createScatterPlot(data, label, container) {
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };

    const parentDiv = document.getElementById("container1");
    const pixels = (window.innerHeight * 35) / 100;

    const width = 600 - margin.left - margin.right;
    const height = pixels - margin.top - margin.bottom;
  


    var ymax=0;
    var counter=0
    data.forEach(currentData => {
      currentData.forEach(value => {
        if (!isNaN(value) && value > ymax) {
          ymax = value;
        }
      });
    });
    console.log("ymax="+ymax)

    const months = ["June", "September", "November", "December"];

    const xScale = d3.scaleBand()
      .domain(months)
      .range([0, width])
      .paddingInner(0)
      .paddingOuter(0); // Remove inner and outer padding
  
    const yScale = d3.scaleLinear().domain([0, ymax]).range([height, 0]);
  
    const formatAxisLabel = d3.format(".2s");
  
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    //console.log("data:"+data)
    var k=0
    data.forEach(currentData => {
      console.log(counter+":"+currentData)
      svg.selectAll('circle'+counter)
      .data(currentData)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(["June", "September", "November", "December"][monthPosition[k][i]]) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d))
      .attr('r', 5)
      .style('display', d => (typeof d === 'undefined' ? 'none' : ''))
      .style('fill', colours[counter])
      .on('mouseover', (d, i) => handleMouseOver(d,i,label,currentData))  // Add mouseover event listener
      .on('mouseout', handleMouseOut);  // Add mouseout event listener


      // start line
    svg.selectAll('line'+counter)
      .data(currentData)
      .enter()
      .append('line')
      .attr('x1', (d, i) => {
        const xValue = ["June", "September", "November", "December"][monthPosition[k][i]];
        return typeof d !== 'undefined' ? xScale(xValue) + xScale.bandwidth() / 2 : null;
      })
      .attr('y1', d => typeof d !== 'undefined' ? yScale(d) : null)
      .attr('x2', (d, i, nodes) => {
        const currentPointVisible = typeof d !== 'undefined' && nodes[i].style.display !== 'none';

        if (currentPointVisible) {
          // Find the next visible point
          let j = i + 1;
          //console.log("j prima:"+j)

          //serve a skippare il punto prossimo se non esiste
          while (j < currentData.length && (typeof currentData[j] === 'undefined' || nodes[j].style.display === 'none')) {
            j++;
          }
          //console.log("j dopo:"+j)
          if (j < currentData.length) {
            const nextXValue = ["June", "September", "November", "December"][monthPosition[k][i+1]];
            return xScale(nextXValue) + xScale.bandwidth() / 2;
          }
        }

        return null;
      })
  .attr('y2', (d, i, nodes) => {
    const currentPointVisible = typeof d !== 'undefined' && nodes[i].style.display !== 'none';

    if (currentPointVisible) {
      // Find the next visible point
      let j = i + 1;
      while (j < currentData.length && (typeof currentData[j] === 'undefined' || nodes[j].style.display === 'none')) {
        j++;
      }

      if (j < currentData.length) {
        return yScale(currentData[j]);
      }
    }

    return null;
  })
  .style('stroke', colours[counter]) // Set the color of the lines (adjust as needed)
  .style('display', (d, i, nodes) => {
    const currentPointVisible = typeof d !== 'undefined' && nodes[i].style.display !== 'none';

    if (currentPointVisible) {
      // Find the next visible point
      let j = i + 1;
      while (j < currentData.length && (typeof currentData[j] === 'undefined' || nodes[j].style.display === 'none')) {
        j++;
      }

      if (j < currentData.length) {
        return null;
      }
    }

    return 'none';
  });
  //end line
  counter=counter+1
  k++

});

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
  
    svg.append('g')
      .call(d3.axisLeft(yScale).tickFormat(formatAxisLabel));
  
    svg.append('text')
      .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
      .style('text-anchor', 'middle')
      .text(label);
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Count');

  
  countDisplay++    
  }



  
  function handleMouseOver(d, i, label, data) {
    const xValue = ["June", "September", "November", "December"][i];
    var yValue = formatNumber(d);
    if (yValue==-1) yValue="Not defined"
  
    // Check if the next point is higher
    const nextIndex = i + 1;
    const nextYValue = nextIndex < data.length ? formatNumber(data[nextIndex]) : null;
    const isNextPointHigher = nextYValue !== null && parseFloat(nextYValue) > parseFloat(yValue);
  
    // Calculate tooltip position
    const left = `${d3.event.pageX}px`;
    const top = isNextPointHigher ? `${d3.event.pageY + 28}px` : `${d3.event.pageY - 28}px`;
  
    // Show tooltip with data value
    d3.select('#tooltip')
      .style('opacity', 1)
      .html(`<strong>${label}:</strong> ${yValue}`)
      .style('left', left)
      .style('top', top);
  }

  // Define the mouseout event handler
  function handleMouseOut() {
    // Hide the tooltip
    d3.select('#tooltip').style('opacity', 0);
    const tooltip = d3.select('#tooltip');

    // Move the tooltip to the bottom-right corner
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;
    const tooltipWidth = parseFloat(tooltip.style('width'));
    const tooltipHeight = parseFloat(tooltip.style('height'));
  
    const left = bodyWidth - tooltipWidth;
    const top = bodyHeight - tooltipHeight;
  
    tooltip
      .style('left', left + 'px')
      .style('top', top + 'px');
  }

  function createLegend(usernames, colours) {
    const legendContainer = d3.select('#legend-container');
  
    // Loop through each youtuber and create legend entries
    usernames.forEach((username, index) => {
      const legendEntry = legendContainer
      .append('div')
        .style('color', colours[index])
        .text(username);
    });
  }
  

  

  
  