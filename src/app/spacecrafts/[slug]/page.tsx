import fleet from "../../../../data/nasa3d.json";
import SpacecraftDetailClient from "./SpacecraftDetailClient";

interface Entry {
  slug: string;
  title: string;
  description: string;
  image: string;
  glbLocal?: string;
  href: string;
}

export function generateStaticParams() {
  const data = fleet as Entry[];
  return data.filter((entry) => Boolean(entry.slug)).map((entry) => ({ slug: entry.slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const data = fleet as Entry[];
  return <SpacecraftDetailClient slug={params.slug} entries={data} />;
}

