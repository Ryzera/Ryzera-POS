// src/app/page.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;
  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>apps/web/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="#"
          >
            Deploy now
          </a>
          <a
            href="#"
            className={styles.secondary}
          >
            Read docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Examples
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}

