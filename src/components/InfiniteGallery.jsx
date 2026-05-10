import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────────────
   3D Infinite Gallery — ported from TypeScript to plain JS.
   Images fly toward the camera in a tunnel; scroll/wheel controls speed.
───────────────────────────────────────────────────────────────────────────── */

const DEFAULT_DEPTH_RANGE      = 50;
const MAX_HORIZONTAL_OFFSET    = 8;
const MAX_VERTICAL_OFFSET      = 8;

function createClothMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map:         { value: null },
      opacity:     { value: 1.0 },
      blurAmount:  { value: 0.0 },
      scrollForce: { value: 0.0 },
      time:        { value: 0.0 },
      isHovered:   { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = sin(wavePhase) * 0.1 * dampening;
          flagWave += sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
        }
        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(map, vUv);
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
}

function ImagePlane({ texture, position, scale, material }) {
  const meshRef    = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (material && texture) material.uniforms.map.value = texture;
  }, [material, texture]);

  useEffect(() => {
    if (material?.uniforms) material.uniforms.isHovered.value = hovered ? 1.0 : 0.0;
  }, [material, hovered]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      material={material}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
    </mesh>
  );
}

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 8,
  fadeSettings = {
    fadeIn:  { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4,  end: 0.43 },
  },
  blurSettings = {
    blurIn:  { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}) {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [autoPlay, setAutoPlay]             = useState(true);
  const lastInteraction                     = useRef(Date.now());

  const textures = useTexture(images.map((img) => (typeof img === "string" ? img : img.src)));

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  );

  const spatialPositions = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, i) => {
      const hAngle = (i * 2.618) % (Math.PI * 2);
      const vAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const hR = (i % 3) * 1.2;
      const vR = ((i + 1) % 4) * 0.8;
      return {
        x: (Math.sin(hAngle) * hR * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(vAngle) * vR * MAX_VERTICAL_OFFSET)   / 4,
      };
    });
  }, [visibleCount]);

  const depthRange  = DEFAULT_DEPTH_RANGE;
  const totalImages = images.length;

  const planesData = useRef(
    Array.from({ length: visibleCount }, (_, i) => ({
      index:      i,
      z:          visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x:          spatialPositions[i]?.x ?? 0,
      y:          spatialPositions[i]?.y ?? 0,
    }))
  );

  /* wheel */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScrollVelocity((p) => p + e.deltaY * 0.01 * speed);
    setAutoPlay(false);
    lastInteraction.current = Date.now();
  }, [speed]);

  /* keyboard */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      setScrollVelocity((p) => p - 2 * speed);
      setAutoPlay(false);
      lastInteraction.current = Date.now();
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      setScrollVelocity((p) => p + 2 * speed);
      setAutoPlay(false);
      lastInteraction.current = Date.now();
    }
  }, [speed]);

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        canvas.removeEventListener("wheel", handleWheel);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleWheel, handleKeyDown]);

  /* auto-play resume */
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastInteraction.current > 3000) setAutoPlay(true);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useFrame((state, delta) => {
    if (autoPlay) setScrollVelocity((p) => p + 0.3 * delta);
    setScrollVelocity((p) => p * 0.95);

    const time = state.clock.getElapsedTime();
    materials.forEach((mat) => {
      if (mat?.uniforms) {
        mat.uniforms.time.value        = time;
        mat.uniforms.scrollForce.value = scrollVelocity;
      }
    });

    const imageAdvance = totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
    const halfRange    = depthRange / 2;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + scrollVelocity * delta * 10;
      let wrapsF = 0, wrapsB = 0;
      if (newZ >= depthRange) { wrapsF = Math.floor(newZ / depthRange); newZ -= depthRange * wrapsF; }
      else if (newZ < 0)      { wrapsB = Math.ceil(-newZ / depthRange); newZ += depthRange * wrapsB; }

      if (wrapsF > 0 && imageAdvance > 0 && totalImages > 0)
        plane.imageIndex = (plane.imageIndex + wrapsF * imageAdvance) % totalImages;
      if (wrapsB > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsB * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % depthRange) + depthRange) % depthRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const norm = plane.z / depthRange;
      let opacity = 1;
      if      (norm < fadeSettings.fadeIn.start)  opacity = 0;
      else if (norm <= fadeSettings.fadeIn.end)   opacity = (norm - fadeSettings.fadeIn.start) / (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      else if (norm >= fadeSettings.fadeOut.end)  opacity = 0;
      else if (norm >= fadeSettings.fadeOut.start) opacity = 1 - (norm - fadeSettings.fadeOut.start) / (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
      opacity = Math.max(0, Math.min(1, opacity));

      let blur = 0;
      if      (norm < blurSettings.blurIn.start)  blur = blurSettings.maxBlur;
      else if (norm <= blurSettings.blurIn.end)   blur = blurSettings.maxBlur * (1 - (norm - blurSettings.blurIn.start) / (blurSettings.blurIn.end - blurSettings.blurIn.start));
      else if (norm >= blurSettings.blurOut.end)  blur = blurSettings.maxBlur;
      else if (norm >= blurSettings.blurOut.start) blur = blurSettings.maxBlur * ((norm - blurSettings.blurOut.start) / (blurSettings.blurOut.end - blurSettings.blurOut.start));
      blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

      const mat = materials[i];
      if (mat?.uniforms) {
        mat.uniforms.opacity.value    = opacity;
        mat.uniforms.blurAmount.value = blur;
      }
    });
  });

  if (!images.length) return null;

  return (
    <>
      {planesData.current.map((plane, i) => {
        const texture  = textures[plane.imageIndex];
        const material = materials[i];
        if (!texture || !material) return null;
        const aspect = texture.image ? texture.image.width / texture.image.height : 1;
        const scale  = aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
        return (
          <ImagePlane
            key={plane.index}
            texture={texture}
            position={[plane.x, plane.y, plane.z - depthRange / 2]}
            scale={scale}
            material={material}
          />
        );
      })}
    </>
  );
}

function FallbackGallery({ images }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8"
      style={{ background: "#141410" }}>
      <p className="text-white/40 text-sm mb-6 uppercase tracking-widest">Gallery</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto w-full">
        {images.map((img, i) => (
          <img key={i} src={typeof img === "string" ? img : img.src}
            alt={typeof img === "string" ? "" : img.alt}
            className="w-full h-32 object-cover rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  speed = 1,
  visibleCount = 10,
  className = "h-screen w-full",
  style,
  fadeSettings,
  blurSettings,
}) {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    try {
      const c  = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) setWebglOk(false);
    } catch (_) { setWebglOk(false); }
  }, []);

  if (!webglOk) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas camera={{ position: [0, 0, 0], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <GalleryScene
          images={images}
          speed={speed}
          visibleCount={visibleCount}
          fadeSettings={fadeSettings}
          blurSettings={blurSettings}
        />
      </Canvas>
    </div>
  );
}
