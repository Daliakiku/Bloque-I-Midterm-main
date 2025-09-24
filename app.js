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
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
//const geo = new THREE.SphereGeometry(1.5, 80, 80);
const geo = new THREE.TorusGeometry( 1, 0.5, 16, 100 );

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
// 1. "Loading manager".
const manager = new THREE.LoadingManager(); //create loading manager

//define local functions for different manager events
manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   createMaterial();
};

manager.onError = function (url) {
   console.error(`❌ Error al cargar: ${url}`);
};

// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager); //this is calling the funtions we just created in the loading manager

// 3. Cargamos texturas guardadas en el folder del proyecto.
//BRICKS
// const tex = {
//    albedo: loader.load('./assets/texturas/bricks/albedo.png'), //base color
//    ao: loader.load('./assets/texturas/bricks/ao.png'), //ambient occlusion, luces y sombras
//    metalness: loader.load('./assets/texturas/bricks/metallic.png'), //what it sounds like
//    normal: loader.load('./assets/texturas/bricks/normal.png'), //uhhhhh
//    roughness: loader.load('./assets/texturas/bricks/roughness.png'), //applies to metalic objects
//    displacement: loader.load('./assets/texturas/bricks/displacement.png'), //extrusion/3d values of texture
// };

//METAL PANELS
const tex = {
   albedo: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_albedo.png'), //base color
   ao: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_ao.png'), //ambient occlusion, luces y sombras
   metalness: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_metallic.png'), //what it sounds like
   normal: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_normal-ogl.png'), //uhhhhh
   roughness: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_roughness.png'), //applies to metalic objects
   displacement: loader.load('./assets/texturas/metal-panel/vented-metal-panel1_height.png'), //extrusion/3d values of texture
};
// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var pbrMaterial; //create variable that will hold the material


//BRICKS
// function createMaterial() { 
//    pbrMaterial = new THREE.MeshStandardMaterial({ //assign all the variables we created to the maps
//        map: tex.albedo, //albedo variable inside the tex object
//        aoMap: tex.ao,
//        metalnessMap: tex.metalness,
//        normalMap: tex.normal,
//        roughnessMap: tex.roughness,
//        displacementMap: tex.displacement,
//        displacementScale: 0.8, //how much extrusion
//        side: THREE.FrontSide, //which side of the faces to renders
//        // wireframe: true,
//    });

//    mesh.material = pbrMaterial;
// }

//PANELS
function createMaterial() {
   pbrMaterial = new THREE.MeshStandardMaterial({ //assign all the variables we created to the maps
       map: tex.albedo, //albedo variable inside the tex object
       aoMap: tex.ao,
       metalnessMap: tex.metalness,
       normalMap: tex.normal,
       roughnessMap: tex.roughness,
       displacementMap: tex.displacement,
       displacementScale: 0.15, //how much extrusion
       side: THREE.FrontSide, //which side of the faces to renders
       // wireframe: true,
   });

   mesh.material = pbrMaterial;
}



//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
    //create and define variables
    x: 0, //raw x value
    lerpedX: 0, //smoothed x value
    speed: 0.005, //scroll speed
    cof: 0.07 //coeficient of friction
 };
 
 // 2. Escuchar el evento scroll y actualizar el valor del scroll.
 function updateScrollData(eventData) {
    scroll.x += eventData.deltaY * scroll.speed; //update raw y value based on scroll
 }
 
 window.addEventListener("wheel", updateScrollData);

//  // 3. Aplicar el valor del scroll a la rotación del mesh. (en el loop de animación)
// function updateMeshRotation() {
//     mesh.rotation.x = scroll.x;
//  }

function updateMeshRotation() {
    mesh.rotation.x = scroll.lerpedX;
 }
  
 // 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollX() {
    scroll.lerpedX += (scroll.x - scroll.lerpedX) * scroll.cof;
 }
 


//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".

// 1. Crear un objeto con la data referente al MOUSE para ocuparla en todos lados.
var mouse = {
    x: 0,
    y: 0,
    normalOffset: {
        x: 0,
        y: 0
    },
    lerpNormalOffset: {
        x: 0,
        y: 0
    },
 
    cof: 0.07,
    gazeRange: {
        x: 7,
        y: 7
    }
 }

 // 2. Leer posición del mouse y calcular distancia del mouse al centro.
function updateMouseData(eventData) {
    updateMousePosition(eventData);
    calculateNormalOffset();
 }
 function updateMousePosition(eventData) {
    mouse.x = eventData.clientX;
    mouse.y = eventData.clientY;
 }
 function calculateNormalOffset() {
    let windowCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    }
    mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
    mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
 }
 
 window.addEventListener("mousemove", updateMouseData);
 
 // 3. Aplicar valor calculado a la posición de la cámara. (en el loop de animación)
function updateCameraPosition() {
    camera.position.x = mouse.normalOffset.x * mouse.gazeRange.x;
    camera.position.y = -mouse.normalOffset.y * mouse.gazeRange.y;
 }
 

///////// FIN DE LA CLASE.

//Make the mesh bigger when clicked
function updateMeshScale() {
    gsap.to(mesh.scale, { //use gsap to animate the scale of the mesh
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.5,
        ease: "bounce.out",
        //yoyo: true,
        //repeat: 1
    });
}

mesh.addEventListener("click", updateMeshScale);




/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.y -= 0.005;

    updateCameraPosition();
    camera.lookAt(mesh.position);

    lerpScrollX();
    updateMeshRotation();
    renderer.render(scene, camera);
}

animate();

