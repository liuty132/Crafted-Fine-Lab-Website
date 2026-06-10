import AboutDocument from "../AboutDocument";
import { UI } from "@/lib/ui";

export const metadata = {
  title: "About — Shàn Architects + Lab",
};

export default function StudioPage() {
  return (
    <AboutDocument
      heading={UI.studioHeading}
      docTitle={UI.about}
      body={UI.studioDescription}
    />
  );
}
