"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroPhoto from "@/assets/hero.jpg";
import { brand } from "@/data/store";
import { formatCedi } from "@/lib/format";
import { heroProductFrom, type Product } from "@/lib/product";
import { PillLink } from "./ui/Button";
import { easeOut } from "./ui/Section";

/** Sampled from the photo's left and right edges, so wide screens extend the backdrop seamlessly. */
const backdrop =
  "linear-gradient(to bottom, #1a1a1a 0%, #1c1c1c 10%, #1d1d1d 20%, #2b2b2b 30%, #676767 40%, #a6a6a6 50%, #c7c7c7 60%, #d6d6d6 70%, #e0e0e0 80%, #e7e7e7 90%, #ededed 100%)";

/** Difference blending keeps the type readable over both the dark figure and the light backdrop. */
const blendText = "relative z-10 text-white mix-blend-difference";

export function Hero({ products }: { products: Product[] }) {
  const featured = heroProductFrom(products);

  return (
    <section id="home" className="relative h-svh max-h-[1100px] min-h-[600px] overflow-hidden" style={{ background: backdrop }}>
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: easeOut }}
        className="absolute inset-0 lg:inset-y-0 lg:right-auto lg:left-1/2 lg:h-full lg:aspect-[3/4] lg:-translate-x-1/2 lg:[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
      >
        <Image
          src={heroPhoto}
          alt="Model in Mutedeworld clothing against a dark-to-light studio backdrop"
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 1024px) 80vh, 100vw"
          className="object-cover"
        />
      </motion.div>

      {/* No transform or opacity on this wrapper: either would isolate the text and stop it blending with the photo. */}
      <div className="container-page relative flex h-full flex-col justify-end gap-8 pb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-[14vh]">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
            className={`${blendText} text-[11.5vw] leading-[0.9] font-extrabold tracking-tight uppercase lg:text-[7.5vw] 2xl:text-[7.5rem]`}
          >
            {brand.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
            className={`${blendText} mt-3 max-w-xs text-sm leading-relaxed lg:mt-5 lg:max-w-[16rem]`}
          >
            <span className="font-semibold">{brand.tagline}.</span>
            <span className="hidden lg:inline"> {brand.description}</span>
          </motion.p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
            className="relative z-10"
          >
            <PillLink href="#collection" variant="dark" arrow className="py-2 pl-8 text-base shadow-xl shadow-black/20">
              Shop the collection
            </PillLink>
          </motion.div>
          {featured && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
              className={`${blendText} text-sm`}
            >
              <Link href={`/product/${featured.slug}`} className="group inline-flex items-center gap-1.5 hover:underline">
                Featured: <span className="font-semibold">{featured.name}</span> · {formatCedi(featured.price)}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
