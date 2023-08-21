import * as THREE from 'three'
// import * as d3 from 'd3';
// import gsap from 'gsap'
// import * as echarts from 'echarts';
// import Papa from 'papaparse';
// // For THREE.js
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




const vertexShader = `
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0,1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    //vec3: change the color of atmosphere

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture,vertexUV).xyz, 1.0);
}
`;

const fragmentPngShader = `
uniform sampler2D globeTexture;
varying vec2 vertexUV;

void main() {
    vec4 textureColor = texture2D(globeTexture, vertexUV);
    gl_FragColor = textureColor;
}
`;

const atmosphereVertexShader = `
varying vec3 vertexNormal;

void main(){
    vertexNormal = normalize(normalMatrix * normal) ;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const atmosphereFragmentShader = `
varying vec3 vertexNormal;
void main(){
    float intensity = pow(0.5 - dot(vertexNormal, vec3(0, 0, 1.0)),2.5);

    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0)*intensity;
}
`;




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
renderer.setSize(innerWidth/2, innerHeight/2);
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

            // 如果 pH 值小于 7.8，创建并添加一个柱体
            if (d.pH < 8.0) {
                let cylinderHeight = (8.0-d.pH)*2.4;  // 你可以根据需要调整柱体的尺寸
                let cylinderGeometry = new THREE.CylinderGeometry(0.002, 0.002, cylinderHeight, 32);
                let cylinderMaterial = new THREE.MeshBasicMaterial({color: 0xFC7600});  // 你可以根据需要选择柱体的颜色
                let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

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

        // 地球半径
        const earthRadius = 1;
// 创建纬度线
        for (let i = -9; i <= 9; i++) {
            const latitude = (Math.PI / 18) * i; // 纬度，从-90°到+90°
            const latitudeRadius = earthRadius * Math.cos(latitude); // 纬度半径

            const torusGeometry = new THREE.TorusGeometry(latitudeRadius + 0.05, 0.003, 16, 100);
            const torus = new THREE.Mesh(torusGeometry, material);
            torus.rotation.x = Math.PI / 2; // 将圆环旋转到正确的方向
            torus.position.y = earthRadius * Math.sin(latitude); // 设置y位置以匹配纬度
            group.add(torus);

            const text = i * 10; // 或你想要的任何文本
            const fontSize = 40; // 字体大小
            const color = "rgba(200, 200, 200, 0.3)";
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = fontSize + 'px Arial';
            context.fillStyle = color;
            context.fillText(text, 0, fontSize);

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.5, 0.25, 1);
            const offsetAngle = Math.PI / 5.5; // 角度偏移，可以根据需要调整
            const offsetDistance = 0.2; // 距离偏移，可以根据需要调整

// 计算文字的x和z位置
            const textX = (latitudeRadius + offsetDistance) * Math.cos(offsetAngle)+0.1;
            const textZ = (latitudeRadius + offsetDistance) * Math.sin(offsetAngle);

// 设置文字的位置
            sprite.position.set(textX, torus.position.y, textZ);
            scene.add(sprite);
        }


    });
}
const yearSlider = document.getElementById("yearSlider");
const yearDisplay = document.getElementById("yearDisplay");
var rangeBullet = document.getElementById("rs-bullet");

yearDisplay.textContent =yearSlider.value;

document.getElementById("yearSlider").addEventListener("input", function(event){
    const year = event.target.value;
    loadYearData(year);

    yearDisplay.textContent = year;
});

let isEarthRotating = false;


loadYearData(2011); // 首先加载2011年的数据

// var myChartLat = echarts.init(document.getElementById('myChartLat'));
// myChartLat.resize({
//     height: 340,
//     width: 1000
// });
//
// const years = Array.from({length: 10}, (_, i) => 2011 + i);
// const averagesByYear = {};
//
// // 读取CSV文件
// Papa.parse('./dataset/all_years_latitude_data.csv', {
//     download: true,
//     header: true,
//     complete: function(results) {
//         var data = results.data;
//         var filteredData = data.filter((d) => {
//             let year = parseInt(d.year);
//             let time = parseInt(d.time);
//             let lat = parseInt(d.latitude_bin);
//             let pH = parseFloat(d.pH);
//
//             return !(isNaN(year) || isNaN(time) || isNaN(lat) || isNaN(pH));
//         });
//
// // 使用 filteredData 替代原来的 data 进行映射
//         var latitudeData = filteredData.map((d) => [
//             //(parseInt(d.year) - 2011) * 12 + parseInt(d.time), // 计算月份的总数
//             (parseInt(d.year) - 2011),
//             (parseInt(d.latitude_bin) + 70) / 10, // 将latitude_bin转换为整数
//             parseFloat(d.pH) // pH值转换为浮点数
//         ]);
//
//         const latitude = [
//             -70,-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60,70,80
//         ];
//
//
//         var option_lat = {
//             tooltip: {},
//             visualMap: {
//                 min: 8.0,
//                 max: 8.12,
//                 calculable: true,
//                 precision: 2,
//                 orient: 'vertical',
//                 left: 'right',
//                 top: 'center',
//                 color: ['#4C9EED','#87CFFB','#F9D6A5', '#C09A6C', '#F2A45F']
//
//             },
//             xAxis: {
//                 type: 'category',
//                 //data: Array.from({length: 120}, (_, i) => 2011 + Math.floor(i / 12) + '-' + (i % 12 + 1))
//                 data: Array.from({length: 10}, (_, i) => 2011 + i)
//             },
//             yAxis: {
//                 type: 'category',
//                 data: latitude,
//             },
//             series: [{
//                 name: 'pH',
//                 type: 'heatmap',
//                 data: latitudeData,
//
//                 emphasis: {
//                     itemStyle: {
//                         shadowBlur: 10,
//                         shadowColor: 'rgba(0, 0, 0, 0.5)'
//                     }
//                 }
//             }],
//         };
//         // 绘制图表
//         myChartLat.setOption(option_lat);
//     }
// });
//
// var myChartEveryLat = echarts.init(document.getElementById('myChartEveryLat'));
//
// Papa.parse('./dataset/all_years_latitude_data.csv', {
//     download: true,
//     header: true,
//     complete: function(results) {
//         var data = results.data;
//         var filteredData = data.filter((d) => {
//             let year = parseInt(d.year);
//             let time = parseInt(d.time);
//             let lat = parseInt(d.latitude_bin);
//             let pH = parseFloat(d.pH);
//
//             return !(isNaN(year) || isNaN(time) || isNaN(lat) || isNaN(pH));
//         });
//
//         var years = Array.from(new Set(filteredData.map(d => parseInt(d.year)))).filter(Boolean);
//
//         var seriesData = years.map(year => {
//             var yearData = filteredData.filter(d => parseInt(d.year) === year);
//
//             var latitudeSum = {};
//             var latitudeCount = {};
//
//             yearData.forEach(d => {
//                 let lat = parseInt(d.latitude_bin); // 直接获取纬度
//                 let pH = parseFloat(d.pH);
//
//                 latitudeSum[lat] = (latitudeSum[lat] || 0) + pH;
//                 latitudeCount[lat] = (latitudeCount[lat] || 0) + 1;
//             });
//
//             var latitudeAvg = [];
//             for (let lat in latitudeSum) {
//                 latitudeAvg.push([parseInt(lat), latitudeSum[lat] / latitudeCount[lat]]);
//             }
//
//             latitudeAvg.sort((a, b) => a[0] - b[0]); // 按纬度排序
//
//             return {
//                 name: year.toString(),
//                 type: 'line',
//                 data: latitudeAvg
//             };
//         });
//
//
//         var option_every_lat = {
//             tooltip: {
//                 trigger: 'axis'
//             },
//             xAxis: {
//                 type: 'value',
//                 name: 'Latitude'
//             },
//             yAxis: {
//                 min:8.01,
//                 max: 8.16,
//                 type: 'value',
//                 name: 'pH'
//             },
//             series: seriesData
//         };
//         myChartEveryLat.setOption(option_every_lat);
//     }
// });








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



