// function used to generate the points on the line
// input: {c0:Vector3, c1:Vector3, c2:Vector3, c3:Vector3, t:float}
// output: array of required points
import * as THREE from "https://cdn.skypack.dev/three";

function bezier3({ c0: c0, c1: c1, c2: c2, c3: c3, t: t }) {
  let points;
  let x =
    (1 - t) * (1 - t) * (1 - t) * c0.x +
    3 * (1 - t) * (1 - t) * t * c1.x +
    3 * (1 - t) * t * t * c2.x +
    t * t * t * c3.x;
  let y =
    (1 - t) * (1 - t) * (1 - t) * c0.y +
    3 * (1 - t) * (1 - t) * t * c1.y +
    3 * (1 - t) * t * t * c2.y +
    t * t * t * c3.y;
  let z =
    (1 - t) * (1 - t) * (1 - t) * c0.z +
    3 * (1 - t) * (1 - t) * t * c1.z +
    3 * (1 - t) * t * t * c2.z +
    t * t * t * c3.z;
  points = new THREE.Vector3(x, y, z);
  return points;
}

export { bezier3 };
