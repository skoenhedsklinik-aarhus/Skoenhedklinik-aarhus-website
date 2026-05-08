"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Database } from "@/types/supabase";

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

export function TeamSection({ teamMembers }: TeamSectionProps) {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-2 block">
            Teamet
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
            Mød vores specialister
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden mb-6 border-4 border-white shadow-sm">
                <Image
                  src={member.photo_url || "/placeholder.jpg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading text-[28px] text-textPrimary mb-1">
                {member.name}
              </h3>
              <div className="text-cognac font-medium mb-4">
                {member.role}
              </div>
              <p className="text-textBody text-base line-clamp-3 max-w-xs mx-auto">
                {member.short_bio}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/om-os">
            <Button variant="ghost" className="text-cognac border border-cognac hover:bg-beige rounded-full px-8">
              Læs mere om os
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
