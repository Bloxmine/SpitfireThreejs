// Author: Hein Dijstelbloem
// Description: Spitfire 3D model flying in place, with clouds flying past it. Able to be observed from all angles.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87BEFC, 1);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
controls.update();

let spitfireModel;

loader.load('../models/spitfire.gltf', function(gltf) {
    gltf.scene.traverse(function(node) {
        if (node.isMesh) {
            // toon material attempt
            node.material = new THREE.MeshToonMaterial({
                map: node.material.map
            });
        }
    });

    spitfireModel = gltf.scene;
    scene.add(spitfireModel);
    spitfireModel.position.y = -1;
    spitfireModel.rotation.y = Math.PI / 2;
    spitfireModel.scale.set(1, 1, 1);
});

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// ground plane
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('../models/farmland.jpg');

groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;

const textureRepeatFactor = 3;
groundTexture.repeat.set(textureRepeatFactor, textureRepeatFactor);

const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshToonMaterial({ map: groundTexture })
);

groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -50;
scene.add(groundPlane);

const fogColor = 0xBCD6F3; // white
const fogNear = 100;
const fogFar = 140;

scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

const skyTexture = new THREE.TextureLoader().load('../models/sky.jpg');
const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide
});
const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyMesh);

const cloudGeometry = new THREE.SphereGeometry(1, 32, 32);
const cloudMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
const clouds = [];
for (let i = 0; i < 10; i++) {
    clouds.push(new THREE.Mesh(cloudGeometry, cloudMaterial));
    clouds[i].position.x = Math.random() * 10 - 5;
    clouds[i].position.y = Math.random() * 10 - 5;
    clouds[i].position.z = Math.random() * 10 - 5;
    scene.add(clouds[i]);
}

const animate = function() {
    requestAnimationFrame(animate);
    if (spitfireModel) {
        // date.now() is used to get a smooth animation
        spitfireModel.position.z = Math.sin(Date.now() * 0.001) * 0.5;
        spitfireModel.rotation.z = Math.sin(Date.now() * 0.001) * 0.2;
    }
    groundTexture.offset.x -= 0.0001;

    clouds.forEach(cloud => {
        cloud.position.x += 0.01;
        if (cloud.position.x > 5) {
            cloud.position.x = -5;
        }
    });
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

);