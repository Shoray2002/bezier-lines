// function used to generate the points on the line
// input: {c0:Vector3, c1:Vector3, c2:Vector3, c3:Vector3, t:float} 
// output: array of required points


// algorithm
function bezier3({c0:c0,c1:c1,c2:c2,c3:c3,t:t}) {
// draw a bezier from c0 to c3
// c0, c1, c2, c3 are the control points
// t is the step size
// return an array of points
  let points = [];
  let n = Math.floor(1/t);
  for (let i = 0; i <= n; i++) {
    let x = Math.pow((1-t),3)*c0.x + 3*t*Math.pow((1-t),2)*c1.x + 3*Math.pow(t,2)*(1-t)*c2.x + Math.pow(t,3)*c3.x;
    let y = Math.pow((1-t),3)*c0.y + 3*t*Math.pow((1-t),2)*c1.y + 3*Math.pow(t,2)*(1-t)*c2.y + Math.pow(t,3)*c3.y;
    let z = Math.pow((1-t),3)*c0.z + 3*t*Math.pow((1-t),2)*c1.z + 3*Math.pow(t,2)*(1-t)*c2.z + Math.pow(t,3)*c3.z;
    points.push(new Vector3(x, y, z));
  }
  return points;

}
export { bezier3 };
