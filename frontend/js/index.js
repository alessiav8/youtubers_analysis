import Histogram from "./histogram.js"

const reset_button=document.getElementById("reset_button");
let dataset_g;

// Leggi dataset
var selectedMonth = "june"
var radioButtons = document.querySelectorAll('input[name="monthOption"]');

document.addEventListener("DOMContentLoaded", function () {
  showLoadingMessage();
  disableRadioButtons();
  getDataAndRenderGraph();
  saveLocalStorageAndRenderHistoAndFilters();
});



function handleRadioButtonChange() {
  var checkedRadioButton = document.querySelector('input[name="monthOption"]:checked');
  selectedMonth = checkedRadioButton.value;
  console.log(selectedMonth)
  showLoadingMessage();
  disableRadioButtons();
  getDataAndRenderGraph();
  saveLocalStorageAndRenderHistoAndFilters();
  removeSVGElements();
}

radioButtons.forEach((radio) => {
  radio.addEventListener('change', handleRadioButtonChange);
});

function saveLocalStorageAndRenderHistoAndFilters(){
  var file = selectedMonth+".xlsx";
  fetch(`/getXlsx/${file}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(jsonData => {
      console.log("JSON",jsonData);
      dataset_g = jsonData;
      localStorage.setItem("dataset", JSON.stringify(jsonData));

      var categories = extractCategories(dataset_g);
      renderFilters(categories,"scrollableCategory");
      var countries = extractCountries(dataset_g);
      renderFilters(countries,"scrollableCountry")

      const likes= formatData(dataset_g,"likes");
      const views= formatData(dataset_g,"views");
      const comments= formatData(dataset_g,"comments");
      const followers = formatData(dataset_g,"followers");

      const h_likes= new Histogram(likes,"isto_like","#IstoLikes","Likes");
      h_likes.renderIsto()

      const h_views= new Histogram(views,"isto_view","#IstoViews","Views");
      h_views.renderIsto()

      const h_comments= new Histogram(comments,"isto_comment","#IstoComments","Comments");
      h_comments.renderIsto()

      const h_followers= new Histogram(followers,"isto_follower","#IstoFollowers","Followers");
      h_followers.renderIsto()
      
    })
    .catch(error => {
      console.error('Errore durante la richiesta:', error.message);
    });
  }

//From the dataset get back the frequency-something for the histogram
function parseKMBtoNumber(str) {
  if (typeof str !== 'string') return parseFloat(str);
  const numericPart = parseFloat(str.replace(/[^\d.]/g, ''));

  if (isNaN(numericPart)) return null; 
  const multiplier = str.match(/[KMB]/);
  if (multiplier) {
    const multiplierValue = { K: 1e3, M: 1e6, B: 1e9 }[multiplier[0]];
    return numericPart * multiplierValue;
  }

  return numericPart;
}
function extractCategories(data) {
  // Assuming your category data is present in a "Category" column
  const categoryColumn = "Category"; // Adjust this based on your actual column name

  // Extract unique categories from the dataset
  const uniqueCategories = [...new Set(data
    .map(item => item[categoryColumn] || "Mixed") // Use "mixed" if category is empty or undefined
  )].sort();

  return uniqueCategories;
}
function extractCountries(data) {
  // Assuming your category data is present in a "Category" column
  const countryColumn = "Country"; // Adjust this based on your actual column name

  // Extract unique categories from the dataset
  const uniqueCountries = [...new Set(data
    .map(item => item[countryColumn] || "No country") // Use "mixed" if category is empty or undefined
  )].sort();

  return uniqueCountries;
}
function renderFilters(categories,container) {
  const checkboxesContainer = document.getElementById(container);

  // Clear existing checkboxes
  checkboxesContainer.innerHTML = "";

  // Add "All" checkbox at the beginning
  const allCheckboxDiv = document.createElement("div");
  allCheckboxDiv.classList.add("custom-control", "custom-checkbox");
  allCheckboxDiv.style.display = "flex"; // Use flexbox

  const allCheckboxInput = document.createElement("input");
  allCheckboxInput.type = "checkbox";
  allCheckboxInput.classList.add("custom-control-input");
  var idd="selectAll"+container;
  allCheckboxInput.id = idd  // You may want to modify this based on your needs
  // Add additional attributes if needed

  const allCheckboxLabel = document.createElement("label");
  allCheckboxLabel.classList.add("custom-control-label");
  allCheckboxLabel.setAttribute("for", idd);
  allCheckboxLabel.textContent = "All";
  allCheckboxLabel.style.marginLeft = "5px"; // Adjust the spacing as needed

  // Add event listener to toggle all other checkboxes
  allCheckboxInput.addEventListener("change", function() {
    const otherCheckboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]:not(#selectAll)');
    otherCheckboxes.forEach(checkbox => {
      checkbox.checked = allCheckboxInput.checked;
    });
  });

  allCheckboxDiv.appendChild(allCheckboxInput);
  allCheckboxDiv.appendChild(allCheckboxLabel);

  checkboxesContainer.appendChild(allCheckboxDiv);
  const separator = document.createElement("hr");
  checkboxesContainer.appendChild(separator);

  // Add other checkboxes
  categories.forEach(category => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("custom-control", "custom-checkbox");
    checkboxDiv.style.display = "flex"; // Use flexbox

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.classList.add("custom-control-input");
    checkboxInput.id = category; // You may want to modify this based on your category data
    // Add additional attributes if needed

    const checkboxLabel = document.createElement("label");
    checkboxLabel.classList.add("custom-control-label");
    checkboxLabel.setAttribute("for", category); // Should match the checkbox ID
    checkboxLabel.textContent = category; // You may want to modify this based on your category data
    checkboxLabel.style.marginLeft = "5px"; // Adjust the spacing as needed

    checkboxDiv.appendChild(checkboxInput);
    checkboxDiv.appendChild(checkboxLabel);

    checkboxesContainer.appendChild(checkboxDiv);
  });

  // Set all checkboxes to be selected by default
  checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = true;
  });
}


function formatData(data, type) {
  let formattedData;
  const numBins = 5;

  if (type === "likes") {
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
  else if (type === "views") {
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
  else if (type === "comments") {
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
  else if (type === "followers") {
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
//


reset_button.addEventListener("click",function(){
  location.reload();
})


function removeSVGElements() {
  // Select and remove SVG elements with ID "mds"
  const svgElements = document.querySelectorAll('svg');
  svgElements.forEach((svgElem) => {
    svgElem.parentNode.removeChild(svgElem);
  });
}


function getDataAndRenderGraph() {
  const requestOptions = {
    method: "GET",
    headers: {
      month: selectedMonth,
    },
  };
  
  fetch("http://127.0.0.1:5000/data", requestOptions)
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      hideLoadingMessage();
      renderScatterPlot(data);
      enableRadioButtons();

    })
    .catch((error) => {
      hideLoadingMessage();
      enableRadioButtons();
      //console.error("Error:", error);
    });
}


function showLoadingMessage() {
  document.getElementById("loadingMessage").style.display = "block";
}


function hideLoadingMessage() {
  document.getElementById("loadingMessage").style.display = "none";
}


function disableRadioButtons() {
  // Disable all radio buttons
  radioButtons.forEach((radio) => {
    radio.disabled = true;
  });
}


function enableRadioButtons() {
  // Enable all radio buttons
  radioButtons.forEach((radio) => {
    radio.disabled = false;
  });
}


  //TODO: servirà qualche funzione di conversione dei dati sicuramente
  //l'idea è di triggerare questa funzione quando viene selezionato qualcosa, in modo da triggerare il cambiamento in ogni grafico
  function changeHighlight(data){
    colorScatterPlot(data)
    colorIsto(data)
  }

  function renderScatterPlot(data) {
    data.forEach((d) => {
      d.x = +d.x;
      d.y = +d.y;
    });

    const parentDiv = document.getElementById("ScatterPlotContainer");
    const parentDivRect = parentDiv.getBoundingClientRect();
  
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = parentDivRect.width - margin.left - margin.right;
    const height = parentDivRect.height - margin.top - margin.bottom;


    const scatter_plot = d3
      .select("#ScatterPlotContainer")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "mds")
      .append("g")
      .attr("id","scatterplot")
      .attr("id","scatterplot")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(data, (d) => d.x);
    const yExtent = d3.extent(data, (d) => d.y);

    const maxExtent = [
      Math.min(xExtent[0], yExtent[0]),
      Math.max(xExtent[1], yExtent[1]),
    ];

    const xScale = d3.scaleLinear().domain(maxExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain(maxExtent).range([height, 0]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute");

    const circles = scatter_plot
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "red");
    

    circles.on("mouseover", (event) => {
      const xPosition = xScale(event.x) + 5 + 7 * margin.left;
      const yPosition = yScale(event.y) - 10 + 7 * margin.top;
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");

      tooltip.html(`<strong>${event.label}</strong>`);
    });

    circles.on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    scatter_plot
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    scatter_plot.append("g").call(yAxis);
    scatter_plot
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    scatter_plot.append("g").call(yAxis);

    //brush implementation scatterplot
    const brush = d3
      .brush()
      .extent([
        [-20, -20],
        [width + 20, height + 20],
      ])
      .on("brush", brushed_scatter_plot)
      .on("end", brushedend_scatter_plot);
    

    function brushed_scatter_plot() {
      const event = d3.event;
      if (event && event.selection) {
        const selection = event.selection;
      }
    }
    function brushedend_scatter_plot() {
      const event = d3.event;
      if (event && event.selection) {
        const selection = event.selection;
        //qui vengono mappati i dati selezionati e ti restituisce l'array con
        //qui vengono mappati i dati selezionati e ti restituisce l'array con
        //le label e la posizione dei punti selezionati

        const selectedData = data.filter(
          (d) =>
            xScale(d.x) >= selection[0][0] &&
            xScale(d.x) <= selection[1][0] &&
            yScale(d.y) >= selection[0][1] &&
            yScale(d.y) <= selection[1][1]
        );
        console.log("Selected Data:", selectedData);
        colorScatterPlot(circles,selectedData,"black")
        colorScatterPlot(circles,selectedData,"black")
      }
    }
    scatter_plot.call(brush);
  }

  

  function isPointInsideSelection(point, selection) {
    for (const i in selection) {
      if (point.x === selection[i].x && point.y === selection[i].y) {
        return true;
      }
    }
    return false;
  }
  
  function colorScatterPlot(component, selectedData, color) {
    component.attr("fill", function (d) {
      const circle = d3.select(this);

      //TODO: modifica
      //colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])
      //h.colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])

      return selectedData.length > 0
        ? isPointInsideSelection(d, selectedData)
          ? color
          : "red"
        : "red";
    });

  }

  export {colorScatterPlot, parseKMBtoNumber}
