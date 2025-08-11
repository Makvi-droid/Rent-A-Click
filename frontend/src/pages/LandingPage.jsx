import React from 'react'
import Hero from '../components/Landing/Hero'
import Navigation from '../components/Landing/Navigation'
import Featured from '../components/Landing/Featured'
import Services from '../components/Landing/Services'
import About from '../components/Landing/About'
import Footer from '../components/Landing/Footer'

export default function LandingPage() {
  return (
    <div>
        <Navigation/>
        <Hero/>
        <Featured/>
        <Services/>
        <About/>
        <Footer/>
    </div>
  )
}
