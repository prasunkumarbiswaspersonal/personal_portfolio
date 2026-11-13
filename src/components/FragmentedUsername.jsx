import { motion, useTransform } from 'framer-motion';
import GLYPHS from './glyphData.json';

// High-speed full-page scatter vectors aligned to font cut lines
const DRIFT_CONFIG = {
  'char-0': {
    piece0: { x: -440, y: -380, rotate: -65, scale: 0.7 },
    piece1: { x: -320, y: 440, rotate: 55, scale: 1.2 },
    shards: [{ x: -500, y: -260, r: 200, w: 10, h: 2.5 }]
  },
  'char-x': {
    piece0: { x: 260, y: -420, rotate: 80, scale: 1.2 },
    piece1: { x: -450, y: 380, rotate: -70, scale: 0.65 },
    shards: [{ x: 340, y: -350, r: 180, w: 9, h: 2 }]
  },
  'char-p': {
    piece0: { x: -520, y: 150, rotate: -75, scale: 0.75 },
    piece1: { x: 280, y: -480, rotate: 90, scale: 1.25 },
    shards: [{ x: -420, y: 100, r: -190, w: 11, h: 2.5 }]
  },
  'char-r': {
    piece0: { x: 380, y: -440, rotate: 70, scale: 0.7 },
    piece1: { x: -340, y: 420, rotate: -60, scale: 1.15 },
    shards: [{ x: 440, y: -360, r: 170, w: 10, h: 2.5 }]
  },
  'char-a': {
    piece0: { x: 60, y: -520, rotate: 40, scale: 1.25 },
    piece1: { x: -100, y: 480, rotate: -45, scale: 0.65 },
    shards: [{ x: 90, y: -480, r: 220, w: 10, h: 2.5 }]
  },
  'char-s': {
    piece0: { x: 450, y: 420, rotate: 80, scale: 0.7 },
    piece1: { x: -360, y: -390, rotate: -85, scale: 1.15 },
    shards: [{ x: 460, y: 360, r: 190, w: 11, h: 2.5 }]
  },
  'char-u': {
    piece0: { x: 540, y: -320, rotate: 65, scale: 0.75 },
    piece1: { x: -300, y: 460, rotate: -65, scale: 1.15 },
    shards: [{ x: 560, y: -200, r: 180, w: 10, h: 2.5 }]
  },
  'char-n': {
    piece0: { x: 580, y: -460, rotate: 75, scale: 1.25 },
    piece1: { x: 420, y: 390, rotate: -70, scale: 0.7 },
    shards: [{ x: 620, y: -400, r: 240, w: 11, h: 2.5 }]
  }
};

const NanoShard = ({ shard, smoothScrollY, isAccent }) => {
  const sX = useTransform(smoothScrollY, [15, 580], [0, shard.x]);
  const sY = useTransform(smoothScrollY, [15, 580], [0, shard.y]);
  const sRot = useTransform(smoothScrollY, [15, 580], [0, shard.r]);
  const sScale = useTransform(smoothScrollY, [15, 120, 540], [0, 1.6, 0]);
  const sOpacity = useTransform(smoothScrollY, [15, 60, 520], [0, 0.9, 0]);

  return (
    <motion.span
      style={{
        x: sX,
        y: sY,
        rotate: sRot,
        scale: sScale,
        opacity: sOpacity,
        width: `${shard.w}px`,
        height: `${shard.h}px`,
        transformZ: 0
      }}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
        isAccent ? 'bg-target shadow-[0_0_8px_#FF003C]' : 'bg-sensor shadow-[0_0_10px_#00E5FF]'
      } rounded-none will-change-transform`}
      aria-hidden="true"
    />
  );
};

const FragmentedChar = ({ glyph, smoothScrollY }) => {
  const config = DRIFT_CONFIG[glyph.id] || {
    piece0: { x: -300, y: -300, rotate: -50, scale: 0.8 },
    piece1: { x: 300, y: 300, rotate: 50, scale: 1.1 },
    shards: []
  };

  // Pure GPU-composited transforms with zero CPU/fill-rate overhead
  const p0X = useTransform(smoothScrollY, [15, 580], [0, config.piece0.x]);
  const p0Y = useTransform(smoothScrollY, [15, 580], [0, config.piece0.y]);
  const p0Rot = useTransform(smoothScrollY, [15, 580], [0, config.piece0.rotate]);
  const p0Scale = useTransform(smoothScrollY, [15, 580], [1, config.piece0.scale]);

  const p1X = useTransform(smoothScrollY, [15, 580], [0, config.piece1.x]);
  const p1Y = useTransform(smoothScrollY, [15, 580], [0, config.piece1.y]);
  const p1Rot = useTransform(smoothScrollY, [15, 580], [0, config.piece1.rotate]);
  const p1Scale = useTransform(smoothScrollY, [15, 580], [1, config.piece1.scale]);

  const pieceOpacity = useTransform(smoothScrollY, [0, 25, 460, 640], [1, 1, 0.9, 0]);

  const piece0 = glyph.pieces[0];
  const piece1 = glyph.pieces[1];

  const colorClass = glyph.isAccent ? 'text-target' : 'text-sensor';
  const glowShadow = glyph.isAccent
    ? 'drop-shadow-[0_0_16px_rgba(255,0,60,0.55)]'
    : 'drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]';

  const effectiveWidth = glyph.isSmallcase ? Math.round(glyph.advanceWidth * 0.82) : glyph.advanceWidth;

  return (
    <div className={`relative inline-block select-none overflow-visible h-[clamp(3.5rem,13vw,8.5rem)] ${glowShadow}`}>
      {/* Invisible placeholder for natural layout spacing */}
      <svg
        viewBox={`0 0 ${effectiveWidth} 800`}
        className="h-full w-auto invisible pointer-events-none"
        aria-hidden="true"
      >
        <g transform={glyph.isSmallcase ? 'translate(0, 135) scale(0.82)' : undefined}>
          <path d={piece0.d} />
          <path d={piece1.d} />
        </g>
      </svg>

      {/* Piece 0: Natural Font Upper/Stem Segment in its own hardware-accelerated motion div */}
      <motion.div
        style={{
          x: p0X,
          y: p0Y,
          rotate: p0Rot,
          scale: p0Scale,
          opacity: pieceOpacity,
          transformZ: 0
        }}
        className={`absolute inset-0 pointer-events-none will-change-transform ${colorClass}`}
      >
        <svg
          viewBox={`0 0 ${effectiveWidth} 800`}
          className="h-full w-auto overflow-visible"
          aria-hidden="true"
        >
          <g transform={glyph.isSmallcase ? 'translate(0, 135) scale(0.82)' : undefined}>
            <path d={piece0.d} fill="currentColor" />
          </g>
        </svg>
      </motion.div>

      {/* Piece 1: Natural Font Lower/Loop Segment in its own hardware-accelerated motion div */}
      <motion.div
        style={{
          x: p1X,
          y: p1Y,
          rotate: p1Rot,
          scale: p1Scale,
          opacity: pieceOpacity,
          transformZ: 0
        }}
        className={`absolute inset-0 pointer-events-none will-change-transform ${colorClass}`}
      >
        <svg
          viewBox={`0 0 ${effectiveWidth} 800`}
          className="h-full w-auto overflow-visible"
          aria-hidden="true"
        >
          <g transform={glyph.isSmallcase ? 'translate(0, 135) scale(0.82)' : undefined}>
            <path d={piece1.d} fill="currentColor" />
          </g>
        </svg>
      </motion.div>

      {/* Fast nano-shard */}
      {config.shards.map((s, idx) => (
        <NanoShard
          key={`shard-${idx}`}
          shard={s}
          smoothScrollY={smoothScrollY}
          isAccent={glyph.isAccent}
        />
      ))}
    </div>
  );
};

export const FragmentedUsername = ({ scrollY }) => {
  return (
    <div className="relative inline-flex items-center justify-center gap-[2px] md:gap-1 mb-3 md:mb-5 overflow-visible">
      <h1 className="sr-only">0xPRASUN</h1>
      <div className="flex items-center justify-center tracking-wide leading-none overflow-visible" aria-hidden="true">
        {GLYPHS.map((glyph) => (
          <FragmentedChar
            key={glyph.id}
            glyph={glyph}
            smoothScrollY={scrollY}
          />
        ))}
      </div>
    </div>
  );
};

export default FragmentedUsername;
