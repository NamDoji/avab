import { HeroSection } from '@/components/home/HeroSection'
import { YearlyStats } from '@/components/home/YearlyStats'
import { StatsSection } from '@/components/home/StatsSection'
import { WhyAvab } from '@/components/home/WhyAvab'
import { FeaturedCourses } from '@/components/home/FeaturedCourses'
import { ProductFeatures } from '@/components/home/ProductFeatures'
import { StartupStory } from '@/components/home/StartupStory'
import { Testimonials } from '@/components/home/Testimonials'
import { CtaSection } from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <YearlyStats />
      <StatsSection />
      <WhyAvab />
      <FeaturedCourses />
      <ProductFeatures />
      <StartupStory />
      <Testimonials />
      <CtaSection />
    </>
  )
}
