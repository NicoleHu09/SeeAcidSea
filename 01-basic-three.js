import * as THREE from 'three'
import * as d3 from 'd3';
import gsap from 'gsap'
import * as echarts from 'echarts';
import Papa from 'papaparse';
// For THREE.js
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.min.js';
//
// // For d3.js
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@6/dist/d3.module.min.js';
//
// // For gsap
// import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js';
//
// // For echarts
// import * as echarts from 'https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js';
//
// // For PapaParse
// import Papa from 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
//
// // For OBJLoader (part of three.js)
// import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
//
// // For Vector3 (part of three.js)
// import { Vector3 } from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.min.js';



import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'

import fragmentPngShader from './shader/fragmentpng.glsl'

import atmosphereVertexShader from './shader/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shader/atmosphereFragment.glsl'




const scene = new THREE.Scene()
const camera = new THREE.
PerspectiveCamera(
    72,
    innerWidth/innerHeight,
    0.1,
    1000
)


const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: document.querySelector('#earth-container')
})
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
//document.body.appendChild(renderer.domElement)

const vertexPointsShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentPointsShader = `
  varying vec3 vColor;
  void main() {
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
      discard;
    }
    gl_FragColor = vec4(vColor, 1.0 - r);
    alpha = 1.0 - r;
    if ( alpha < 0.9 ) discard;
  }
`;
const pointsMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexPointsShader,
    fragmentShader: fragmentPointsShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
});


//create a sphere

const sphere =
    new THREE.Mesh(new THREE.SphereGeometry(1,50,50),
        new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms:{
                globeTexture:{
                    value: new THREE.TextureLoader().load('./img/blueearth3.jpg')
                }
            }
        })
    )

//create outline layer
const outline =
    new THREE.Mesh(new THREE.SphereGeometry(1,50,50),
        new THREE.ShaderMaterial({
            vertexShader:vertexShader,
            fragmentShader:fragmentPngShader,
            uniforms:{
                globeTexture:{
                    value: new THREE.TextureLoader().load('./img/outline2.png')
                }
            },
            transparent: true
        })
    )
outline.scale.set(1.02, 1.02,1.02)
scene.add(outline)



const atmosphere =
    new THREE.Mesh(new THREE.SphereGeometry(1,50,50),
        new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        })
    )
atmosphere.scale.set(1.3, 1.3,1.3)

scene.add(atmosphere)

const group = new THREE.Group()
group.add(sphere)
group.add(outline)
scene.add(group)



camera.position.z = 2.3

const mouse ={
    x: undefined,
    y: undefined
}


/////////////////////////////////////////////////








//mouse
let isMouseDown = false;
let mouseDown = { x: 0, y: 0 };  // 记录鼠标按下时的位置
let targetRotation = { x: 0, y: 0 };  // 记录目标的旋转

addEventListener('mousedown', (event) => {
    isMouseDown = true;
    mouseDown.x = event.clientX;
    mouseDown.y = event.clientY;
    targetRotation.x = group.rotation.x;
    targetRotation.y = group.rotation.y;
});
const canvas = document.querySelector('canvas');

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        // 计算鼠标位置的变化
        let deltaX = (event.clientX - mouseDown.x) / (innerWidth * 6);
        let deltaY = (event.clientY - mouseDown.y) / (innerHeight * 6);
        // 把鼠标位置的变化应用到球体的旋转上
        targetRotation.x += deltaY * 0.5;
        targetRotation.y += deltaX * 0.5;

        // 限制旋转角度在-π/2至+π/2之间
        targetRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.x));

        // 使用gsap.to创建一个过渡动画
        gsap.to(group.rotation, {
            x: targetRotation.x,
            y: targetRotation.y,
            duration: 0.5
        });
    }
});

addEventListener('mouseup', () => {
    isMouseDown = false;
});
// let data;
//
// fetch('data.json')
//     .then(response => response.json())
//     .then(json => data = json);



//button reset
const resetButton = document.querySelector('#reset-button');

// Add an event listener to the button
resetButton.addEventListener('click', () => {
    // Use gsap to smoothly reset the rotation
    gsap.to(group.rotation, {
        x: 0,
        y: 0,
        duration: 1 // Duration of the animation, you can adjust this
    });
});






// 使用 D3.js 加载 CSV 文件

let cylinder
function loadYearData(year) {
    group.remove(group.getObjectByName("points"));
    let oldCylinders = group.getObjectByName("dataCylinder");
    while(oldCylinders) {
        group.remove(oldCylinders);
        oldCylinders = group.getObjectByName("dataCylinder");
    }

    d3.csv(`./dataset/average/${year}_averaged_data.csv`).then(data => {

        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array(data.length * 3); // 3 vertices per point
        let colors = new Float32Array(data.length * 3);

        const colorScale = d3.scaleLinear()
            .domain([7.95, 8.03, 8.06, 8.12, 8.14, 8.4])
            .range(['#ff0000', '#F9D6A5', '#ffffff', '#87CFFB', '#4C9EED']);  // 设置输出域为你的五个颜色



        data.forEach((d, i) => {
            // 将字符串转换为数字
            d.latitude = +d.latitude;
            d.longitude =360- +d.longitude;
            d.pH = +d.pH

            // 经纬度转换为弧度
            let latRad = (90 - Math.abs(d.latitude)) * (Math.PI / 180);  //纬度转为弧度
            let lngRad = d.longitude * (Math.PI / 180);  //经度转为弧度

            // 半径
            let r = 1;

            // 计算x, y, z
            let x = r * Math.sin(latRad) * Math.cos(lngRad);
            let y = d.latitude >= 0 ? r * Math.cos(latRad) : -r * Math.cos(latRad);
            let z = r * Math.sin(latRad) * Math.sin(lngRad);

            let color = new THREE.Color(colorScale(d.pH));


            if (d.pH < 8.0) {
                let cylinderHeight = (8.0-d.pH)*2.4;  // 你可以根据需要调整柱体的尺寸
                let cylinderGeometry = new THREE.CylinderGeometry(0.002, 0.002, cylinderHeight, 32);
                let cylinderMaterial = new THREE.MeshBasicMaterial({color: 0xFC7600});  // 你可以根据需要选择柱体的颜色
                cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

                // 计算新的位置，使柱体的底部紧贴地球表面
                let positionVec = new THREE.Vector3(x, y, z);
                let normalizedVec = positionVec.clone().normalize();
                let newPos = normalizedVec.multiplyScalar(r + cylinderHeight / 2);

                cylinder.position.set(newPos.x, newPos.y, newPos.z);
                cylinder.lookAt(new THREE.Vector3(0, 0, 0));  // 让柱体朝向地球中心

                // 旋转柱体90度，让它从地球表面射出
                cylinder.rotateX(Math.PI / 2);
                cylinder.name = "dataCylinder";

                group.add(cylinder);
            }

            // 将计算的位置添加到positions数组
            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;

            colors[3 * i] = color.r;
            colors[3 * i + 1] = color.g;
            colors[3 * i + 2] = color.b;

        });

        // 设置geometry的位置数据
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));  // Add color attribute


        // 创建点精灵
        const points = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({vertexColors: true, size: 0.038})
        );

        // 添加点精灵到场景
        group.add(points);

    });
}
//////////////////////////////set ocean cylinder/////////////////////////////////////////////
    let oceanCylinderHeight = 0.01;  // 你可以根据需要调整柱体的尺寸
    let oceanCylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, oceanCylinderHeight, 32);
    let oceanCylinderMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0,        // 设置为0.5让其半透明，您可以根据需要调整这个值
        transparent: true   // 设定材质为透明的
    });
    let oceanCylinderEqa = new THREE.Mesh(oceanCylinderGeometry, oceanCylinderMaterial);
    let oceanCylinderIn = new THREE.Mesh(oceanCylinderGeometry, oceanCylinderMaterial);
    let oceanCylinderIndia = new THREE.Mesh(oceanCylinderGeometry, oceanCylinderMaterial);


    // 计算新的位置，使柱体的底部紧贴地球表面
    let positionVecPacEqa = new THREE.Vector3(
        -3, -1, 8);

    let normalizedVecEqa = positionVecPacEqa.clone().normalize();
    let newPosEqa = normalizedVecEqa.multiplyScalar(1+ oceanCylinderHeight / 2);
    oceanCylinderEqa.position.set(newPosEqa.x, newPosEqa.y, newPosEqa.z);
    oceanCylinderEqa.lookAt(new THREE.Vector3(0, 0, 0));  // 让柱体朝向地球中心

    let positionVecPacIn = new THREE.Vector3(
        6, 8, -4.5);
    let normalizedVecIn = positionVecPacIn.clone().normalize();
    let newPosIn = normalizedVecIn.multiplyScalar(1 + oceanCylinderHeight / 2);
    oceanCylinderIn.position.set(newPosIn.x, newPosIn.y, newPosIn.z);
    oceanCylinderIn.lookAt(new THREE.Vector3(0, 0, 0));  // 让柱体朝向地球中心

    let positionVecPacIndia = new THREE.Vector3(
        4, 2, -7);
    let normalizedVecIndia = positionVecPacIndia.clone().normalize();
    let newPosIndia = normalizedVecIndia.multiplyScalar(1 + oceanCylinderHeight / 2);
    oceanCylinderIndia.position.set(newPosIndia.x, newPosIndia.y, newPosIndia.z);
    oceanCylinderIndia.lookAt(new THREE.Vector3(0, 0, 0));  // 让柱体朝向地球中心



    // 旋转柱体90度，让它从地球表面射出
    oceanCylinderEqa.rotateX(Math.PI / 2);
    oceanCylinderIn.rotateX(Math.PI / 2);
    oceanCylinderIndia.rotateX(Math.PI / 2);


    group.add(oceanCylinderEqa);
    group.add(oceanCylinderIn);
    group.add(oceanCylinderIndia);

//////////////////////////////////////实现点击跳转+悬浮文字//////////////////////////////////////////////////

const equatorialArea = document.getElementById('rightdownEqa');
const innerArea = document.getElementById('rightdownIn');
const indiaArea = document.getElementById('rightdownIndia');

// 默认隐藏这三个HTML元素
equatorialArea.classList.remove('show');
innerArea.classList.remove('show');
indiaArea.classList.remove('show');

// 获取 htmlElementEqa, htmlElementIn 和 htmlElementIndia 元素
const htmlElementEqa = document.getElementById('oceanCylinderEqaHTMLEqa');
const htmlElementIn = document.getElementById('oceanCylinderEqaHTMLIn');
const htmlElementIndia = document.getElementById('oceanCylinderEqaHTMLIndia');

// 当点击 htmlElementEqa 元素时，显示 equatorialArea 并隐藏 innerArea 和 indiaArea
htmlElementEqa.addEventListener('click', function() {
    if(equatorialArea.classList.contains('show')) {
        equatorialArea.classList.remove('show');
    } else {
        equatorialArea.classList.add('show');
        innerArea.classList.remove('show'); // 确保隐藏 innerArea
        indiaArea.classList.remove('show'); // 确保隐藏 indiaArea
    }
}, false);

// 当点击 htmlElementIn 元素时，显示 innerArea 并隐藏 equatorialArea 和 indiaArea
htmlElementIn.addEventListener('click', function() {
    if(innerArea.classList.contains('show')) {
        innerArea.classList.remove('show');
    } else {
        innerArea.classList.add('show');
        equatorialArea.classList.remove('show'); // 确保隐藏 equatorialArea
        indiaArea.classList.remove('show'); // 确保隐藏 indiaArea
    }
}, false);

// 当点击 htmlElementIndia 元素时，显示 indiaArea 并隐藏 equatorialArea 和 innerArea
htmlElementIndia.addEventListener('click', function() {
    if(indiaArea.classList.contains('show')) {
        indiaArea.classList.remove('show');
    } else {
        indiaArea.classList.add('show');
        equatorialArea.classList.remove('show'); // 确保隐藏 equatorialArea
        innerArea.classList.remove('show'); // 确保隐藏 innerArea
    }
}, false);



function updateHTMLElementPosition() {
    // 获取3D对象的世界坐标
    const vector1 = new THREE.Vector3();
    oceanCylinderEqa.getWorldPosition(vector1);
    const vector2 = new THREE.Vector3();
    oceanCylinderIn.getWorldPosition(vector2);
    const vector3 = new THREE.Vector3();   // 为India添加的向量
    oceanCylinderIndia.getWorldPosition(vector3);  // 获取India的位置

    // 计算摄像机到3D物体的向量
    const cameraToObjectEqa = vector1.clone().sub(camera.position);
    const cameraToObjectIn = vector2.clone().sub(camera.position);
    const cameraToObjectIndia = vector3.clone().sub(camera.position); // 为India添加的向量

    // 计算柱体的法向量
    const objectNormalEqa = vector1.clone().normalize();
    const objectNormalIn = vector2.clone().normalize();
    const objectNormalIndia = vector3.clone().normalize(); // 为India添加的法向量

    // 判断柱体是否面向摄像机
    if (cameraToObjectEqa.dot(objectNormalEqa) < 0) {
        htmlElementEqa.style.display = 'block';
    } else {
        htmlElementEqa.style.display = 'none';
    }

    if (cameraToObjectIn.dot(objectNormalIn) < 0) {
        htmlElementIn.style.display = 'block';
    } else {
        htmlElementIn.style.display = 'none';
    }

    if (cameraToObjectIndia.dot(objectNormalIndia) < 0) {  // 为India添加的判断逻辑
        htmlElementIndia.style.display = 'block';
    } else {
        htmlElementIndia.style.display = 'none';
    }

    // 将3D坐标转换为屏幕坐标
    vector1.project(camera);
    const x1 = (vector1.x * 0.5 + 0.5) * window.innerWidth;
    const y1 = (-(vector1.y * 0.5) + 0.5) * window.innerHeight;

    vector2.project(camera);
    const x2 = (vector2.x * 0.5 + 0.5) * window.innerWidth;
    const y2 = (-(vector2.y * 0.5) + 0.5) * window.innerHeight;

    vector3.project(camera);  // 为India转换屏幕坐标
    const x3 = (vector3.x * 0.5 + 0.5) * window.innerWidth;
    const y3 = (-(vector3.y * 0.5) + 0.5) * window.innerHeight;

    // 更新HTML元素的位置
    htmlElementEqa.style.left = x1 + 'px';
    htmlElementEqa.style.top = y1 + 'px';
    htmlElementIn.style.left = x2 + 'px';
    htmlElementIn.style.top = y2 + 'px';
    htmlElementIndia.style.left = x3 + 'px';  // 为India更新位置
    htmlElementIndia.style.top = y3 + 'px';
}




// 在渲染循环或者其他需要的地方调用此函数


// let tooltip = document.getElementById('tooltip');
//
// window.addEventListener('mousemove', function(event) {
//     event.preventDefault();
//
//     // 将鼠标点击位置的像素坐标转换为归一化的设备坐标，范围从-1到1
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//
//     // 更新射线投射器的射线方向
//     raycaster.setFromCamera(mouse, camera);
//
//     // 检测ray与oceanCylinder的交叉
//     let intersects = raycaster.intersectObject(oceanCylinder);
//
//     if(intersects.length > 0) {
//         // 如果悬停在oceanCylinder上，显示tooltip并设置内容
//         tooltip.style.display = 'block';
//         tooltip.style.left = event.clientX + 'px';
//         tooltip.style.top = event.clientY + 'px';
//         tooltip.textContent = '这是一行文字';  // 这里可以设置你想显示的文字
//     } else {
//         // 如果不在oceanCylinder上，隐藏tooltip
//         tooltip.style.display = 'none';
//     }
// }, false);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const yearSlider = document.getElementById("yearSlider");
const yearDisplay = document.getElementById("yearDisplay");
var rangeBullet = document.getElementById("rs-bullet");
const co2Emissions = [3205.9873,3307.9721,3346.0888,3411.9894,3407.0177,3414.5652,3468.7837,3556.0556,3547.7245,3356.6428]
const co2Display = document.getElementById("co2Display");
const percentages=[1.780, 1.708, 1.874, 1.497, 0.845, 1.479, 2.067,2.144,2.121, 2.582]
const pctDisplay = document.getElementById("pctDisplay");
const oceanDisplay = document.getElementById("co2Ocean");
const treeDisplay = document.getElementById("co2Tree");





yearDisplay.textContent =yearSlider.value;

document.getElementById("yearSlider").addEventListener("input", function(event){
    const year = event.target.value;
    loadYearData(year);

    let year_index = year-2011;
    let co2Value = co2Emissions[year_index];
    let pctValue = percentages[year_index];

    co2Display.textContent = co2Value.toString();
    pctDisplay.textContent = `${pctValue}%`;
    let oceanValue = (0.30 * co2Value).toFixed(2);
    oceanDisplay.textContent = oceanValue;

    let treeValue = (0.30 * co2Value / 22).toFixed(2);
    treeDisplay.textContent = treeValue;

    console.log(co2Emissions[year_index]);

    yearDisplay.textContent = year;
});

let isEarthRotating = false;


loadYearData(2011); // 首先加载2011年的数据

const particles = 5000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particles * 3);

for (let i = 0; i < positions.length; i++) {
    positions[i] = (Math.random() - 0.5) * 20; // -5.0 - +5.0
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.005
});
const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

function animate() {
    particleSystem.geometry.attributes.position.needsUpdate = true;

    for (let i = 0; i < particles; i++) {
        let i3 = i * 3;

        particleSystem.geometry.attributes.position.array[i3 + 0] += (Math.random() - 0.5) * 0.001;  // Smaller number = slower speed
        particleSystem.geometry.attributes.position.array[i3 + 1] += (Math.random() - 0.5) * 0.001;  // Smaller number = slower speed
        particleSystem.geometry.attributes.position.array[i3 + 2] += (Math.random() - 0.5) * 0.001;  // Smaller number = slower speed

    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    group.rotation.y += 0.0004;
    gsap.to(group.rotation, {
        duration: 1
    });
    updateHTMLElementPosition();
}

animate()

const closeleft = document.getElementById('close-left')
const closeright = document.getElementById('close-right')
const openleft = document.getElementById('open-left')
const openright = document.getElementById('open-right')
const leftcontainer = document.getElementById('left-container')
const rightcontainer = document.getElementById('right-container')

openleft.style.display='none'
openright.style.display='none'

// 使用 addEventListener 来监听 closeleft 的点击事件
closeleft.addEventListener('click', function() {
    // 为 leftcontainer 添加 slideOutLeft 动画
    leftcontainer.classList.add('animate__animated', 'animate__slideOutLeft');

    // 当 leftcontainer 的动画结束后
    leftcontainer.addEventListener('animationend', function() {
        // 移除 leftcontainer 的动画类，以避免动画被重复触发
        leftcontainer.classList.remove('animate__animated', 'animate__slideOutLeft');

        // 隐藏 leftcontainer
        leftcontainer.style.display = 'none';

        // 显示 openleft
        openleft.style.display = 'block';

        // 为 openleft 添加 slideInRight 动画
        openleft.classList.add('animate__animated', 'animate__slideInLeft');

        // 动画完成后移除 openleft 的动画类
        openleft.addEventListener('animationend', function() {
            openleft.classList.remove('animate__animated', 'animate__slideInLeft');
        }, { once: true });  // once: true 表示该监听器只执行一次
    }, { once: true });
});

// 类似地，当点击 openleft 时，可以将 leftcontainer 显示并隐藏 openleft
openleft.addEventListener('click', function() {
    // 隐藏 openleft
    openleft.style.display = 'none';

    // 显示 leftcontainer 并添加从左边滑入的动画
    leftcontainer.style.display = 'block';
    leftcontainer.classList.add('animate__animated', 'animate__slideInLeft');

    leftcontainer.addEventListener('animationend', function() {
        leftcontainer.classList.remove('animate__animated', 'animate__slideInLeft');
    }, { once: true });
});



closeright.addEventListener('click', function() {
    rightcontainer.classList.add('animate__animated', 'animate__slideOutRight');

    rightcontainer.addEventListener('animationend', function() {

        rightcontainer.classList.remove('animate__animated', 'animate__slideOutRight');


        rightcontainer.style.display = 'none';


        openright.style.display = 'block';


        openright.classList.add('animate__animated', 'animate__slideInRight');

        openright.addEventListener('animationend', function() {
            openright.classList.remove('animate__animated', 'animate__slideInRight');
        }, { once: true });  // once: true 表示该监听器只执行一次
    }, { once: true });
});

openright.addEventListener('click', function() {
    openright.style.display = 'none';

    rightcontainer.style.display = 'block';
    rightcontainer.classList.add('animate__animated', 'animate__slideInRight');

    rightcontainer.addEventListener('animationend', function() {
        rightcontainer.classList.remove('animate__animated', 'animate__slideInRight');
    }, { once: true });
});





