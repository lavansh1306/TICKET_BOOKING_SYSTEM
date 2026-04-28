"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Ticket3D({ frontCanvas }: { frontCanvas?: HTMLCanvasElement | null }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const width = 460;
    const height = 280;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;

    const geometry = new THREE.BoxGeometry(3.6, 2.0, 0.05);

    // front texture
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 340;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#4F46E5";
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Inter";
    ctx.fillText("BOOKING_SYSTEM", 12, 26);
    ctx.fillText("E-TICKET", canvas.width - 80, 26);

    const textureFront = new THREE.CanvasTexture(canvas);
    const materialFront = new THREE.MeshStandardMaterial({ map: textureFront });
    const materialBack = new THREE.MeshStandardMaterial({ color: 0xf5f5f7 });

    const materials = [materialFront, materialBack, new THREE.MeshStandardMaterial({ color: 0xe4e4e7 }), new THREE.MeshStandardMaterial({ color: 0xe4e4e7 }), new THREE.MeshStandardMaterial({ color: 0xe4e4e7 }), new THREE.MeshStandardMaterial({ color: 0xe4e4e7 })];

    const ticket = new THREE.Mesh(geometry, materials);
    scene.add(ticket);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dir1.position.set(2, 2, 2);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x6366f1, 0.2);
    dir2.position.set(-2, -1, 1);
    scene.add(dir2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    let raf = 0;
    function animate() {
      ticket.rotation.y += 0.004;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      geometry.dispose();
      materialFront.dispose();
      materialBack.dispose();
      renderer.dispose();
      controls.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [frontCanvas]);

  return <div ref={mountRef} style={{ width: 460, height: 280 }} />;
}
