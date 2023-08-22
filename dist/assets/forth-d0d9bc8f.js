import{S as Q,g as ee,W as te,j as V,A as oe,f as C,k as H,T as _,G as ae,m as R,B as U,n as B,P as j,e as N,o as ne,p as re,C as ie,q as se,r as le,V as G,s as ce,t as de,u as me,v as ue}from"./papaparse.min-af088632.js";const L=`
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,ve=`
uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0,1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    //vec3: change the color of atmosphere

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture,vertexUV).xyz, 1.0);
}
`,ye=`
uniform sampler2D globeTexture;
varying vec2 vertexUV;

void main() {
    vec4 textureColor = texture2D(globeTexture, vertexUV);
    gl_FragColor = textureColor;
}
`,g=new Q,W=new ee(69,innerWidth/innerHeight,.1,1e3),ge=document.getElementById("myCanvas"),b=new te({antialias:!0,alpha:!0});b.setPixelRatio(window.devicePixelRatio);b.setSize(innerWidth/2,innerHeight/2);ge.appendChild(b.domElement);const pe=`
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`,he=`
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
`;new V({vertexShader:pe,fragmentShader:he,blending:oe,depthTest:!1,transparent:!0,vertexColors:!0});const xe=new C(new H(1,50,50),new V({vertexShader:L,fragmentShader:ve,uniforms:{globeTexture:{value:new _().load("./img/blueearth.jpg")}}})),I=new C(new H(1,50,50),new V({vertexShader:L,fragmentShader:ye,uniforms:{globeTexture:{value:new _().load("./img/outline2.png")}},transparent:!0}));I.scale.set(1.02,1.02,1.02);g.add(I);const o=new ae;o.add(xe);o.add(I);g.add(o);W.position.z=2.3;let D=!1,S={x:0,y:0},l={x:0,y:0};addEventListener("mousedown",e=>{D=!0,S.x=e.clientX,S.y=e.clientY,l.x=o.rotation.x,l.y=o.rotation.y});const fe=document.querySelector("canvas");fe.addEventListener("mousemove",e=>{if(D){let a=(e.clientX-S.x)/(innerWidth*6),m=(e.clientY-S.y)/(innerHeight*6);l.x+=m*.5,l.y+=a*.5,l.x=Math.max(-Math.PI/4,Math.min(Math.PI/4,l.x)),R.to(o.rotation,{x:l.x,y:l.y,duration:.5})}});addEventListener("mouseup",()=>{D=!1});function X(e){o.remove(o.getObjectByName("points"));let a=o.getObjectByName("dataCylinder");for(;a;)o.remove(a),a=o.getObjectByName("dataCylinder");ne(`./dataset/average/${e}_averaged_data.csv`).then(m=>{let P=new U,p=new Float32Array(m.length*3),h=new Float32Array(m.length*3);const $=re().domain([7.95,8.03,8.06,8.12,8.14,8.4]).range(["#ff0000","#F9D6A5","#ffffff","#87CFFB","#4C9EED"]);m.forEach((t,r)=>{t.latitude=+t.latitude,t.longitude=360-+t.longitude,t.pH=+t.pH;let s=(90-Math.abs(t.latitude))*(Math.PI/180),x=t.longitude*(Math.PI/180),n=1,f=n*Math.sin(s)*Math.cos(x),u=t.latitude>=0?n*Math.cos(s):-n*Math.cos(s),w=n*Math.sin(s)*Math.sin(x),c=new ie($(t.pH));if(t.pH<8){let d=(8-t.pH)*2.4,M=new se(.002,.002,d,32),F=new le({color:16545280}),i=new C(M,F),v=new G(f,u,w).clone().normalize().multiplyScalar(n+d/2);i.position.set(v.x,v.y,v.z),i.lookAt(new G(0,0,0)),i.rotateX(Math.PI/2),i.name="dataCylinder",o.add(i)}p[3*r]=f,p[3*r+1]=u,p[3*r+2]=w,h[3*r]=c.r,h[3*r+1]=c.g,h[3*r+2]=c.b}),P.setAttribute("position",new B(p,3)),P.setAttribute("color",new B(h,3));const J=new N(P,new j({vertexColors:!0,size:.038}));o.add(J);const T=1;for(let t=-9;t<=9;t++){const r=Math.PI/18*t,s=T*Math.cos(r),x=new ce(s+.05,.003,16,100),n=new C(x,k);n.rotation.x=Math.PI/2,n.position.y=T*Math.sin(r),o.add(n);const f=t*10,u=40,w="rgba(200, 200, 200, 0.3)",c=document.createElement("canvas"),d=c.getContext("2d");d.font=u+"px Arial",d.fillStyle=w,d.fillText(f,0,u);const M=new de(c);M.needsUpdate=!0;const F=new me({map:M,transparent:!0}),i=new ue(F);i.scale.set(.5,.25,1);const z=Math.PI/5.5,A=.2,v=(s+A)*Math.cos(z)+.1,K=(s+A)*Math.sin(z);i.position.set(v,n.position.y,K),g.add(i)}})}const we=document.getElementById("yearSlider"),Y=document.getElementById("yearDisplay");document.getElementById("rs-bullet");Y.textContent=we.value;document.getElementById("yearSlider").addEventListener("input",function(e){const a=e.target.value;X(a),Y.textContent=a});X(2011);const q=5e3,O=new U,E=new Float32Array(q*3);for(let e=0;e<E.length;e++)E[e]=(Math.random()-.5)*20;O.setAttribute("position",new B(E,3));const k=new j({color:16777215,size:.005}),y=new N(O,k);g.add(y);function Z(){y.geometry.attributes.position.needsUpdate=!0;for(let e=0;e<q;e++){let a=e*3;y.geometry.attributes.position.array[a+0]+=(Math.random()-.5)*.001,y.geometry.attributes.position.array[a+1]+=(Math.random()-.5)*.001,y.geometry.attributes.position.array[a+2]+=(Math.random()-.5)*.001}requestAnimationFrame(Z),b.render(g,W),o.rotation.y+=4e-4,R.to(o.rotation,{duration:1})}Z();
