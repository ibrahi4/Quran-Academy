"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
  categoryKey: string;
  icon: LucideIcon;
  searchQuery: string;
  index: number;
};

export default function FAQCategory({ categoryKey, icon: Icon, searchQuery, index }: Props) {
  const t = useTranslations("faq");

  const questionsCount = Number(t(`${categoryKey}.count`));
  const questions = Array.from({ length: questionsCount }, (_, i) => ({
    question: t(`${categoryKey}.items.${i}.q`),
    answer: t(`${categoryKey}.items.${i}.a`),
  }));

  const filtered = searchQuery
    ? questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : questions;

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {t(`categories.${categoryKey}`)}
        </h2>
        <span className="ml-auto rtl:mr-auto rtl:ml-0 px-3 py-1 bg-primary/5 text-primary text-sm font-medium rounded-full">
          {filtered.length}
        </span>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {filtered.map((item, i) => (
          <AccordionItem
            key={i}
            value={`${categoryKey}-${i}`}
            className="bg-white rounded-2xl border border-gray-100 px-6 shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:shadow-premium data-[state=open]:border-primary/20"
          >
            <AccordionTrigger className="text-left rtl:text-right text-base font-semibold text-gray-800 hover:text-primary py-5 hover:no-underline [&[data-state=open]]:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed pb-5 text-[15px]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
