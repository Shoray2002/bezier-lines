import "../css/style.css"; //import of css styles
import * as THREE from "https://cdn.skypack.dev/three";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
// import of threeJS dependencies using CDN
import { lineMP } from "../bezier3.mjs";
// import of mjs module

// variables
let camera, scene, renderer;
let plane;
let pointer, raycaster;
let rollOverMesh, rollOverMaterial;
let sphereGeo, materials;
let planeGeo;
const objects = []; // objects in the scene
let marked = []; // placement of red spheres
let pos = [];
let input = [];
let selected;
init();

function init() {
  // set up scene and camera
  camera = new THREE.PerspectiveCamera(
    15,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(-400, 800, 700);
  camera.lookAt(0, 0, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8e88b3);

  // roll-over helpers
  const rollOverGeo = new THREE.CircleGeometry(3, 32);
  rollOverGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  rollOverGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-25, -26, -25));
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0x1ed760,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // mats
  sphereGeo = new THREE.SphereGeometry(12.5, 32);
  sphereGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  sphereGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-25, -25, -25));
  materials = [
    new THREE.MeshBasicMaterial({
      color: 0xffff00,
      opacity: 0.5,
      transparent: true,
    }),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.5,
      transparent: true,
    }),
  ];
  // drawing the axes
  const points1 = [];
  points1.push(new THREE.Vector3(0, 0, 0));
  points1.push(new THREE.Vector3(1050, 0, 0));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points1);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 5,
  });
  const line = new THREE.Line(lineGeo, lineMat);
  const points2 = [];
  points2.push(new THREE.Vector3(0, 0, 0));
  points2.push(new THREE.Vector3(0, 0, -1000));
  const lineGeo2 = new THREE.BufferGeometry().setFromPoints(points2);
  const lineMat2 = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 5,
  });
  const line2 = new THREE.Line(lineGeo2, lineMat2);
  scene.add(line);
  scene.add(line2);

  // drawing the plane
  planeGeo = new THREE.PlaneGeometry(50, 50);
  planeGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  planeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, -15, 0));
  let lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xf68968,
    opacity: 0.9,
    transparent: true,
    side: THREE.DoubleSide,
  });
  let darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e88b3,
    opacity: 0.9,
    transparent: true,
    side: THREE.DoubleSide,
  });
  let board = new THREE.Group();

  // make a checkerboard like pattern
  for (let i = -20; i <= 20; i++) {
    for (let j = -20; j <= 20; j++) {
      if (j % 2 == 0) {
        var cube;
        cube = new THREE.Mesh(
          planeGeo,
          i % 2 == 0 ? lightMaterial : darkMaterial
        );
      } else {
        cube = new THREE.Mesh(
          planeGeo,
          i % 2 == 0 ? darkMaterial : lightMaterial
        );
      }
      cube.position.set(i * 50, 0, j * 50);
      board.add(cube);
    }
  }
  board.position.set(25, 12.5, 25);
  scene.add(board);

  // setting up the invisible movement plane on which the user can move (this plane is smaller than the plane above)
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  const geometry = new THREE.PlaneGeometry(2000, 2000);
  geometry.rotateX(-Math.PI / 2);
  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);
  objects.push(plane);

  // lights
  const ambientLight = new THREE.AmbientLight(0x606060);
  // const pointLight = new THREE.PointLight(0xffffff, 0.5, 0);
  // pointLight.position.set(0, -25000, 0);
  // scene.add(pointLight);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls
  document.addEventListener("pointermove", onPointerMove);
  // document.addEventListener("keydown", onXDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("wheel", (event) => {
    // zoom in and out
    if (event.deltaY < 0) {
      camera.fov -= 2;
    } else {
      camera.fov += 2;
    }
    camera.updateProjectionMatrix();
    render();
  });
  // onload handler
  window.addEventListener("load", () => {
    let locs = [
      [75, 25, 75],
      [-25, 25, 75],
      [75, 25, -25],
      [-25, 25, -25],
    ];
    for (let i = 0; i < 4; i++) {
      let sphere = new THREE.Mesh(sphereGeo, materials[i]);
      sphere.position.set(locs[i][0], locs[i][1], locs[i][2]);
      sphere.name = "C" + i;
      scene.add(sphere);
      marked.push(sphere);
      objects.push(sphere);
      input.push({
        x: locs[i][0],
        y: locs[i][1],
        z: locs[i][2],
        name: sphere.name,
      });
    }
    console.log(input);
  });
}

// event handlers
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function onPointerMove(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
    rollOverMesh.position.divideScalar(50).multiplyScalar(50).addScalar(25);
  }
  render();
  // console log the position of the pointer with respect to the plane
  let x = (rollOverMesh.position.x - 25) / 50;
  let y = -1 * ((rollOverMesh.position.z - 25) / 50);
  let z = 0;

  // round the position to the 3 decimal places
  x = Math.round(x * 1000) / 1000;
  y = Math.round(y * 1000) / 1000;
  z = Math.round(z * 1000) / 1000;
  pos = [x, y, z];
  // console.log(pos);
}

// when x is pressed
// function onXDown(event) {
//   // if event is x
//   if (event.key == "x") {
//     raycaster.setFromCamera(pointer, camera);
//     const intersects = raycaster.intersectObjects(objects, false);
//     if (intersects.length > 0) {
//       const intersect = intersects[0];
//       // stop stacking
//       if (intersect.object === plane) {
//         const mat = new THREE.Mesh(redSphere, redMatmaterial);
//         mat.position.copy(intersect.point).add(intersect.face.normal);
//         mat.position.divideScalar(50).multiplyScalar(50).addScalar(25);
//         mat.updateMatrix();
//         plane.geometry.merge(mat.geometry, mat.matrix);
//         let x = (mat.position.x - 25) / 50;
//         let y = -1 * ((mat.position.z - 25) / 50);
//         let z = 0;
//         marked.push({ x: x, y: y, z: z });
//         console.log(
//           "Marked: " +
//             marked[marked.length - 1].x +
//             "," +
//             marked[marked.length - 1].y +
//             "," +
//             marked[marked.length - 1].z
//         );
//         objects.push(mat);
//         scene.add(mat);
//       }

//       if (marked.length >= 2) {
//         let x1 = marked[marked.length - 2].x;
//         let y1 = marked[marked.length - 2].y;
//         let x2 = marked[marked.length - 1].x;
//         let y2 = marked[marked.length - 1].y;
//         let v1 = new THREE.Vector3(x1 * 50, 0, -1 * (y1 * 50));
//         let v2 = new THREE.Vector3(x2 * 50, 0, -1 * (y2 * 50));
//         const lineGeometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
//         const lineMaterial = new THREE.LineBasicMaterial({
//           color: 0x000000,
//         });
//         const line = new THREE.Line(lineGeometry, lineMaterial);
//         line.position.y = 2;
//         scene.add(line);
//         objects.push(line);
//         /* let result = lineMP(
//           marked[marked.length - 2],
//           marked[marked.length - 1]
//         ); */

//         /* marked.pop();
//         marked.pop();
//         for (let i = 0; i < result.length; i++) {
//           const cube = new THREE.Mesh(cubeGeo, cubeMaterial);

//           cube.position.set(
//             result[i].x * 50 + 25,
//             25,
//             -1 * (result[i].y * 50 - 25)
//           );
//           objects.push(cube);
//           scene.add(cube);
//         } */
//       }
//       render();
//     }
//   }
// }

// when backspace is pressed
function onDocumentKeyDown(event) {
  let index;
  switch (event.keyCode) {
    // backspace
    case 8:
      while (objects.length > 5) {
        scene.remove(objects[objects.length - 1]);
        objects.pop();
        render();
      } // remove all objects at once
      console.log("Scene Reset");
      break;
    // 1
    case 49:
      marked[0].material.opacity = 1;
      marked[1].material.opacity = 0.5;
      marked[2].material.opacity = 0.5;
      marked[3].material.opacity = 0.5;
      selected = "C0";
      break;
    // 2
    case 50:
      marked[1].material.opacity = 1;
      marked[0].material.opacity = 0.5;
      marked[2].material.opacity = 0.5;
      marked[3].material.opacity = 0.5;
      selected = "C1";
      break;
    // 3
    case 51:
      marked[2].material.opacity = 1;
      marked[0].material.opacity = 0.5;
      marked[1].material.opacity = 0.5;
      marked[3].material.opacity = 0.5;
      selected = "C2";
      break;
    // 4
    case 52:
      marked[3].material.opacity = 1;
      marked[0].material.opacity = 0.5;
      marked[1].material.opacity = 0.5;
      marked[2].material.opacity = 0.5;
      selected = "C3";
      break;
    // space
    case 32:
      index = marked.findIndex((element) => element.name === selected);
      marked[index].position.x = pos[0] * 50 + 25;
      marked[index].position.z = -1 * (pos[1] * 50 - 25);
      break;
    // w
    case 87:
      index = marked.findIndex((element) => element.name === selected);
      marked[index].position.y += 5;
      break;
    // s
    case 83:
      index = marked.findIndex((element) => element.name === selected);
      marked[index].position.y -= 5;
      break;

    default:
      break;
  }
  if (selected) {
    console.log(selected);
    index = marked.findIndex((element) => element.name === selected);
    document.getElementById("info").innerHTML = selected + " Selected ";
    let x = (marked[index].position.x - 25) / 50;
    let y = -1 * ((marked[index].position.z - 25) / 50);
    let z = (marked[index].position.y - 25) / 50;
    // round to 3 decimal places
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    z = Math.round(z * 100) / 100;
    document.getElementById("cordinates").innerHTML =
      "X: " + x + " Y: " + y + " Z: " + z;
  }
}

// render the scene
function render() {
  renderer.render(scene, camera);
}

// animate the scene
function animate() {
  const controls = new OrbitControls(camera, renderer.domElement);
  // drags.deactivate();
  controls.enableDamping = true;
  controls.dampingFactor = 1;
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.panSpeed = 0.1;
  controls.update();
  requestAnimationFrame(animate);
  render();
}

animate();