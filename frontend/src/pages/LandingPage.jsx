import React from 'react'
import Hero from '../components/Hero'
import Navigation from '../components/Navigation'
import Featured from '../components/Featured'
import Services from '../components/Services'
import About from '../components/About'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div>
        <Navigation/>
        <Hero/>
        <Featured/>
        <Services/>
        <About/>
        <CTA/>
        <Footer/>
    </div>
  )
}
