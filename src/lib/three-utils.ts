/**
 * three-utils.ts — Three.js 通用辅助
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/** 幂等配置贴图色彩空间与过滤（three r152+ map 贴图必须 sRGB，否则发暗失真） */
function configureSRGB(tex: THREE.Texture): void {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
}

/**
 * useTexture + sRGB 色彩空间与各项异性过滤。
 */
export function useSRGBTexture(url: string): THREE.Texture {
  const tex = useTexture(url);
  useEffect(() => configureSRGB(tex), [tex]);
  return tex;
}

/** 由 RingGeometry 构建"径向条带采样"的环几何（UV.x = 归一化半径），供土星环贴图使用 */
export function buildRingGeometry(inner: number, outer: number, segments = 128): THREE.RingGeometry {
  const geo = new THREE.RingGeometry(inner, outer, segments, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 1);
  }
  return geo;
}
