export default function Logo({ 
  color = "#0367a6", 
  className = "",
  width = 125.68,
  height = 29.72
}) {
  return (
    <svg 
      id="Text" 
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      viewBox="0 0 200 50"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <text 
        x="31.23"
        y="35"
        fill={color}
        style={{ 
          fontFamily: 'Hummingbird-Bold, Hummingbird, sans-serif', 
          fontSize: '52px', 
          fontWeight: 700
        }}
      >
        Liquid Suites
      </text>
    </svg>
  )
}

