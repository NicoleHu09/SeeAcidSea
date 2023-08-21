// import * as THREE from 'three'
// import * as d3 from 'd3';
// import gsap from 'gsap'
// import * as echarts from 'echarts';
// import Papa from 'papaparse';
// For THREE.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.min.js';

// For d3.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@6/dist/d3.module.min.js';

// For gsap
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js';

// For echarts
import * as echarts from 'https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js';

// For PapaParse
import Papa from 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';

// For OBJLoader (part of three.js)
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

// For Vector3 (part of three.js)
import { Vector3 } from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.min.js';



import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'

import fragmentPngShader from './shader/fragmentpng.glsl'

import atmosphereVertexShader from './shader/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shader/atmosphereFragment.glsl'




const scene = new THREE.Scene()
const camera = new THREE.
PerspectiveCamera(
    69,
    innerWidth/innerHeight,
    0.1,
    1000
)
const container = document.getElementById('myCanvas'); // 确保你的HTML中有一个id为'myCanvas'的元素

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth/1.1, innerHeight/1.1);
container.appendChild(renderer.domElement); // 将渲染器的DOM元素添加到容器中


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
                    value: new THREE.TextureLoader().load('./img/blueearth.jpg')
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

const group = new THREE.Group()
group.add(sphere)
group.add(outline)
scene.add(group)


camera.position.z = 2.3

const mouse ={
    x: undefined,
    y: undefined
}

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

function createTextSprite(text, fontSize, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = fontSize + 'px Arial';
    context.fillStyle = color;
    context.fillText(text, 0, fontSize);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(fontSize * text.length * 0.1, fontSize, 1);

    return sprite;
}







// 使用 D3.js 加载 CSV 文件
function loadMonthData(month) {
    group.remove(group.getObjectByName("points"));
    let oldCylinders = group.getObjectByName("dataCylinder");
    while (oldCylinders) {
        group.remove(oldCylinders);
        oldCylinders = group.getObjectByName("dataCylinder");
    }

    d3.csv(`./dataset/2020_merged_data.csv`).then(allData => {
        const data = allData.filter(d => +d.time === +month);

        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array(data.length * 3); // 3 vertices per point
        let colors = new Float32Array(data.length * 3);

        const colorScale = d3.scaleLinear()
            .domain([7.95, 8.03, 8.06, 8.12, 8.14, 8.4])
            .range(['#ff0000', '#F9D6A5', '#ffffff', '#87CFFB', '#4C9EED']);

        data.forEach((d, i) => {
            d.latitude = +d.latitude;
            d.longitude = 360 - +d.longitude;
            d.pH = +d.pH;

            let latRad = (90 - Math.abs(d.latitude)) * (Math.PI / 180);
            let lngRad = d.longitude * (Math.PI / 180);

            let r = 1;

            let x = r * Math.sin(latRad) * Math.cos(lngRad);
            let y = d.latitude >= 0 ? r * Math.cos(latRad) : -r * Math.cos(latRad);
            let z = r * Math.sin(latRad) * Math.sin(lngRad);

            let color = new THREE.Color(colorScale(d.pH));

            if (d.pH < 8.0) {
                let cylinderHeight = (8.0 - d.pH) * 2.4;
                let cylinderGeometry = new THREE.CylinderGeometry(0.002, 0.002, cylinderHeight, 32);
                let cylinderMaterial = new THREE.MeshBasicMaterial({color: 0xFC7600});
                let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

                let positionVec = new THREE.Vector3(x, y, z);
                let normalizedVec = positionVec.clone().normalize();
                let newPos = normalizedVec.multiplyScalar(r + cylinderHeight / 2);

                cylinder.position.set(newPos.x, newPos.y, newPos.z);
                cylinder.lookAt(new THREE.Vector3(0, 0, 0));
                cylinder.rotateX(Math.PI / 2);
                cylinder.name = "dataCylinder";

                group.add(cylinder);
            }

            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;

            colors[3 * i] = color.r;
            colors[3 * i + 1] = color.g;
            colors[3 * i + 2] = color.b;

        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const points = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({vertexColors: true, size: 0.038})
        );

        group.add(points);
    });
}



// 添加滚动容器
let scrollContainer = document.getElementById("reason-right-container");




const yearSlider = document.getElementById("yearSlider");
const yearDisplay = document.getElementById("yearDisplay");
var rangeBullet = document.getElementById("rs-bullet");

yearDisplay.textContent =yearSlider.value;

document.getElementById("yearSlider").addEventListener("input", function(event){
    const month = event.target.value;
    loadMonthData(month);

    yearDisplay.textContent = month;
});

let isEarthRotating = false;


loadMonthData(1);function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    }
}




scrollContainer.addEventListener("scroll", throttle(function() {
    // 获取容器的总高度和当前滚动位置
    const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const currentScroll = scrollContainer.scrollTop;

    // 计算滚动比例
    const scrollRatio = currentScroll / totalHeight;

    // 映射滚动比例到年份范围
    const minYear = parseInt(document.getElementById("yearSlider").min);
    const maxYear = parseInt(document.getElementById("yearSlider").max);

    const yearSpan = maxYear - minYear;
    const mappedYear = Math.round(minYear + (yearSpan * scrollRatio));

    // 更新滑块和年份显示
    document.getElementById("yearSlider").value = mappedYear;
    loadMonthData(mappedYear);
    document.getElementById("yearDisplay").textContent = mappedYear;
}, 800));  // 100毫秒内最多执行一次






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
}

animate()



