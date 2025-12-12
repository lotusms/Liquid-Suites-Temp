export default function WaveDivider({ 
  waveColor = "#000000"
}) {
  const waveSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 1000' preserveAspectRatio='xMidYMid meet'>
      <g transform='translate(50,500) rotate(90) translate(-500,-50)' fill='#000000'>
        <path d='M0 1v99c134.3 0 153.7-99 296-99H0Z' opacity='.5'/>
        <path d='M1000 4v86C833.3 90 833.3 3.6 666.7 3.6S500 90 333.3 90 166.7 4 0 4h1000Z' opacity='.5'/>
        <path d='M617 1v86C372 119 384 1 196 1h421Z' opacity='.5'/>
        <path d='M1000 0H0v52C62.5 28 125 4 250 4c250 0 250 96 500 96 125 0 187.5-24 250-48V0Z'/>
      </g>
    </svg>
  `)

  return (
    <div className="absolute inset-0 hidden lg:block">
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: "#000000",
          opacity: 1,
          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
          WebkitClipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: waveColor,
          opacity: 0.6,
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
          WebkitClipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
        }}
      >
      </div>
      
      <div
        className="absolute top-0 bottom-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${waveSvg}")`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          left: '50%',
          width: '9%',
          height: '100%',
          transform: 'translateX(-22%) rotate(180deg)',
          mixBlendMode: 'multiply',
          opacity: 1,
        }}
      />
    </div>
  )
}
