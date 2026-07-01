const fs = require("fs");
const path = require("path");
const root = "D:/kaifa_stu/world_website/src/components";
const files = [
  "PlanetGrid.tsx",
  "FeatureBelt.tsx",
  "WhatsUp.tsx",
  "CTABanner.tsx",
  "FeaturedStories.tsx",
  "ControlBar.tsx",
  "BodyPanel.tsx",
  "PlanetsIndex.tsx",
  "StoriesIndex.tsx",
  "FactsView.tsx",
  "MissionsView.tsx",
  "ResourcesView.tsx",
  "AboutView.tsx",
  "PlanetDetail.tsx"
];
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.log("skip", f); continue; }
  let s = fs.readFileSync(p, "utf8");
  // Add zh import if not present
  if (!s.includes('from "@/i18n/zh"')) {
    s = 'import { zh } from "@/i18n/zh";\n' + s;
  }
  fs.writeFileSync(p, s, "utf8");
  console.log("patched", f);
}
