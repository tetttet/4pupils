"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./team.module.css";
import { brand } from "@/lib/brand";

const phrase = ["Готовы", "Попробовать", brand.name];

function Eyes() {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - window.innerWidth / 2;
      const deltaY = event.clientY - window.innerHeight / 2;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      setRotate(angle - 280);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.eyesRow}>
      {[0, 1].map((eye) => (
        <div className={styles.eye} key={eye}>
          <Image
            alt=""
            aria-hidden="true"
            className={styles.eyeImage}
            height={200}
            src="/ochi/eyes.svg"
            style={{ transform: `rotate(${rotate}deg)` }}
            width={200}
          />
        </div>
      ))}
    </div>
  );
}

function ReadyButton({
  href,
  title,
  variant = "solid",
}: {
  href: string;
  title: string;
  variant?: "solid" | "outline";
}) {
  return (
    <Link
      className={`${styles.pillLink} ${
        variant === "outline" ? styles.pillLinkOutline : styles.pillLinkSolid
      }`}
      href={href}
    >
      <span className={styles.pillFill} />
      <span className={styles.pillText}>{title}</span>
      <span className={styles.pillIcon} aria-hidden="true">
        <ArrowUpRight size={30} strokeWidth={1.5} />
      </span>
    </Link>
  );
}

export default function Ready() {
  const container = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });
  const mq = useTransform(scrollYProgress, [0, 1], [0, -700]);

  return (
    <section className={`${styles.root} ${styles.ready}`} ref={container}>
      <div className={styles.content}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>
            {phrase.map((line, index) => (
              <span className={styles.maskLine} key={line}>
                <span
                  className={`${styles.maskText} ${
                    index === 0 ? styles.readyWord : ""
                  }`}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div className={styles.actions}>
          <ReadyButton href="/auth/sign-in" title="Войти в платформу" />
          <p className={styles.orText}>ИЛИ</p>
          <ReadyButton
            href="/contact"
            title={brand.supportEmail ? `Связаться с нами` : "Связаться с нами"}
            variant="outline"
          />
        </div>
      </div>

      <motion.div className={styles.eyesLayer} style={{ y: mq }}>
        <Eyes />
      </motion.div>
    </section>
  );
}
