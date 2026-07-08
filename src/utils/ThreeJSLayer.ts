import * as THREE from 'three';
import maplibregl from 'maplibre-gl';

export class RocketTrajectoryLayer {
    id = 'rocket-trajectory';
    type = 'custom' as const;
    renderingMode = '3d' as const;
    
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    map: maplibregl.Map;
    
    startCoord: [number, number];
    azimuth: number;
    distance: number; // in meters
    maxHeight: number; // in meters
    
    rocketMesh: THREE.Mesh;
    trajectoryPoints: THREE.Vector3[] = [];
    trajectoryLine: THREE.Line;
    boxMesh: THREE.Mesh;
    
    startTime: number = 0;
    duration: number = 4000; // 4 seconds animation
    isAnimating: boolean = false;
    currentProgress: number = 0;
    
    constructor(startCoord: [number, number], azimuth: number, distanceKm: number, maxHeightKm: number) {
        this.startCoord = startCoord;
        this.azimuth = azimuth;
        this.distance = distanceKm * 1000;
        this.maxHeight = maxHeightKm * 1000;
        
        this.camera = new THREE.Camera();
        this.camera.matrixAutoUpdate = false;
        
        this.scene = new THREE.Scene();
        console.log('RocketTrajectoryLayer constructor created', this.startCoord);
    }

    onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
        console.log('RocketTrajectoryLayer onAdd called');
        this.map = map;
        
        // Setup lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        // Rocket Mesh: Cone geometry (15m base diameter, 60m tall)
        const geometry = new THREE.ConeGeometry(15, 60, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xef4444,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
            depthTest: false
        });
        
        this.rocketMesh = new THREE.Mesh(geometry, material);
        this.rocketMesh.frustumCulled = false; // CRITICAL: prevent frustum culling!
        this.scene.add(this.rocketMesh);

        // Child flame mesh representing engine exhaust
        const flameGeo = new THREE.ConeGeometry(10, 30, 16);
        flameGeo.rotateX(Math.PI); // Point tip downwards (opposite to rocket travel)
        flameGeo.translate(0, -30, 0); // Sits at the base of the rocket cone
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.85,
            depthTest: false
        });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        this.rocketMesh.add(flameMesh);
        
        // Trajectory Line: Orange glowing line
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0xffa500, 
            linewidth: 4, 
            depthTest: false 
        });
        const lineGeo = new THREE.BufferGeometry();
        this.trajectoryLine = new THREE.Line(lineGeo, lineMat);
        this.trajectoryLine.frustumCulled = false; // CRITICAL: prevent frustum culling!
        this.scene.add(this.trajectoryLine);

        // Giant static green box at starting point for verification (100m size)
        const boxGeo = new THREE.BoxGeometry(100, 100, 100);
        const boxMat = new THREE.MeshStandardMaterial({ 
            color: 0x10b981, 
            emissive: 0x10b981,
            emissiveIntensity: 0.4,
            depthTest: false 
        });
        this.boxMesh = new THREE.Mesh(boxGeo, boxMat);
        this.boxMesh.position.set(0, 0, 50); // half height above ground so it sits on the ground
        this.boxMesh.frustumCulled = false; // CRITICAL: prevent frustum culling!
        this.scene.add(this.boxMesh);

        // Setup Three.js WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
        });
        this.renderer.autoClear = false;
        
        this.startAnimation();
    }
    
    startAnimation() {
        console.log('RocketTrajectoryLayer startAnimation');
        this.startTime = performance.now();
        this.isAnimating = true;
        this.currentProgress = 0;
        this.trajectoryPoints = [new THREE.Vector3(0, 0, 0)];
        this.trajectoryLine.geometry.dispose();
        this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(this.trajectoryPoints);
        this.map.triggerRepaint();
    }

    render(gl: WebGLRenderingContext, matrix: number[]) {
        const time = performance.now();
        
        if (this.isAnimating) {
            let progress = (time - this.startTime) / this.duration;
            if (progress >= 1) {
                 progress = 1;
                 this.isAnimating = false;
                 console.log('RocketTrajectoryLayer animation finished');
            }
            this.currentProgress = progress;
        }

        const progress = this.currentProgress;

        // Parabolic trajectory math in local meters
        const d = this.distance * progress;
        const h = 4 * this.maxHeight * progress * (1 - progress);
        
        const theta_rad = this.azimuth * Math.PI / 180;
        const x = d * Math.sin(theta_rad);
        const y = d * Math.cos(theta_rad);
        const z = h;

        // Position the rocket mesh
        this.rocketMesh.position.set(x, y, z);
        
        // Point rocket along the tangent direction
        const dx_dp = this.distance * Math.sin(theta_rad);
        const dy_dp = this.distance * Math.cos(theta_rad);
        const dz_dp = 4 * this.maxHeight * (1 - 2 * progress);
        
        const dir = new THREE.Vector3(dx_dp, dy_dp, dz_dp).normalize();
        this.rocketMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        // Add to trajectory line
        if (this.isAnimating) {
            const newPt = new THREE.Vector3(x, y, z);
            if (this.trajectoryPoints.length === 0 || this.trajectoryPoints[this.trajectoryPoints.length - 1].distanceTo(newPt) > 1.0) {
                this.trajectoryPoints.push(newPt);
                this.trajectoryLine.geometry.dispose();
                this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(this.trajectoryPoints);
            }
        }

        // Camera setup
        const startMercator = maplibregl.MercatorCoordinate.fromLngLat(this.startCoord, 0);
        const scale = startMercator.meterInMercatorCoordinateUnits();
        
        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
            .makeTranslation(startMercator.x, startMercator.y, startMercator.z)
            .scale(new THREE.Vector3(scale, -scale, scale));
            
        this.camera.projectionMatrix = m.multiply(l);

        // Render the scene using Three.js WebGL state recovery
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        
        // Loop the repaints if we are still animating
        if (this.isAnimating) {
            this.map.triggerRepaint();
        }
    }

    onRemove(map: maplibregl.Map, gl: WebGLRenderingContext) {
        console.log('RocketTrajectoryLayer onRemove called');
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.trajectoryLine) {
            this.trajectoryLine.geometry.dispose();
        }
        if (this.rocketMesh) {
            // Dispose rocket geometry and material
            this.rocketMesh.geometry.dispose();
            if (Array.isArray(this.rocketMesh.material)) {
                this.rocketMesh.material.forEach(m => m.dispose());
            } else {
                this.rocketMesh.material.dispose();
            }
            // Dispose flame child
            this.rocketMesh.children.forEach(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
        }
        if (this.boxMesh) {
            this.boxMesh.geometry.dispose();
            if (Array.isArray(this.boxMesh.material)) {
                this.boxMesh.material.forEach(m => m.dispose());
            } else {
                this.boxMesh.material.dispose();
            }
        }
    }
}
