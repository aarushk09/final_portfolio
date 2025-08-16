"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Github, Mail, MapPin, Calendar, Camera, Code, Briefcase } from "lucide-react"
import Image from "next/image"
import { SpotifyWidget } from "@/components/spotify-widget"
import { PhotoGallery } from "@/components/photo-gallery"
import { StorageSetup } from "@/components/storage-setup"
import { PhotoUpload } from "@/components/photo-upload"
import { DeleteAllPhotos } from "@/components/delete-all-photos"
import { Navigation } from "@/components/navigation"

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("about")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const projects = [
    {
      title: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution built with Next.js, featuring real-time inventory management and secure payment processing.",
      tech: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
      github: "https://github.com",
      demo: "https://demo.com",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Task Management App",
      description:
        "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      tech: ["React", "Node.js", "Socket.io", "MongoDB"],
      github: "https://github.com",
      demo: "https://demo.com",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Weather Dashboard",
      description:
        "A responsive weather dashboard that provides detailed forecasts, interactive maps, and location-based weather alerts.",
      tech: ["Vue.js", "Express", "OpenWeather API", "Chart.js"],
      github: "https://github.com",
      demo: "https://demo.com",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Git",
    "Figma",
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <SpotifyWidget isVisible={true} />

      <div className="container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-12 bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-black">
              About
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Projects
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Photos
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Aarush Gupta
                  </h1>
                  <p className="text-xl text-zinc-400 mb-6">Full Stack Developer & Creative Technologist</p>
                  <div className="flex items-center gap-4 text-zinc-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Available for work</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-300 leading-relaxed">
                    I'm a passionate full-stack developer with 5+ years of experience building scalable web
                    applications. I specialize in React, Next.js, and Node.js, with a keen eye for user experience and
                    performance optimization.
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    When I'm not coding, you'll find me exploring new technologies, contributing to open-source
                    projects, or capturing moments through photography. I believe in creating digital experiences that
                    are both functional and beautiful.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-80 h-96 relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700">
                    <Image
                      src="/images/aarush-photo.png"
                      alt="Aarush Gupta"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full opacity-10 blur-xl"></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                A collection of projects that showcase my skills in full-stack development, from concept to deployment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card
                  key={index}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{project.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-700 hover:bg-zinc-800 bg-transparent"
                        asChild
                      >
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                      <Button size="sm" className="bg-white text-black hover:bg-zinc-200" asChild>
                        <a href={project.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Photography</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Capturing moments and exploring the world through my lens. A collection of my favorite shots from
                travels and daily life.
              </p>
            </div>

            <div className="space-y-6">
              <StorageSetup />
              <PhotoUpload />
              <DeleteAllPhotos />
              <PhotoGallery />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Let's Connect</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                I'm always interested in new opportunities and collaborations. Feel free to reach out if you'd like to
                work together!
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Get in Touch
                      </h3>
                      <div className="space-y-3 text-zinc-400">
                        <p>
                          <strong className="text-white">Email:</strong>
                          <br />
                          aarush@example.com
                        </p>
                        <p>
                          <strong className="text-white">Location:</strong>
                          <br />
                          San Francisco, CA
                        </p>
                        <p>
                          <strong className="text-white">Response Time:</strong>
                          <br />
                          Usually within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Find Me Online
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-zinc-700 hover:bg-zinc-800 bg-transparent"
                          asChild
                        >
                          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-zinc-700 hover:bg-zinc-800 bg-transparent"
                          asChild
                        >
                          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <Briefcase className="w-4 h-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-zinc-700 hover:bg-zinc-800 bg-transparent"
                          asChild
                        >
                          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <Camera className="w-4 h-4 mr-2" />
                            Instagram
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800">
                    <p className="text-center text-zinc-500 text-sm">
                      Currently open to new opportunities • Available for freelance projects
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
