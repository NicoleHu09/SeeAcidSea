import{S as we,g as xe,W as fe,j as A,A as ne,f as h,k as U,T as oe,l as Le,G as _e,m as X,q as ae,r as ie,V as i,B as se,n as O,P as le,e as re,o as Ee,p as Ie,C as be}from"./papaparse.min-af088632.js";const ce=`
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,Ce=`
uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main(){
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0,1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    //vec3: change the color of atmosphere

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture,vertexUV).xyz, 1.0);
}
`,Me=`
uniform sampler2D globeTexture;
varying vec2 vertexUV;

void main() {
    vec4 textureColor = texture2D(globeTexture, vertexUV);
    gl_FragColor = textureColor;
}
`,Pe=`
varying vec3 vertexNormal;

void main(){
    vertexNormal = normalize(normalMatrix * normal) ;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,Se=`
varying vec3 vertexNormal;
void main(){
    float intensity = pow(0.5 - dot(vertexNormal, vec3(0, 0, 1.0)),2.5);

    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0)*intensity;
}
`,P=new we,d=new xe(72,innerWidth/innerHeight,.1,1e3),Y=new fe({antialias:!0,alpha:!0,canvas:document.querySelector("#earth-container")});Y.setSize(innerWidth,innerHeight);Y.setPixelRatio(window.devicePixelRatio);const Be=`
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`,ze=`
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
`;new A({vertexShader:Be,fragmentShader:ze,blending:ne,depthTest:!1,transparent:!0,vertexColors:!0});const Ve=new h(new U(1,50,50),new A({vertexShader:ce,fragmentShader:Ce,uniforms:{globeTexture:{value:new oe().load("./img/blueearth3.jpg")}}})),$=new h(new U(1,50,50),new A({vertexShader:ce,fragmentShader:Me,uniforms:{globeTexture:{value:new oe().load("./img/outline2.png")}},transparent:!0}));$.scale.set(1.02,1.02,1.02);P.add($);const de=new h(new U(1,50,50),new A({vertexShader:Pe,fragmentShader:Se,blending:ne,side:Le}));de.scale.set(1.3,1.3,1.3);P.add(de);const n=new _e;n.add(Ve);n.add($);P.add(n);d.position.z=2.3;let J=!1,q={x:0,y:0},m={x:0,y:0};addEventListener("mousedown",e=>{J=!0,q.x=e.clientX,q.y=e.clientY,m.x=n.rotation.x,m.y=n.rotation.y});const ke=document.querySelector("canvas");ke.addEventListener("mousemove",e=>{if(J){let t=(e.clientX-q.x)/(innerWidth*6),o=(e.clientY-q.y)/(innerHeight*6);m.x+=o*.5,m.y+=t*.5,m.x=Math.max(-Math.PI/4,Math.min(Math.PI/4,m.x)),X.to(n.rotation,{x:m.x,y:m.y,duration:.5})}});addEventListener("mouseup",()=>{J=!1});const Fe=document.querySelector("#reset-button");Fe.addEventListener("click",()=>{X.to(n.rotation,{x:0,y:0,duration:1})});let x;function me(e){n.remove(n.getObjectByName("points"));let t=n.getObjectByName("dataCylinder");for(;t;)n.remove(t),t=n.getObjectByName("dataCylinder");Ee(`./dataset/average/${e}_averaged_data.csv`).then(o=>{let s=new se,l=new Float32Array(o.length*3),r=new Float32Array(o.length*3);const E=Ie().domain([7.95,8.03,8.06,8.12,8.14,8.4]).range(["#ff0000","#F9D6A5","#ffffff","#87CFFB","#4C9EED"]);o.forEach((a,c)=>{a.latitude=+a.latitude,a.longitude=360-+a.longitude,a.pH=+a.pH;let w=(90-Math.abs(a.latitude))*(Math.PI/180),V=a.longitude*(Math.PI/180),v=1,k=v*Math.sin(w)*Math.cos(V),F=a.latitude>=0?v*Math.cos(w):-v*Math.cos(w),Z=v*Math.sin(w)*Math.sin(V),H=new be(E(a.pH));if(a.pH<8){let ee=(8-a.pH)*2.4,pe=new ae(.002,.002,ee,32),he=new ie({color:16545280});x=new h(pe,he);let T=new i(k,F,Z).clone().normalize().multiplyScalar(v+ee/2);x.position.set(T.x,T.y,T.z),x.lookAt(new i(0,0,0)),x.rotateX(Math.PI/2),x.name="dataCylinder",n.add(x)}l[3*c]=k,l[3*c+1]=F,l[3*c+2]=Z,r[3*c]=H.r,r[3*c+1]=H.g,r[3*c+2]=H.b}),s.setAttribute("position",new O(l,3)),s.setAttribute("color",new O(r,3));const D=new re(s,new le({vertexColors:!0,size:.038}));n.add(D)})}let j=.01,K=new ae(.05,.05,j,32),Q=new ie({color:16711680,opacity:0,transparent:!0}),S=new h(K,Q),B=new h(K,Q),z=new h(K,Q),qe=new i(-3,-1,8),Ae=qe.clone().normalize(),N=Ae.multiplyScalar(1+j/2);S.position.set(N.x,N.y,N.z);S.lookAt(new i(0,0,0));let je=new i(6,8,-4.5),De=je.clone().normalize(),R=De.multiplyScalar(1+j/2);B.position.set(R.x,R.y,R.z);B.lookAt(new i(0,0,0));let He=new i(4,2,-7),Te=He.clone().normalize(),W=Te.multiplyScalar(1+j/2);z.position.set(W.x,W.y,W.z);z.lookAt(new i(0,0,0));S.rotateX(Math.PI/2);B.rotateX(Math.PI/2);z.rotateX(Math.PI/2);n.add(S);n.add(B);n.add(z);const f=document.getElementById("rightdownEqa"),L=document.getElementById("rightdownIn"),_=document.getElementById("rightdownIndia");f.classList.remove("show");L.classList.remove("show");_.classList.remove("show");const I=document.getElementById("oceanCylinderEqaHTMLEqa"),b=document.getElementById("oceanCylinderEqaHTMLIn"),C=document.getElementById("oceanCylinderEqaHTMLIndia");I.addEventListener("click",function(){f.classList.contains("show")?f.classList.remove("show"):(f.classList.add("show"),L.classList.remove("show"),_.classList.remove("show"))},!1);b.addEventListener("click",function(){L.classList.contains("show")?L.classList.remove("show"):(L.classList.add("show"),f.classList.remove("show"),_.classList.remove("show"))},!1);C.addEventListener("click",function(){_.classList.contains("show")?_.classList.remove("show"):(_.classList.add("show"),f.classList.remove("show"),L.classList.remove("show"))},!1);function Ne(){const e=new i;S.getWorldPosition(e);const t=new i;B.getWorldPosition(t);const o=new i;z.getWorldPosition(o);const s=e.clone().sub(d.position),l=t.clone().sub(d.position),r=o.clone().sub(d.position),E=e.clone().normalize(),D=t.clone().normalize(),a=o.clone().normalize();s.dot(E)<0?I.style.display="block":I.style.display="none",l.dot(D)<0?b.style.display="block":b.style.display="none",r.dot(a)<0?C.style.display="block":C.style.display="none",e.project(d);const c=(e.x*.5+.5)*window.innerWidth,w=(-(e.y*.5)+.5)*window.innerHeight;t.project(d);const V=(t.x*.5+.5)*window.innerWidth,v=(-(t.y*.5)+.5)*window.innerHeight;o.project(d);const k=(o.x*.5+.5)*window.innerWidth,F=(-(o.y*.5)+.5)*window.innerHeight;I.style.left=c+"px",I.style.top=w+"px",b.style.left=V+"px",b.style.top=v+"px",C.style.left=k+"px",C.style.top=F+"px"}const Re=document.getElementById("yearSlider"),ye=document.getElementById("yearDisplay");document.getElementById("rs-bullet");const te=[3205.9873,3307.9721,3346.0888,3411.9894,3407.0177,3414.5652,3468.7837,3556.0556,3547.7245,3356.6428],We=document.getElementById("co2Display"),Oe=[1.78,1.708,1.874,1.497,.845,1.479,2.067,2.144,2.121,2.582],Ge=document.getElementById("pctDisplay"),Ue=document.getElementById("co2Ocean"),Xe=document.getElementById("co2Tree");ye.textContent=Re.value;document.getElementById("yearSlider").addEventListener("input",function(e){const t=e.target.value;me(t);let o=t-2011,s=te[o],l=Oe[o];We.textContent=s.toString(),Ge.textContent=`${l}%`;let r=(.3*s).toFixed(2);Ue.textContent=r;let E=(.3*s/22).toFixed(2);Xe.textContent=E,console.log(te[o]),ye.textContent=t});me(2011);const ue=5e3,ve=new se,G=new Float32Array(ue*3);for(let e=0;e<G.length;e++)G[e]=(Math.random()-.5)*20;ve.setAttribute("position",new O(G,3));const Ye=new le({color:16777215,size:.005}),M=new re(ve,Ye);P.add(M);function ge(){M.geometry.attributes.position.needsUpdate=!0;for(let e=0;e<ue;e++){let t=e*3;M.geometry.attributes.position.array[t+0]+=(Math.random()-.5)*.001,M.geometry.attributes.position.array[t+1]+=(Math.random()-.5)*.001,M.geometry.attributes.position.array[t+2]+=(Math.random()-.5)*.001}requestAnimationFrame(ge),Y.render(P,d),n.rotation.y+=4e-4,X.to(n.rotation,{duration:1}),Ne()}ge();const $e=document.getElementById("close-left"),Je=document.getElementById("close-right"),g=document.getElementById("open-left"),p=document.getElementById("open-right"),y=document.getElementById("left-container"),u=document.getElementById("right-container");g.style.display="none";p.style.display="none";$e.addEventListener("click",function(){y.classList.add("animate__animated","animate__slideOutLeft"),y.addEventListener("animationend",function(){y.classList.remove("animate__animated","animate__slideOutLeft"),y.style.display="none",g.style.display="block",g.classList.add("animate__animated","animate__slideInLeft"),g.addEventListener("animationend",function(){g.classList.remove("animate__animated","animate__slideInLeft")},{once:!0})},{once:!0})});g.addEventListener("click",function(){g.style.display="none",y.style.display="block",y.classList.add("animate__animated","animate__slideInLeft"),y.addEventListener("animationend",function(){y.classList.remove("animate__animated","animate__slideInLeft")},{once:!0})});Je.addEventListener("click",function(){u.classList.add("animate__animated","animate__slideOutRight"),u.addEventListener("animationend",function(){u.classList.remove("animate__animated","animate__slideOutRight"),u.style.display="none",p.style.display="block",p.classList.add("animate__animated","animate__slideInRight"),p.addEventListener("animationend",function(){p.classList.remove("animate__animated","animate__slideInRight")},{once:!0})},{once:!0})});p.addEventListener("click",function(){p.style.display="none",u.style.display="block",u.classList.add("animate__animated","animate__slideInRight"),u.addEventListener("animationend",function(){u.classList.remove("animate__animated","animate__slideInRight")},{once:!0})});
