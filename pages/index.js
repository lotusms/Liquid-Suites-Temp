import WaveDivider from '../components/WaveDivider'
import SocialMediaIcons from '../components/SocialMediaIcons'
import PhoneSubscriptionForm from '../components/PhoneSubscriptionForm'
import Logo from '../components/Logo'

export default function Home() {
  const handlePhoneSubmit = (phoneNumber) => {
    console.log('Phone number submitted:', phoneNumber)
  }
  return (
    <div className="min-h-screen relative flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="/mainbuilding.png" 
          alt="Main Building" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div 
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundColor: "#243875",
          opacity: 0.6,
        }}
      />
      <p className="lg:hidden text-white text-5xl sm:text-7xl md:text-8xl font-hummingbird absolute top-0 left-[50%] translate-x-[-50%] translate-y-[50%]">Liquid Suites</p>
      
      <WaveDivider waveColor="#243875" />

      <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="lg:hidden bg-black/60 rounded-lg p-6 inline-block">
          <div className="w-full md:py-20 max-w-2xl">

            <h1 className="font-serif text-4xl font-bold text-white mb-6 leading-tight">
              Our Website is <br/> Coming Soon
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
              We're working hard to finish the development of this site. Sign up below to receive SMS updates and to be notified when we launch!
            </p>

            <PhoneSubscriptionForm onSubmit={handlePhoneSubmit} />
          </div>
        </div>

        <div className="hidden lg:block w-full md:w-1/2 lg:w-2/5 py-20 max-w-2xl">
          <p className="text-white text-7xl md:text-8xl font-hummingbird mb-12">Liquid Suites</p>

          <h1 className="font-serif lg:text-5xl font-bold text-white mb-6 leading-tight">
            Our Website is <br/> Coming Soon
          </h1>
          
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            We're working hard to finish the development of this site. Sign up below to receive SMS updates and to be notified when we launch!
          </p>

          <PhoneSubscriptionForm onSubmit={handlePhoneSubmit} />
        </div>
      </div>
    </div>
  )
}


