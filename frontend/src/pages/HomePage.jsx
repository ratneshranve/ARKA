import Seo from '@/components/common/Seo';
import CompanyIntro from '@/components/home/CompanyIntro';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import HeroSlider from '@/components/home/HeroSlider';
import HomeContact from '@/components/home/HomeContact';

/** Home: Hero → About Us → Products → Projects → Contact Us (footer comes from the layout). */
export default function HomePage() {
  return (
    <>
      <Seo />
      <HeroSlider />
      <CompanyIntro />
      <FeaturedProducts />
      <FeaturedProjects />
      <HomeContact />
    </>
  );
}
