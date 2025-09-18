///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#0a0c2c");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
// const geo = new THREE.SphereGeometry(1.5, 128, 128);

const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    wireframe: true,
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;

// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#ffffff", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#0066ff", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);



///////// EN CLASE.

//// A) Cargar múltiples texturas.

//// B) Rotación al scrollear.

//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".

///////// FIN DE LA CLASE.


/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x -= 0.005;

    renderer.render(scene, camera);
}

animate();