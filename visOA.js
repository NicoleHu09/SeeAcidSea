import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let scene, camera, renderer;
let curve;

// 创建场景
scene = new THREE.Scene();

// 创建相机
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30,-2,30);

// 创建渲染器
renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#myCanvasOA') });
renderer.setSize(window.innerWidth, window.innerHeight);

// 创建一个Catmull-Rom曲线
curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(30, -2, 30),
    new THREE.Vector3(20, 5, 20),
    new THREE.Vector3(8, 5, 8),
]);

let group = new THREE.Group();  // 创建一个用于旋转的组
scene.add(group);  // 添加到场景中
camera.lookAt(group.position.x,group.position.y+4,group.position.z);
let velocities = [];


let material = new THREE.PointsMaterial({ color: 0xC2ECFF, size: 0.001 , transparent: true, opacity: 0.1  });

const loader = new OBJLoader();
loader.load('./model/test2.obj',
    (obj) => {
        // the request was successfull

        obj.children.forEach((child) => {
            console.log(obj.children);
            let mesh = new THREE.Points(child.geometry, material);
            mesh.position.set(-10,-10,0);
            group.add(mesh);  // 把模型添加到组中，而不是直接添加到场景
        });
    },
);


// 获取滚动容器元素
const scrollContainer = document.getElementById('scrollContainer');
let explodeStarted = false;

// 添加滚动事件监听器
// window.addEventListener('scroll', function() {
//     const scrollPosition = window.pageYOffset;
//     const maxScrollPosition = scrollContainer.offsetHeight - window.innerHeight;
//     const canvas = document.querySelector('#myCanvasOA');
//
//     // 如果滚动位置大于maxScrollPosition，我们不需要改变camera或者title的属性。
//     // 并且我们将隐藏canvas元素。
//     if (scrollPosition > maxScrollPosition*0.8) {
//         canvas.style.display = 'none';  // 隐藏canvas元素
//         return;
//     } else {
//         canvas.style.display = 'block'; // 显示canvas元素
//     }
//
//     // 计算滚动位置在整个滚动范围内的百分比
//     const scrollPercentage = scrollPosition / maxScrollPosition;
//
//     // 计算相机应该在曲线上的位置
//     const point = curve.getPoint(scrollPercentage);
//
//     // 更新相机的位置
//     camera.position.set(point.x, point.y, point.z);
//
//     // 让相机看向场景的中心
//     camera.lookAt(group.position.x,group.position.y+4,group.position.z);
//
//     // // 控制title元素的透明度
//     // let title = document.getElementById('title-ocean');
//     // title.style.opacity = (1 - scrollPercentage).toString();
// });

function animate() {
    requestAnimationFrame(animate);




    // Update position for each point
    group.traverse((object) => {
        if (object instanceof THREE.Points && explodeStarted) {
            let positions = object.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                positions.setXYZ(i, positions.getX(i) + velocities[i].x, positions.getY(i) + velocities[i].y, positions.getZ(i) + velocities[i].z);
            }
            positions.needsUpdate = true; // Needed to inform Three.js to update points
        }
    });

    renderer.render(scene, camera);
}
animate();


