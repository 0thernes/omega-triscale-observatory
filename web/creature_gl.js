/* ============================================================================
 * OMEGA 4-TIER OBSERVATORY — TIER 3 BIOPHYSICAL WEBGL2 MULTI-SHADER SPECIMEN ENGINE
 * Pure GLSL ES 3.00 (Zero Dependencies)
 *
 * Hard-wired honestly to real live 4-tier telemetry:
 *   - Real 48x48 octahedral base + spikes GPU texture from az_live TYPE.SHAPES
 *   - Real 112x1 RGBA8 GPU texture: R=T1 DNA traits112, G=T2 Cells traits112,
 *     B=signed Δ112, A=spatial gradient dΔ/di
 *   - Morphing 3D vertex geometry driven by Body Parts, Units, Energy, Health,
 *     T2 GRN fates, T2 GHz microtubules, T2 CPG pulses & T4 local temperature
 *   - 12 Biophysical Multi-Shader & Extreme Cellular Geometry Modes (0=Auto + 1..11:
 *     Bio-Chitin Voronoi, Neural X-Ray, Turing Chromatophore, Vent Crystal, Δ112 Manifold,
 *     Nacre Opal, Abyssal Protoplasm, Silica Diatom Frustule, Levin Bioelectric Vmem,
 *     Coenocyte Syncytium, Haloquadratum Square / Warnowiid Ocelloid)
 *   - Count-Driven 3D Internal Organ & Neural Projection synthesized inside the body cavity
 *     from exact live scalar counts (`parts`, `neurons`, `tiles`, `T2 active_axons`, `T2 CPG`;
 *     note: Asmodensius-Native /api/inspect exports anatomy counts, not per-organ 3D coordinates)
 * ============================================================================ */

const SKIN_VERT = `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec3 aNormal;

uniform mat4 uViewProj;
uniform mat3 uRot;
uniform highp sampler2D uOctTex;     // 48x48 RG8: R=base radius, G=spike height
uniform highp sampler2D uTraitsTex;  // 112x1 RGBA8: R=T1 DNA, G=T2 Cells, B=delta, A=grad
uniform float uTime;
uniform float uElong;
uniform float uSpike;
uniform float uMorphAmt;             // 0..2 cellular/organ morphing amplitude
uniform int   uShaderMode;           // 0..11 (modes 8..11 also apply extreme cellular vertex morphs!)
uniform vec4  uBio0;                 // x=partsNorm, y=neuronsNorm, z=energyNorm, w=healthNorm
uniform vec4  uBio1;                 // x=ghzNorm, y=cpgPhase, z=tempNorm, w=solventPhase/3
uniform vec4  uGrn;                  // x=ecto, y=neural, z=muscle, w=gut

out vec3 vWorldPos;
out vec3 vWorldNorm;
out vec3 vLocalDir;
out vec3 vLocalPos;
out float vDisp;
out float vSpikeVal;
out float vTraitSample;

vec2 octUv(vec3 n) {
  vec3 a = abs(n);
  float s = a.x + a.y + a.z + 1e-6;
  vec2 o = n.xy / s;
  if (n.z < 0.0) {
    o = (1.0 - abs(o.yx)) * vec2(o.x >= 0.0 ? 1.0 : -1.0, o.y >= 0.0 ? 1.0 : -1.0);
  }
  return o * 0.5 + 0.5;
}

float evalRadius(vec3 n, out float spkOut, out float tSamp) {
  vec2 uv = (0.5 + 47.0 * octUv(n)) / 48.0;
  vec2 rg = textureLod(uOctTex, uv, 0.0).rg;
  spkOut = rg.g;
  float baseR = 0.36 + 1.40 * rg.r + uSpike * rg.g;

  // Map 3D direction onto the 112-trait differential vector
  float tIdx = fract(atan(n.y, n.x) / 6.2831853 + 0.5 + n.z * 0.31);
  vec4 tr = textureLod(uTraitsTex, vec2(tIdx, 0.5), 0.0);
  float signedDelta = (tr.b - 0.5) * 2.0;
  tSamp = signedDelta;

  if (uMorphAmt <= 0.001) return baseR;

  // Hard-wired live cellular & organ morphing (like living cells!)
  float lobeFreq = 2.0 + floor(uBio0.x * 6.0);                       // Body parts -> segmentation lobes
  float segWave  = sin(n.x * lobeFreq * 3.14159 - uTime * 1.4) * (0.045 + 0.055 * uGrn.z);
  float cpgPulse = sin(n.x * 5.2 - uBio1.y * 6.2831853) * (0.03 + 0.04 * uGrn.y);
  float breath   = sin(uTime * (1.5 + uBio0.z * 2.2)) * 0.032;
  float mtRipple = sin((n.x * 7.0 + n.y * 9.0 + n.z * 6.0) - uTime * (3.5 + uBio1.x * 4.5)) * (0.015 + 0.025 * uBio1.x);
  float amoeboid = sin(n.y * 4.0 + uTime * 1.1) * cos(n.z * 4.0 - uTime * 0.9) * (0.035 + 0.045 * uGrn.w);
  float traitFold = signedDelta * 0.065;
  // Thermal stress tightens/sharpens membrane ridges
  float thermalPinch = (uBio1.z - 0.5) * 0.06 * cos(n.z * 9.0 + uTime * 1.8);

  // Extreme Cellular Geometry Morphs (Modes 8..11: Diatom Frustule, Bioelectric Dipole, Coenocyte, Haloquadratum Square)
  float extremeDisp = 0.0;
  if (uShaderMode == 8) {
    // Silica Diatom Frustule & Radiolarian radial ribs + equatorial girdle band
    float ang = atan(n.y, n.x);
    float ribs = 0.095 * cos(ang * 12.0) * (1.0 - abs(n.z)) + 0.06 * cos(n.z * 14.0);
    extremeDisp = ribs;
  } else if (uShaderMode == 9) {
    // Levin Bioelectric Vmem anterior/posterior head-pole swelling
    extremeDisp = 0.08 * pow(abs(n.x), 3.0) * (0.7 + 0.3 * sin(uTime * 3.2));
  } else if (uShaderMode == 10) {
    // Multinucleate Coenocyte / Syncytium streaming membrane lobes
    extremeDisp = 0.09 * sin(n.x * 4.5 + uTime * 1.7) * cos(n.y * 5.0 - uTime * 1.3);
  }

  float deltaR = (segWave + cpgPulse + breath + mtRipple + amoeboid + traitFold + thermalPinch + extremeDisp) * uMorphAmt;
  return max(0.18, baseR + deltaR);
}

vec3 morphPos(vec3 n, out float rOut, out float spkOut, out float tSamp) {
  rOut = evalRadius(n, spkOut, tSamp);
  float invE13 = pow(max(0.45, uElong), -0.3333333);
  vec3 pos = vec3(n.x * uElong, n.y, n.z) * (rOut * invE13 * 0.68);
  if (uShaderMode == 11 && uMorphAmt > 0.001) {
    // Haloquadratum flat-square lamellar cell morph (superquadric plate compression!)
    float k = min(1.0, uMorphAmt * 0.78);
    vec3 sq = sign(n) * pow(abs(n) + vec3(1e-4), vec3(0.42)) * vec3(1.18, 1.18, 0.24);
    pos = mix(pos, sq * (0.78 * rOut), k);
  }
  return pos;
}

void main() {
  vec3 n = normalize(aNormal);
  float r0, spk0, t0;
  vec3 p0 = morphPos(n, r0, spk0, t0);

  // Finite-difference tangent basis for accurate morphed surface normals!
  vec3 upRef = abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tan1 = normalize(cross(upRef, n));
  vec3 tan2 = cross(n, tan1);
  float eps = 0.035;
  float r1, s1, t1, r2, s2, t2;
  vec3 p1 = morphPos(normalize(n + tan1 * eps), r1, s1, t1);
  vec3 p2 = morphPos(normalize(n + tan2 * eps), r2, s2, t2);
  vec3 localNorm = normalize(cross(p1 - p0, p2 - p0));
  if (dot(localNorm, n) < 0.0) localNorm = -localNorm;

  vec3 wp = uRot * p0;
  vWorldPos = wp;
  vWorldNorm = normalize(uRot * localNorm);
  vLocalDir = n;
  vLocalPos = p0;
  vDisp = r0;
  vSpikeVal = spk0;
  vTraitSample = t0;

  gl_Position = uViewProj * vec4(wp, 1.0);
}
`;

const SKIN_FRAG = `#version 300 es
precision highp float;
precision highp int;

in vec3 vWorldPos;
in vec3 vWorldNorm;
in vec3 vLocalDir;
in vec3 vLocalPos;
in float vDisp;
in float vSpikeVal;
in float vTraitSample;

uniform highp sampler2D uTraitsTex;
uniform float uTime;
uniform int   uShaderMode; // 0=Auto, 1=Bio-Chitin, 2=Neural X-Ray, 3=Turing Skin, 4=Vent Crystal, 5=Δ112 Manifold
uniform vec3  uSunDir;
uniform vec3  uEyePos;
uniform vec4  uLook;       // x=hue(0..1), y=sat, z=pattern(0..255), w=glow
uniform vec4  uLook2;      // x=sheen, y=cladeHash(0..1), z=genesNorm, w=xrayAlpha
uniform vec4  uBio0;       // x=partsNorm, y=neuronsNorm, z=energyNorm, w=healthNorm
uniform vec4  uBio1;       // x=ghzNorm, y=cpgPhase, z=tempNorm, w=solventPhase/3
uniform vec4  uGrn;        // x=ecto, y=neural, z=muscle, w=gut

out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

// Fast 3D hash & smooth value noise for procedural multi-skins
float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i+vec3(0,0,0)), hash31(i+vec3(1,0,0)), f.x),
        mix(hash31(i+vec3(0,1,0)), hash31(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i+vec3(0,0,1)), hash31(i+vec3(1,0,1)), f.x),
        mix(hash31(i+vec3(0,1,1)), hash31(i+vec3(1,1,1)), f.x), f.y), f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise3(p);
    p = p * 2.04 + vec3(13.7, -9.1, 7.3);
    a *= 0.5;
  }
  return v;
}

// 3D Cellular Voronoi distance for scales / epithelial cells
vec2 voronoi3(vec3 x) {
  vec3 n = floor(x), f = fract(x);
  float d1 = 8.0, d2 = 8.0;
  for (int k = -1; k <= 1; k++)
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++) {
    vec3 g = vec3(float(i), float(j), float(k));
    vec3 o = vec3(hash31(n+g), hash31(n+g+17.1), hash31(n+g+43.7));
    vec3 r = g + (0.5 + 0.42 * sin(uTime * 0.7 + 6.2831 * o)) - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; }
    else if (d < d2) { d2 = d; }
  }
  return vec2(sqrt(d1), sqrt(d2) - sqrt(d1)); // x=cell center, y=ridge edge!
}

// Spectral thin-film interference color (physically motivated soap/beetle iridescence)
vec3 thinFilm(float ndv, float thickness) {
  float phase = 6.28318 * (1.8 * thickness * sqrt(max(0.05, 1.0 - 0.5 * (1.0 - ndv * ndv))));
  return 0.52 + 0.48 * cos(phase + vec3(0.0, 2.094, 4.188));
}

void main() {
  vec3 N = normalize(vWorldNorm);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(uEyePos - vWorldPos);
  vec3 L = normalize(uSunDir);
  vec3 L2 = normalize(vec3(-0.6, 0.7, 0.5));
  float ndl = max(0.0, dot(N, L));
  float ndl2 = max(0.0, dot(N, L2));
  float ndv = max(0.001, dot(N, V));
  float fresnel = pow(1.0 - ndv, 2.8);

  float baseHue = uLook.x;
  float pat = uLook.z;
  float patType = floor(pat / 64.0); // 0..3 native pattern class
  float patFreq = 3.0 + mod(floor(pat / 8.0), 8.0);
  float cladeSeed = uLook2.y;

  // Harmonious triadic/analogous multi-pigment palette honestly derived from genome hue + clade + GRN
  vec3 colPrimary = hsv2rgb(vec3(baseHue, 0.58 + 0.34 * uLook.y, 0.86));
  vec3 colAccent  = hsv2rgb(vec3(fract(baseHue + 0.24 + 0.18 * cladeSeed), 0.72, 0.94));
  vec3 colBioGlow = hsv2rgb(vec3(fract(baseHue + 0.52 + 0.14 * uBio1.w), 0.88, 1.0));

  // Sample live 112-trait differential vector across the body longitude
  float tU = fract(atan(vLocalDir.y, vLocalDir.x) / 6.2831853 + 0.5);
  vec4 tr = texture(uTraitsTex, vec2(tU, 0.5));
  float tDna = tr.r, tCell = tr.g, tDelta = (tr.b - 0.5) * 2.0, tGrad = (tr.a - 0.5) * 2.0;

  // Determine active shader style (Mode 0 auto-selects honestly across all 11 skins from live genome/organ/env/GHz!)
  int mode = uShaderMode;
  if (mode == 0) {
    if (uBio1.z > 0.72) mode = 4;                        // High local temp / vent -> Vent Crystal
    else if (uBio0.y > 0.62 && patType == 2.0) mode = 9; // High neurons + pattern 2 -> Levin Bioelectric Vmem
    else if (uBio0.y > 0.48 && patType == 2.0) mode = 2; // Neural X-Ray
    else if (patType == 1.0 && cladeSeed > 0.55) mode = 8; // Silica Diatom Frustule
    else if (patType == 1.0) mode = 3;                   // Turing Chromatophore
    else if (patType == 3.0 && uBio1.x > 0.45) mode = 10;// Multinucleate Coenocyte Syncytium
    else if (patType == 3.0) mode = 5;                   // Δ112 Spectral Manifold
    else if (cladeSeed > 0.78) mode = 11;                // Haloquadratum / Ocelloid Eye
    else if (cladeSeed > 0.58) mode = 6;                 // Prismatic Nacreous Opal
    else if (uGrn.w > 0.34) mode = 7;                    // Globular Protoplasm
    else mode = 1;                                       // Iridescent Bio-Chitin + Scales
  }

  vec3 albedo = colPrimary;
  vec3 emissive = vec3(0.0);
  float specPow = 24.0;
  float specStr = 0.35 + 0.45 * uLook2.x;
  float alpha = 1.0;

  // Procedural multi-textures shared across modes
  vec3 q = vLocalDir * (3.2 + 2.2 * uBio0.x);
  vec2 vor = voronoi3(q + vec3(0.0, 0.0, uTime * 0.08));
  float cellEdge = smoothstep(0.03, 0.16, vor.y);
  float warp = fbm(vLocalDir * 3.8 + vec3(uTime * 0.16, -uTime * 0.12, cladeSeed * 9.0));

  if (mode == 1) {
    // 1. IRIDESCENT BIO-CHITIN & VORONOI CELLULAR SCALES
    vec3 irid = thinFilm(ndv, 1.4 + 1.8 * vDisp + 0.9 * warp + uLook2.x);
    albedo = mix(colPrimary, colAccent, smoothstep(0.35, 0.72, warp));
    albedo = mix(albedo * 0.55, albedo, cellEdge);
    albedo = mix(albedo, irid, 0.38 + 0.32 * fresnel + 0.20 * vSpikeVal);
    // Bioluminescent cellular pore margins driven by GHz microtubules + CPG
    float poreGlow = (1.0 - cellEdge) * (0.35 + 0.65 * sin(uTime * 3.2 - vLocalDir.x * 6.0) * 0.5 + 0.5);
    emissive = colBioGlow * poreGlow * (0.28 + 0.55 * uBio1.x);
    specPow = 44.0;
    specStr = 0.65 + 0.35 * uLook2.x;
  } else if (mode == 2) {
    // 2. TRANSLUCENT BIO-GLASS & INTERNAL ORGAN / NEURAL X-RAY
    vec3 sss = mix(colPrimary, colBioGlow, 0.55) * (0.35 + 0.65 * pow(1.0 - ndv, 1.6));
    float vein = smoothstep(0.46, 0.52, abs(sin(vLocalDir.x * 9.0 + warp * 5.0 - uTime * 2.2)));
    albedo = mix(colPrimary * 0.65, colAccent, warp);
    emissive = sss * 0.55 + colBioGlow * (1.0 - vein) * (0.45 + 0.55 * uBio0.y);
    alpha = clamp(0.30 + 0.58 * fresnel + 0.12 * (1.0 - cellEdge), 0.24, 0.92);
    specPow = 64.0;
    specStr = 0.85;
  } else if (mode == 3) {
    // 3. REACTION-DIFFUSION TURING & CEPHALOPOD CHROMATOPHORE SKIN
    vec3 wq = vLocalDir * (patFreq * 1.15) + vec3(warp * 2.4, -warp * 1.9, uTime * 0.25);
    float turing = sin(wq.x * 3.1) * cos(wq.y * 3.1) + sin(wq.z * 3.4 + uBio1.y * 6.283);
    float band = smoothstep(-0.35, 0.35, turing);
    float margin = 1.0 - smoothstep(0.0, 0.22, abs(turing));
    // Chromatophore live pulse modulated by Energy & Wnt/BMP/Shh GRN balance
    float wave = 0.5 + 0.5 * sin(vLocalDir.x * 8.0 - uTime * (2.5 + 3.0 * uBio0.z));
    vec3 grnTint = vec3(0.28 + 0.65 * uGrn.z, 0.35 + 0.60 * uGrn.x, 0.45 + 0.55 * uGrn.y);
    albedo = mix(colPrimary * 0.75, mix(colAccent, grnTint, 0.45), band);
    emissive = colBioGlow * margin * (0.55 + 0.65 * wave) + colAccent * vSpikeVal * 0.3;
    specPow = 18.0;
  } else if (mode == 4) {
    // 4. XENOCELLULAR VENT CRYSTALLINE & THERMAL BIOLUMINESCENCE
    vec3 fN = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
    N = normalize(mix(N, fN, 0.72)); // crisp crystalline mineral facets!
    ndl = max(0.0, dot(N, L));
    float fissure = 1.0 - smoothstep(0.02, 0.14, vor.y);
    vec3 thermalCol = mix(vec3(0.18, 0.75, 0.95), vec3(1.0, 0.42, 0.12), uBio1.z);
    albedo = mix(colPrimary * 0.55, colAccent * 0.85, vor.x) + thinFilm(ndv, 2.2) * 0.25;
    emissive = thermalCol * fissure * (0.65 + 0.9 * uBio1.z + 0.4 * sin(uTime * 3.5 + vor.x * 8.0));
    specPow = 72.0;
    specStr = 0.9;
  } else if (mode == 5) {
    // 5. HALLUCINATED 112-TRAIT DIFFERENTIAL SPECTRUM MANIFOLD
    vec3 dq = vLocalDir * 4.2 + vec3(warp * 2.8, tDelta * 1.9, uTime * 0.35);
    float curl = fbm(dq + vec3(fbm(dq * 1.5), -warp, tGrad * 2.0));
    float isolines = 1.0 - smoothstep(0.0, 0.08, abs(fract(curl * 6.0 + tDelta * 2.5 - uTime * 0.18) - 0.5));
    vec3 specMap = hsv2rgb(vec3(fract(baseHue + curl * 0.72 + tDelta * 0.45), 0.82, 0.92));
    vec3 irid = thinFilm(ndv, 1.5 + curl * 2.4 + abs(tDelta) * 2.0);
    albedo = mix(specMap, irid, 0.35 + 0.35 * fresnel);
    emissive = mix(colBioGlow, hsv2rgb(vec3(fract(tCell + 0.15), 0.92, 1.0)), 0.5) *
               (isolines * 0.75 + abs(tDelta) * 0.35 + vSpikeVal * 0.28);
    specPow = 36.0;
    specStr = 0.72;
  } else if (mode == 6) {
    // 6. PRISMATIC NACREOUS OPAL & CELLULAR FILAMENTS
    vec3 opal1 = thinFilm(ndv, 1.2 + 2.4 * warp + 1.4 * vDisp + sin(uTime * 0.9) * 0.25);
    vec3 opal2 = thinFilm(ndv, 2.3 + 1.9 * vor.x + abs(tGrad) * 1.6);
    float fil = 1.0 - smoothstep(0.02, 0.14, abs(sin(vLocalDir.y * 12.0 + warp * 4.5 - uTime * 1.8)));
    albedo = mix(mix(colPrimary, opal1, 0.62), opal2, 0.35 + 0.45 * fresnel);
    albedo = mix(albedo * 0.78, albedo, cellEdge);
    emissive = mix(colAccent, opal2, 0.6) * (fil * 0.55 + (1.0 - cellEdge) * 0.38) * (0.45 + 0.55 * uBio1.x);
    specPow = 84.0;
    specStr = 0.95;
  } else if (mode == 7) {
    // 7. ABYSSAL GLOBULAR PROTOPLASM & DUAL-BRAIN RESONANCE
    float gel = fbm(vLocalDir * 2.8 + vec3(sin(uTime * 0.5), cos(uTime * 0.4), uTime * 0.22));
    float ripple = 0.5 + 0.5 * sin(vLocalDir.x * 11.0 + gel * 6.0 - uBio1.y * 6.283 - uTime * 2.6);
    vec3 coreCol = hsv2rgb(vec3(fract(baseHue + 0.38 + gel * 0.28), 0.90, 0.96));
    albedo = mix(colPrimary * 0.52, coreCol, 0.45 + 0.55 * pow(1.0 - ndv, 1.4));
    emissive = mix(colBioGlow, coreCol, ripple) * (0.45 + 0.65 * ripple * (0.4 + 0.6 * uBio0.y) + (1.0 - cellEdge) * 0.35);
    alpha = clamp(0.32 + 0.55 * fresnel + 0.14 * ripple, 0.26, 0.92);
    specPow = 54.0;
    specStr = 0.82;
  } else if (mode == 8) {
    // 8. SILICA DIATOM FRUSTULE & RADIOLARIAN MINERAL GEODE
    vec3 fN = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
    N = normalize(mix(N, fN, 0.65));
    ndl = max(0.0, dot(N, L));
    float ang = atan(vLocalDir.y, vLocalDir.x);
    float pores = smoothstep(0.18, 0.48, abs(sin(ang * 12.0) * sin(vLocalDir.z * 16.0)));
    float girdle = 1.0 - smoothstep(0.0, 0.09, abs(vLocalDir.z));
    vec3 silica = mix(vec3(0.72, 0.94, 0.98), thinFilm(ndv, 2.0 + 1.4 * pores), 0.55);
    albedo = mix(colPrimary * 0.45, silica, 0.72) * (0.55 + 0.45 * pores);
    emissive = mix(vec3(0.22, 0.88, 0.96), colBioGlow, 0.4) * (girdle * 0.75 + (1.0 - pores) * 0.32) * (0.6 + 0.4 * sin(uTime * 2.0));
    alpha = clamp(0.45 + 0.50 * fresnel + 0.15 * girdle, 0.40, 0.96);
    specPow = 96.0;
    specStr = 1.05;
  } else if (mode == 9) {
    // 9. LEVIN BIOELECTRIC VMEM MORPHOGENETIC FIELD (Depolarized Amber Head Poles <-> Cobalt Trunk)
    float pole = pow(abs(vLocalDir.x), 1.6); // Bicephalic / anterior-posterior voltage poles!
    float iso = 1.0 - smoothstep(0.0, 0.08, abs(fract(vLocalDir.x * 7.0 - uTime * 0.45 + warp * 0.6) - 0.5));
    float arc = smoothstep(0.72, 0.96, sin(vLocalDir.y * 14.0 + warp * 5.0 - uTime * 4.5));
    vec3 vHyper = vec3(0.08, 0.32, 0.88);   // -66 mV Hyperpolarized
    vec3 vDepol = vec3(1.00, 0.72, 0.14);   // -14 mV Depolarized Head Organizer
    albedo = mix(vHyper, vDepol, smoothstep(0.18, 0.78, pole));
    emissive = mix(vec3(0.25, 0.82, 1.0), vec3(1.0, 0.86, 0.28), pole) * (iso * 0.85 + arc * 0.55 + pole * 0.42);
    alpha = clamp(0.42 + 0.52 * fresnel + 0.18 * iso, 0.38, 0.96);
    specPow = 48.0;
    specStr = 0.78;
  } else if (mode == 10) {
    // 10. MULTINUCLEATE COENOCYTE (CAULERPA SYNCYTIUM) & RUSSIAN-DOLL ENDOSYMBIONTS
    vec3 streamQ = vLocalDir * 4.6 + vec3(-uTime * 0.55, sin(uTime * 0.7) * 0.35, cos(uTime * 0.6) * 0.35);
    vec2 nucVor = voronoi3(streamQ);
    float nuclei = 1.0 - smoothstep(0.08, 0.24, nucVor.x);
    float dollRing = 1.0 - smoothstep(0.02, 0.09, abs(nucVor.x - 0.34));
    vec3 cyto = mix(vec3(0.06, 0.46, 0.32), colPrimary, 0.42);
    albedo = mix(cyto, colAccent, 0.35 * warp);
    emissive = vec3(0.98, 0.82, 0.26) * nuclei * 1.15 + vec3(0.32, 0.95, 0.78) * dollRing * 0.65;
    alpha = clamp(0.28 + 0.56 * fresnel + 0.35 * nuclei, 0.25, 0.94);
    specPow = 40.0;
    specStr = 0.70;
  } else {
    // 11. HALOQUADRATUM SQUARE HALOPHILE & WARNOWIID SINGLE-CELL OCELLOID CAMERA-EYE
    float eyeDist = length(vLocalDir.xy);
    float pupil  = 1.0 - smoothstep(0.14, 0.20, eyeDist);
    float iris   = smoothstep(0.18, 0.24, eyeDist) * (1.0 - smoothstep(0.42, 0.48, eyeDist));
    float cornea = 1.0 - smoothstep(0.0, 0.04, abs(eyeDist - 0.47));
    float eyeSide = smoothstep(0.15, 0.65, vLocalDir.z);
    vec3 haloCol = mix(vec3(0.76, 0.24, 0.58), colAccent, warp); // Haloquadratum bacteriorhodopsin magenta-purple!
    vec3 irisCol = thinFilm(ndv, 2.2 + 2.4 * eyeDist + 0.5 * sin(atan(vLocalDir.y, vLocalDir.x) * 16.0));
    albedo = mix(haloCol, mix(irisCol, vec3(0.03, 0.04, 0.08), pupil), eyeSide * (iris + pupil));
    emissive = irisCol * iris * eyeSide * 0.75 + vec3(0.45, 0.95, 1.0) * cornea * eyeSide * 0.95 + colBioGlow * (1.0 - cellEdge) * 0.25;
    specPow = 90.0;
    specStr = 0.98;
  }

  // If Organ/Neural X-Ray overlay is toggled on any mode, subtly increase membrane translucency
  if (uLook2.w > 0.01 && mode != 2) {
    alpha = mix(1.0, 0.42 + 0.50 * fresnel, uLook2.w);
  }

  // Three-point Blinn-Phong + Subsurface Backlight + Fresnel Rim
  vec3 H1 = normalize(L + V);
  vec3 H2 = normalize(L2 + V);
  float spec = pow(max(0.0, dot(N, H1)), specPow) * specStr + pow(max(0.0, dot(N, H2)), specPow * 0.7) * specStr * 0.35;
  float wrapDiff = 0.36 + 0.64 * max(0.0, (dot(N, L) + 0.25) / 1.25) + 0.30 * ndl2;
  float ao = 0.74 + 0.26 * clamp(vDisp / 1.35, 0.0, 1.0);
  vec3 rim = mix(colAccent, colBioGlow, 0.6) * fresnel * (0.38 + 0.45 * uLook.w);

  vec3 col = albedo * wrapDiff * ao + vec3(spec) + rim + emissive * (0.55 + 0.45 * uLook.w);
  // Subtle ACES-like filmic tone mapping
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  if (!gl_FrontFacing) alpha *= 0.36;
  fragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}
`;

// Internal 3D Organs + Brain Neural Nodes + Axonal Filaments Shader (Pass 1 inside translucent body)
const ORGAN_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColSize; // rgb=color, a=point size
uniform mat4 uViewProj;
uniform mat3 uRot;
uniform float uDpr;
out vec3 vCol;
void main() {
  vec3 wp = uRot * aPos;
  vCol = aColSize.rgb;
  gl_Position = uViewProj * vec4(wp, 1.0);
  gl_PointSize = max(2.0, aColSize.a * uDpr);
}
`;

const ORGAN_FRAG = `#version 300 es
precision highp float;
in vec3 vCol;
uniform int uIsPoint;
out vec4 fragColor;
void main() {
  if (uIsPoint == 1) {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    float core = exp(-r2 * 2.8);
    fragColor = vec4(vCol * (0.7 + 0.9 * core), core * 0.92);
  } else {
    fragColor = vec4(vCol, 0.58);
  }
}
`;

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error("GLSL compile error: " + info);
  }
  return s;
}

function linkProgram(gl, vsSrc, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error("GLSL link error: " + gl.getProgramInfoLog(p));
  }
  return p;
}

function perspective(fovRad, aspect, near, far) {
  const f = 1 / Math.tan(fovRad * 0.5);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}

function rotMat3(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  // Column-major mat3 = Rx(pitch) * Ry(yaw)
  return new Float32Array([
    cy,      sp * sy, -cp * sy,
    0,       cp,       sp,
    sy,     -sp * cy,  cp * cy
  ]);
}

function mulViewProj(proj, eyeZ) {
  // Simple translation along -Z (camera at (0, 0, eyeZ) looking at origin)
  const out = new Float32Array(proj);
  out[12] += proj[8] * (-eyeZ);
  out[13] += proj[9] * (-eyeZ);
  out[14] += proj[10] * (-eyeZ);
  out[15] += proj[11] * (-eyeZ);
  return out;
}

export class CreatureGLStudio {
  constructor(canvas, hudCanvas) {
    this.canvas = canvas;
    this.hudCanvas = hudCanvas;
    this.hudCtx = hudCanvas ? hudCanvas.getContext("2d") : null;
    this.gl = canvas.getContext("webgl2", { alpha: true, antialias: true, depth: true, premultipliedAlpha: false });
    this.ready = false;

    this.shaderMode = 0; // 0=Auto..11=Haloquadratum/Ocelloid
    this.autoCycleSkin = false;
    this.showOrgans = true;
    this.morphEnabled = true;
    this.morphScale = 1.0;
    this.orbit = { yaw: 0.65, pitch: 0.25, zoom: 3.85, auto: true, dragging: false, lastX: 0, lastY: 0 };
    this._lerpElong = 1.2;
    this._lerpSpike = 0.25;
    this._lerpHue = 0.55;

    this.shape = null;
    this.organPointCount = 0;
    this.organLineCount = 0;
    this.lastOrganKey = "";

    this._bindPointer();
    if (this.gl) {
      try { this._initGL(); this.ready = true; } catch (e) { console.error("[CreatureGLStudio]", e); }
    }
  }

  _bindPointer() {
    const el = this.hudCanvas || this.canvas;
    el.addEventListener("pointerdown", (e) => {
      this.orbit.dragging = true;
      this.orbit.lastX = e.clientX;
      this.orbit.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!this.orbit.dragging) return;
      this.orbit.yaw += (e.clientX - this.orbit.lastX) * 0.011;
      this.orbit.pitch = Math.max(-1.35, Math.min(1.35, this.orbit.pitch + (e.clientY - this.orbit.lastY) * 0.011));
      this.orbit.lastX = e.clientX;
      this.orbit.lastY = e.clientY;
    });
    el.addEventListener("pointerup", () => { this.orbit.dragging = false; });
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.orbit.zoom = Math.max(2.1, Math.min(6.2, this.orbit.zoom * (e.deltaY > 0 ? 1.08 : 0.92)));
    }, { passive: false });
  }

  _initGL() {
    const gl = this.gl;
    this.skinProg = linkProgram(gl, SKIN_VERT, SKIN_FRAG);
    this.organProg = linkProgram(gl, ORGAN_VERT, ORGAN_FRAG);

    // High-resolution subdivided UV sphere (48x72 = 3,529 verts, 6,912 tris) for silky morphing!
    const LAT = 48, LON = 72;
    const verts = [];
    const idx = [];
    for (let i = 0; i <= LAT; i++) {
      const th = (i / LAT) * Math.PI;
      const st = Math.sin(th), ct = Math.cos(th);
      for (let j = 0; j <= LON; j++) {
        const ph = (j / LON) * Math.PI * 2;
        verts.push(st * Math.cos(ph), st * Math.sin(ph), ct);
      }
    }
    for (let i = 0; i < LAT; i++) {
      for (let j = 0; j < LON; j++) {
        const a = i * (LON + 1) + j, b = a + 1, c = a + (LON + 1), d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    this.indexCount = idx.length;

    this.sphereVao = gl.createVertexArray();
    gl.bindVertexArray(this.sphereVao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // Internal Organ / Brain Neural Network dynamic VAO
    this.organVao = gl.createVertexArray();
    this.organPtsBuf = gl.createBuffer();
    this.organLinesBuf = gl.createBuffer();

    // 48x48 RG8 Octahedral Shape Texture (default smooth sphere until SHAPES arrives)
    this.octTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.octTex);
    const defOct = new Uint8Array(48 * 48 * 2);
    for (let i = 0; i < 48 * 48; i++) { defOct[i * 2] = 140; defOct[i * 2 + 1] = 24; }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, 48, 48, 0, gl.RG, gl.UNSIGNED_BYTE, defOct);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 112x1 RGBA8 Live Differential Traits Texture
    this.traitsTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.traitsTex);
    const defTr = new Uint8Array(112 * 4);
    defTr.fill(128);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 112, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, defTr);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Cache Uniform Locations
    this.u = {};
    for (const name of [
      "uViewProj","uRot","uOctTex","uTraitsTex","uTime","uElong","uSpike",
      "uMorphAmt","uBio0","uBio1","uGrn","uShaderMode","uSunDir","uEyePos","uLook","uLook2"
    ]) {
      this.u[name] = gl.getUniformLocation(this.skinProg, name);
    }
    this.uo = {};
    for (const name of ["uViewProj","uRot","uDpr","uIsPoint"]) {
      this.uo[name] = gl.getUniformLocation(this.organProg, name);
    }
  }

  setShape(shapeObj) {
    this.shape = shapeObj;
    if (!this.ready || !shapeObj?.base || !shapeObj?.spikes) return;
    const gl = this.gl;
    const rg = new Uint8Array(48 * 48 * 2);
    for (let i = 0; i < 48 * 48; i++) {
      rg[i * 2]     = shapeObj.base[i] || 128;
      rg[i * 2 + 1] = shapeObj.spikes[i] || 0;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.octTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 48, 48, gl.RG, gl.UNSIGNED_BYTE, rg);
  }

  updateTraitsTexture(dna112, cells112, delta112, grad111) {
    if (!this.ready || !Array.isArray(dna112) || !Array.isArray(cells112)) return;
    const gl = this.gl;
    const data = new Uint8Array(112 * 4);
    for (let i = 0; i < 112; i++) {
      const a = Math.max(0, Math.min(1, Number(dna112[i]) || 0));
      const b = Math.max(0, Math.min(1, Number(cells112[i]) || 0));
      const d = Array.isArray(delta112) ? Number(delta112[i]) || 0 : (b - a);
      const g = Array.isArray(grad111) && i < 111 ? Number(grad111[i]) || 0 : 0;
      data[i * 4]     = Math.round(a * 255);
      data[i * 4 + 1] = Math.round(b * 255);
      data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round((d * 0.5 + 0.5) * 255)));
      data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round((g * 0.5 + 0.5) * 255)));
    }
    gl.bindTexture(gl.TEXTURE_2D, this.traitsTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 112, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  // Build real 3D internal organ nodes & neural brain wiring from exact live counts!
  _rebuildOrgans(st, nowSec) {
    const lk = st?.creatures?.locked;
    const ct = st?.cells?.telemetry;
    const parts = Math.max(1, Math.min(16, Number(lk?.parts) || 3));
    const neurons = Math.max(4, Math.min(48, Number(lk?.neurons) || 16));
    const tiles = Math.max(2, Math.min(32, Number(lk?.tiles) || 12));
    const axons = Math.max(2, Math.min(36, Number(ct?.active_axons) || 6));
    const clade = Number(lk?.clade) || 7;
    const elong = this.shape ? Math.max(0.6, Math.min(2.2, this.shape.elong)) : 1.25;
    const invE13 = Math.pow(elong, -1 / 3);

    const pts = [];   // 7 floats per vertex: x,y,z, r,g,b, size
    const lines = []; // 7 floats per vertex (pairs)

    // 1. Organ Nodes along elongated body axis (colored by T2 GRN fate classes!)
    const organColors = [
      [0.34, 0.78, 0.95], // Ectoderm / Sensory
      [0.80, 0.48, 0.96], // Neural Brain Ganglion
      [0.92, 0.36, 0.45], // Muscle Motor Core
      [0.95, 0.68, 0.22], // Gut Metabolic Core
      [0.21, 0.85, 0.62]  // Germline / Reproductive
    ];
    const organPos = [];
    for (let p = 0; p < parts; p++) {
      const u = parts === 1 ? 0 : (p / (parts - 1)) * 2 - 1;
      const ox = u * 0.52 * elong * invE13;
      const oy = Math.sin(p * 2.1 + clade) * 0.14 * invE13;
      const oz = Math.cos(p * 1.7 + clade) * 0.14 * invE13;
      const col = organColors[p % organColors.length];
      const pulse = 1 + 0.22 * Math.sin(nowSec * 3.8 - p * 1.1);
      organPos.push([ox, oy, oz, col]);
      pts.push(ox, oy, oz, col[0], col[1], col[2], 14.0 * pulse);
    }

    // 2. Neural Brain Nodes clustered in anterior ganglion + distributed along nerve cord
    const nPos = [];
    for (let i = 0; i < neurons; i++) {
      const fi = (i + 0.5) / neurons;
      const ang = i * 2.39996 + clade * 0.7;
      const rad = (0.14 + 0.28 * Math.sqrt(fi)) * invE13;
      const nx = (0.28 - fi * 0.75) * elong * invE13;
      const ny = Math.cos(ang) * rad;
      const nz = Math.sin(ang) * rad;
      const fire = 0.5 + 0.5 * Math.sin(nowSec * 6.5 - i * 0.85);
      nPos.push([nx, ny, nz]);
      pts.push(nx, ny, nz, 0.45 + 0.55 * fire, 0.88, 1.0, 5.0 + 3.5 * fire);
    }

    // 3. Synaptic / Axonal Filaments linking Brain Tiles & Organ Nodes (real tiles + T2 axons!)
    const nLinks = Math.min(tiles + axons, neurons * 2);
    for (let k = 0; k < nLinks; k++) {
      const a = nPos[k % nPos.length];
      const b = (k % 3 === 0 && organPos.length > 0)
        ? organPos[k % organPos.length]
        : nPos[(k * 7 + 3) % nPos.length];
      const wave = 0.45 + 0.55 * Math.sin(nowSec * 5.5 - k * 0.6);
      lines.push(a[0], a[1], a[2], 0.30 * wave, 0.88 * wave, 1.0 * wave, 1.0);
      lines.push(b[0], b[1], b[2], 0.88 * wave, 0.45 * wave, 0.96 * wave, 1.0);
    }

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.organPtsBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.DYNAMIC_DRAW);
    this.organPointCount = pts.length / 7;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.organLinesBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.DYNAMIC_DRAW);
    this.organLineCount = lines.length / 7;
  }

  render(nowMs, st) {
    if (!this.ready || !this.gl || this.gl.isContextLost()) return;
    const gl = this.gl;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(10, Math.round(rect.width * dpr));
    const H = Math.max(10, Math.round(rect.height * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W; this.canvas.height = H;
    }
    if (this.hudCanvas && (this.hudCanvas.width !== W || this.hudCanvas.height !== H)) {
      this.hudCanvas.width = W; this.hudCanvas.height = H;
    }

    if (this.orbit.auto && !this.orbit.dragging) this.orbit.yaw += 0.007;

    const nowSec = nowMs * 0.001;
    const proj = perspective(0.72, W / Math.max(1, H), 0.1, 40.0);
    const vp = mulViewProj(proj, this.orbit.zoom);
    const rot = rotMat3(this.orbit.yaw, this.orbit.pitch);

    const vis = st?.creatures?.lockedVisual;
    const lk  = st?.creatures?.locked;
    const hab = st?.creatures?.localHabitat;
    const ct  = st?.cells?.telemetry;

    const targetHue = vis ? vis.hue : (((Number(lk?.clade) || 7) * 0.173) % 1);
    const pat = vis ? vis.pattern : ((Number(lk?.clade) || 3) * 19) % 256;
    const sat = this.shape ? (this.shape.body[9] || 180) / 255 : 0.78;
    const glow = this.shape ? (this.shape.body[11] || 95) / 255 : 0.42;
    const sheen = this.shape ? (this.shape.body[12] || 140) / 255 : 0.55;
    const targetElong = this.shape ? Math.max(0.55, Math.min(2.3, this.shape.elong)) : 1.2;
    const targetSpk = this.shape ? this.shape.spike : 0.25;
    // Smooth living-tissue exponential morphing when switching creatures/clades!
    this._lerpElong += (targetElong - this._lerpElong) * 0.08;
    this._lerpSpike += (targetSpk - this._lerpSpike) * 0.08;
    let dH = targetHue - this._lerpHue;
    if (dH > 0.5) dH -= 1; if (dH < -0.5) dH += 1;
    this._lerpHue = (this._lerpHue + dH * 0.08 + 1) % 1;
    const elong = this._lerpElong, spk = this._lerpSpike, hue = this._lerpHue;
    const activeMode = this.autoCycleSkin ? (1 + (Math.floor(nowSec / 4.0) % 11)) : this.shaderMode;
    const cladeHash = (((Number(lk?.clade) || 7) * 0.6180339) % 1);

    const lv = st?.env?.lightVec || [0.45, 0.55, 0.7];
    const fates = Array.isArray(ct?.fates) ? ct.fates : [1, 1, 1, 1, 1, 0];
    const fSum = fates.reduce((a, b) => a + b, 0) || 1;

    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    // Prepare shared skin uniforms
    const xrayMix = (activeMode === 2 || activeMode === 7 || activeMode === 9 || activeMode === 10) ? 1.0 : (this.showOrgans ? 0.58 : 0.0);
    const bindSkin = (alphaMix) => {
      gl.useProgram(this.skinProg);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.octTex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.traitsTex);
      gl.uniformMatrix4fv(this.u.uViewProj, false, vp);
      gl.uniformMatrix3fv(this.u.uRot, false, rot);
      gl.uniform1i(this.u.uOctTex, 0);
      gl.uniform1i(this.u.uTraitsTex, 1);
      gl.uniform1f(this.u.uTime, nowSec);
      gl.uniform1f(this.u.uElong, elong);
      gl.uniform1f(this.u.uSpike, spk);
      gl.uniform1f(this.u.uMorphAmt, this.morphEnabled ? this.morphScale : 0.0);
      gl.uniform4f(
        this.u.uBio0,
        Math.min(1, (Number(lk?.parts) || 3) / 10),
        Math.min(1, (Number(lk?.neurons) || 16) / 48),
        Math.min(1, (Number(lk?.energy) || 2000) / 80000),
        Math.min(1, (Number(lk?.health) || 30000) / 65535)
      );
      gl.uniform4f(
        this.u.uBio1,
        Math.min(1, (Number(ct?.mean_mt_ghz) || 3.5) / 12.0),
        ((Number(ct?.cpg_pulses) || 0) * 0.03 + nowSec * 0.55) % 1.0,
        hab ? hab.tempPct / 100 : 0.45,
        hab ? hab.solventPhase / 3.0 : 0.0
      );
      gl.uniform4f(this.u.uGrn, fates[1] / fSum, fates[2] / fSum, fates[3] / fSum, fates[4] / fSum);
      gl.uniform1i(this.u.uShaderMode, activeMode);
      gl.uniform3f(this.u.uSunDir, lv[0], Math.abs(lv[2]) + 0.35, Math.abs(lv[1]) + 0.55);
      gl.uniform3f(this.u.uEyePos, 0, 0, this.orbit.zoom);
      gl.uniform4f(this.u.uLook, hue, sat, pat, glow);
      const genesNorm = Math.min(1, (Number(lk?.genes) || 12) / 64);
      gl.uniform4f(this.u.uLook2, sheen, cladeHash, genesNorm, alphaMix);
    };

    gl.enable(gl.CULL_FACE);

    // PASS 1 (when translucent/organs enabled): Inner Back-Shell volumetric membrane
    if (xrayMix > 0.01) {
      bindSkin(0.85);
      gl.cullFace(gl.FRONT);
      gl.depthMask(false);
      gl.bindVertexArray(this.sphereVao);
      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

      // PASS 2: Real 3D Internal Organs + Brain Neural Nodes + Firing Axonal Filaments
      this._rebuildOrgans(st, nowSec);
      gl.disable(gl.CULL_FACE);
      gl.useProgram(this.organProg);
      gl.uniformMatrix4fv(this.uo.uViewProj, false, vp);
      gl.uniformMatrix3fv(this.uo.uRot, false, rot);
      gl.uniform1f(this.uo.uDpr, dpr);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);

      gl.bindVertexArray(this.organVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.organLinesBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
      gl.uniform1i(this.uo.uIsPoint, 0);
      gl.drawArrays(gl.LINES, 0, this.organLineCount);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.organPtsBuf);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
      gl.uniform1i(this.uo.uIsPoint, 1);
      gl.drawArrays(gl.POINTS, 0, this.organPointCount);
      gl.enable(gl.CULL_FACE);
    }

    // PASS 3: Outer Front-Shell Morphing Multi-Shader Membrane
    bindSkin(xrayMix);
    gl.cullFace(gl.BACK);
    gl.depthMask(true);
    gl.bindVertexArray(this.sphereVao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    gl.disable(gl.CULL_FACE);

    // PASS 3: Crisp Scientific HUD Overlay (Polar Graticule + 3D XYZ Triad + Live Δ112 Halo Ring)
    if (this.hudCtx) this._drawHud(W, H, dpr, rot, st);
  }

  _drawHud(W, H, dpr, rot, st) {
    const ctx = this.hudCtx;
    ctx.clearRect(0, 0, W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const maxR = Math.min(W, H) * 0.43;

    // Subtle concentric graticule
    ctx.strokeStyle = "rgba(203, 213, 225, 0.07)";
    ctx.lineWidth = dpr;
    ctx.beginPath(); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.stroke();

    // Live 112-Trait Differential Radial Telemetry Halo around specimen!
    const delta = st?.differential?.signedDelta112;
    if (Array.isArray(delta) && delta.length === 112) {
      for (let i = 0; i < 112; i += 2) {
        const ang = (i / 112) * Math.PI * 2 - Math.PI * 0.5;
        const dv = delta[i];
        const r0 = maxR * 0.96;
        const r1 = r0 + dv * (10 * dpr);
        ctx.strokeStyle = dv >= 0 ? "rgba(78, 168, 222, 0.45)" : "rgba(224, 108, 117, 0.45)";
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
        ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.stroke();
      }
    }

    // 3D XYZ Orientation Triad (bottom-left)
    const tx = 22 * dpr, ty = H - 28 * dpr, tl = 13 * dpr;
    const axes = [[[1,0,0],"#e06c75","X"], [[0,1,0],"#36b89a","Y"], [[0,0,1],"#4ea8de","Z"]];
    ctx.lineWidth = 1.4 * dpr;
    ctx.font = `${8 * dpr}px monospace`;
    for (const [[ax, ay, az], col, lbl] of axes) {
      const rx = rot[0] * ax + rot[3] * ay + rot[6] * az;
      const ry = rot[1] * ax + rot[4] * ay + rot[7] * az;
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + rx * tl, ty - ry * tl); ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillText(lbl, tx + rx * (tl + 5 * dpr) - 2 * dpr, ty - ry * (tl + 5 * dpr) + 3 * dpr);
    }
  }
}
