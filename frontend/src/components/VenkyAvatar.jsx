import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function VenkyAvatar({
  size = 'lg',
  isListening = false,
  isSpeaking = false,
  getAudioLevel,
  getSpeechMetrics,
  onClick,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ isListening, isSpeaking, getAudioLevel, getSpeechMetrics });
  const [loadFailed, setLoadFailed] = useState(false);

  stateRef.current = { isListening, isSpeaking, getAudioLevel, getSpeechMetrics };

  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'w-10 h-10 rounded-full overflow-hidden shrink-0 border border-amber-500/40 bg-slate-900'
    : 'w-72 h-80 sm:w-80 sm:h-88';

  useEffect(() => {
    if (isSmall || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 352;

    // 1. Transparent WebGL Renderer (Zero background — just the 3D waiter)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene & Direct-Facing Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 20);

    // 3. Warm Luxury Bistro Studio 3-Point Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x1e293b, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.0);
    keyLight.position.set(0.8, 1.6, 2.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.75);
    fillLight.position.set(-1.4, 0.9, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.9);
    rimLight.position.set(0.0, 1.4, -1.8);
    scene.add(rimLight);

    const morphMeshes = [];
    const bones = {};
    const restQuats = {};
    let disposed = false;

    // Helper: compute local quaternion that aims a bone toward a world-space direction
    const setBoneWorldDir = (bone, childBone, targetWorldDir, lerp = 1.0) => {
      if (!bone || !childBone) return;
      bone.updateMatrixWorld(true);
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3();
      bone.getWorldPosition(p1);
      childBone.getWorldPosition(p2);
      const currentDir = p2.sub(p1).normalize();
      const targetDir = targetWorldDir.clone().normalize();
      const worldDelta = new THREE.Quaternion().setFromUnitVectors(currentDir, targetDir);
      const worldQuat = new THREE.Quaternion();
      bone.getWorldQuaternion(worldQuat);
      const newWorldQuat = worldDelta.multiply(worldQuat);
      const parentWorldQuat = new THREE.Quaternion();
      if (bone.parent) {
        bone.parent.getWorldQuaternion(parentWorldQuat);
      }
      const targetLocal = parentWorldQuat.invert().multiply(newWorldQuat);
      if (lerp >= 0.99) {
        bone.quaternion.copy(targetLocal);
      } else {
        bone.quaternion.slerp(targetLocal, lerp);
      }
      bone.updateMatrixWorld(true);
    };

    const loader = new GLTFLoader();
    const texLoader = new THREE.TextureLoader();
    const waiterTex = texLoader.load('/venky_waiter_outfit.png');
    waiterTex.flipY = false;
    waiterTex.colorSpace = THREE.SRGBColorSpace;

    loader.load(
      '/venky_3d.glb',
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        scene.add(model);

        model.traverse((obj) => {
          if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
            morphMeshes.push(obj);
          }
          if (obj.isMesh && obj.name === 'outfit_top' && obj.material) {
            obj.material.map = waiterTex;
            obj.material.roughness = 0.72;
            obj.material.metalness = 0.05;
            obj.material.needsUpdate = true;
          }
          if (obj.isBone) {
            bones[obj.name] = obj;
            restQuats[obj.name] = obj.quaternion.clone();

            // Gently relax/curl fingers so hands look natural instead of stiff
            if (
              (obj.name.includes('Index') ||
                obj.name.includes('Middle') ||
                obj.name.includes('Ring') ||
                obj.name.includes('Pinky')) &&
              (obj.name.endsWith('1') || obj.name.endsWith('2') || obj.name.endsWith('3'))
            ) {
              obj.rotation.x += 0.28;
            }
          }
        });

        // Set initial polite waiter stance
        model.updateMatrixWorld(true);
        setBoneWorldDir(bones.LeftArm, bones.LeftForeArm, new THREE.Vector3(0.22, -0.94, 0.24), 1.0);
        setBoneWorldDir(bones.RightArm, bones.RightForeArm, new THREE.Vector3(-0.22, -0.94, 0.24), 1.0);
        setBoneWorldDir(bones.LeftForeArm, bones.LeftHand, new THREE.Vector3(-0.35, -0.45, 0.82), 1.0);
        setBoneWorldDir(bones.RightForeArm, bones.RightHand, new THREE.Vector3(0.35, -0.45, 0.82), 1.0);

        // Save base wrist quaternions for expressive palm gestures
        if (bones.LeftHand) restQuats.LeftHandBase = bones.LeftHand.quaternion.clone();
        if (bones.RightHand) restQuats.RightHandBase = bones.RightHand.quaternion.clone();

        // Frame head, burgundy bow tie, waistcoat, VENKY tag, and expressive waiter hands
        const headObj = model.getObjectByName('AvatarHead') || model;
        const box = new THREE.Box3().setFromObject(headObj);
        const center = new THREE.Vector3();
        const boxSize = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(boxSize);

        const targetY = center.y - boxSize.y * 0.42;
        camera.position.set(center.x, center.y - boxSize.y * 0.05, boxSize.y * 4.35);
        camera.lookAt(center.x, targetY, center.z);
      },
      undefined,
      (err) => {
        console.warn('3D avatar load failed, falling back to cutout:', err);
        if (!disposed) setLoadFailed(true);
      }
    );

    const setMorph = (name, value, lerp = 0.35) => {
      for (let i = 0; i < morphMeshes.length; i++) {
        const mesh = morphMeshes[i];
        const idx = mesh.morphTargetDictionary[name];
        if (idx !== undefined) {
          const cur = mesh.morphTargetInfluences[idx] || 0;
          mesh.morphTargetInfluences[idx] = cur + (value - cur) * lerp;
        }
      }
    };

    let animId;
    let smoothOpen = 0;
    let smoothSpread = 0;
    let avgFloor = 0.08;
    let nextBlinkTime = performance.now() + 2500;
    let blinkProgress = -1;

    const animate = (now) => {
      if (disposed) return;

      const {
        isListening: listening,
        isSpeaking: speaking,
        getAudioLevel: readLevel,
        getSpeechMetrics: readMetrics,
      } = stateRef.current;

      // 1. Real-time Speech Energy & Formants for 3D ARKit / Oculus Visemes
      let targetOpen = 0;
      let targetSpread = 0;

      if (speaking && !listening) {
        const metrics = readMetrics ? readMetrics() : { open: 0, spread: 0 };
        const liveLevel = readLevel ? readLevel() : 0;
        const rawEnergy = Math.max(metrics.open, liveLevel);

        if (rawEnergy > 0.02) {
          avgFloor += (rawEnergy * 0.4 - avgFloor) * 0.08;
          const burst = Math.max(0, rawEnergy - avgFloor);
          targetOpen = Math.min(1, burst * 1.55);
          targetSpread = metrics.spread;
        } else {
          const t = now * 0.001;
          const syl = Math.max(0, Math.sin(t * 14.5) * 0.55 + Math.sin(t * 23.0) * 0.25 + 0.14);
          const gate = Math.sin(t * 2.3) > -0.55 ? 1 : 0;
          targetOpen = Math.min(0.85, syl * gate);
          targetSpread = 0.45 + 0.4 * Math.sin(t * 9.2);
        }
      } else {
        avgFloor = 0.08;
      }

      smoothOpen += (targetOpen - smoothOpen) * (targetOpen > smoothOpen ? 0.48 : 0.3);
      smoothSpread += (targetSpread - smoothSpread) * 0.28;

      // 2. Natural Eye Blinking (Every 3.0 - 4.8s)
      let blinkVal = 0;
      if (now >= nextBlinkTime && blinkProgress < 0) {
        blinkProgress = 0;
      }
      if (blinkProgress >= 0) {
        blinkProgress += 0.16;
        if (blinkProgress >= 2) {
          blinkProgress = -1;
          nextBlinkTime = now + 3000 + Math.random() * 1800;
        } else {
          blinkVal = blinkProgress <= 1 ? blinkProgress : 2 - blinkProgress;
        }
      }

      const t = now * 0.001;

      if (morphMeshes.length > 0) {
        const isTalking = speaking && !listening && smoothOpen > 0.03;
        const roundness = isTalking ? Math.max(0, 0.5 - smoothSpread) * 1.4 : 0;
        const wideness = isTalking ? Math.max(0, smoothSpread - 0.35) * 1.4 : 0;

        setMorph('jawOpen', isTalking ? smoothOpen * 0.42 : 0, 0.45);
        setMorph('viseme_aa', isTalking ? smoothOpen * 0.55 * (1 - roundness * 0.5) : 0, 0.42);
        setMorph('viseme_O', isTalking ? smoothOpen * roundness * 0.65 : 0, 0.38);
        setMorph('viseme_E', isTalking ? smoothOpen * wideness * 0.55 : 0, 0.38);
        setMorph('viseme_I', isTalking ? smoothOpen * wideness * 0.3 : 0, 0.38);
        setMorph('viseme_PP', speaking && !listening && smoothOpen <= 0.03 ? 0.25 : 0, 0.35);

        const smileAmt = listening ? 0.22 : isTalking ? 0.24 + smoothOpen * 0.08 : 0.34;
        setMorph('mouthSmileLeft', smileAmt, 0.14);
        setMorph('mouthSmileRight', smileAmt, 0.14);
        setMorph('cheekSquintLeft', smileAmt * 0.35, 0.14);
        setMorph('cheekSquintRight', smileAmt * 0.35, 0.14);

        const browLift = isTalking ? 0.12 + smoothOpen * 0.22 + Math.sin(t * 3.1) * 0.05 : listening ? 0.18 : 0.06;
        setMorph('browInnerUp', browLift, 0.15);
        setMorph('browOuterUpLeft', browLift * 0.6, 0.15);
        setMorph('browOuterUpRight', browLift * 0.6, 0.15);

        setMorph('eyeBlinkLeft', blinkVal, 0.85);
        setMorph('eyeBlinkRight', blinkVal, 0.85);

        const lookDown = listening ? 0.38 : 0;
        setMorph('eyeLookDownLeft', lookDown, 0.16);
        setMorph('eyeLookDownRight', lookDown, 0.16);
      }

      // 3. Natural Waiter Hand & Arm Gestures (Head stays steady while talking)
      if (bones.LeftArm && bones.RightArm && bones.LeftForeArm && bones.RightForeArm) {
        if (listening) {
          // Order-taking posture: left hand holds pad at chest, right hand writes smoothly
          const writeWave = Math.sin(t * 6.5) * 0.05;
          setBoneWorldDir(bones.LeftArm, bones.LeftForeArm, new THREE.Vector3(0.26, -0.88, 0.38), 0.1);
          setBoneWorldDir(bones.RightArm, bones.RightForeArm, new THREE.Vector3(-0.26, -0.88, 0.38), 0.1);
          setBoneWorldDir(bones.LeftForeArm, bones.LeftHand, new THREE.Vector3(-0.42, 0.15, 0.90), 0.1);
          setBoneWorldDir(bones.RightForeArm, bones.RightHand, new THREE.Vector3(0.32 + writeWave, 0.22 + writeWave * 0.6, 0.92), 0.14);
        } else if (speaking) {
          // Expressive open-palm conversational waiter gestures synced with speech
          const gestureA = Math.sin(t * 2.2) * (0.12 + smoothOpen * 0.16);
          const gestureB = Math.cos(t * 1.7) * (0.08 + smoothOpen * 0.12);
          setBoneWorldDir(bones.LeftArm, bones.LeftForeArm, new THREE.Vector3(0.24, -0.92, 0.28), 0.08);
          setBoneWorldDir(bones.RightArm, bones.RightForeArm, new THREE.Vector3(-0.28, -0.90, 0.32), 0.08);
          setBoneWorldDir(
            bones.LeftForeArm,
            bones.LeftHand,
            new THREE.Vector3(-0.28 + gestureB * 0.4, -0.25 + gestureB, 0.92),
            0.1
          );
          setBoneWorldDir(
            bones.RightForeArm,
            bones.RightHand,
            new THREE.Vector3(0.18 + gestureA * 0.6, 0.05 + gestureA, 0.96),
            0.12
          );
        } else {
          // Polite relaxed waiter stance (hands resting neatly in front)
          const idleSway = Math.sin(t * 1.1) * 0.025;
          setBoneWorldDir(bones.LeftArm, bones.LeftForeArm, new THREE.Vector3(0.22, -0.94, 0.24), 0.07);
          setBoneWorldDir(bones.RightArm, bones.RightForeArm, new THREE.Vector3(-0.22, -0.94, 0.24), 0.07);
          setBoneWorldDir(bones.LeftForeArm, bones.LeftHand, new THREE.Vector3(-0.38, -0.42 + idleSway, 0.82), 0.07);
          setBoneWorldDir(bones.RightForeArm, bones.RightHand, new THREE.Vector3(0.38, -0.42 - idleSway, 0.82), 0.07);
        }
      }

      // Gentle wrist turn so palms feel open & welcoming during speech
      if (bones.RightHand && restQuats.RightHandBase) {
        const palmTurn = speaking && !listening ? 0.35 + Math.sin(t * 2.2) * 0.15 : 0.1;
        const targetWrist = restQuats.RightHandBase.clone().multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, palmTurn, 0.12))
        );
        bones.RightHand.quaternion.slerp(targetWrist, 0.1);
      }

      // Attentive downward head pitch only while taking down order
      if (bones.Head) {
        const targetPitch = listening ? 0.16 : 0;
        bones.Head.rotation.x += (targetPitch - bones.Head.rotation.x) * 0.12;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 352;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      waiterTex.dispose();
      renderer.dispose();
    };
  }, [isSmall]);

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${sizeClasses} cursor-pointer`}
      style={
        !isSmall
          ? {
              WebkitMaskImage: 'linear-gradient(to bottom, black 84%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 84%, transparent 100%)',
            }
          : undefined
      }
    >
      {isSmall || loadFailed ? (
        <img
          src={isListening ? '/venky_writing_cutout.png' : '/venky_cutout.png'}
          alt="Waiter Venky"
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}
    </div>
  );
}

export default VenkyAvatar;
