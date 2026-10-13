"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Plus, Quote } from "lucide-react";
import { brand, categoryLabel, heroQuote, heroTags } from "@/data/store";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { showCategory } from "@/lib/filter";
import { formatCedi } from "@/lib/format";
import { coverPhoto, firstAvailable, heroProductFrom, type Product } from "@/lib/product";
import { Blob } from "./ui/Blob";
import { PillLink } from "./ui/Button";
import { CircleBadge } from "./ui/CircleBadge";
import { ProductImage } from "./ui/ProductImage";
import { easeOut } from "./ui/Section";
import { SectionLabel } from "./ui/SectionHeading";
import { Sparkle, Star4 } from "./ui/Sparkle";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

export function Hero({ products }: { products: Product[] }) {
  const { addItem, openCart } = useCart();
  const heroProduct = heroProductFrom(products);
  const heroVariant = heroProduct ? firstAvailable(heroProduct) : null;

  const categoriesInStock = new Set(products.map((p) => p.category));
  const tags = heroTags.filter((tag) => categoriesInStock.has(tag));

  const stats = [
    { value: `${products.length}`, label: "Pieces" },
    { value: `${categoriesInStock.size}`, label: "Categories" },
    ...(products.length ? [{ value: formatCedi(Math.min(...products.map((p) => p.price))), label: "From" }] : []),
  ];

  const addHeroProduct = () => {
    if (!heroProduct || !heroVariant) return;
    addItem(heroProduct.id, heroVariant.color, heroVariant.size);
    openCart();
  };

  return (
    <section id="home" className="relative overflow-hidden bg-grid pt-32 md:pt-36">
      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: easeOut }}
          className="absolute top-0 right-5 hidden lg:block"
        >
          <CircleBadge
            text={`New Drop • ${brand.collectionYear} • New Drop • ${brand.collectionYear} • `}
            icon={<Star4 className="size-5" />}
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <SectionLabel className="text-base">New Collection — {brand.collectionYear}</SectionLabel>
          </motion.div>
          <motion.h1
            variants={item}
            className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Let the{" "}
            <span className="whitespace-nowrap text-accent">
              Style
              <Sparkle className="ml-1 size-7 -translate-y-6 lg:size-9 lg:-translate-y-9" />
            </span>{" "}
            Speak
          </motion.h1>
          <motion.p variants={item} className="mt-4 max-w-xl text-lg text-muted">
            {brand.description}
          </motion.p>
        </motion.div>

        <div className="relative mt-8 grid items-end gap-10 lg:mt-4 lg:grid-cols-[1fr_auto_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
            className="order-3 mx-auto max-w-xs pb-12 text-center lg:order-1 lg:mx-0 lg:pb-24 lg:text-left"
          >
            <Quote className="mx-auto size-8 fill-accent text-accent lg:mx-0" aria-hidden="true" />
            <p className="mt-3 text-muted">{heroQuote}</p>
            <dl className="mt-8 flex justify-center gap-6 lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-muted">{stat.label}</dt>
                  <dd className="text-2xl font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <div className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2 lg:w-[400px] xl:w-[420px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
              style={{ transformOrigin: "50% 100%" }}
              className="absolute inset-x-[4%] top-[14%] bottom-0"
            >
              <Blob className="size-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
              className="relative px-[14%] pt-4 pb-24"
            >
              {heroProduct ? (
                <Link href={`/product/${heroProduct.slug}`} aria-label={`View ${heroProduct.name}`} className="block">
                  <ProductImage
                    src={coverPhoto(heroProduct)}
                    alt={heroProduct.name}
                    category={heroProduct.category}
                    sizes="(min-width: 1024px) 300px, 70vw"
                    preload
                    className="aspect-[3/4] rounded-t-full rounded-b-3xl shadow-2xl shadow-black/20 ring-8 ring-surface/70"
                  />
                </Link>
              ) : (
                <ProductImage
                  src=""
                  alt=""
                  category="tees"
                  sizes="(min-width: 1024px) 300px, 70vw"
                  className="aspect-[3/4] rounded-t-full rounded-b-3xl shadow-2xl shadow-black/20 ring-8 ring-surface/70"
                />
              )}
              {heroProduct && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.1, ease: easeOut }}
                  className="absolute top-1/3 -right-1 flex items-center gap-3 rounded-2xl bg-surface/90 p-2 pl-4 shadow-xl shadow-black/10 backdrop-blur-md sm:-right-4 dark:ring-1 dark:ring-white/10"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold">{heroProduct.name}</p>
                    <p className="text-sm text-accent">{heroVariant ? formatCedi(heroProduct.price) : "Sold out"}</p>
                  </div>
                  {heroVariant ? (
                    <button
                      type="button"
                      onClick={addHeroProduct}
                      aria-label={`Add ${heroProduct.name} to cart`}
                      className="grid size-10 place-items-center rounded-full bg-night text-white transition-colors hover:bg-accent"
                    >
                      <Plus className="size-5" aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href={`/product/${heroProduct.slug}`}
                      aria-label={`View ${heroProduct.name}`}
                      className="grid size-10 place-items-center rounded-full bg-night text-white transition-colors hover:bg-accent"
                    >
                      <ArrowUpRight className="size-5" aria-hidden="true" />
                    </Link>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1, ease: easeOut }}
              className="absolute inset-x-0 bottom-6 flex justify-center"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-surface/70 bg-surface/60 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md">
                <PillLink href="#collection" variant="dark" arrow className="hover:translate-y-0">
                  Shop Now
                </PillLink>
                <PillLink href="#story" variant="outline" className="py-2.5 hover:translate-y-0">
                  Our Story
                </PillLink>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: easeOut }}
            className="order-2 flex flex-col items-center gap-4 lg:order-3 lg:items-end lg:pb-24"
          >
            <p className="text-sm text-muted">Shop by Category</p>
            <ul className="flex max-w-sm flex-wrap items-center justify-center gap-2.5 lg:max-w-[17rem] lg:justify-end">
              {tags.map((tag, i) => (
                <Fragment key={tag}>
                  <motion.li
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3 + (i % 3) * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.25,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => showCategory(tag)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105",
                        i % 3 === 1
                          ? "bg-accent shadow-accent/25"
                          : "bg-night shadow-black/10 dark:ring-1 dark:ring-white/10",
                      )}
                    >
                      {categoryLabel(tag)}
                    </button>
                  </motion.li>
                  {i === 1 && (
                    <li aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-accent text-white">
                      <Star4 className="size-4" />
                    </li>
                  )}
                </Fragment>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}