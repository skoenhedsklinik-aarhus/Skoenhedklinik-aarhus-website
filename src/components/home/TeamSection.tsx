"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  short_bio: string | null;
  photo_url: string | null;
  display_order: number;
}

const TEAM_PHOTO_MAP: Record<string, string> = {
  "Aliaa Jamil": "/images/team-aliaa.avif",
  "Lise Lindhal": "/images/team-lise.avif",
  "Louise Simonsen": "/images/team-louise.avif",
};

function getTeamPhoto(member: TeamMember): string {
  return TEAM_PHOTO_MAP[member.name] || member.photo_url || "/images/filler.avif";
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

export function TeamSection({ teamMembers }: TeamSectionProps) {
  if (!teamMembers || teamMembers.length === 0) return null;

  const [featured, ...rest] = teamMembers;

  return (
    <section className="py-24 lg:py-32 bg-cream overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <span className="eyebrow text-cognac mb-4 block">Vores team</span>
          <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light">
            Mødt vores eksperter
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured member — large */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 group relative overflow-hidden rounded-sm"
            >
              <div className="relative aspect-[16/10] lg:aspect-[16/9] w-full">
                <Image
                  src={getTeamPhoto(featured)}
                  alt={featured.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Glass name card */}
                <div className="absolute bottom-6 left-6 glass rounded-xl px-6 py-4">
                  <p className="font-heading text-2xl text-white font-light">{featured.name}</p>
                  <p className="eyebrow text-cognac-light text-[10px] mt-1">{featured.role}</p>
                </div>
              </div>
              {featured.short_bio && (
                <div className="pt-5 pb-2">
                  <p className="text-textBody text-sm leading-relaxed line-clamp-2">{featured.short_bio}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Remaining members — stacked */}
          <div className="flex flex-col gap-6">
            {rest.slice(0, 2).map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 + 0.15 }}
                className="group relative overflow-hidden rounded-sm flex-1"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={getTeamPhoto(member)}
                    alt={member.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                  <div className="absolute bottom-4 left-4 glass rounded-lg px-4 py-3">
                    <p className="font-heading text-lg text-white font-light">{member.name}</p>
                    <p className="eyebrow text-cognac-light text-[9px] mt-0.5">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/om-os"
            className="inline-flex items-center gap-2 text-cognac hover:text-cognac-hover text-sm font-medium tracking-wide transition-colors group"
          >
            Læs mere om os
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
