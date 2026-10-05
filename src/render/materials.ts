// The stage's materials and lights (P36). Depth is drawn four ways: solid structures are lit by
// a lamp that travels with the camera, so a tube reads as round; they write depth, so the near
// one hides the far one; a fog in the stage's own colour fades what is farther away; and the
// shells — the cord, the lobes — are glass, bright at the silhouette and clear face-on.
// Nothing here decides a finding.
import * as THREE from 'three';

/** A flat, unlit tint: for highlights that should not be shaded — the lesion, a slice. */
export const basic = (color: string, opacity: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });

/**
 * A lit surface. The emissive floor keeps the unlit side from going black on the dark stage.
 */
export const lit = (color: string, opacity = 1): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.12,
    roughness: 0.42,
    metalness: 0,
    // A solid one hides what is behind it; a see-through one is drawn over it instead, because
    // see-through things that write depth hide each other in whatever order they happen to draw.
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
  });

/** Recolours a lit mark — its surface and its emissive floor together — and sets how solid it is. */
export function tint(mesh: THREE.Mesh, color: string, opacity: number): void {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  mat.color.set(color);
  mat.emissive.set(color);
  mat.opacity = opacity;
}

/**
 * Glass: nearly clear where the surface faces the camera, brighter toward its edge (a Fresnel
 * rim), so a shell reads as a volume. `face` is the opacity face-on, `rim` at the silhouette.
 */
export function glass(color: string, face: number, rim: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uFace: { value: face }, uRim: { value: rim } },
    vertexShader: `
      #include <clipping_planes_pars_vertex>
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }`,
    fragmentShader: `
      #include <clipping_planes_pars_fragment>
      uniform vec3 uColor;
      uniform float uFace;
      uniform float uRim;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        #include <clipping_planes_fragment>
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        float edge = pow(1.0 - facing, 2.2);
        gl_FragColor = vec4(uColor, mix(uFace, uRim, edge));
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    clipping: true,
  });
}

export type Stage = {
  /**
   * Call each frame with the camera's distance from what it looks at, and — when the camera looks
   * down the cord — the height of the slice, above which everything is cut away; otherwise null.
   */
  update(radius: number, cutAbove: number | null): void;
};

/**
 * Lights and fog. The key lamp is fixed to the camera, up and to the left, so shading stays
 * readable from every station; the hemisphere light fills from above. The fog's range follows
 * the camera's distance, so depth fades the same way in a close view and a far one.
 */
export function buildStage(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, stageColour: string): Stage {
  const fog = new THREE.Fog(stageColour, 1, 100);
  scene.fog = fog;
  scene.add(new THREE.HemisphereLight(0xffffff, stageColour, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 3.0);
  key.position.set(-0.7, 0.9, 0.4);
  key.target.position.set(0, 0, -1);
  camera.add(key, key.target);
  scene.add(camera);
  // Looking down the cord, the solid tracts above the slice would stand between the camera and the
  // cross-section. The view becomes a cut-away: one plane removes everything above the slice.
  const cut = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const cutting = [cut];
  const open: THREE.Plane[] = [];
  return {
    update(radius, cutAbove) {
      fog.near = radius - Math.max(1.2, radius * 0.2);
      fog.far = radius + Math.max(6, radius * 0.7);
      if (cutAbove === null) {
        renderer.clippingPlanes = open;
      } else {
        cut.constant = cutAbove;
        renderer.clippingPlanes = cutting;
      }
    },
  };
}
