//https://stackoverflow.com/questions/31332316/how-to-store-html-form-input-as-javascript-object
//https://codetheweb.blog/javascript-localstorage/
//https://dmitripavlutin.com/foreach-iterate-array-javascript/
//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
//https://math.stackexchange.com/questions/43698/range-scaling-problem
//https://www.d3-graph-gallery.com/graph/wordcloud_size.html
//https://www.d3-graph-gallery.com/circular_barplot.html
//https://www.d3-graph-gallery.com/heatmap.html

//globals
var i_trials = 0;
const MAX_TRIALS = 60;

//store participant responses
var participant = []


//start
const btn2 = document.querySelector('#start');
btn2.addEventListener('click', (e) => {
  document.getElementById('response_field').value="";
  document.getElementById('response_field_div').style="display:inline;"
  document.getElementById('viz_div').style="display:inline;"
  document.getElementById('start_page').style="display:none;"
  document.getElementById('counter_div').style="display:inline;"
  document.getElementById('counter').textContent =`${i_trials+1}/${MAX_TRIALS}`
  new_viz()
});


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//identifier of the vizualization
//(vizualization type 1-3, data 1-3)
viz_ids = []

for (x=0; x<3;x++){
  for (y=1;y<21;y++) {
    viz_ids.push({vid:x,data:y})
  }
}
shuffleArray(viz_ids)

//response
const btn = document.querySelector('#next');
btn.addEventListener('click', (e) => {
  if (document.getElementById('response_field').value != "" &&
      Number(document.getElementById('response_field').value) != null && 
      Number(document.getElementById('response_field').value) >= 0 &&
      Number(document.getElementById('response_field').value) <= 100) {
    participant.push([viz_ids[i_trials].vid + ", " + viz_ids[i_trials].data + ", " + document.getElementById('response_field').value]);
    clear_viz()
    new_viz()
  }
});


function export_participant() {
  
  csvdata = participant.join('\n')
  var link = window.document.createElement("a");
  link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvdata));
  link.setAttribute("download", "viz_study_response.csv");
  link.click(); 
}

//generate random experiment
function new_viz() {
  //if reached max number of trials
  if (i_trials == MAX_TRIALS) {
  
    export_participant()
    document.getElementById('response_field_div').style="display:none;"
    document.getElementById('viz_div').style="display:none;"
    document.getElementById('thank_you').style="display:inline;"
    document.getElementById('counter').style="display:none;"
    return 0;
  }
  document.getElementById('counter').textContent =`${i_trials+1}/${MAX_TRIALS}`
  
  if (viz_ids[i_trials].vid == 0) {
    document.getElementById('circular_caption').style="display:inline;"
    document.getElementById('wordmap_caption').style="display:none;"
    document.getElementById('heatmap_caption').style="display:none;"
    viz_circular(viz_ids[i_trials].data)
  } else if (viz_ids[i_trials].vid == 1) {
    document.getElementById('circular_caption').style="display:none;"
    document.getElementById('wordmap_caption').style="display:none;"
    document.getElementById('heatmap_caption').style="display:inline;"
    viz_heatmap(viz_ids[i_trials].data)
  } else {
    document.getElementById('circular_caption').style="display:none;"
    document.getElementById('wordmap_caption').style="display:inline;"
    document.getElementById('heatmap_caption').style="display:none;"
    viz_wordcloud(viz_ids[i_trials].data)
  }
  i_trials++;
}

//remove existing experiment
function clear_viz() {
  d3.select("#viz_div").selectAll("svg").remove();
  document.getElementById('response_field').value="";
}


//experiment 1
function viz_circular(vid) {

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom,
      innerRadius = 50,
      outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

  // append the svg object to the body of the page
  var svg = d3.select("#viz_div")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + ( height/2 )+ ")"); // Add 100 on Y translation, cause upper bars are longer

  d3.csv("https://raw.githubusercontent.com/wtt102/03-experiment/main/data/data_trial_" +vid+".csv", function(data) {
    // X scale
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing ?
        .domain( data.map(function(d) { return d.x_1; }) ); // The domain of the X axis is the list of states.

    // Y scale
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, 100]); // Domain of Y is from 0 to the max seen in the data
    var k = 0;
    // Add bars
    svg.append("g")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "1px")
        //.attr("fill", "red")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d.x_1);})
            .startAngle(function(d) { return x(d.x_1); })
            .endAngle(function(d) { return x(d.x_1) + x.bandwidth(); })
            .padAngle(.3)
            .padRadius(innerRadius))

    function getx(i,n,r) {
      return r*Math.cos(Math.PI/2 - ((2*Math.PI * 1/n) / 2) - 2*Math.PI * (i-1)/n)
    }

    function gety(i,n,r) {
      return r*Math.sin(Math.PI/2 - ((2*Math.PI * 1/n) / 2) - 2*Math.PI * (i-1)/n)
    }


    function iterate_data(d) {
      if (d.compare == "True") {
        svg.append("circle")
          .attr("cx",  getx(Number(d.data_id),data.length,50+d.x_1/2))
          .attr("cy", -gety(Number(d.data_id),data.length,50+d.x_1/2))
          .attr("r",5)
          .style("fill","black");
      }
    }

    data.forEach(iterate_data);

  });

}

//experiment 2
function viz_heatmap(vid) {
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 450 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;
  //end the svg object to the body of the page
  var svg = d3.select("#viz_div")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("https://raw.githubusercontent.com/wtt102/03-experiment/main/data/data_trial_" +vid+".csv", function(data) {
    // Labels of row and columns
    
    var ids = []
    var x = ['x_1']
    function get_ids(d) {
      ids.push(d.data_id)
      //svg.append("rect")
    }
    data.forEach(get_ids);

    function iterate_data(d) {
      svg.append("rect")
        .attr("x",  (Number(d.data_id)-1)*width/data.length)
        .attr("y",  0)
        .attr("width",  width/data.length)
        .attr("height",  height)
        .attr("fill",  d3.rgb(256*(d.x_2)/100,256*(d.x_2)/100,256*(d.x_2)/100))
    }
    data.forEach(iterate_data);

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(ids)
      .padding(0.01);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

    // Build X scales and axis:
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .padding(0.01);
    svg.append("g")
      .call(d3.axisLeft(y));

    //make markers
    function markers(d) {
      if (d.compare == "True") {
        svg.append("circle")
          .attr("cx", width*((Number(d.data_id)-1)/data.length)+width*(1/data.length)/2)
          .attr("cy", height+25)
          .attr("r",5)
          .style("fill","black");
      }
    }
    data.forEach(markers);
  })

}

//wordcloud visualization
function viz_wordcloud(vid) {

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 450 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#viz_div").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  

  //get data
  d3.csv("https://raw.githubusercontent.com/wtt102/03-experiment/main/data/data_trial_"+vid+".csv", function(data) {
    var word_list = ["Running", "Surfing", "Climbing", "Kiting", "Sailing", "Snowboarding", "Jogging", "Sprinting", "Jumping", "Swimming"]
    var words = []
    
    //scale font size
    function affine_transform(x,min_old,max_old,min_new,max_new) {
      return min_new * (1- (x - min_old)/(max_old - min_old)) + max_new * ((x - min_old)/(max_old - min_old))
    }

    //add words
    function iter_words(d) {
      words.push({word:word_list[Number(d.data_id)],size:affine_transform(d.x_3,0,100,10,50)})
    }
    data.forEach(iter_words)
    
    coords_x = []
    coords_y = []
    
    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
      .size([width, height])
      .words(words.map(function(d) { return {text: d.word, size:d.size}; }))
      .padding(5)        //space between words
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .fontSize(function(d) { return d.size; })      // font size of words
      .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      svg
        .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size; })
            .style("fill", "#black")
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
              coords_x.push(d.x)
              coords_y.push(d.y)
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
      }

    //select two of the words
    function markers(d) {
      if (d.compare == "True") {
        svg.append("circle")
          .attr("cx", width/2 + coords_x[Number(d.data_id)-1])
          .attr("cy", height/2 + coords_y[Number(d.data_id)-1])
          .attr("r",10)
          .style("fill","red");
      }
    }

    data.forEach(markers)

  })
}

