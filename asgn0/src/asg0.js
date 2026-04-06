// asg0.js
var canvas;
var ctx;

function main() {  
  // 1. Retrieve <canvas> element
  canvas = document.getElementById('cnv1'); 
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return; 
  } 

  // 2. Get the rendering context for 2D
  ctx = canvas.getContext('2d');

  // 3. Draw initial black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Part 2: Draw Vector Function
function drawVector(v, color) {
  let cx = canvas.width / 2;  // Center X (200)
  let cy = canvas.height / 2; // Center Y (200)

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy); // Start at center
  
  // Scale coordinates by 20. 
  // Subtract Y because in Canvas, Y increases downwards.
  ctx.lineTo(cx + v.elements[0] * 20, cy - v.elements[1] * 20);
  
  ctx.stroke();
}

// Part 3 & 4: Handle Draw Button
function handleDrawEvent() {
  // Clear the canvas with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read v1 from HTML
  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;
  let v1 = new Vector3([v1x, v1y, 0]);
  drawVector(v1, "red");

  // Read v2 from HTML
  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v2, "blue");
}

// Part 5-8: Handle Operations Button
function handleDrawOperationEvent() {
  // 1. Clear Canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Read v1 and v2 again
  let v1 = new Vector3([document.getElementById('v1x').value, document.getElementById('v1y').value, 0]);
  let v2 = new Vector3([document.getElementById('v2x').value, document.getElementById('v2y').value, 0]);
  
  // 3. Draw originals
  drawVector(v1, "red");
  drawVector(v2, "blue");

  // 4. Get operation and scalar
  let op = document.getElementById('op-select').value;
  let s = parseFloat(document.getElementById('scalar').value);

  // 5. Perform Math 
  // Note: We use "new Vector3(v1.elements)" to avoid mutating the original vectors 
  // used for the red/blue drawing.
  if (op === "add") {
    let v3 = new Vector3(v1.elements).add(v2);
    drawVector(v3, "green");
  } else if (op === "sub") {
    let v3 = new Vector3(v1.elements).sub(v2);
    drawVector(v3, "green");
  } else if (op === "mul") {
    let v3 = new Vector3(v1.elements).mul(s);
    let v4 = new Vector3(v2.elements).mul(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "div") {
    let v3 = new Vector3(v1.elements).div(s);
    let v4 = new Vector3(v2.elements).div(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "mag") {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  } else if (op === "norm") {
    let v3 = new Vector3(v1.elements).normalize();
    let v4 = new Vector3(v2.elements).normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "angle") {
    let angle = angleBetween(v1, v2);
    console.log("Angle:", angle);
  } else if (op === "area") {
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle:", area);
  }
}

// Helper Function for Part 7
function angleBetween(v1, v2) {
  let d = Vector3.dot(v1, v2);
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  
  // cos(alpha) = (v1 dot v2) / (||v1|| * ||v2||)
  let cosAlpha = d / (m1 * m2);
  
  // Math.acos returns radians, so we convert to degrees
  let angleRad = Math.acos(cosAlpha);
  let angleDeg = angleRad * (180 / Math.PI);
  
  return angleDeg;
}

// Helper Function for Part 8
function areaTriangle(v1, v2) {
  // The magnitude of the cross product is the area of the parallelogram
  let v3 = Vector3.cross(v1, v2);
  let areaParallelogram = v3.magnitude();
  
  // Triangle area is half of the parallelogram area
  return areaParallelogram / 2;
}