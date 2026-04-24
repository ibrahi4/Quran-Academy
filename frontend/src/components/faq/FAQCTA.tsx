"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";

export default function FAQCTA() {
  const t = useTranslations("faq.cta");

  return (
    <section className="py-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-white/80 mb-10">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={siteConfig.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 py-6 text-base font-semibold shadow-xl gap-2">
                <MessageCircle className="w-5 h-5" />
                {t("whatsapp")}
              </Button>
            </a>

            <Link href="/contact">
              <Button
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-6 text-base font-semibold gap-2 bg-transparent"
              >
                <Mail className="w-5 h-5" />
                {t("contact")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
