import{S as K,g as Q,W as Z,j as S,A as $,f as b,k as H,T,G as ee,m as _,B as j,n as C,P as G,e as L,o as te,p as ne,C as oe,q as re,r as ae,V as A}from"./papaparse.min-af088632.js";const N=`
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,ie=`
uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0,1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    //vec3: change the color of atmosphere

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture,vertexUV).xyz, 1.0);
}
`,le=`
uniform sampler2D globeTexture;
varying vec2 vertexUV;

void main() {
    vec4 textureColor = texture2D(globeTexture, vertexUV);
    gl_FragColor = textureColor;
}
`,p=new K,R=new Q(69,innerWidth/innerHeight,.1,1e3),se=document.getElementById("myCanvas"),x=new Z({antialias:!0,alpha:!0});x.setPixelRatio(window.devicePixelRatio);x.setSize(innerWidth/1.1,innerHeight/1.1);se.appendChild(x.domElement);const ce=`
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`,de=`
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
`;new S({vertexShader:ce,fragmentShader:de,blending:$,depthTest:!1,transparent:!0,vertexColors:!0});const me=new b(new H(1,50,50),new S({vertexShader:N,fragmentShader:ie,uniforms:{globeTexture:{value:new T().load("./img/blueearth.jpg")}}})),P=new b(new H(1,50,50),new S({vertexShader:N,fragmentShader:le,uniforms:{globeTexture:{value:new T().load("./img/outline2.png")}},transparent:!0}));P.scale.set(1.02,1.02,1.02);p.add(P);const n=new ee;n.add(me);n.add(P);p.add(n);R.position.z=2.3;let B=!1,h={x:0,y:0},l={x:0,y:0};addEventListener("mousedown",e=>{B=!0,h.x=e.clientX,h.y=e.clientY,l.x=n.rotation.x,l.y=n.rotation.y});const ue=document.querySelector("canvas");ue.addEventListener("mousemove",e=>{if(B){let t=(e.clientX-h.x)/(innerWidth*6),r=(e.clientY-h.y)/(innerHeight*6);l.x+=r*.5,l.y+=t*.5,l.x=Math.max(-Math.PI/4,Math.min(Math.PI/4,l.x)),_.to(n.rotation,{x:l.x,y:l.y,duration:.5})}});addEventListener("mouseup",()=>{B=!1});function E(e){n.remove(n.getObjectByName("points"));let t=n.getObjectByName("dataCylinder");for(;t;)n.remove(t),t=n.getObjectByName("dataCylinder");te("./dataset/2020_merged_data.csv").then(r=>{const a=r.filter(o=>+o.time==+e);let s=new j,c=new Float32Array(a.length*3),i=new Float32Array(a.length*3);const q=ne().domain([7.95,8.03,8.06,8.12,8.14,8.4]).range(["#ff0000","#F9D6A5","#ffffff","#87CFFB","#4C9EED"]);a.forEach((o,d)=>{o.latitude=+o.latitude,o.longitude=360-+o.longitude,o.pH=+o.pH;let g=(90-Math.abs(o.latitude))*(Math.PI/180),F=o.longitude*(Math.PI/180),m=1,I=m*Math.sin(g)*Math.cos(F),z=o.latitude>=0?m*Math.cos(g):-m*Math.cos(g),V=m*Math.sin(g)*Math.sin(F),f=new oe(q(o.pH));if(o.pH<8){let D=(8-o.pH)*2.4,k=new re(.002,.002,D,32),J=new ae({color:16545280}),u=new b(k,J),w=new A(I,z,V).clone().normalize().multiplyScalar(m+D/2);u.position.set(w.x,w.y,w.z),u.lookAt(new A(0,0,0)),u.rotateX(Math.PI/2),u.name="dataCylinder",n.add(u)}c[3*d]=I,c[3*d+1]=z,c[3*d+2]=V,i[3*d]=f.r,i[3*d+1]=f.g,i[3*d+2]=f.b}),s.setAttribute("position",new C(c,3)),s.setAttribute("color",new C(i,3));const O=new L(s,new G({vertexColors:!0,size:.038}));n.add(O)})}let v=document.getElementById("reason-right-container");const ye=document.getElementById("yearSlider"),U=document.getElementById("yearDisplay");document.getElementById("rs-bullet");U.textContent=ye.value;document.getElementById("yearSlider").addEventListener("input",function(e){const t=e.target.value;E(t),U.textContent=t});E(1);function ge(e,t){let r=0;return function(...a){const s=new Date().getTime();if(!(s-r<t))return r=s,e(...a)}}v.addEventListener("scroll",ge(function(){const e=v.scrollHeight-v.clientHeight,r=v.scrollTop/e,a=parseInt(document.getElementById("yearSlider").min),c=parseInt(document.getElementById("yearSlider").max)-a,i=Math.round(a+c*r);document.getElementById("yearSlider").value=i,E(i),document.getElementById("yearDisplay").textContent=i},800));const Y=5e3,W=new j,M=new Float32Array(Y*3);for(let e=0;e<M.length;e++)M[e]=(Math.random()-.5)*20;W.setAttribute("position",new C(M,3));const ve=new G({color:16777215,size:.005}),y=new L(W,ve);p.add(y);function X(){y.geometry.attributes.position.needsUpdate=!0;for(let e=0;e<Y;e++){let t=e*3;y.geometry.attributes.position.array[t+0]+=(Math.random()-.5)*.001,y.geometry.attributes.position.array[t+1]+=(Math.random()-.5)*.001,y.geometry.attributes.position.array[t+2]+=(Math.random()-.5)*.001}requestAnimationFrame(X),x.render(p,R),n.rotation.y+=4e-4,_.to(n.rotation,{duration:1})}X();
