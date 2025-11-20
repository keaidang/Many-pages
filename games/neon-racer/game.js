/**
 * 游戏配置
 */
const CONFIG = {
    laneWidth: 5,
    maxLanesRange: 12,
    speedBase: 0.4,      // 保持舒适的起步速度
    speedMax: 2.4,       // 最高速度不变，但需要很久才能达到
    speedIncrement: 0.0001, // 大幅降低加速度：从 0.0003 降至 0.0001（大约需要 5-6 分钟才能达到极速）
    obstacleSpawnRate: 110, // 增加障碍物生成的间隔帧数，给玩家更多反应空间
    fovBase: 60,
    fovMax: 95
};

let gameState = {
    isPlaying: false,
    score: 0,
    speed: 0,
    frame: 0,
    time: 0
};

// Three.js 全局变量
let scene, camera, renderer;
let playerCar;
let roadMesh, gridTexture;
let obstacles = [];
let buildings = []; // 道路两侧的建筑
let sunMesh;
let particles = [];

// 输入与物理
let input = { left: false, right: false };
let carPositionX = 0;
let carTargetTilt = 0;

/**
 * 初始化
 */
function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b18, 0.015); // 浓雾隐藏远处

    // 2. 相机
    camera = new THREE.PerspectiveCamera(CONFIG.fovBase, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 0, -20);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 优化性能
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 4. 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 模拟月光/城市光
    const dirLight = new THREE.DirectionalLight(0xaaccff, 0.6);
    dirLight.position.set(-20, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 5. 创建各个部分
    createSky();
    createRoad();
    createPlayer();
    createInitialBuildings();

    // 6. 监听
    window.addEventListener('resize', onWindowResize, false);
    setupInputs();

    // 7. 循环
    animate();
}

/**
 * 创建复古太阳和天空
 */
function createSky() {
    // 太阳
    const sunGeo = new THREE.CircleGeometry(40, 32);
    // 使用顶点颜色创建渐层
    const sunMat = new THREE.MeshBasicMaterial({
        color: 0xff00aa,
        fog: false
    });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 20, -150);
    scene.add(sunMesh);

    // 太阳发光层（简单的背后大圆）
    const glowGeo = new THREE.CircleGeometry(45, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0055, opacity: 0.3, transparent: true, fog: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -151;
    sunMesh.add(glow);
}

/**
 * 创建无限滚动的路面
 */
function createRoad() {
    // 创建动态网格纹理
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 黑色背景
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, 128, 128);

    // 霓虹网格线
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);
    // 中间再画一条线增强密度
    ctx.beginPath();
    ctx.moveTo(64, 0); ctx.lineTo(64, 128);
    ctx.moveTo(0, 64); ctx.lineTo(128, 64);
    ctx.stroke();

    gridTexture = new THREE.CanvasTexture(canvas);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(20, 20);
    // 开启各向异性让远处纹理更清晰
    gridTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const geometry = new THREE.PlaneGeometry(300, 600);
    const material = new THREE.MeshStandardMaterial({
        map: gridTexture,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x220022,
        emissiveIntensity: 0.5
    });

    roadMesh = new THREE.Mesh(geometry, material);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.z = -100; // 延伸到远处
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
}

/**
 * 创建炫酷的赛车
 */
function createPlayer() {
    playerCar = new THREE.Group();

    // 1. 主车体（低多边形跑车造型）
    const chassisGeo = new THREE.BoxGeometry(2, 0.5, 4);
    const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        roughness: 0.2,
        metalness: 0.8
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    playerCar.add(chassis);

    // 2. 座舱盖
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.4, 2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1, roughness: 0 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.9, -0.5);
    playerCar.add(cabin);

    // 3. 扰流板
    const spoilerGeo = new THREE.BoxGeometry(2.2, 0.1, 0.5);
    const spoiler = new THREE.Mesh(spoilerGeo, chassisMat);
    spoiler.position.set(0, 1.0, 1.8);
    playerCar.add(spoiler);

    // 扰流板支架
    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legL = new THREE.Mesh(legGeo, chassisMat);
    legL.position.set(0.8, 0.75, 1.8);
    const legR = legL.clone();
    legR.position.set(-0.8, 0.75, 1.8);
    playerCar.add(legL);
    playerCar.add(legR);

    // 4. 尾灯（强烈发光）
    const lightGeo = new THREE.BoxGeometry(1.8, 0.1, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailLight = new THREE.Mesh(lightGeo, lightMat);
    tailLight.position.set(0, 0.6, 2.0);
    playerCar.add(tailLight);

    // 尾灯光晕
    const tailGlow = new THREE.PointLight(0xff0000, 1, 5);
    tailGlow.position.set(0, 0.6, 2.5);
    playerCar.add(tailGlow);

    // 5. 车轮（发光轮圈）
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // 霓虹轮圈

    const positions = [
        { x: -1.1, z: 1.2 }, { x: 1.1, z: 1.2 },
        { x: -1.1, z: -1.2 }, { x: 1.1, z: -1.2 }
    ];

    positions.forEach(pos => {
        const wheelGroup = new THREE.Group();
        const tire = new THREE.Mesh(wheelGeo, wheelMat);
        tire.rotation.z = Math.PI / 2;

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.31, 8), rimMat);
        rim.rotation.z = Math.PI / 2;

        wheelGroup.add(tire);
        wheelGroup.add(rim);
        wheelGroup.position.set(pos.x, 0.4, pos.z);
        playerCar.add(wheelGroup);
    });

    // 6. 车头大灯（聚光灯）
    const headLightL = new THREE.SpotLight(0xffffff, 4, 60, 0.5, 0.5, 1);
    headLightL.position.set(-0.6, 0.5, -1.8);
    headLightL.target.position.set(-0.6, 0, -20);
    playerCar.add(headLightL);
    playerCar.add(headLightL.target);

    const headLightR = new THREE.SpotLight(0xffffff, 4, 60, 0.5, 0.5, 1);
    headLightR.position.set(0.6, 0.5, -1.8);
    headLightR.target.position.set(0.6, 0, -20);
    playerCar.add(headLightR);
    playerCar.add(headLightR.target);

    scene.add(playerCar);
}

/**
 * 生成障碍物
 */
function spawnObstacle() {
    const type = Math.random();
    let geometry, material, mesh;

    if (type > 0.5) {
        // 类型 1：尖刺障碍
        geometry = new THREE.ConeGeometry(1, 2, 4);
        material = new THREE.MeshPhongMaterial({ color: 0xff0055, emissive: 0x550022, flatShading: true });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1;
    } else {
        // 类型 2：宽路障
        geometry = new THREE.BoxGeometry(3, 1, 1);
        material = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0xaa4400 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;
    }

    mesh.castShadow = true;

    // 随机 X 位置
    const xPos = (Math.random() * CONFIG.maxLanesRange * 2) - CONFIG.maxLanesRange;
    // 稍微量化位置，避免过难
    const snappedX = Math.round(xPos / 3) * 3;

    const group = new THREE.Group();
    group.add(mesh);
    group.position.set(snappedX, 0, -150); // 从远处生成

    scene.add(group);
    obstacles.push(group);
}

/**
 * 生成背景建筑
 */
function createInitialBuildings() {
    for (let i = 0; i < 40; i++) {
        spawnBuilding(-150 + i * 10); // 预先生成
    }
}

function spawnBuilding(zPos) {
    const height = 5 + Math.random() * 20;
    const geometry = new THREE.BoxGeometry(4, height, 4);
    // 随机霓虹色
    const color = Math.random() > 0.5 ? 0x00ffff : 0xff00ff;
    const material = new THREE.MeshLambertMaterial({ color: 0x111111, emissive: color, emissiveIntensity: 0.2 });

    const mesh = new THREE.Mesh(geometry, material);

    // 随机放在左边或右边
    const side = Math.random() > 0.5 ? 1 : -1;
    const xPos = side * (20 + Math.random() * 30);

    mesh.position.set(xPos, height / 2, zPos);
    scene.add(mesh);
    buildings.push(mesh);
}

/**
 * 粒子特效（简单尾气）
 */
function spawnParticle() {
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    const particle = new THREE.Mesh(geo, mat);

    // 从车尾随机位置发射
    particle.position.copy(playerCar.position);
    particle.position.z += 2;
    particle.position.y += 0.2;
    particle.position.x += (Math.random() - 0.5);

    scene.add(particle);
    particles.push({ mesh: particle, life: 1.0 });
}

function resetGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.speed = CONFIG.speedBase;
    gameState.frame = 0;

    obstacles.forEach(o => scene.remove(o));
    obstacles = [];

    carPositionX = 0;
    playerCar.position.x = 0;
    playerCar.rotation.z = 0;

    updateHUD();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
}

function gameOver() {
    gameState.isPlaying = false;
    document.getElementById('final-score').innerText = `最终得分: ${Math.floor(gameState.score)}`;
    document.getElementById('game-over-screen').classList.remove('hidden');

    // 撞击特效：相机震动
    camera.position.y = 5;
    camera.lookAt(0, 0, -20);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = 0.016; // 假设 60fps

    // 1. 游戏逻辑
    if (gameState.isPlaying) {
        gameState.speed = Math.min(CONFIG.speedMax, gameState.speed + CONFIG.speedIncrement);
        gameState.score += gameState.speed * 0.1;
        gameState.frame++;
        gameState.time += delta;

        // 2. 车辆控制（物理插值）
        if (input.left) carPositionX -= 0.3 + (gameState.speed * 0.05);
        if (input.right) carPositionX += 0.3 + (gameState.speed * 0.05);

        // 边界限制
        carPositionX = Math.max(-CONFIG.maxLanesRange, Math.min(CONFIG.maxLanesRange, carPositionX));

        // 平滑移动（Lerp）
        playerCar.position.x += (carPositionX - playerCar.position.x) * 0.15;

        // 车身倾斜效果
        const tilt = (playerCar.position.x - carPositionX) * 0.5;
        playerCar.rotation.z = tilt; // 左右倾斜
        playerCar.rotation.y = -tilt * 0.3; // 轻微转向

        // 3. 障碍物管理
        const spawnRate = Math.max(20, Math.floor(CONFIG.obstacleSpawnRate / gameState.speed));
        if (gameState.frame % spawnRate === 0) spawnObstacle();

        // 4. 建筑与纹理滚动（制造前进错觉）
        // 路面纹理移动
        gridTexture.offset.y -= gameState.speed * 0.02;

        // 移动障碍物
        const playerBox = new THREE.Box3().setFromObject(playerCar);
        playerBox.expandByScalar(-0.3); // 碰撞宽容度

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obj = obstacles[i];
            obj.position.z += gameState.speed * 50 * delta; // 相对速度

            // 碰撞检测
            const enemyBox = new THREE.Box3().setFromObject(obj);
            if (playerBox.intersectsBox(enemyBox)) {
                gameOver();
            }

            if (obj.position.z > 10) {
                scene.remove(obj);
                obstacles.splice(i, 1);
            }
        }

        // 移动建筑
        for (let i = buildings.length - 1; i >= 0; i--) {
            let b = buildings[i];
            b.position.z += gameState.speed * 50 * delta;
            if (b.position.z > 20) {
                scene.remove(b);
                buildings.splice(i, 1);
                // 在远处再生成一个，保持数量
                spawnBuilding(-150);
            }
        }

        // 粒子特效
        if (gameState.frame % 5 === 0) spawnParticle();
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.life -= 0.05;
            p.mesh.position.z += gameState.speed * 20 * delta; // 粒子被抛在后面
            p.mesh.scale.setScalar(p.life);
            if (p.life <= 0) {
                scene.remove(p.mesh);
                particles.splice(i, 1);
            }
        }

        // 动态 FOV
        const targetFov = CONFIG.fovBase + (gameState.speed / CONFIG.speedMax) * (CONFIG.fovMax - CONFIG.fovBase);
        camera.fov += (targetFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();

        updateHUD();
    } else {
        // 待机画面：旋转相机
        gameState.time += 0.005;
        camera.position.x = Math.sin(gameState.time) * 5;
        camera.lookAt(0, 0, -20);
        // 网格慢速移动
        gridTexture.offset.y -= 0.005;
    }

    // 渲染
    renderer.render(scene, camera);
}

function updateHUD() {
    document.getElementById('score-display').innerText = Math.floor(gameState.score);
    const speedKmh = Math.floor(gameState.speed * 120);
    document.getElementById('speed-display').innerText = speedKmh + " KM/H";

    // 速度条百分比
    const pct = Math.min(100, (gameState.speed / CONFIG.speedMax) * 100);
    document.getElementById('speed-bar-fill').style.width = pct + "%";
}

function setupInputs() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
    });
    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    });

    // 触摸控制
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobile-controls').style.display = 'flex';
        // 手机上调整 FOV 防止画面变形
        camera.fov = 75;
        camera.updateProjectionMatrix();
    }

    const bindTouch = (id, dir) => {
        const btn = document.getElementById(id);
        const start = (e) => { e.preventDefault(); input[dir] = true; btn.style.transform = 'rotate(45deg) scale(0.9)'; };
        const end = (e) => { e.preventDefault(); input[dir] = false; btn.style.transform = 'rotate(45deg) scale(1.0)'; };
        btn.addEventListener('touchstart', start);
        btn.addEventListener('touchend', end);
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
    };

    bindTouch('btn-left', 'left');
    bindTouch('btn-right', 'right');

    document.getElementById('start-btn').addEventListener('click', resetGame);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
