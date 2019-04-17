var canvas;
var canvasScale;
var countryList;
var somethingChanged;

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

var color_background;
var hoverState;
var hoverCountry;
var lastHoverCountry;
var dataLoaded;

function preload() {
  d3.csv("data/top_countries.csv", function (data) {
    countryList = data;
    // console.log("data loaded");
    somethingChanged = true;
    dataLoaded = true;
  });
}

function setup() {
  // canvas was too large to shop up on mobile devices
  canvasScale = 0.9;

  manualHeight = 3000;
  manualWidth = 1400;

  dataLoaded = false;
  hoverState = false;

  horizontalScaleMaxValue = 320800;
  horizontalScaleTick = 50000; // value between each tick

  verticalScaleMaxValue = 71000;
  verticalScaleTick = 5000;

  color_background = color(231, 240, 243);

  var canvas = createCanvas(manualWidth*canvasScale, manualHeight*canvasScale);
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
    .range([100, manualWidth - 120]);

  // vertical gdp scale
  gdp_to_verticalScale = d3
    .scaleSqrt()
    .domain([0, 71000])
    .range([manualHeight - 20, 180]);
  // scale is reversed to start at bottom. 100 pixels below and above

  somethingChanged = false;
}

function draw() {
  if (somethingChanged) {
    push(); // Start a new drawing state
    scale(canvasScale);

    background(color_background);

    drawHorizontalTicks(50,-10);
    drawHorizontalTicks(gdp_to_verticalScale(0),15);
    drawVerticalTicks();

    // Draw all countries
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

    // Draw legend on Norway if not hoverstate for Norway
    if (hoverState && hoverCountry === "NOR") {} else {
      drawlegend(
        days_to_horizontal_Scale(countryList[0].fishing_days_2016), // xpos based on days
        gdp_to_verticalScale(countryList[0].gdp), // ypos
        tonnageScale(countryList[0].avg_tonnage), // vesselLength
        cargoHeightScale(countryList[0].fishing_days_2016), // cargoheight
        tonnageScale(countryList[0].fished_avg_tonnage), // fishedLength
        cargoHeightScale(countryList[0].fished_days_2016), // fishedHeight
        days_to_horizontal_Scale(countryList[0].fishing_days_2012)
      );
    }

    // Draw country info
    if (hoverState) {
      var countryToShow = getArrayPosition(hoverCountry);

      drawCountryInfo(
        countryList[countryToShow].country_name, //countryName
        days_to_horizontal_Scale(countryList[countryToShow].fishing_days_2016), // xpos based on days
        gdp_to_verticalScale(countryList[countryToShow].gdp), // ypos
        countryList[countryToShow].avg_tonnage, // vesselLength tonnage
        countryList[countryToShow].fishing_days_2016, // cargoheight
        countryList[countryToShow].fished_avg_tonnage, // fishedLength
        countryList[countryToShow].fished_days_2016, // fishedHeight
        days_to_horizontal_Scale(countryList[countryToShow].fishing_days_2012)
      );

    }
    somethingChanged = false;
    pop(); // Restore original state
  }
}

function mouseReleased(){
  // In order for touch to be registered on mobile devices
  mouseMoved();
}

function mouseMoved() {
  var xThreshold = 50; // pixels from vessel center
  var yThreshold = 50; // pixels from vessel center
  var xDiff;
  var yDiff;

  if (dataLoaded) {
    for (var i = 0; i < countryList.length; i++) {
      xDiff = Math.abs(mouseX - canvasScale*days_to_horizontal_Scale(countryList[i].fishing_days_2016));
      yDiff = Math.abs(mouseY - canvasScale*gdp_to_verticalScale(countryList[i].gdp));

      // check ypos first, then x
      if (yDiff < yThreshold) {
        if (xDiff < xThreshold) {
          // We have a hover
          // Is this a new state?
          if (hoverState && lastHoverCountry == hoverCountry) {
            // no
            somethingChanged = false;
          } else {
            // yes, new state
            somethingChanged = true;
            lastHoverCountry = hoverCountry;
          }
          // we have hover 
          hoverState = true;
          hoverCountry = countryList[i].country;
          break;
        }
      }
      // if last item and we had hoverstate, but not anymore
      if (hoverState && i === countryList.length - 1) {
        hoverState = false;
        somethingChanged = true;
      }
    }
  }
}

function drawCountryInfo(
  countryName,
  xpos,
  ypos,
  fishing_tonnage,
  fishing_days,
  fished_tonnage,
  fished_days,
  fishing_2012) {

  var fishing_tonnage_px = tonnageScale(fishing_tonnage);
  var fished_tonnage_px = tonnageScale(fished_tonnage);
  var fishing_days_px = cargoHeightScale(fishing_days);
  var fished_days_px = cargoHeightScale(fished_days);

  var color_red = color(231, 67, 39);
  var color_blue = color(32, 66, 128);

  var maxTonnage = Math.max(fishing_tonnage_px, fished_tonnage_px);

  // if pixel values are too low, adjust
  if (fishing_days_px < 20) {
    fishing_days_px = 20;
  }
  if (fished_days_px < 35) {
    // fished_days_px = 35;
  }

  // Calculate 2012-2016 pixel difference
  var diff_2012_2016 = Math.abs(xpos - fishing_2012);

  push();
  // translate 0,0 to vessel center position
  translate(xpos, ypos);

  // BACKGROUND SHEETS

  // fill(red(color_background), green(color_background), blue(color_background), 120);
  fill(250, 220);
  noStroke();

  // Sheet above cargo: fishing
  beginShape();
  vertex(0, -fishing_days_px - 27);
  vertex(5, -fishing_days_px - 32);
  vertex(45, -fishing_days_px - 32);
  vertex(45, -fishing_days_px - 72);
  vertex(-45, -fishing_days_px - 72);
  vertex(-45, -fishing_days_px - 32);
  vertex(-5, -fishing_days_px - 32);
  endShape(CLOSE);

  // Sheet below vessel: fished
  beginShape();
  vertex(0, fished_days_px + 7);
  vertex(5, fished_days_px + 12);
  vertex(45, fished_days_px + 12);
  vertex(45, fished_days_px + 52);
  vertex(-45, fished_days_px + 52);
  vertex(-45, fished_days_px + 12);
  vertex(-5, fished_days_px + 12);
  endShape(CLOSE);

  // Upper right: days fishing
  rect((maxTonnage / 2) + 25, -49, 90, 40);

  // Lower right: days fished
  rect((maxTonnage / 2) + 25, 3, 90, 40);

  // TEXT ON SHEETS
  textAlign(CENTER);
  noStroke();

  fill(color_red);

  // Fishing tonnage above vessel
  textStyle(BOLD);
  textSize(16);
  text(Math.round(fishing_tonnage).toLocaleString(), 0, -fishing_days_px - 52);
  textSize(12);
  textStyle(NORMAL);
  text("tonnes (avg.)", 0, -fishing_days_px - 40);

  // Upper right: Fishing days
  textStyle(BOLD);
  textSize(16);
  text(Math.round(fishing_days).toLocaleString(), (maxTonnage / 2) + 70, -29);
  textStyle(NORMAL);
  textSize(12);
  text("days fishing", (maxTonnage / 2) + 70, -17);

  fill(color_blue);

  // Fished tonnage below vessel
  textStyle(BOLD);
  textSize(16);
  text(Math.round(fished_tonnage).toLocaleString(), 0, fished_days_px + 32);
  textSize(12);
  textStyle(NORMAL);
  text(" tonnes (avg.)", 0, fished_days_px + 3 + 25 + 16);

  // Lower right: Fished days
  textStyle(BOLD);
  textSize(16);
  text(Math.round(fished_days).toLocaleString(), (maxTonnage / 2) + 70, 23);
  textStyle(NORMAL);
  textSize(12);
  text("days fished", (maxTonnage / 2) + 70, 35);

  // Fishing 2012
  // text("hello", -diff_2012_2016, 30, fishing_2012);

  pop();
}

function drawlegend(xpos, ypos, fishing_tonnage, fishing_days, fished_tonnage, fished_days, fishing_2012) {
  var legend_text_fishing_tonnage = ["Average vessel tonnage", "(fishing in other countries)"];
  var legend_text_fishing_days = ["Days fishing in other", "countries’ waters in 2016"];
  var legend_text_fished_tonnage = ["Average vessel tonnage", "(fished by other countries)"];
  var legend_text_fished_days = ["Days fished by vessels", "from other countries in 2016"];
  var legend_text_change = ["Change in days", "fishing in other", "countries’ waters", "from 2012 to 2016"];

  var color_red = color(231, 67, 39);
  var color_blue = color(32, 66, 128);

  // Calculate 2012-2016 pixel difference
  var diff_2012_2016 = Math.abs(xpos - fishing_2012);

  push();
  translate(xpos, ypos);

  // Fishing tonnage
  drawArrow(-(fishing_tonnage / 2), -fishing_days - 9 - 24, fishing_tonnage / 2, -fishing_days - 9 - 24, color_red, true, true);
  drawText(-(fishing_tonnage / 2), -fishing_days - 9 - 24 - 28, legend_text_fishing_tonnage, color_red);

  // Fishing days
  drawArrow(60, -fishing_days - 9, 60, -9, color_red, true, true);
  drawText(70, -fishing_days + 10, legend_text_fishing_days, color_red);

  // Fished days
  drawArrow(60, 2, 60, fished_days + 2, color_blue, true, true);
  drawText(70, 30, legend_text_fished_days, color_blue);

  // Fished tonnage
  drawArrow(-(fished_tonnage / 2), fished_days + 3 + 10, fished_tonnage / 2, fished_days + 3 + 10, color_blue, true, true);
  drawText(-(fished_tonnage / 2), fished_days + 3 + 30, legend_text_fished_tonnage, color_blue);

  // Fishing 2012
  drawArrow(-diff_2012_2016, 10, 0, 10, color_red, false, true);
  drawText(-diff_2012_2016, 30, legend_text_change, color_red);

  pop();
}

function drawText(xpos, ypos, textAsList, textColor) {
  var textlineHeight = 15;
  textSize(12);
  textAlign(LEFT);
  noStroke();
  textStyle(NORMAL);
  fill(textColor);
  for (var textLine in textAsList) {
    text(textAsList[textLine], xpos, ypos + (textlineHeight * textLine));
  }
}

function drawArrow(startX, startY, endX, endY, strokeColor, startArrow, endArrow) {
  // strokeColor: send color, startArrow and endArrow: true or false
  noFill();
  stroke(strokeColor);

  // Draw line

  beginShape();
  vertex(startX, startY);
  vertex(endX, endY);
  endShape();

  var arrowWidth = 3;
  var arrowLength = 4;
  var angleRadians = Math.atan2(endY - startY, endX - startX);

  if (startArrow) {
    push();
    translate(startX, startY);
    rotate(angleRadians);
    beginShape();
    vertex(arrowLength, arrowWidth);
    vertex(0, 0);
    vertex(arrowLength, -arrowWidth);
    endShape();
    // endShape(CLOSE); // to fill arrow
    pop();
  }

  if (endArrow) {
    push();
    translate(endX, endY);
    rotate(angleRadians);
    beginShape();
    vertex(-arrowLength, -arrowWidth);
    vertex(0, 0);
    vertex(-arrowLength, arrowWidth);
    endShape();
    pop();
  }

}


// Function to find index of array
function getArrayPosition(countryCode) {
  arrayPosition = countryList.findIndex(function (countryList) {
    return countryList.country === countryCode;
  });
  return arrayPosition;
}

function drawVerticalTicks() {
  var xOrigo = days_to_horizontal_Scale(0);
  var yAxisText = "GDP per capita (USD, 2016)";

  // calculate number of ticks
  var ticks = Math.ceil(verticalScaleMaxValue / verticalScaleTick) + 1;

  // AXIS text
  textAlign(LEFT);
  textSize(12);
  // text(yAxisText[0], 10, 54);
  // text(yAxisText[1], 10, 54 + 16);

  // vertical line
  stroke(0, 40);
  noFill();
  line(xOrigo, 50, xOrigo, gdp_to_verticalScale(0));

  // Draw vertical text
  push();
  // background box
  translate(xOrigo + 4, 80);
  rotate(-PI / 2);
  fill(color_background);
  // Text
  noStroke();
  rect(-textWidth(yAxisText) - 10, -10, textWidth(yAxisText) + 20, 20);
  noStroke();
  fill(0, 160);
  textAlign(RIGHT);
  text(yAxisText, 0, 0);
  pop();

  for (var i = 0; i < ticks; i++) {

    textAlign(RIGHT);
    noStroke();
    fill(0, 160);

    text(
      (i * verticalScaleTick).toLocaleString(),
      xOrigo - 45,
      gdp_to_verticalScale(i * verticalScaleTick) + 4);

    stroke(0, 160);
    noFill();
    line(
      xOrigo - 35,
      gdp_to_verticalScale(i * verticalScaleTick),
      xOrigo - 30,
      gdp_to_verticalScale(i * verticalScaleTick)
    );

  }
}

function drawHorizontalTicks(axisYpos,axisTextOffset) {
  textStyle(NORMAL);
  var ticks = Math.ceil(horizontalScaleMaxValue / horizontalScaleTick) + 1;
  var xAxisText = "Days of fishing in other contries' waters";
  var ypos = axisYpos; // 50
  var yposText = axisTextOffset; // -10 

  // AXIS text
  textAlign(LEFT);
  noStroke();
  fill(0, 160);
  textSize(12);
  text(xAxisText, days_to_horizontal_Scale(0) + 40, ypos + 4);
  var textLength = textWidth(xAxisText);

  stroke(0, 40);
  noFill();
  line(days_to_horizontal_Scale(0) - 1, ypos, days_to_horizontal_Scale(0) + 30, ypos);
  line(days_to_horizontal_Scale(0) + 40 + textLength + 10, ypos, days_to_horizontal_Scale((ticks - 1) * horizontalScaleTick), ypos);

  textSize(12);
  var textLength;

  for (var i = 0; i < ticks; i++) {
    textAlign(CENTER);

    noStroke();
    fill(0, 160);
    text(
      (i * horizontalScaleTick).toLocaleString(),
      days_to_horizontal_Scale(i * horizontalScaleTick),
      ypos+yposText
    );

    stroke(0, 160);
    noFill();
    line(
      days_to_horizontal_Scale(i * horizontalScaleTick),
      ypos-2,
      days_to_horizontal_Scale(i * horizontalScaleTick),
      ypos+3
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
  var color_hull = color(90, 109, 112, 150);
  var color_house = color(147, 163, 163, 126);
  var color_windows = color(0, 80);
  var color_roof = color(90, 109, 112, 126);
  var color_fished_area = color(32, 66, 128, 150);
  var color_cargo = color(231, 67, 39, 150);
  var color_shadow = color(0, 20);
  var color_ocean_overlay = color(231, 240, 243, 230);
  // var color_oceanline = color(101, 98, 79, 80);
  var color_oceanline = color(231, 67, 39, 110);
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
 
  // Ccean line 2012-2016
  stroke(color_oceanline);

  // vessel origo vertical line
  line(50, 56, 50, 62);
  // line(83 + length, 56, 83 + length, 62);

  // 2012 vertical line
  line(49 + diff_2012_2016, 56, 49 + diff_2012_2016, 62);
  // line(83 + length + diff_2012_2016, 56, 83 + length + diff_2012_2016, 62);

  // 2012-2016 horizontal line
  line(50, 59, 49 + diff_2012_2016, 59);

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