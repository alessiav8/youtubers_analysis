import Histogram from "./histogram.js"


const reset_button = document.getElementById("reset_button");
const compare_button = document.getElementById("compare_button");
const zoom_button = document.getElementById("zoom_button");
const confirm_button = document.getElementById("confirmButton");
const ScatterPlotContainer = document.getElementById("ScatterPlotContainer")
var totalAmount

let dataset_g;
let dataset_full;

// Leggi dataset
var selectedMonth = "june"
var temp=false
var radioButtons = document.querySelectorAll('input[name="monthOption"]');
var Data

window.addEventListener('beforeunload', function (event) {
 localStorage.setItem("scatterTriggered",false);
 localStorage.setItem("filteredOnHistos",false);

});


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
  updateTextBefore()
  temp=false
  var checkedRadioButton = document.querySelector('input[name="monthOption"]:checked');
  selectedMonth = checkedRadioButton.value;
  showLoadingMessage();
  saveLocalStorageStart();
  disableRadioButtons();
  removeSVGElements();
  setTimeout(() => {
    renderFilters();
    getDataAndRenderGraph();
  }, 200);
}

export function updateText(){
    // Check if the element with id "counter" already exists
  const len=JSON.parse(localStorage.getItem("datasetAfterScatter")).length
  const text=len+" of "+totalAmount+" Youtubers selected"
  const existingCounterElement = document.getElementById("counter");

  if (existingCounterElement) existingCounterElement.parentNode.removeChild(existingCounterElement);
      //create a new text node and span element
      const newText = document.createTextNode(text);
      const counterElement = document.createElement("div");
      counterElement.id = "counter";
      counterElement.appendChild(newText);

      // Append the span element to the ScatterPlotContainer div
      ScatterPlotContainer.appendChild(counterElement);
}

function updateTextBefore(){
  const existingCounterElement = document.getElementById("counter");

  if (existingCounterElement) existingCounterElement.parentNode.removeChild(existingCounterElement);
}

radioButtons.forEach((radio) => {
  radio.addEventListener('change', handleRadioButtonChange);
});

function saveLocalStorageStart() {

  const parentDiv = document.getElementById("ScatterPlotContainer");
  const parentDivRect = parentDiv.getBoundingClientRect();

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = (parentDivRect.width/12)*11 - margin.left - margin.right;
  const height = (parentDivRect.height/15)*14 - margin.top - margin.bottom;

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
      localStorage.setItem("dataset", JSON.stringify(cleanData(JSON.stringify(jsonData))));
      localStorage.setItem("datasetAfterHisto", JSON.stringify(cleanData(JSON.stringify(jsonData))));
      localStorage.setItem("datasetAfterScatter", JSON.stringify(cleanData(JSON.stringify(jsonData))));
      localStorage.setItem("datasetFull", JSON.stringify(cleanData(JSON.stringify(jsonData))));
      totalAmount=JSON.parse(localStorage.getItem("datasetAfterScatter")).length
      localStorage.setItem("pt1x", 0);
      localStorage.setItem("pt2x", width);
      localStorage.setItem("pt2y", height);
      localStorage.setItem("pt1y", 0);
    })
    .catch(error => {
      console.error('Errore durante la richiesta:', error.message);
    });
}
function saveLocalStorageZoom() {
  const jsonData=JSON.parse(localStorage.getItem("datasetAfterScatter"))
  if (jsonData.length < 6) compare_button.removeAttribute("hidden");
  localStorage.setItem("datasetFull", JSON.stringify(jsonData));
  localStorage.setItem("dataset", JSON.stringify(jsonData));
  localStorage.setItem("datasetAfterHisto", JSON.stringify(jsonData));
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
  let dataset = JSON.parse(localStorage.getItem("dataset")) === null? JSON.parse(localStorage.getItem("datasetFull")): JSON.parse(localStorage.getItem("dataset"));
  dataset_full = JSON.parse(localStorage.getItem("datasetFull"));

  sessionStorage.setItem("datasetLikes", JSON.stringify(dataset));
  sessionStorage.setItem("datasetViews", JSON.stringify(dataset));
  sessionStorage.setItem("datasetComments", JSON.stringify(dataset));
  sessionStorage.setItem("datasetFollowers", JSON.stringify(dataset));

  sessionStorage.setItem("NoSubLikes", JSON.stringify(dataset));
  sessionStorage.setItem("NoSubViews", JSON.stringify(dataset));
  sessionStorage.setItem("NoSubComments", JSON.stringify(dataset));
  sessionStorage.setItem("NoSubFollowers", JSON.stringify(dataset));

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
      
      if (filteredDataset.length < 6) compare_button.removeAttribute("hidden");
      else compare_button.setAttribute("hidden", true);

      // Update "dataset" in storage with the filtered dataset
      localStorage.setItem("dataset", JSON.stringify(filteredDataset));
      localStorage.setItem("datasetAfterHisto", JSON.stringify(filteredDataset));
      localStorage.setItem("datasetAfterScatter", JSON.stringify(filteredDataset));


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
  allCheckboxLabel.style.marginLeft = "0.5vh"; // Adjust the spacing as needed

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
    checkboxLabel.style.marginLeft = "0.5vh"; // Adjust the spacing as needed

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
  updateTextBefore()
  removeSVGElements();
  showLoadingMessage();
  saveLocalStorageZoom();
  disableRadioButtons();
  temp=true
  
  const serverEndpoint = '/generateExcel';
  const datasetString = localStorage.getItem("dataset");
  var datasetAsd = JSON.parse(datasetString);
  if (datasetAsd.length < 6) compare_button.removeAttribute("hidden");


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
      renderFilters();
      showLoadingMessage();
      getDataAndRenderGraph();
    }, 500);
  
})
confirm_button.addEventListener("click", function () {
  updateTextBefore()
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
      hideLoadingMessage();
      Data=intersectCleanedDataScatteData(data); 
      renderScatterPlot(Data);
      console.log("logg", data.length);  // Check the length
      enableRadioButtons();
      renderHisto();

    })
    .catch((error) => {
      hideLoadingMessage();
      enableRadioButtons();
    });
}

//remove all N/A and all duplicates elements
function cleanData(dataset) {
  dataset=JSON.parse(dataset);
  const uniqueChannels = {};
  const cleanedData = dataset.filter(item => {
    const channelName = item["Youtube channel"];
    const youtuberName = item["youtuber name"];
    const Comments = item["Avg. comments"];
    const Likes= item["Avg. likes"];
    const Views= item["Avg. views"]
    const Followers= item["Followers"]
    if ( channelName !== "N/A" && channelName !== ("N/A'") &&
   youtuberName !== "N/A" && youtuberName !== ("N/A'") &&
    Comments !== "N/A" && Comments !== ("N/A'") &&
     Likes !== "N/A" && Likes !== ("N/A'") &&
    Views !== "N/A" && Views !== ("N/A'") &&
   Followers !== "N/A" && Followers !== ("N/A'")) {
      // Se il canale non è già stato registrato, mantenerlo e registrarlo
      if (!uniqueChannels[channelName]) {
        uniqueChannels[channelName] = true;
        return true;
      }
     
    }

    return false;
  });

  return cleanedData;
}

//clean the data for the scatterplot
function intersectCleanedDataScatteData(data){
  const dataset=JSON.parse(localStorage.getItem("dataset"));
  const uniqueChannels = new Set();
  const filteredData = data.filter(item => {
    if (!uniqueChannels.has(item["label"])) {
      uniqueChannels.add(item["label"]);
      return true;
    }
    return false;
  });
  return filteredData;

}

function callChangeInHistograms(filteredDataset){
  //added by A
  const dataset2= JSON.parse(localStorage.getItem("dataset"));
  const h = new Histogram(dataset2,"","","");
  //const intersect = h.intersectFunction(filteredDataset)
  h.reRenderHistos(filteredDataset);
  console.log("callChangeInHistograms","\n Actual db", dataset2, "filteredData",filteredDataset);

  //
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

//to recompute some varibales do to the change of the histo range and the area selected by the scatter
function recomputeIntersection(selection){
  const histos = ["Likes", "Comments", "Views", "Followers"];
    let n = [2, 3, 4, 5];
    const dynamicDatabases = {};

    for (let i in histos) {
        let variable = n.pop();
        const my_db = "db" + variable;
        // Associo il valore della sessionStorage all'oggetto dynamicDatabases
        dynamicDatabases[my_db] = JSON.parse(
          sessionStorage.getItem("NoSub"+histos[i])
        );
        console.log(JSON.parse(
          sessionStorage.getItem("NoSub"+histos[i])
        ));
    }

    console.log("dynamicDatabases: ", dynamicDatabases);
    
    // Trovare l'intersezione tra tutti i dataset
    var intersection = selection.filter((item) => {
      if(dynamicDatabases.db2.some(d=>d["Youtube channel"]==item["Youtube channel"]) &&
        dynamicDatabases.db3.some(d=>d["Youtube channel"]==item["Youtube channel"]) &&
        dynamicDatabases.db4.some(d=>d["Youtube channel"]==item["Youtube channel"]) &&
        dynamicDatabases.db5.some(d=>d["Youtube channel"]==item["Youtube channel"]) ){
        return item;
      }
    });

    console.log("afterHistos: " + JSON.parse(localStorage.getItem("datasetAfterHisto")));
    localStorage.setItem("datasetAfterHisto", JSON.stringify(intersection));
    console.log("DBComments: ",JSON.parse(sessionStorage.getItem("datasetComments")));
   




    console.log("Intersection from recomputing");
    return intersection;
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
    
    const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);

    /*se ci sono problemi:
        const xExtent = d3.extent(data, (d) => d.x);
      const yExtent = d3.extent(data, (d) => d.y);

      const maxExtent = [
        Math.min(xExtent[0], yExtent[0]),
        Math.max(xExtent[1], yExtent[1]),
      ];

      const xScale = d3.scaleLinear().domain(maxExtent).range([0, width]);
      const yScale = d3.scaleLinear().domain(maxExtent).range([height, 0]);
    */
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
  
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");


  


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

      localStorage.setItem("scatterTriggered",true);
      const selection = event.selection;
      const actualDB = JSON.parse(localStorage.getItem("dataset"));
      const Data = data.filter(
        (d) =>
          xScale(d.x) >= selection[0][0] &&
          xScale(d.x) <= selection[1][0] &&
          yScale(d.y) >= selection[0][1] &&
          yScale(d.y) <= selection[1][1]  
      );
      const selectedScatter = actualDB.filter((d) => {
        if(Data.some(item => item.label === d["Youtube channel"])){
          return d;
        }}
      )
      recomputeIntersection(selectedScatter);
      const jsonData = JSON.parse(localStorage.getItem("filteredOnHistos")) == true ? JSON.parse(localStorage.getItem("datasetAfterHisto")) : JSON.parse(localStorage.getItem("dataset"))
      
      //qui vengono mappati i dati selezionati e ti restituisce l'array con
      //le label e la posizione dei punti selezionati


      const selectedData = Data.filter((d)=>{
        if(jsonData.some(item => item["Youtube channel"] === d.label)){
          return d;
        }
      });

      //i need two variabiles, one to keep track of the points i need to color
      //the other one, this one, to keep track of the points in the selected area


      localStorage.setItem("dataContainedInScatterArea",JSON.stringify(selectedScatter));

      const datasetAfterHisto = JSON.parse(localStorage.getItem("datasetAfterHisto"));

      // Filter items from "datasetAfterScatter" based on the YouTube channel in selectedData
      const filteredDataset = datasetAfterHisto.filter(item =>
        selectedData.some(selectedItem => selectedItem.label === item["Youtube channel"])
      );

      // Save the filtered dataset in localStorage
      localStorage.setItem("datasetAfterScatter", JSON.stringify(filteredDataset));
      updateText()
      localStorage.setItem("pt1x", selection[0][0]);
      localStorage.setItem("pt2x", selection[1][0]);
      localStorage.setItem("pt2y", selection[1][1]);
      localStorage.setItem("pt1y", selection[0][1]);

      console.log("dataset after Histo",datasetAfterHisto,"saved in afterScatter", filteredDataset, "Selected Area",selectedScatter);
     
      
      colorScatterPlot(circles, selectedData);


      callChangeInHistograms(filteredDataset);

      if (selectedData.length === 1) {
        const confirmation = window.confirm("One youtuber found. Move to see specific data?");
        if (confirmation){
          const username = selectedData[0]["label"];
          window.open(`/detail/${encodeURIComponent(username)}`, '_blank');
        }
      }
    }
  }
  scatter_plot.call(brush);


  const circles = scatter_plot
  .append("g")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d.x))
  .attr("cy", (d) => yScale(d.y))
  .attr("r", 4)
  .attr("fill", "gray")
  .attr("pointer-events", "all")
  .on("mouseover", mouseover)

 //mouseover function
 function mouseover(event) {
  const xPosition = xScale(event.x) + 400;
  const yPosition = yScale(event.y) + 200;
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0.9)
    .style("left", xPosition + "px")
    .style("top", yPosition + "px");

  tooltip.html(`<strong>${event.label}</strong>`);
}


circles.on("mouseout", () => {
  tooltip.transition().duration(500).style("opacity", 0);
});

circles.on("click", (d) => {
  const confirmation = window.confirm("One youtuber found. Move to see specific data?");
  if (confirmation) {
    const username = d.label;
    window.open(`/detail/${encodeURIComponent(username)}`, '_blank');
  }
});


}



function isPointInsideSelection(point, selection) {
  for (const i in selection) {
    if (point.x === selection[i].x && point.y === selection[i].y) {
      return true;
    }
  }
  return false;
}

function colorScatterPlot(component, selectedData) {
  component.attr("fill", function (d) {
    //TODO: modifica
    //colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])
    //h.colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])

    return selectedData.length > 0
      ? isPointInsideSelection(d, selectedData)
        ? "steelblue"
        : "gray"
      : "gray";
  });
  component.attr("opacity", function (d) {
    //TODO: modifica
    //colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])
    //h.colorIsto(d3.select("#instolikes"),[{ intervallo: "0-10", frequenza: 5 }])

    return selectedData.length > 0
      ? isPointInsideSelection(d, selectedData)
        ? 1
        : 0.05
      : 0.05;
  });
}

export { colorScatterPlot, parseKMBtoNumber }
export { Data };

