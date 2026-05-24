'use client'

export default function TerrestrialSanctum() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050D1A',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          {/*
            Outer atmospheric halo — a larger soft ring that sits just
            beyond the geometric sphere edge. Blurred into diffusion.
          */}
          <radialGradient id="ts-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#2E8B8B" stopOpacity="0" />
            <stop offset="79%"  stopColor="#2E8B8B" stopOpacity="0" />
            <stop offset="87%"  stopColor="#2E8B8B" stopOpacity="0.07" />
            <stop offset="93%"  stopColor="#4A7C8E" stopOpacity="0.14" />
            <stop offset="97%"  stopColor="#7FFFD4" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7FFFD4" stopOpacity="0" />
          </radialGradient>

          {/*
            Planet body — near-black navy core, barely lighter at the edge.
            The core must read as dark, not glowing.
          */}
          <radialGradient id="ts-body" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#050D1A" />
            <stop offset="50%"  stopColor="#071420" />
            <stop offset="82%"  stopColor="#091A28" />
            <stop offset="100%" stopColor="#0D2133" />
          </radialGradient>

          {/*
            Atmospheric limb glow — fully transparent at center,
            building toward the sphere's geometric edge, peak at ~93%,
            then dropping to nothing just outside. This is the limb
            brightening effect: the sphere reads dark inside and lit
            at its rim, as if backlit by its own atmosphere.
          */}
          <radialGradient id="ts-limb" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#7FFFD4" stopOpacity="0" />
            <stop offset="57%"  stopColor="#2E8B8B" stopOpacity="0" />
            <stop offset="71%"  stopColor="#2E8B8B" stopOpacity="0.06" />
            <stop offset="80%"  stopColor="#2E8B8B" stopOpacity="0.22" />
            <stop offset="88%"  stopColor="#3D9E9E" stopOpacity="0.44" />
            <stop offset="93%"  stopColor="#7FFFD4" stopOpacity="0.60" />
            <stop offset="97%"  stopColor="#7FFFD4" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#7FFFD4" stopOpacity="0" />
          </radialGradient>

          {/* Halo: large blur to diffuse it into a soft atmospheric band */}
          <filter id="ts-halo-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>

          {/* Limb: gentle softening so the edge doesn't read as a hard ring */}
          <filter id="ts-limb-soft" x="-6%" y="-6%" width="112%" height="112%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/*
          Globe center: cx=605 (60.5% from left), cy=280 (46.7% from top).
          Radius 400 in a 1000×600 viewBox.

          Crop geometry:
            top:    280 − 400 = −120  → crops at top ✓
            bottom: 280 + 400 = 680 > 600 → crops at bottom ✓
            right:  605 + 400 = 1005 > 1000 → crops on right ✓
            left:   605 − 400 = 205  → fully visible on left ✓

          Three-edge crop reads as planet-scale environment, not graphic.
        */}

        {/* Layer 1: diffuse outer halo */}
        <circle
          cx="605" cy="280" r="435"
          fill="url(#ts-halo)"
          filter="url(#ts-halo-blur)"
        />

        {/* Layer 2: dark planet body */}
        <circle
          cx="605" cy="280" r="400"
          fill="url(#ts-body)"
        />

        {/* Layer 3: atmospheric limb brightening */}
        <circle
          cx="605" cy="280" r="400"
          fill="url(#ts-limb)"
          filter="url(#ts-limb-soft)"
        />
      </svg>
    </div>
  )
}
