"use client"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

// Dynamically import icons
const Shield = dynamic(() => import('lucide-react').then(mod => mod.Shield))
const Zap = dynamic(() => import('lucide-react').then(mod => mod.Zap))
const Globe = dynamic(() => import('lucide-react').then(mod => mod.Globe))

export default function About() {
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in text-dada-orange">About Dada Devs</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-8 animate-fade-in animate-delay-200">
            Building Africa's First Pipeline of Female Open-Source Bitcoin Engineers.
          </p>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-300 text-dada-orange">Who We Are</h2>
          <p className="text-lg mb-8 animate-fade-in animate-delay-400">
            DADA DEVS is an initiative focused on equipping African female developers with the skills to contribute to Bitcoin development and the open-source ecosystem. Our goal is to bridge the gap between traditional software development and Bitcoin by providing specialized training, mentorship, and access to industry networks.
          </p>
          <p className="text-lg mb-8 animate-fade-in animate-delay-500">
            Through workshops, boot camps, and collaborative projects, we help developers refine their technical expertise, gain real-world experience, and actively contribute to open-source Bitcoin projects. By fostering a strong community of skilled women in Bitcoin development, we are expanding opportunities, increasing representation, and driving meaningful innovation in the space.
          </p>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-600 text-dada-orange">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in animate-delay-700 border-dada-orange/20">
              <CardHeader>
                <Shield className="h-8 w-8 text-dada-orange mb-2" />
                <CardTitle className="text-dada-orange">Technical Training</CardTitle>
              </CardHeader>
              <CardContent>
                Comprehensive workshops and bootcamps covering Bitcoin development, cryptography, and open-source contribution.
              </CardContent>
            </Card>
            <Card className="animate-fade-in animate-delay-800 border-dada-orange/20">
              <CardHeader>
                <Zap className="h-8 w-8 text-dada-orange mb-2" />
                <CardTitle className="text-dada-orange">Mentorship Program</CardTitle>
              </CardHeader>
              <CardContent>One-on-one guidance from experienced Bitcoin developers and industry professionals.</CardContent>
            </Card>
            <Card className="animate-fade-in animate-delay-900 border-dada-orange/20">
              <CardHeader>
                <Globe className="h-8 w-8 text-dada-orange mb-2" />
                <CardTitle className="text-dada-orange">Community Network</CardTitle>
              </CardHeader>
              <CardContent>Access to a supportive community of female developers and industry connections across Africa.</CardContent>
            </Card>
          </div>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-1000 text-dada-orange">Our Impact</h2>
          <p className="text-lg mb-4 animate-fade-in animate-delay-1100">
            We are building the next generation of African female Bitcoin developers who will contribute to the global open-source ecosystem. Our graduates go on to work on critical Bitcoin infrastructure, contribute to major open-source projects, and lead innovation in the African tech space.
          </p>
          <p className="text-lg animate-fade-in animate-delay-1200">
            Join us in building a more inclusive and diverse Bitcoin development community across Africa.
          </p>
        </div>
      </div>
    </Layout>
  )
}