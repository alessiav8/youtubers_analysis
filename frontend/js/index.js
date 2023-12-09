document.addEventListener('DOMContentLoaded', function () {
  console.log("loading");
  showLoadingMessage();

  function showLoadingMessage() {
    document.getElementById('loadingMessage').style.display = 'block';
  }

  function hideLoadingMessage() {
    document.getElementById('loadingMessage').style.display = 'none';
  }

  getDataAndRenderGraph();

  function getDataAndRenderGraph() {
    const requestOptions = {
      method: 'GET',
      headers: {
        'month': 'june',
      },
    };

    fetch('http://127.0.0.1:5000/data', requestOptions)
      .then(response => response.json())
      .then(data => {
        hideLoadingMessage();
        renderGraph(data);
      })
      .catch(error => {
        hideLoadingMessage();
        console.error('Error:', error);
      });
  }

  function renderGraph(data) {
    data.forEach(d => {
      d.x = +d.x;
      d.y = +d.y;
    });

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#GraphContainer')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);

    const maxExtent = [
      Math.min(xExtent[0], yExtent[0]),
      Math.max(xExtent[1], yExtent[1])
    ];

    const xScale = d3.scaleLinear()
      .domain(maxExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(maxExtent)
      .range([height, 0]);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute');

    const circles = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr("fill", "red");

    circles.on('mouseover', (event, d) => {
      const xPosition = xScale(d.x) + 5 + 7 * margin.left;
      const yPosition = yScale(d.y) - 10 + 7 * margin.top;

      tooltip.transition()
        .duration(200)
        .style('opacity', .9)
        .style('left', xPosition + 'px')
        .style('top', yPosition + 'px');

      tooltip.html(`<strong>${d.label}</strong>`);
    });

    circles.on('mouseout', () => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g')
      .call(yAxis);
  }
})