"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 dark:from-primary-800 dark:to-secondary-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Hydrogen Infrastructure?
          </h2>
          <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto">
            Join leading organizations in accelerating the green hydrogen
            economy. Start mapping your infrastructure projects today.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="group bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Sales
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">30-Day</div>
              <div className="text-white/80">Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/80">Uptime SLA</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
