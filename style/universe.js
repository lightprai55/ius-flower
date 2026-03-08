import * as THREE from "https://esm.sh/three@0.136.0";
import { OrbitControls } from "https://esm.sh/three@0.136.0/examples/jsm/controls/OrbitControls.js";

let initialized = false;
window.initUniverse = function () {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById("universe-container");
    container.classList.add('show');
    document.body.style.overflow = "hidden"; // Ngăn cuộn trang

    // --- CÁC CÂU TIN NHẮN ---
    const messages = [
        "Happy Beauty's Day",
        "Yêu embe Thiên nhất",
        "Mãi bên nhau nha❤️"
    ];

    function getTextPoints(text, count) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1200;
        canvas.height = 200;

        ctx.fillStyle = "white";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const textWidth = ctx.measureText(text).width;
        const aspect = window.innerWidth / window.innerHeight;
        const visibleWidthAtZ0 = 2 * Math.tan(Math.PI * 60 / 360) * 30 * aspect;
        const maxWorldWidth = visibleWidthAtZ0 * 0.8;
        const scale = Math.min(0.08, maxWorldWidth / textWidth);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const points = [];

        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
                const alpha = data[(y * canvas.width + x) * 4 + 3];
                if (alpha > 128) {
                    points.push(new THREE.Vector3(
                        (x - canvas.width / 2) * scale,
                        (canvas.height / 2 - y) * scale,
                        0
                    ));
                }
            }
        }

        const result = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const p = points[i % points.length];
            result[i * 3] = p.x;
            result[i * 3 + 1] = p.y;
            result[i * 3 + 2] = p.z;
        }
        return result;
    }

    let scene = new THREE.Scene();
    scene.background = new THREE.Color('#160016');
    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 4, 30);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    let gu = {
        time: { value: 0 },
        textMix: { value: 0 },
        finalMix: { value: 0 },
        initialMix: { value: 0 } // Mix từ scatter sang text
    }

    const totalPoints = 150000;
    const messagePoints = messages.map(msg => getTextPoints(msg, totalPoints));

    let pts = [];
    let sizes = [];
    let shift = [];
    let scatterPos = [];
    let pushShift = () => {
        shift.push(
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2,
            (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
            Math.random() * 0.9 + 0.1
        );
    }

    for (let i = 0; i < totalPoints; i++) {
        let galaxyPos;
        if (i < 50000) {
            galaxyPos = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5);
        } else {
            let r = 10, R = 40;
            let rand = Math.pow(Math.random(), 1.5);
            let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
            galaxyPos = new THREE.Vector3().setFromCylindricalCoords(radius, Math.random() * 2 * Math.PI, (Math.random() - 0.5) * 2);
        }
        pts.push(galaxyPos);
        sizes.push(Math.random() * 1.5 + 0.5);
        pushShift();

        // Tạo vị trí ngẫu nhiên khắp màn hình để tập trung lại
        scatterPos.push(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
    }

    let g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
    g.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));
    g.setAttribute("scatterPos", new THREE.Float32BufferAttribute(scatterPos, 3));

    let startTextAttr = new THREE.Float32BufferAttribute(messagePoints[0], 3);
    let endTextAttr = new THREE.Float32BufferAttribute(messagePoints[0], 3);
    g.setAttribute("startText", startTextAttr);
    g.setAttribute("endText", endTextAttr);

    let m = new THREE.PointsMaterial({
        size: 0.125,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        onBeforeCompile: shader => {
            shader.uniforms.time = gu.time;
            shader.uniforms.textMix = gu.textMix;
            shader.uniforms.finalMix = gu.finalMix;
            shader.uniforms.initialMix = gu.initialMix;
            shader.vertexShader = `
                    uniform float time;
                    uniform float textMix;
                    uniform float finalMix;
                    uniform float initialMix;
                    attribute float sizes;
                    attribute vec4 shift;
                    attribute vec3 startText;
                    attribute vec3 endText;
                    attribute vec3 scatterPos;
                    varying vec3 vColor;
                    ${shader.vertexShader}
                `.replace(
                `gl_PointSize = size;`,
                `gl_PointSize = size * sizes;`
            ).replace(
                `#include <color_vertex>`,
                `#include <color_vertex>
                    float d = length(abs(position) / vec3(40., 10., 40));
                    d = clamp(d, 0., 1.);
                    vColor = mix(vec3(42,40,154), vec3(209,124,196), d) / 255.;
                `).replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                    float t = time;
                    float moveT = mod(shift.x + shift.z * t, PI2);
                    float moveS = mod(shift.y + shift.z * t, PI2);
                    
                    // Mix giữa 2 câu text
                    vec3 currentTextPos = mix(startText, endText, textMix);
                    
                    // Mix từ lúc tủa ra khắp nơi về text đầu tiên
                    vec3 gatheredPos = mix(scatterPos, currentTextPos, initialMix);
                    
                    // Mix từ text sang galaxy
                    vec3 finalPos = mix(gatheredPos, position, finalMix);
                    
                    vec3 noise = vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.a;
                    transformed = finalPos + noise * (finalMix + (1.0 - initialMix) * 0.5);
                `);

            shader.fragmentShader = `
                varying vec3 vColor;
                ${shader.fragmentShader}
                `.replace(
                `#include <clipping_planes_fragment>`,
                `#include <clipping_planes_fragment>
                    float d = length(gl_PointCoord.xy - 0.5);
                    if (d > 0.5) discard;
                `).replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `vec4 diffuseColor = vec4( vColor, smoothstep(0.5, 0.1, d) );`
                );
        }
    });

    let p = new THREE.Points(g, m);
    p.rotation.order = "ZYX";
    p.rotation.z = 0;
    scene.add(p);

    let clock = new THREE.Clock();
    let messageIndex = 0;
    let state = "GATHERING"; // Bắt đầu bằng việc tập trung hạt
    let stateTime = 0;

    renderer.setAnimationLoop(() => {
        controls.update();
        let dt = clock.getDelta();
        let t = clock.getElapsedTime() * 0.5;
        gu.time.value = t * Math.PI;
        stateTime += dt;

        if (state === "GATHERING") {
            let progress = stateTime / 3.0; // Tập trung trong 3 giây
            if (progress >= 1) {
                progress = 1;
                state = "DISPLAYING";
                stateTime = 0;
            }
            gu.initialMix.value = progress;
        } else if (state === "DISPLAYING") {
            gu.initialMix.value = 1;
            if (stateTime > 2.5) {
                state = "SWITCHING";
                stateTime = 0;
                messageIndex++;

                if (messageIndex < messages.length) {
                    g.attributes.endText.array.set(messagePoints[messageIndex]);
                    g.attributes.endText.needsUpdate = true;
                } else {
                    state = "GALAXY";
                }
            }
        } else if (state === "SWITCHING") {
            let progress = stateTime / 1.5;
            if (progress >= 1) {
                progress = 1;
                gu.textMix.value = 0;
                g.attributes.startText.array.set(messagePoints[messageIndex]);
                g.attributes.startText.needsUpdate = true;
                state = "DISPLAYING";
                stateTime = 0;
            } else {
                gu.textMix.value = progress;
            }
        } else if (state === "GALAXY") {
            let progress = stateTime / 5.0;
            gu.finalMix.value = Math.min(1, progress);
            p.rotation.y = t * 0.05 * gu.finalMix.value;
            p.rotation.z = 0.2 * gu.finalMix.value;
        }

        renderer.render(scene, camera);
    });
}
