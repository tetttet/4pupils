"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import styles from "./team.module.css";
import { brand } from "@/lib/brand";

export default function Hero() {
  return (
    <section
      aria-label="Our Team Introduction"
      className={`${styles.root} ${styles.hero}`}
      data-scroll
      data-scroll-speed="-.3"
    >
      <div className={styles.frame}>
        <div />
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.titleBlock}>
              <h1 className={styles.heading}>
                <span className={styles.line}>мы создали</span>
                <span className={styles.inlineLine}>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{
                      ease: [0.86, 0, 0.07, 0.995],
                      duration: 1,
                      delay: 0.2,
                    }}
                    className={styles.imageReveal}
                  >
                    <Image
                      width={120}
                      height={50}
                      src="/logos/logo-black-1.png"
                      alt="img"
                      className={styles.heroImage}
                      priority
                    />
                  </motion.span>
                  <span>открытую</span>
                </span>
                <span className={styles.line}>платформу</span>
              </h1>
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.metaRow}>
              <div className={styles.metaColumn}>
                <p className={styles.paragraph}>
                  Мы создаём удобную образовательную платформу, где ученики
                  находят своего преподавателя, а репетиторы строят карьеру в
                  образовании с первых дней работы с нами.
                </p>
              </div>
              <div className={styles.metaActions}>
                <div>
                  <p className={styles.paragraph}>
                    
                  </p>
                </div>
                <div className={styles.ctaGroup}>
                  <div className={styles.ctaPill}>
                    <Link className={styles.ctaLink} href="/contact">
                      Страница для корпоративных клиентов
                    </Link>
                  </div>
                  <div className={styles.ctaIcon}>
                    <ArrowUpRight size={24} strokeWidth={1.25} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.scrollWrap}>
              <motion.p
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: "100%", opacity: 0.5 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: [0.3, 0.86, 0.36, 0.95],
                }}
                className={`${styles.paragraph} ${styles.scrollText}`}
              >
                <ChevronDown size={24} strokeWidth={1.5} />
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
