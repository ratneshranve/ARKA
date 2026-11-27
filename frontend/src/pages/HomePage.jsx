import ScrollReveal from '@/components/common/ScrollReveal';
import Seo from '@/components/common/Seo';
import CompanyIntro from '@/components/home/CompanyIntro';
import ExploreProductsSection from '@/components/home/ExploreProductsSection';
import HeroSlider from '@/components/home/HeroSlider';
import HomeContact from '@/components/home/HomeContact';
import ProjectCategoriesSection from '@/components/home/ProjectCategoriesSection';

/**
 * Home: Hero → About Us → Project Categories (with image sliders) → Explore Products CTA → Contact Us
 * Enhanced with Lenis smooth scrolling and scroll reveal animations on each section.
 */
export default function HomePage() {
  return (
    <>
      <Seo />
      <HeroSlider />
      <ScrollReveal>
        <CompanyIntro />
      </ScrollReveal>
      <ScrollReveal>
        <ProjectCategoriesSection />
      </ScrollReveal>
      <ScrollReveal>
        <ExploreProductsSection />
      </ScrollReveal>
      <ScrollReveal>
        <HomeContact />
      </ScrollReveal>
    </>
  );
}
