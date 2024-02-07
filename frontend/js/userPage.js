const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const username1 = window.location.pathname.split('/').pop();
console.log(username1)


//const username = window.location.pathname.split('/').pop();

let youtuberData; // Declare youtuberData outside of the fetch block

function convertToInt(value) {
  console.log(value)

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

// Make an AJAX request to the server to get data
fetch(`/getData/${username1}`)
  .then(response => response.json())
  .then(data => {
    // Process data and create D3 visualizations here
    youtuberData = data;

    //Setting the title of the page
    const youtuber_name=youtuberData[0]["youtuber name"];
    const youtuber_name_field=document.getElementById('youtuber_name_field');
    youtuber_name_field.innerHTML="Youtuber: " + youtuber_name;
    //

    console.log(youtuberData)

  const followers = [];
    for (let i = 0; i < youtuberData.length; i++) {
      followers.push(convertToInt(youtuberData[i]["Followers"]));
    }
    const likes = [];
    for (let i = 0; i < youtuberData.length; i++) {
      likes.push(convertToInt(youtuberData[i]["Avg. likes"]));
    }
    const comments = [];
    for (let i = 0; i < youtuberData.length; i++) {
      comments.push(convertToInt(youtuberData[i]["Avg. comments"]));
      console.log(youtuberData[i]["Avg. comments"])
    }
    const views = [];
    for (let i = 0; i < youtuberData.length; i++) {
      views.push(convertToInt(youtuberData[i]["Avg. views"]));
    }

    createScatterPlot(followers, 'Followers', "#container1");
    createScatterPlot(likes, 'Likes', "#container1");
    createScatterPlot(comments, 'Comments', "#container2");
    createScatterPlot(views, 'Views',"#container2");

    console.log(followers)
    console.log(likes)
    console.log(comments)

  })
  .catch(error => console.error('Error fetching data:', error));


  




  function createScatterPlot(data, label, container) {
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };

    const parentDiv = document.getElementById("container1");
    const parentDivRect = parentDiv.getBoundingClientRect();
    const pixels = (window.innerHeight * 35) / 100;

    const width = (parentDivRect.width/24)*11 - margin.left - margin.right;
    const height = pixels - margin.top - margin.bottom;
  
    const months = ["June", "September", "November", "December"];

    const xScale = d3.scaleBand()
      .domain(months)
      .range([0, width])
      .paddingInner(0)
      .paddingOuter(0); // Remove inner and outer padding
  
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height, 0]);
  
    const formatAxisLabel = d3.format(".2s");
  
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
      svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(["June", "September", "November", "December"][i]) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d))
      .attr('r', 5)
      .style('display', d => (typeof d === 'undefined' ? 'none' : ''))
      .on('mouseover', (d, i) => handleMouseOver(d,i,label,data))  // Add mouseover event listener
      .on('mouseout', handleMouseOut);  // Add mouseout event listener



      // start line
    svg.selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', (d, i) => {
        const xValue = ["June", "September", "November", "December"][i];
        return typeof d !== 'undefined' ? xScale(xValue) + xScale.bandwidth() / 2 : null;
      })
      .attr('y1', d => typeof d !== 'undefined' ? yScale(d) : null)
      .attr('x2', (d, i, nodes) => {
        const currentPointVisible = typeof d !== 'undefined' && nodes[i].style.display !== 'none';

        if (currentPointVisible) {
          // Find the next visible point
          let j = i + 1;
          while (j < data.length && (typeof data[j] === 'undefined' || nodes[j].style.display === 'none')) {
            j++;
          }

          if (j < data.length) {
            const nextXValue = ["June", "September", "November", "December"][j];
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
      while (j < data.length && (typeof data[j] === 'undefined' || nodes[j].style.display === 'none')) {
        j++;
      }

      if (j < data.length) {
        return yScale(data[j]);
      }
    }

    return null;
  })
  .style('stroke', 'blue') // Set the color of the lines (adjust as needed)
  .style('display', (d, i, nodes) => {
    const currentPointVisible = typeof d !== 'undefined' && nodes[i].style.display !== 'none';

    if (currentPointVisible) {
      // Find the next visible point
      let j = i + 1;
      while (j < data.length && (typeof data[j] === 'undefined' || nodes[j].style.display === 'none')) {
        j++;
      }

      if (j < data.length) {
        return null;
      }
    }

    return 'none';
  });
  //end line


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
  

  

  
  