import Image from "next/image";
import type { ProjectImage } from "@/types";
import type { Language } from "@/types";
import styles from "./PlanWaterfall.module.css";

interface PlanWaterfallProps {
  images: ProjectImage[];
  lang: Language;
  onImageClick: (image: ProjectImage) => void;
}

export default function PlanWaterfall({
  images,
  lang,
  onImageClick,
}: PlanWaterfallProps) {
  if (images.length === 0) return null;

  return (
    <div className={styles.grid}>
      {images.map((image, i) => (
        <div
          key={i}
          className={styles.item}
          onClick={() => onImageClick(image)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onImageClick(image)}
          aria-label={image.alt[lang]}
        >
          <Image
            src={image.src}
            alt={image.alt[lang]}
            width={image.width}
            height={image.height}
            className={styles.image}
            loading="lazy"
            unoptimized={image.src.endsWith(".svg")}
            onLoad={(e) => (e.target as HTMLElement).classList.add(styles.imageLoaded)}
          />
        </div>
      ))}
    </div>
  );
}
