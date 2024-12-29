import { useState } from 'react'
import { motion } from "framer-motion"
import { SnowBackground } from './SnowBackground'

interface WelcomePageProps {
  onEnter: () => void;
  version: string;
}

const partners = [
  {
    name: "BunnyBot",
    logo: "/bunnybot.png",
    url: "https://partner1.com"
  },
  {
    name: "KinkyDevs",
    logo: "/KINKYDEVS.png",
    url: "https://partner2.com"
  },
  {
    name: "LGBTQ+ Community",
    logo: "/LGBTQ-plus-Community.png",
    url: "https://partner3.com"
  }
]

export function WelcomePage({ onEnter, version }: WelcomePageProps) {
  const [isEntering, setIsEntering] = useState(false)
  
  const updates = [
    "Added cool snow effect to the background",
    "Redesigned UI for a more modern look",
    "Improved responsiveness and animations"
  ]

  const handleEnter = () => {
    setIsEntering(true)
    setTimeout(onEnter, 500)
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-[#0a0f1acc] to-[#1a2535cc] text-white relative overflow-hidden">
      <SnowBackground />
      
      {/* Main Content Container */}
      <div className="h-full w-full relative z-10">
        {/* Center Content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.img
              src="/3DX_ONE_LOGO_TRANSPARENT.png"
              alt="3DX ONE"
              className="w-50 h-60 object-contain mb-0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
            />
            <p className="text-2xl text-neutral-300 font-light">
              Welcome to 3DX ONE
            </p>
            <div className="text-lg text-[#34e5f7] font-semibold mt-4">
              You are up-to-date and ready to create!
            </div>
            <motion.button
              onClick={handleEnter}
              disabled={isEntering}
              whileHover={{ scale: 1.05, backgroundColor: '#fe3752', color: '#fff' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-lg font-semibold bg-[#fe3752] text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              {isEntering ? "Entering 3DX ONE..." : "Enter 3DX ONE"}
            </motion.button>

            {/* Partners Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 w-[600px]"
            >
              <h3 className="text-sm font-medium text-neutral-400 mb-6 uppercase tracking-wider">Trusted Partners</h3>
              <div className="grid grid-cols-3 gap-6">
                {partners.map((partner, index) => (
                  <a 
                    key={index}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-24 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors p-4 rounded-lg border-0"
                  >
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="h-20 w-auto object-contain hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Updates Card - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-20 top-1/3 -translate-y-1/3 flex items-center justify-end w-[500px]"
        >
          <div className="bg-black/30 backdrop-blur-lg rounded-lg overflow-hidden border-0">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Developer Updates</h2>
              <div className="inline-block px-2 py-1 text-xs font-semibold bg-[#fe3752] text-white rounded-lg mb-4">
                Version {version}
              </div>
              <ul className="space-y-2">
                {updates.map((update, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-[#34e5f7]">•</span>
                    <span className="text-neutral-300">{update}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-neutral-400 space-y-2 w-full"
        >
          <p> 2024 3DX ONE by KINKYDEVS. All rights reserved.</p>
          <p>
            For support or inquiries, visit{" "}
            <a
              href="#"
              className="text-[#34e5f7] hover:text-[#fe3752] transition-colors"
            >
              KINKYDEVS DISCORD SERVER
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
