import { Hero } from "@/components/Hero";
import { DiscoverySection } from "@/components/DiscoverySection";
import { TopicsGrid } from "@/components/fx/TopicsGrid";
import { PlanetGrid } from "@/components/PlanetGrid";
import { FeatureBelt } from "@/components/FeatureBelt";
import { StatsMarquee } from "@/components/StatsMarquee";
import { FeaturedStories } from "@/components/FeaturedStories";
import { CTABanner } from "@/components/CTABanner";
import { WhatsUp } from "@/components/WhatsUp";
import { featuredTopics } from "@/data/nasaContent";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <DiscoverySection />
      <TopicsGrid eyebrow="宇宙主题" title="深入探索深空宇宙" cards={featuredTopics} />
      <StatsMarquee />
      <PlanetGrid />
      <FeatureBelt />
      <WhatsUp />
      <FeaturedStories />
      <CTABanner />
    </div>
  );
}

