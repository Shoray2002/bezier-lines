// function used to generate the points on the line
// input: {c0:Vector3, c1:Vector3, c2:Vector3, c3:Vector3, t:float}
// output: array of required points
import * as THREE from "https://cdn.skypack.dev/three";
import Curve from "https://cdn.skypack.dev/three/src/extras/core/Curve.js";
import CubicBezier from "https://cdn.skypack.dev/three/src/extras/core/Interpolations.js";

class CubicBezierCurve3 extends Curve {
  constructor(
    v0 = new THREE.Vector3(),
    v1 = new THREE.Vector3(),
    v2 = new THREE.Vector3(),
    v3 = new THREE.Vector3()
  ) {
    super();
    this.type = "CubicBezierCurve3";
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const point = optionalTarget;
    const v0 = this.v0,
      v1 = this.v1,
      v2 = this.v2,
      v3 = this.v3;

    point.set(
      CubicBezier(t, v0.x, v1.x, v2.x, v3.x),
      CubicBezier(t, v0.y, v1.y, v2.y, v3.y),
      CubicBezier(t, v0.z, v1.z, v2.z, v3.z)
    );

    return point;
  }
}
CubicBezierCurve3.prototype.isCubicBezierCurve3 = true;
// algorithm
function bezier3(c0, c1, c2, c3, t) {
  const path=new CubicBezierCurve3(c0, c1, c2, c3);
  return path.getPoint(t);
}








export { bezier3 };
