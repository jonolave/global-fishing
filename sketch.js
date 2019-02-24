var canvas;
var countryList;
var somethingChanged;
var temp;

var manualHeight;

var cargoHeightScale;
var tonnageScale;

var horizontalScale;

var days_to_horizontal_Scale;
var horizontalScaleMaxValue;
var horizontalScaleTick;

var gdp_to_verticalScale;
var verticalScaleMaxValue;
var verticalScaleTick;

function preload() {
  d3.csv("data/top_countries.csv", function(data) {
    countryList = data;
    console.log("data loaded");
    somethingChanged = true;
  });
}

function setup() {
  manualHeight = 3000;
  manualWidth = 1400;

  horizontalScaleMaxValue = 320800;
  horizontalScaleTick = 50000; // value between each tick

  verticalScaleMaxValue = 71000;
  verticalScaleTick = 5000;

  var canvas = createCanvas(manualWidth, manualHeight);
  canvas.parent('sketchwrapper');

  // Define scales
  // cargoHeight
  cargoHeightScale = d3
    .scaleLinear()
    .domain([0, 320800])
    .range([0, 160]);

  tonnageScale = d3
    .scaleLinear()
    .domain([0, 1900])
    .range([0, 100]);

  // horisontal based on days
  days_to_horizontal_Scale = d3
    .scaleSqrt()
    .domain([0, 320800])
    .range([100, manualWidth - 100]);

  // vertical gdp scale
  gdp_to_verticalScale = d3
    .scaleSqrt()
    .domain([0, 71000])
    .range([manualHeight - 100, 150]);
  // scale is reversed to start at bottom. 100 pixels below and above

  somethingChanged = false;
}

function draw() {
  if (somethingChanged) {
    background(231, 240, 243);

    drawHorizontalTicks();
    drawVerticalTicks(); 

    for (var i = 0; i < countryList.length; i++) {
      // Do something
      drawVessel(
        countryList[i].country_name, //countryName
        days_to_horizontal_Scale(countryList[i].fishing_days_2016), // xpos based on days
        gdp_to_verticalScale(countryList[i].gdp), // ypos
        tonnageScale(countryList[i].avg_tonnage), // vesselLength
        cargoHeightScale(countryList[i].fishing_days_2016), // cargoheight
        tonnageScale(countryList[i].fished_avg_tonnage), // fishedLength
        cargoHeightScale(countryList[i].fished_days_2016), // fishedHeight
        countryList[i].direction, // direction
        days_to_horizontal_Scale(countryList[i].fishing_days_2012)
      );
    }

    somethingChanged = false;
  }
}

function drawVerticalTicks() {
  // calculate number of ticks
  var ticks = Math.ceil(verticalScaleMaxValue / verticalScaleTick) + 1;

  for (var i = 0; i < ticks; i++) {
    stroke(0, 160);
    noFill();
    line(
      10,
      gdp_to_verticalScale(i * verticalScaleTick),
      15,
      gdp_to_verticalScale(i * verticalScaleTick)
    );
  }
}

function drawHorizontalTicks() {
  textSize(10);
  textStyle(NORMAL);
  var ticks = Math.ceil(horizontalScaleMaxValue / horizontalScaleTick) + 1;

  // AXIS text
  textAlign(LEFT);
  noStroke();
  fill(0, 160);
  text("Days of fishing:", days_to_horizontal_Scale(0), 20);

  for (var i = 0; i < ticks; i++) {
    textAlign(CENTER);

    noStroke();
    fill(0, 160);
    text(
      (i * horizontalScaleTick).toLocaleString(),
      days_to_horizontal_Scale(i * horizontalScaleTick),
      40
    );

    stroke(0, 160);
    noFill();
    line(
      days_to_horizontal_Scale(i * horizontalScaleTick),
      50,
      days_to_horizontal_Scale(i * horizontalScaleTick),
      55
    );
  }
}

function drawVessel(
  countryName,
  xpos,
  ypos,
  vesselLength,
  cargoheight,
  fishedLength,
  fishedHeight,
  direction,
  xpos_2012
) {
  // Define colors
  var color_hull = color(90, 109, 112, 126);
  var color_house = color(147, 163, 163, 126);
  var color_windows = color(0, 20);
  var color_roof = color(90, 109, 112, 126);
  var color_fished_area = color(32, 66, 128, 110);
  var color_cargo = color(231, 67, 39, 110);
  var color_shadow = color(0, 20);
  var color_ocean_overlay = color(231, 240, 243, 230);
  var color_oceanline = color(101, 98, 79, 80);
  var color_12_16_diff = color(101, 98, 79, 160);


  // Calculate 2012-2016 pixel difference
  var diff_2012_2016 = Math.abs(xpos - xpos_2012);

  // calculate length on each side minus existing size
  length = vesselLength / 2 - 10;

  var cornerRadius = 2;
  var text_ypos;
  var vessel_scale = 1.0;

  push(); // Start a new drawing state

  if (direction === "right") {
    translate(xpos + 50, ypos - 59);
    scale(-vessel_scale, vessel_scale);
  } else if (direction === "left") {
    translate(xpos - 50, ypos - 59);
    scale(vessel_scale, vessel_scale);
  } else {
    console.log("check direction spelling: " + direction);
  }

  //fished area
  noStroke();
  fill(color_fished_area);
  rect(50 - fishedLength / 2, 62, fishedLength, fishedHeight, cornerRadius);

  //hull
  fill(color_hull);
  beginShape();
  vertex(12 - length, 47);
  vertex(30.61 - length, 47);
  vertex(33.76 - length, 51);
  vertex(40 - length, 51);
  vertex(40 - length, 50);
  vertex(60 + length, 50);
  vertex(60 + length, 51);
  vertex(89.12 + length, 51);
  vertex(88.43 + length, 56.28);
  vertex(83 + length, 59); // på linja
  // vertex(80.01 + length, 65); // kutt
  // vertex(26.81 - length, 65); // kutt
  // vertex(23.07 - length, 63.93); // kutt
  // vertex(19.9 - length, 61.64); // kutt
  vertex(18 - length, 59); // på linja
  vertex(16.19 - length, 55.16);
  vertex(13.33 - length, 48.03);
  vertex(12 - length, 47.68);
  endShape(CLOSE);

  //cargo
  fill(color_cargo);
  rect(
    40 - length,
    50 - cargoheight,
    20 + length * 2,
    cargoheight,
    cornerRadius
  );

  //house
  fill(color_house);
  rect(68 + length, 37, 14, 14);

  //brightline
  /*  
    fill(255,125);
    beginShape();
    vertex(29.88-length, 56);
    vertex(88.47+length, 56);
    vertex(88.73+length, 54);
    vertex(31.48-length, 54);
    vertex(15.37-length, 53.11);
    vertex(16.19-length, 55.16);
    endShape(CLOSE); */

  //roof
  fill(color_roof);
  rect(66 + length, 35, 17, 2, cornerRadius);

  //windows
  fill(color_windows);
  rect(70 + length, 40, 2, 4);
  rect(73 + length, 40, 2, 4);

  //shadow
  fill(color_shadow);
  beginShape();
  vertex(13.33 - length, 48.03);
  vertex(17.03 - length, 48.93);
  vertex(22.59 - length, 53.27); // opp 4
  vertex(25.41 - length, 55.3); // opp 4
  vertex(28.9 - length, 56.29); // opp 4
  vertex(75.16 + length, 56.29); // opp 4
  vertex(79.28 + length, 56);
  vertex(86.93 + length, 54);
  vertex(87.45 + length, 51);
  vertex(89.12 + length, 51);
  vertex(88.43 + length, 56.28);
  vertex(83 + length, 59); // på linja
  // vertex(80.01 + length, 65); // kutt
  // vertex(26.81 - length, 65); // kutt
  // vertex(23.07 - length, 63.93); // kutt
  // vertex(19.9 - length, 61.64); // kutt
  vertex(18 - length, 59); // på linja
  vertex(16.19 - length, 55.16);
  endShape(CLOSE);

  //ocean
  //   fill(color_ocean_overlay);
  //   beginShape();
  //   vertex(80.5 + length, 66.78);
  //   vertex(21.98 - length, 66.78);
  //   vertex(15.84 - length, 58.54);
  //   vertex(86.96 + length, 58.54);
  //   endShape(CLOSE);

  // masts
  // stroke(101, 98, 79);
  // line(28.5-length,14,28.5-length,47);
  // line(80.5+length,9,80.5+length,51);

  // Ccean line 2012-2016
  stroke(color_oceanline);

  // horizontal ocean line
  // From bow to aft in 2012
//   line(18 - length, 59, 83 + length + diff_2012_2016, 59);

  stroke(color_12_16_diff);

  // vessel origo vertical line
  line(50, 56, 50, 62);
  // line(83 + length, 56, 83 + length, 62);

  // 2012 vertical line
  line(50 + diff_2012_2016, 56, 50 + diff_2012_2016, 62);
  // line(83 + length + diff_2012_2016, 56, 83 + length + diff_2012_2016, 62);

// 2012-2016 horizontal line
line(50, 59, 50 + diff_2012_2016, 59);


  pop(); // Restore original state

  // New state to draw text and origo
  push(); // Start a new drawing state
  translate(xpos, ypos);

  // text y pos
  if (cargoheight < 16) {
    text_ypos = 28;
  } else {
    text_ypos = cargoheight + 14;
  }

  textSize(13);
  textAlign(CENTER);
  noStroke();
  textStyle(BOLD);
  fill(0, 160);
  text(countryName, 0, -text_ypos);

  // vessel origo indicator
  stroke(color_oceanline);
  noFill();
  // line(0, 0, 0, 2);

  pop(); // Restore original state
}
