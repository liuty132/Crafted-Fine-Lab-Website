import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./AnimatedLink.module.css";

type AnimatedLinkProps = ComponentProps<typeof Link>;

export default function AnimatedLink({
  className,
  children,
  ...props
}: AnimatedLinkProps) {
  return (
    <Link
      className={`${styles.link}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </Link>
  );
}
