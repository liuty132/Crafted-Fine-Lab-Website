import AboutDocument from "../AboutDocument";
import { UI } from "@/lib/ui";

export const metadata = {
  title: "Meet the Founders — Shàn Architects + Lab",
};

export default function FoundersPage() {
  return <AboutDocument heading={UI.foundersHeading} body={UI.foundersDescription} />;
}
