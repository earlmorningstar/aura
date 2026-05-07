"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

type ParticleSphereProps = {
    radius?: number;
    count?: number;
    color?: string;
    speed?: number;
};

export function ParticleSphere({
    radius = 2,
    count = 4000,
    color = "#38bdf8",
    speed = 1,
}: ParticleSphereProps) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // =========================
        // SCENE SETUP
        // =========================
        const scene = new THREE.Scene();

        const VFOV_DEG = 60;

        const camera = new THREE.PerspectiveCamera(
            VFOV_DEG,
            mount.clientWidth / mount.clientHeight,
            0.1,
            100
        );

        // Computes the z distance that guarantees the sphere fits
        // inside the viewport on both axes, with a small padding factor.
        const fitCameraZ = (width: number, height: number): number => {
            const aspect = width / height;
            const vFov = THREE.MathUtils.degToRad(VFOV_DEG);
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
            // Use whichever axis is tighter (portrait = horizontal is tighter)
            const minFov = Math.min(vFov, hFov);
            return (radius * 1.6) / Math.tan(minFov / 2);
        };

        camera.position.z = fitCameraZ(mount.clientWidth, mount.clientHeight);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        // =========================
        // GLOBE PARTICLES
        // =========================
        const positions: number[] = [];

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const r = radius * (1 + (Math.random() - 0.5) * 0.025);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
            size: 0.012,
            color: color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // =========================
        // CONNECTION LINES
        // =========================
        const lineMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08,
        });

        const linePositions: number[] = [];

        for (let i = 0; i < count; i += 10) {
            const x1 = positions[i * 3]!;
            const y1 = positions[i * 3 + 1]!;
            const z1 = positions[i * 3 + 2]!;

            for (let j = i + 1; j < i + 20 && j < count; j++) {
                const x2 = positions[j * 3]!;
                const y2 = positions[j * 3 + 1]!;
                const z2 = positions[j * 3 + 2]!;

                const dist = Math.sqrt(
                    (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2
                );

                if (dist < 0.5) {
                    linePositions.push(x1, y1, z1, x2, y2, z2);
                }
            }
        }

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(linePositions, 3)
        );

        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // =========================
        // SPACE / BACKGROUND PARTICLES
        // =========================
        const spaceCount = 3000;
        const spacePositions: number[] = [];
        const spreadRadius = 20;

        for (let i = 0; i < spaceCount; i++) {
            let x: number, y: number, z: number;

            do {
                x = (Math.random() - 0.5) * spreadRadius * 2;
                y = (Math.random() - 0.5) * spreadRadius * 2;
                z = (Math.random() - 0.5) * spreadRadius * 2;
            } while (Math.sqrt(x * x + y * y + z * z) < radius * 1.5);

            spacePositions.push(x, y, z);
        }

        const spaceGeometry = new THREE.BufferGeometry();
        spaceGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(spacePositions, 3)
        );

        const spaceMaterial = new THREE.PointsMaterial({
            size: 0.025,
            color: "#ffffff",
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const spaceParticles = new THREE.Points(spaceGeometry, spaceMaterial);
        scene.add(spaceParticles);

        // =========================
        // BLOOM POST-PROCESSING
        // =========================
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(mount.clientWidth, mount.clientHeight),
            1.5,
            0.6,
            0.1
        );

        composer.addPass(bloomPass);

        // =========================
        // ANIMATION
        // =========================
        const clock = new THREE.Clock();
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);

            const t = clock.getElapsedTime();

            points.rotation.y += 0.002 * speed;
            points.rotation.x = Math.sin(t * 0.3) * 0.2;
            lines.rotation.copy(points.rotation);

            spaceParticles.rotation.y += 0.0001 * speed;
            spaceParticles.rotation.x += 0.00005 * speed;

            composer.render();
        };

        animate();

        // =========================
        // RESIZE
        // =========================
        const handleResize = () => {
            if (!mount) return;

            const w = mount.clientWidth;
            const h = mount.clientHeight;

            camera.aspect = w / h;
            // Recompute z so the globe stays fully visible at every size
            camera.position.z = fitCameraZ(w, h);
            camera.updateProjectionMatrix();

            renderer.setSize(w, h);
            composer.setSize(w, h);
        };

        window.addEventListener("resize", handleResize);

        // =========================
        // CLEANUP
        // =========================
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);

            renderer.dispose();
            geometry.dispose();
            lineGeometry.dispose();
            spaceGeometry.dispose();
            material.dispose();
            lineMaterial.dispose();
            spaceMaterial.dispose();

            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [radius, count, color, speed]);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 z-0 pointer-events-none"
        />
    );
}