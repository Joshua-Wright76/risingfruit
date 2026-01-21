/**
 * Large semi-transparent compass rose overlay
 * Pokemon Go style aesthetic
 * Fixed north-up overlay (map rotates underneath)
 */
export function CompassRose() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Main compass container */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
          }}
        >
          {/* Outer ring with gradient */}
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circle with blur */}
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="rgba(23, 23, 23, 0.6)"
            style={{ backdropFilter: 'blur(8px)' }}
          />

          {/* Outer decorative ring */}
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="2"
          />

          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />

          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 5) * (Math.PI / 180);
            const isCardinal = i % 18 === 0; // N, E, S, W
            const isIntercardinal = i % 9 === 0 && !isCardinal; // NE, SE, SW, NW
            const isMajor = i % 3 === 0 && !isCardinal && !isIntercardinal;

            const innerRadius = isCardinal ? 80 : isIntercardinal ? 82 : isMajor ? 85 : 88;
            const outerRadius = 92;
            const strokeWidth = isCardinal ? 2 : isIntercardinal ? 1.5 : 1;
            const opacity = isCardinal ? 0.9 : isIntercardinal ? 0.6 : isMajor ? 0.3 : 0.15;

            const x1 = 100 + innerRadius * Math.sin(angle);
            const y1 = 100 - innerRadius * Math.cos(angle);
            const x2 = 100 + outerRadius * Math.sin(angle);
            const y2 = 100 - outerRadius * Math.cos(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i === 0 ? '#4ade80' : '#ffffff'}
                strokeWidth={strokeWidth}
                opacity={i === 0 ? 1 : opacity}
              />
            );
          })}

          {/* Cardinal direction labels */}
          <text
            x="100"
            y="35"
            textAnchor="middle"
            fill="#4ade80"
            fontSize="18"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            filter="url(#glow)"
          >
            N
          </text>
          <text
            x="165"
            y="105"
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="14"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            E
          </text>
          <text
            x="100"
            y="175"
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="14"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            S
          </text>
          <text
            x="35"
            y="105"
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="14"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            W
          </text>

          {/* North arrow / indicator */}
          <polygon
            points="100,55 94,75 100,70 106,75"
            fill="#4ade80"
            filter="url(#glow)"
          />

          {/* Center dot */}
          <circle
            cx="100"
            cy="100"
            r="4"
            fill="#4ade80"
            opacity="0.8"
          />

          {/* Cross hairs */}
          <line
            x1="100"
            y1="92"
            x2="100"
            y2="108"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
          <line
            x1="92"
            y1="100"
            x2="108"
            y2="100"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
