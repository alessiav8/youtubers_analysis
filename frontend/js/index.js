import Histogram from "./histogram.js"

const reset_button=document.getElementById("reset_button");
let dataset_g;

// Leggi dataset
//TODO: da modificare con il filtro sulla data & spostare dopo il caricamento dello scatter plot, non lo faccio adesso perchè ci mette troppo tempo
var selectedMonth = "june"
var radioButtons = document.querySelectorAll('input[name="monthOption"]');

document.addEventListener("DOMContentLoaded", function () {
  showLoadingMessage();
  //holds the actual dataset considered
  disableRadioButtons();
  getDataAndRenderGraph();
  saveLocalStorageAndRenderHisto();
});

function handleRadioButtonChange() {
  var checkedRadioButton = document.querySelector('input[name="monthOption"]:checked');
  selectedMonth = checkedRadioButton.value;
  console.log(selectedMonth)
  showLoadingMessage();
  disableRadioButtons();
  getDataAndRenderGraph();
  removeSVGElements();
  saveLocalStorageAndRenderHisto();
}
radioButtons.forEach((radio) => {
  radio.addEventListener('change', handleRadioButtonChange);
});

function saveLocalStorageAndRenderHisto(){
  //QUESTA PARTE è per salvare la selection in storage
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
      const { likes, views, comments, followers } = formatData(dataset_g);

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

//For now just likes
function formatData(data){
  const likesData = data
    .filter(d => !isNaN(parseKMBtoNumber(d["Avg. likes"])))
    .map(d => parseKMBtoNumber(d["Avg. likes"]));

  const maxLikes = d3.max(likesData);
  sessionStorage.setItem('Likes',maxLikes)

  const numBins = 5;

  const histogram_likes = d3.histogram()
    .domain([0, maxLikes]) 
    .thresholds(d3.range(0, maxLikes, maxLikes / numBins))(likesData);

  const formattedDataLikes = histogram_likes.map(bin => ({
    intervallo: bin.x0,
    frequenza: bin.length,
  }));

  const viewsData = data
    .filter(d => !isNaN(parseKMBtoNumber(d["Avg. views"])))
    .map(d => parseKMBtoNumber(d["Avg. views"]));
  
  const maxViews = d3.max(viewsData);
  sessionStorage.setItem('Views',maxViews)

  const histogram_views = d3.histogram()
    .domain([0, maxViews]) 
    .thresholds(d3.range(0, maxViews, maxViews / numBins))(viewsData);

  const formattedDataViews = histogram_views.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
    }));

  const commentsData = data
    .filter(d => !isNaN(parseKMBtoNumber(d["Avg. comments"])))
    .map(d => parseKMBtoNumber(d["Avg. comments"]));
  
  const maxComments = d3.max(commentsData);
  sessionStorage.setItem('Comments',maxComments)

  const histogram_comments = d3.histogram()
    .domain([0, maxComments]) 
    .thresholds(d3.range(0, maxComments, maxComments / numBins))(commentsData);

  const formattedDataComments = histogram_comments.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
    }));

  const followersData = data
    .filter(d => !isNaN(parseKMBtoNumber(d["Followers"])))
    .map(d => parseKMBtoNumber(d["Followers"]));
  
  const maxFollowers = d3.max(followersData);
  sessionStorage.setItem("Followers", maxFollowers);

  const histogram_followers = d3.histogram()
    .domain([0, maxFollowers]) 
    .thresholds(d3.range(0, maxFollowers, maxFollowers / numBins))(followersData);

  const formattedDataFollowers = histogram_followers.map(bin => ({
      intervallo: bin.x0,
      frequenza: bin.length,
    }));
  //console.log(formattedDataLikes,formattedDataViews,formattedDataComments,formattedDataFollowers);
  return {likes: formattedDataLikes, views: formattedDataViews,comments: formattedDataComments, followers: formattedDataFollowers};
}

//

reset_button.addEventListener("click",function(){
  location.reload();
})


function removeSVGElements() {
  // Select and remove SVG elements with ID "mds"
  const svgElementsWithIdMds = document.querySelectorAll('svg');
  svgElementsWithIdMds.forEach((svgElement) => {
    svgElement.parentNode.removeChild(svgElement);
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

  //renderScatterPlot([{ x: 2, y: 5 },{ x: 7, y: 8 }]);
  //renderIsto();

  function renderScatterPlot(data) {
    //data = [{ x: 2, y: 5 }];
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
     
  /*
  let datiIstogramma = [
    { intervallo: "0-10", frequenza: 5 },
    { intervallo: "10-20", frequenza: 10 },
    { intervallo: "20-30", frequenza: 15 },
  ];
 
  function renderIsto(){  
    
  let datiIstogramma = [
    { intervallo: "0-10", frequenza: 5 },
    { intervallo: "10-20", frequenza: 10 },
    { intervallo: "20-30", frequenza: 15 },
  ];
    //TODO: da modificare con i dati veri
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width_isto = 300 - margin.left - margin.right;
    const height_isto = 200 - margin.top - margin.bottom;

    //TODO: da modificare con i dati veri
    const max = d3.max(datiIstogramma, (d) => d.frequenza);
    const xScaleIsto = d3
      .scaleLinear()
      .domain([0, datiIstogramma.length])
      .range([0, width_isto]);

    const yScaleIsto = d3
      .scaleLinear()
      .domain([0, max])
      .range([height_isto, 0]);

    const isto_likes = d3
      .select("#IstoLikes")
      .append("svg")
      .attr("width", width_isto + margin.left + margin.right)
      .attr("height", height_isto + margin.top + margin.bottom)
      .append("g")
      .attr("id","instolikes")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisIsto = d3.axisBottom(xScaleIsto).tickValues([]).tickSize(0);
    const yAxisIsto = d3.axisLeft(yScaleIsto);

    isto_likes
      .append("g")
      .attr("transform", `translate(0, ${height_isto})`)
      .call(xAxisIsto);

    isto_likes.append("g").call(yAxisIsto);

    isto_likes
      .selectAll("rect")
      .data(datiIstogramma)
      .enter()
      .append("rect")
      .style("fill", "steelblue")
      .attr("x", function (d, i) {
        return xScaleIsto(i);
      })
      .attr("width", width_isto / datiIstogramma.length - 1)
      .attr("y", function (d) {
        return yScaleIsto(d.frequenza);
      })
      .attr("height", function (d) {
        return height_isto - yScaleIsto(d.frequenza);
      });

    isto_likes
      .selectAll(".bar-label")
      .data(datiIstogramma)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .text(function (d) {
        return d.intervallo;
      })
      .attr("x", function (d, i) {
        return xScaleIsto(i) + (width_isto / datiIstogramma.length - 1) / 2;
      })
      .attr("y", height_isto + margin.top)
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em")
      .attr("font-size", "10px");

    isto_likes
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height_isto / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Frequency");

    d3.select("#IstoLikes")
      .append("text")
      .text("Likes")
      .attr("x", width_isto / 2)
      .attr("y", height_isto + margin.top + margin.bottom)
      .attr("dy", "2em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "black");

    
    const brushX = d3.brushX()
      .extent([[0, 0], [width_isto, height_isto]])
      .on("brush", brushed_insto_likes)
      .on("end",brushedend_insto_likes)
    
    isto_likes.append("g")
      .attr("class", "brush")
      .call(brushX);

    function brushed_insto_likes(){

    }
    
    function brushedend_insto_likes() {
      if (d3.event.selection) {
        const [x0, x1] = d3.event.selection;
    
        const startIndex = Math.floor(xScaleIsto.invert(x0));
        console.log("start", startIndex);
        const endIndex = Math.ceil(xScaleIsto.invert(x1));
        console.log("end", endIndex);

        const selectedData = datiIstogramma.slice(startIndex, endIndex );

    
        colorIsto(isto_likes, selectedData);

        console.log("Selected Data:", selectedData);
      }
    }
  

  }





function colorIsto(component, data) {
  console.log(data)
  
  //TODO: da modificare 

  let datiIst = [
    { intervallo: "0-10", frequenza: 5 },
    { intervallo: "10-20", frequenza: 10 },
    { intervallo: "20-30", frequenza: 15 },
  ];

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  const max = d3.max(datiIst, (d) => d.frequenza);
  const xScaleIsto = d3
    .scaleLinear()
    .domain([0, datiIst.length])
    .range([0, width]);

  const yScaleIsto = d3
    .scaleLinear()
    .domain([0, max])
    .range([height, 0]);

  //
  
  component
    .selectAll("rect")
    .data(datiIst)
    .style("fill", function (d, i) {
      console.log("d",d,"i",i, "inc", (Object.values(data)).includes(d),typeof(Object.values(data)))
      if (data.length === 0) {
        return "steelblue";
      }
      return data.includes(d) || data.find(obj => JSON.stringify(obj) === JSON.stringify(d)) ? "green" : "steelblue";
    })
    .attr("x", function (d, i) {
      return xScaleIsto(i);
    })
    .attr("width", width / datiIst.length - 1)
    .attr("y", function (d) {
      return yScaleIsto(d.frequenza);
    })
    .attr("height", function (d) {
      return height - yScaleIsto(d.frequenza);
    });
}


*/