/* KozFlow hero — animated GLSL noise hills (brand gold/terracotta on warm-dark).
   Vanilla port of the Three.js RawShaderMaterial terrain. Degrades gracefully:
   no THREE / no WebGL / reduced-motion -> hero keeps its CSS gradient background. */
(function () {
  function start() {
    if (!window.THREE) return;
    var canvas = document.getElementById('heroHills');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mq = window.matchMedia || function () { return { matches: false }; };
    var mobile = mq('(max-width: 720px)').matches || mq('(pointer: coarse)').matches;
    // Honour data-saver / very weak devices -> skip GL, keep CSS gradient.
    var saveData = navigator.connection && navigator.connection.saveData;
    var weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
               (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (saveData || weak) return;

    var PLANE = 256;                     // world size (unchanged look)
    var SEG = mobile ? 72 : 160;         // mesh density — 66k verts was the freeze; now 5k / 26k
    var SPEED = 0.42;
    var FPS = mobile ? 30 : 60;          // cap mobile to halve GPU/battery
    var frameMin = 1 / FPS;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return; } // no WebGL -> CSS fallback stays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    camera.position.set(0, 16, 125);
    camera.lookAt(new THREE.Vector3(0, 28, 0));

    var uniforms = { time: { value: 0 } };

    var vertexShader = [
      'precision highp float;',
      'attribute vec3 position;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 modelViewMatrix;',
      'uniform float time;',
      'varying vec3 vPosition;',
      'mat4 rotateMatrixX(float r){return mat4(1.0,0.0,0.0,0.0, 0.0,cos(r),-sin(r),0.0, 0.0,sin(r),cos(r),0.0, 0.0,0.0,0.0,1.0);}',
      'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
      'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
      'vec3 fade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}',
      'float cnoise(vec3 P){',
      ' vec3 Pi0=floor(P);vec3 Pi1=Pi0+vec3(1.0);Pi0=mod289(Pi0);Pi1=mod289(Pi1);',
      ' vec3 Pf0=fract(P);vec3 Pf1=Pf0-vec3(1.0);',
      ' vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);vec4 iy=vec4(Pi0.yy,Pi1.yy);',
      ' vec4 iz0=Pi0.zzzz;vec4 iz1=Pi1.zzzz;',
      ' vec4 ixy=permute(permute(ix)+iy);vec4 ixy0=permute(ixy+iz0);vec4 ixy1=permute(ixy+iz1);',
      ' vec4 gx0=ixy0*(1.0/7.0);vec4 gy0=fract(floor(gx0)*(1.0/7.0))-0.5;gx0=fract(gx0);',
      ' vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);vec4 sz0=step(gz0,vec4(0.0));',
      ' gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);',
      ' vec4 gx1=ixy1*(1.0/7.0);vec4 gy1=fract(floor(gx1)*(1.0/7.0))-0.5;gx1=fract(gx1);',
      ' vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);vec4 sz1=step(gz1,vec4(0.0));',
      ' gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);',
      ' vec3 g000=vec3(gx0.x,gy0.x,gz0.x);vec3 g100=vec3(gx0.y,gy0.y,gz0.y);',
      ' vec3 g010=vec3(gx0.z,gy0.z,gz0.z);vec3 g110=vec3(gx0.w,gy0.w,gz0.w);',
      ' vec3 g001=vec3(gx1.x,gy1.x,gz1.x);vec3 g101=vec3(gx1.y,gy1.y,gz1.y);',
      ' vec3 g011=vec3(gx1.z,gy1.z,gz1.z);vec3 g111=vec3(gx1.w,gy1.w,gz1.w);',
      ' vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));',
      ' g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;',
      ' vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));',
      ' g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;',
      ' float n000=dot(g000,Pf0);float n100=dot(g100,vec3(Pf1.x,Pf0.yz));',
      ' float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));float n110=dot(g110,vec3(Pf1.xy,Pf0.z));',
      ' float n001=dot(g001,vec3(Pf0.xy,Pf1.z));float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));',
      ' float n011=dot(g011,vec3(Pf0.x,Pf1.yz));float n111=dot(g111,Pf1);',
      ' vec3 f=fade(Pf0);',
      ' vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),f.z);',
      ' vec2 n_yz=mix(n_z.xy,n_z.zw,f.y);float n_xyz=mix(n_yz.x,n_yz.y,f.x);',
      ' return 2.2*n_xyz;}',
      'void main(){',
      ' vec3 p=(rotateMatrixX(radians(90.0))*vec4(position,1.0)).xyz;',
      ' float s=sin(radians(p.x/128.0*90.0));',
      ' vec3 np=p+vec3(0.0,0.0,time*-30.0);',
      ' float n1=cnoise(np*0.08);float n2=cnoise(np*0.06);float n3=cnoise(np*0.4);',
      ' vec3 last=p+vec3(0.0, n1*s*8.0 + n2*s*8.0 + n3*(abs(s)*2.0+0.5) + pow(s,2.0)*40.0, 0.0);',
      ' vPosition=last;',
      ' gl_Position=projectionMatrix*modelViewMatrix*vec4(last,1.0);}'
    ].join('\n');

    var fragmentShader = [
      'precision highp float;',
      'varying vec3 vPosition;',
      'void main(){',
      ' float h=clamp((vPosition.y+8.0)/52.0,0.0,1.0);',
      // gold (#C4985A) low -> terracotta (#C26B4A) high, lifting toward warm cream at peaks
      ' vec3 gold=vec3(0.77,0.60,0.36);',
      ' vec3 terra=vec3(0.78,0.42,0.30);',
      ' vec3 color=mix(gold,terra,smoothstep(0.45,1.0,h));',
      ' color=mix(color,vec3(0.92,0.79,0.55),pow(h,3.0)*0.5);',
      ' float opacity=(96.0-length(vPosition))/256.0*0.62;',
      ' opacity*=0.55+0.45*h;',
      ' if(opacity<=0.0) discard;',
      ' gl_FragColor=vec4(color,opacity);}'
    ].join('\n');

    var geo = new THREE.PlaneGeometry(PLANE, PLANE, SEG, SEG);
    var mat = new THREE.RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    function resize() {
      var w = hero.clientWidth || window.innerWidth;
      var h = hero.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);
    resize();

    var clock = new THREE.Clock();
    var visible = true, raf = 0, acc = 0;

    function frame() {
      var dt = clock.getDelta();
      acc += dt;
      // FPS cap — skip render until enough time elapsed (saves GPU on mobile)
      if (acc >= frameMin) {
        uniforms.time.value += acc * SPEED;
        renderer.render(scene, camera);
        acc = 0;
      }
      raf = requestAnimationFrame(frame);
    }

    if (reduce) {
      // single static frame, no animation
      uniforms.time.value = 12.0;
      resize();
      renderer.render(scene, camera);
      return;
    }

    // pause when hero scrolled out of view
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting;
        if (v && !visible) { visible = true; clock.getDelta(); raf = requestAnimationFrame(frame); }
        else if (!v && visible) { visible = false; cancelAnimationFrame(raf); }
      }, { threshold: 0 }).observe(hero);
    }
    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
