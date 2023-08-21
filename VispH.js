import * as THREE from 'three';
import {Vector3} from "three";



let slider = document.getElementById("pHSlider");
let label = document.querySelector(".slider-label");

slider.addEventListener("input", function() {
    // 更新标签的值
    label.innerHTML = slider.value;

    // 计算滑块的位置并相应地设置标签的位置
    let newPosition = ((slider.value - slider.min) / (slider.max - slider.min)) * slider.offsetWidth;
    label.style.left = newPosition + 'px';
});


function mapSliderToDensityFactor(sliderValue) {
    let normalizedValue = 1 - (sliderValue - 7.9) / (8.2 - 7.9);

    let densityF = normalizedValue * (2 - 1) + 1;

    return densityF;
}



function mapSliderToOpacity(sliderValue) {
    // 反转滑块值从[7.9, 8.3]的映射范围到[0, 1]
    let normalizedValue = 1 - (sliderValue - 7.9) / (8.2 - 7.9);

    // 透明度范围从[0.4, 0.9]
    return normalizedValue * (0.9 - 0.4) + 0.4;
}



function updateVerticesBasedOnSlider() {
    let densityFactor = mapSliderToDensityFactor(parseFloat(slider.value));
    let opacity = mapSliderToOpacity(parseFloat(slider.value));
    material2.opacity = opacity;
    material2.needsUpdate = true;

    let positions2 = geometry2.attributes.position.array;
    // 使用一个临时数组存储新的点
    let newPositions = [];

    for (let i = 0; i < seaResolution; i++) {
        for (let j = 0; j < seaResolution; j++) {
            let x = i * spacing;
            let y = (Math.random() - 0.5) * heightScale;
            let z = j * spacing;

            newPositions.push(x, y, z);

            // 根据密度因子添加额外的点
            if (Math.random() < (densityFactor - 1)) {
                let offsetY = (Math.random() - 0.5) * heightScale * 0.1;  // slight variation in Y
                newPositions.push(x, y + offsetY, z);
            }
        }
    }

    // 将新的位置应用到geometry2上
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry2.attributes.position.needsUpdate = true;
}

slider.addEventListener("input", updateVerticesBasedOnSlider);



// 初始化时设置标签的位置
label.style.left = ((slider.value - slider.min) / (slider.max - slider.min)) * slider.offsetWidth + 'px';


let rendererpH = new THREE.WebGLRenderer({
    canvas: document.querySelector('#mySecCanvas')
});
rendererpH.setSize(window.innerWidth, window.innerHeight/2);

let scenepH = new THREE.Scene();
let camerapH = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camerapH.position.set(12, 1, 10);
camerapH.lookAt(new Vector3((0,0,0)))

let seaResolution = 200;
let spacing = 0.25;
let noiseScale = 0.2;
let heightScale = 2;
let geometry = new THREE.BufferGeometry();
let vertices = [];

for (let i = 0; i < seaResolution; i++) {
    for (let j = 0; j < seaResolution; j++) {
        let x = i * spacing;
        let y = (Math.random() - 0.5) * heightScale; // 初始随机高度
        let z = j * spacing;
        vertices.push(x, y, z);
    }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.03 });
let pointspH = new THREE.Points(geometry, material);
scenepH.add(pointspH);


let maxVertices2 = [];
for (let i = 0; i < seaResolution; i++) {
    for (let j = 0; j < seaResolution; j++) {
        let x = i * spacing;
        let y = (Math.random() - 0.5) * heightScale;
        let z = j * spacing;
        maxVertices2.push(x, y, z);
    }
}

// 1. 创建一个圆形纹理
function createCircleTexture(radius, blur) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const d = 2 * radius + 2 * blur;
    canvas.width = d;
    canvas.height = d;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(radius + blur, radius + blur, radius, 0, 2 * Math.PI);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

let circleTexture = createCircleTexture(32, 8);

// 2. 创建geometry2和对应的材质
let geometry2 = new THREE.BufferGeometry();
geometry2.setAttribute('position', new THREE.Float32BufferAttribute(maxVertices2.slice(), 3)); // 从maxVertices2拷贝值
let material2 = new THREE.PointsMaterial({
    color: 0xCE141A,
    size: 0.04,
    map: circleTexture,  // 应用圆形纹理
    transparent: true,   // 这样我们可以更改透明度
    opacity: 0.5,        // 初始化透明度为0.5
    depthWrite: false
});

let points2 = new THREE.Points(geometry2, material2);
scenepH.add(points2);






let time = 0;
let time2 = 0;

function animate() {
    requestAnimationFrame(animate);

    let positions = geometry.attributes.position.array;
    for (let i = 0; i < seaResolution; i++) {
        for (let j = 0; j < seaResolution; j++) {
            let idx = 3 * (i * seaResolution + j);
            let zPos = Math.sin(i * noiseScale + time) * Math.cos(j * noiseScale + time) * heightScale*0.3;
            positions[idx + 1] = zPos;
        }
    }
    geometry.attributes.position.needsUpdate = true;

    let positions2 = geometry2.attributes.position.array;
    for (let i = 0; i < seaResolution; i++) {
        for (let j = 0; j < seaResolution; j++) {
            let idx = 3 * (i * seaResolution + j);
            let zPos = Math.sin(i * noiseScale + time2) * Math.cos(j * noiseScale + time2) * heightScale * 0.4;
            positions2[idx + 1] = zPos;
        }
    }
    geometry2.attributes.position.needsUpdate = true;

    rendererpH.render(scenepH, camerapH);
    time += 0.01;
    time2 += 0.005;
}



animate();
