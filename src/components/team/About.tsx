"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import styles from "./team.module.css";

const socialLinks = [
  { title: "Instagram", href: "#" },
  { title: "WhatsApp", href: "#" },
  { title: "Telegram", href: "#" },
  { title: "Linkedin", href: "#" },
];

export default function About() {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      aria-label="Our Team Introduction"
      className={`${styles.root} ${styles.about}`}
    >
      <div className={styles.intro}>
        <h2 className={styles.headline}>
          4Pupils — это обра&shy;зователь&shy;ная плат&shy;форма для
          стре&shy;мя&shy;щих&shy;ся уче&shy;ни&shy;ков,
          <br className={styles.mobileHidden} /> ко&shy;то&shy;рые
          хо&shy;тят&nbsp;
          <span className={styles.flash}>улуч&shy;шить зна&shy;ния,</span>
          &nbsp;до&shy;би&shy;вать&shy;ся ре&shy;зуль&shy;та&shy;тов,{" "}
          <br className={styles.mobileHidden} />
          <span className={styles.flash}>
            раз&shy;би&shy;рать&shy;ся в слож&shy;ных те&shy;мах,
          </span>
          &nbsp;и&nbsp;
          <span className={styles.flash}>
            стро&shy;ить силь&shy;ное бу&shy;ду&shy;щее.
          </span>
        </h2>
      </div>

      <div className={styles.expectations}>
        <div className={styles.expectationsGrid}>
          <div className={styles.expectationsTitleCol}>
            <h3 className={styles.approachHeading}>Наша миссия:</h3>
          </div>

          <div className={styles.expectationsContentCol}>
            <div className={styles.expectationsContent}>
              <div className={styles.copyCol}>
                <p className={styles.paragraph}>
                  Мы создаём удобную образовательную платформу, где ученики
                  находят своего преподавателя, а репетиторы строят карьеру в
                  образовании с первых дней работы с нами.
                </p>
                <p className={`${styles.paragraph} ${styles.paragraphGap}`}>
                  Наша миссия — сделать образование доступным и эффективным для
                  всех, кто стремится к знаниям и развитию.
                </p>
              </div>

              <div className={styles.socialCol}>
                <div className={`${styles.socialList} mb-1`}>
                  {socialLinks.map((link) => (
                    <Link
                      className={styles.socialLink}
                      href={link.href}
                      key={link.title}
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.approach}>
        <div className={styles.approachCopy}>
          <h3 className={styles.approachHeading}>Наш подход:</h3>
          <Link
            className={styles.roundButton}
            href="/ai/homemade/atlas"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span className={styles.roundButtonText}>
              Узнать больше о команде
            </span>
            <span className={styles.roundButtonIcon} aria-hidden="true">
              <ArrowUpRight size={30} strokeWidth={1.5} />
            </span>
          </Link>
        </div>

        <div
          className={`${styles.imageFrame} ${
            hovered ? styles.imageFrameHovered : ""
          }`}
        >
          <Image
            alt="Ochi team presentation workspace"
            className={`${styles.approachImage} ${
              hovered ? styles.approachImageHovered : ""
            }`}
            height={469}
            priority
            src="/ochi/team.jpg"
            width={663}
          />
        </div>
      </div>
    </section>
  );
}
