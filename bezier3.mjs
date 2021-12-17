// function used to generate the points on the line
// input: {x0, y0}, {x1, y1}
// output: array of required points


// algorithm
function bezier3({ x: x0, y: y0 }, { x: x1, y: y1 }) {
  let result = [];
  var dx = Math.abs(x1 - x0);
   var dy = Math.abs(y1 - y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx - dy;

   while(true) {
      result.push({ x: x0, y: y0 });

      if ((x0 === x1) && (y0 === y1)) break;
      var e2 = 2*err;
      if (e2 > -dy) { err -= dy; x0  += sx; }
      if (e2 < dx) { err += dx; y0  += sy; }
   }
  // console.log(result);
  return result;
}
export { bezier3 as lineMP };
