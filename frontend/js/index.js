import Histogram from "./histogram.js"

const reset_button = document.getElementById("reset_button");
const zoom_button = document.getElementById("zoom_button");
const confirm_button = document.getElementById("confirmButton");
let dataset_g;
let dataset_full;

// Leggi dataset
var selectedMonth = "june"
var temp=false
var radioButtons = document.querySelectorAll('input[name="monthOption"]');

document.addEventListener("DOMContentLoaded", function () {
  showLoadingMessage();
  saveLocalStorageStart();
  disableRadioButtons();
  setTimeout(() => {
    renderFilters();
    getDataAndRenderGraph();
  }, 200);
});



function handleRadioButtonChange() {
  temp=false
  var checkedRadioButton = document.querySelector('input[name="monthOption"]:checked');
  selectedMonth = checkedRadioButton.value;
  console.log(selectedMonth)
  showLoadingMessage();
  saveLocalStorageStart();
  disableRadioButtons();
  removeSVGElements();
  setTimeout(() => {
    renderFilters();
    getDataAndRenderGraph();
  }, 200);
}

radioButtons.forEach((radio) => {
  radio.addEventListener('change', handleRadioButtonChange);
});

function saveLocalStorageStart() {

  var file = selectedMonth + ".xlsx";
  fetch(`/getXlsx/${file}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then(jsonData => {
      console.log("JSON", jsonData);
      jsonData.forEach(item => {
        if (!item.hasOwnProperty('Category') || item.Category === null || item.Category === undefined) {
          // Set "mixed" as the default value for the category if it is missing or null
          item.category = "Mixed";
        }
      });
      dataset_g = jsonData;
      localStorage.setItem("dataset", JSON.stringify(jsonData));
      localStorage.setItem("datasetFull", JSON.stringify(jsonData));
    })
    .catch(error => {
      console.error('Errore durante la richiesta:', error.message);
    });
}
function saveLocalStorageZoom() {
  const jsonData=JSON.parse(localStorage.getItem("dataset"))
  localStorage.setItem("datasetFull", JSON.stringify(jsonData));
}
function renderFilters() {
  //i filtri sono basati sul dataset totale (per poter riaggiungere cose), gli istrogrammi sono basati sulla selezione attuale.
  let dataset = JSON.parse(localStorage.getItem("dataset"))=== null? JSON.parse(localStorage.getItem("datasetFull")): JSON.parse(localStorage.getItem("dataset"));
  dataset_full = JSON.parse(localStorage.getItem("datasetFull"));

  var categories = extractCategories(dataset);
  renderFilter(categories, "scrollableCategory");
  var countries = extractCountries(dataset);
  renderFilter(countries, "scrollableCountry")
}
function renderHisto() {
  //i filtri sono basati sul dataset totale (per poter riaggiungere cose), gli istrogrammi sono basati sulla selezione attuale.
  let dataset = JSON.parse(localStorage.getItem("dataset"))=== null? JSON.parse(localStorage.getItem("datasetFull")): JSON.parse(localStorage.getItem("dataset"));
  dataset_full = JSON.parse(localStorage.getItem("datasetFull"));

  sessionStorage.setItem("datasetLikes", JSON.stringify(dataset));
  sessionStorage.setItem("datasetViews", JSON.stringify(dataset));
  sessionStorage.setItem("datasetComments", JSON.stringify(dataset));
  sessionStorage.setItem("datasetFollowers", JSON.stringify(dataset));

  const h_likes = new Histogram(dataset, "isto_like", "#IstoLikes", "Likes");
  h_likes.renderIsto()

  const h_views = new Histogram(dataset, "isto_view", "#IstoViews", "Views");
  h_views.renderIsto()

  const h_comments = new Histogram(dataset, "isto_comment", "#IstoComments", "Comments");
  h_comments.renderIsto()

  const h_followers = new Histogram(dataset, "isto_follower", "#IstoFollowers", "Followers");
  h_followers.renderIsto()
}

function confirmFilters() {
  //quando il pulsante confirm viene premuto, la variabile in localStorage dataset viene modificata in base ai filtri tolti o aggiunti e vengono ri-renderizzati istogrammi e scatter
  //in base a quanto contenuto nella variabile dataset.
  disableRadioButtons();
  var checkboxesContainer = document.getElementById('scrollableCategory');
  var countryCheckboxesContainer = document.getElementById('scrollableCountry');

  // Get all checkboxes (excluding the "All" checkbox)
  var checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]:not(#selectAllscrollableCategory)');
  var countryCheckboxes = countryCheckboxesContainer.querySelectorAll('input[type="checkbox"]:not(#selectAllscrollableCountry)');

  // Get the selected categories
  var selectedCategories = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.id);
  var selectedCountries = Array.from(countryCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.id);

  // Retrieve "dataset" and "datasetFull" from storage
  var storedDataset = localStorage.getItem("dataset");
  var storedDatasetFull = localStorage.getItem("datasetFull");

  if (storedDataset && storedDatasetFull) {
    try {
      // Parse the JSON strings into JavaScript objects
      var dataset = JSON.parse(storedDataset);
      var datasetFull = JSON.parse(storedDatasetFull);
      var additionalEntries

      // Filter "dataset" based on selected categories
      var filteredDataset


      filteredDataset = datasetFull.filter(entry => selectedCategories.includes(entry.Category));
      filteredDataset = filteredDataset.filter(entry => selectedCountries.includes(entry.Country));

      // Update "dataset" in storage with the filtered dataset
      localStorage.setItem("dataset", JSON.stringify(filteredDataset));

      console.log('Selected cat:', selectedCategories);
      console.log('Selected country:', selectedCountries);
    } catch (error) {
      console.error('Error parsing JSON from localStorage:', error);
      // Handle the error as needed
    }
  } else {
    console.log('Dataset or datasetFull not found in localStorage');
    // Handle the absence of the dataset or datasetFull as needed
  }
  console.log('Original datasetUNO:', dataset);
  console.log('Filtered datasetUNO:', filteredDataset);

  removeSVGElements();
  temp=true
  
  const serverEndpoint = '/generateExcel';
  const datasetString = localStorage.getItem("dataset");

  // Make a POST request to the server
  fetch(serverEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataset: datasetString }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // If the response is 'OK', log a message or perform other actions
      console.log('Server responded with OK');
    })
    .catch(error => {
      console.error('Error during the request:', error);
    });

    setTimeout(() => {
      showLoadingMessage();
      getDataAndRenderGraph();
    }, 200);
  
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
function renderFilter(categories, container) {
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
  var idd = "selectAll" + container;
  allCheckboxInput.id = idd  // You may want to modify this based on your needs
  // Add additional attributes if needed

  const allCheckboxLabel = document.createElement("label");
  allCheckboxLabel.classList.add("custom-control-label");
  allCheckboxLabel.setAttribute("for", idd);
  allCheckboxLabel.textContent = "All";
  allCheckboxLabel.style.marginLeft = "5px"; // Adjust the spacing as needed

  // Add event listener to toggle all other checkboxes
  allCheckboxInput.addEventListener("change", function () {
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


reset_button.addEventListener("click", function () {
  location.reload();
})
zoom_button.addEventListener("click", function () {
  removeSVGElements();
  showLoadingMessage();
  saveLocalStorageZoom();
  disableRadioButtons();
  setTimeout(() => {
    renderFilters();
    getDataAndRenderGraph();
  }, 200);
})
confirm_button.addEventListener("click", function () {
  confirmFilters();
})


function removeSVGElements() {
  // Select and remove SVG elements with ID "mds"
  const svgElements = document.querySelectorAll('svg');
  svgElements.forEach((svgElem) => {
    svgElem.parentNode.removeChild(svgElem);
  });
}


function getDataAndRenderGraph() {
  var requestOptions;
  if(temp==false){
    requestOptions = {
    method: "GET",
    headers: {
      month: selectedMonth,
    },
  };
} else {
  requestOptions = {
    method: "GET",
    headers: {
      month: "temp",
    },
  };
}

  fetch("http://127.0.0.1:5000/data", requestOptions)
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      hideLoadingMessage();
      renderScatterPlot(data);
      enableRadioButtons();
      renderHisto();

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
  const confirmButton = document.getElementById("confirmButton");
  confirmButton.disabled = true;
}


function enableRadioButtons() {
  // Enable all radio buttons
  radioButtons.forEach((radio) => {
    radio.disabled = false;
  });
  const confirmButton = document.getElementById("confirmButton");
  confirmButton.disabled = false;
}


//TODO: servirà qualche funzione di conversione dei dati sicuramente
//l'idea è di triggerare questa funzione quando viene selezionato qualcosa, in modo da triggerare il cambiamento in ogni grafico
function changeHighlight(data) {
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
  const width = (parentDivRect.width/12)*11 - margin.left - margin.right;
  const height = (parentDivRect.height/15)*14 - margin.top - margin.bottom;


  const scatter_plot = d3
    .select("#ScatterPlotContainer")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "mds")
    .append("g")
    .attr("id", "scatterplot")
    .attr("id", "scatterplot")
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
    .attr("fill", "gray");

  //questa parte di codice attualmente non funziona per l'hover
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
  //fino a qui
  
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
      //le label e la posizione dei punti selezionati

      const selectedData = data.filter(
        (d) =>
          xScale(d.x) >= selection[0][0] &&
          xScale(d.x) <= selection[1][0] &&
          yScale(d.y) >= selection[0][1] &&
          yScale(d.y) <= selection[1][1]
      );
      console.log("Selected Data:", selectedData);
      colorScatterPlot(circles, selectedData, "black")
      colorScatterPlot(circles, selectedData, "black")
      if (selectedData.length === 1) {
        const confirmation = window.confirm("One youtuber found. Move to see specific data?");
        if (confirmation){
          const username = selectedData[0]["label"];
          window.location.href = `/${encodeURIComponent(username)}`;
        }
      }
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
        ? "steelblue"
        : "gray"
      : "gray";
  });

}

export { colorScatterPlot, parseKMBtoNumber }
