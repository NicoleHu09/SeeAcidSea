import * as THREE from 'three'
import * as d3 from 'd3';
import gsap from 'gsap'
import * as echarts from 'echarts';
import Papa from 'papaparse';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
// For d3.js



let scene01 = new THREE.Scene();
let camera01 = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer01 = new THREE.WebGLRenderer({
    canvas: document.querySelector('#coral-canvas')
});
renderer01.setSize(innerWidth/3, innerHeight/3);
camera01.position.set(2.5,1,0)
camera01.lookAt(0,1,0)


let material = new THREE.PointsMaterial({
    color: 0xC2ECFF,
    size: 0.001,
    transparent: true,
    opacity: 0.1
});

// const geometry = new THREE.SphereGeometry( 1, 32, 16 );
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );

const loader01 = new OBJLoader();
loader01.load('./model/coral.obj', (obj) => {
    obj.children.forEach((child) => {
        let mesh01 = new THREE.Points(child.geometry, material);
        mesh01.position.set(0, 0, 0);
        scene01.add(mesh01);
    });
})






let scene02 = new THREE.Scene();
let camera02 = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer02 = new THREE.WebGLRenderer({
    canvas: document.querySelector('#algae-canvas')
});
renderer02.setSize(innerWidth/3, innerHeight/3);
camera02.position.set(2.5,1,0)
camera02.lookAt(0,1,0)



// const geometry = new THREE.SphereGeometry( 1, 32, 16 );
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );

const loader02 = new OBJLoader();
loader02.load('./model/algae.obj', (obj) => {
    obj.children.forEach((child) => {
        let mesh = new THREE.Points(child.geometry, material);
        mesh.position.set(0, 0, 0);
        scene02.add(mesh);
    });
});

let scene03 = new THREE.Scene();
let camera03 = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer03 = new THREE.WebGLRenderer({
    canvas: document.querySelector('#fish-canvas')
});
renderer03.setSize(innerWidth/3, innerHeight/3);
camera03.position.set(2.5,0,0)
camera03.lookAt(0,0.5,0)



// const geometry = new THREE.SphereGeometry( 1, 32, 16 );
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );

const loader03 = new OBJLoader();
loader03.load('./model/fish.obj', (obj) => {
    obj.children.forEach((child) => {
        let mesh = new THREE.Points(child.geometry, material);
        mesh.position.set(0, 0, 0);
        scene03.add(mesh);
    });
});







// let isMouseDown = false;
// let mouseDown = { x: 0, y: 0 };  // 记录鼠标按下时的位置
// let targetRotation = { x: 0, y: 0 };  // 记录目标的旋转
//
// addEventListener('mousedown', (event) => {
//     isMouseDown = true;
//     mouseDown.x = event.clientX;
//     mouseDown.y = event.clientY;
//     targetRotation.x = scene01.rotation.x;
//     targetRotation.y = scene01.rotation.y;
// });
// const canvas01 = document.querySelector('#coral-canvas');
//
// canvas01.addEventListener('mousemove', (event) => {
//     if (isMouseDown) {
//         // 计算鼠标位置的变化
//         let deltaX = (event.clientX - mouseDown.x) / (innerWidth * 6);
//         let deltaY = (event.clientY - mouseDown.y) / (innerHeight * 6);
//         // 把鼠标位置的变化应用到球体的旋转上
//         targetRotation.x += deltaY * 0.5;
//         targetRotation.y += deltaX * 0.5;
//
//         // 限制旋转角度在-π/2至+π/2之间
//         targetRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.x));
//
//         // 使用gsap.to创建一个过渡动画
//         gsap.to(scene01.rotation, {
//             x: targetRotation.x,
//             y: targetRotation.y,
//             duration: 0.5
//         });
//     }
// });

// addEventListener('mouseup', () => {
//     isMouseDown = false;
// });


function animate() {
    requestAnimationFrame(animate);
    renderer01.render(scene01, camera01);
    scene01.rotation.y +=0.001

    renderer02.render(scene02, camera02);
    scene02.rotation.y +=0.001

    renderer03.render(scene03, camera03);
    scene03.rotation.y +=0.001
}
animate();

