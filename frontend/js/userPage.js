const username = window.location.pathname.split('/').pop();

let youtuberData; // Declare youtuberData outside of the fetch block

function convertToInt(value) {
  if (typeof value === 'string') {
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

// Make an AJAX request to the server to get data
fetch(`/getData/${username}`)
  .then(response => response.json())
  .then(data => {
    // Process data and create D3 visualizations here
    youtuberData = data;
    console.log(youtuberData)

  const june=youtuberData[0]
  const september=youtuberData[1]
  const november=youtuberData[2]
  const december=youtuberData[3]

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

  })
  .catch(error => console.error('Error fetching data:', error));


  




  function createScatterPlot(data, label, container) {
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
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
  
      svg.selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(["June", "September", "November", "December"][i]) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d))
      .attr('r', 5)
      .style('display', d => (typeof d === 'undefined' ? 'none' : ''));
  
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
  
  

  

  
  