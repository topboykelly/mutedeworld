"use client";

import { motion } from "framer-motion";
import { whatsappUrl } from "@/lib/contact";
import { WhatsappIcon } from "./ui/SocialIcons";
import { easeOut } from "./ui/Section";

export function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2, ease: easeOut }}
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] p-3.5 text-white shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
    >
      <WhatsappIcon className="size-6" />
      <span className="hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:max-w-40 group-hover:pr-1 sm:inline">
        Chat with us
      </span>
    </motion.a>
  );
}
