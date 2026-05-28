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

const INTRO =
  "Hos os møder du certificerede specialister, der brænder for naturlige resultater, tryghed og personlig rådgivning. Vi tager os tid til at lytte til dine ønsker og guider dig sikkert gennem hele forløbet — altid med fokus på kvalitet, sikkerhed og et naturligt udtryk.";

interface TeamSectionProps {
  teamMembers: TeamMember[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
  showCta?: boolean;
}

function TeamPortrait({
  member,
  delay = 0,
  className = "",
}: {
  member: TeamMember;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col items-center ${className}`}
    >
      <figcaption className="text-center mb-5">
        <p className="font-heading text-xl lg:text-2xl text-textPrimary font-light">
          {member.name}
        </p>
        <p className="eyebrow text-cognac text-[10px] mt-1.5">{member.role}</p>
      </figcaption>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-cognac/10">
        <Image
          src={getTeamPhoto(member)}
          alt={`${member.name} — ${member.role}`}
          fill
          className="object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>
    </motion.figure>
  );
}

export function TeamSection({
  teamMembers,
  eyebrow = "Vores team",
  heading = "Om os",
  intro = INTRO,
  showCta = true,
}: TeamSectionProps) {
  if (!teamMembers || teamMembers.length === 0) return null;

  // Owner (display_order 1) anchors the centre; the rest flank it.
  const owner = teamMembers[0];
  const sides = teamMembers.slice(1);
  const leftMember = sides[sides.length - 1];
  const rightMember = sides.length > 1 ? sides[0] : undefined;

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-[#E6CDB3] via-[#F0E4D5] to-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="eyebrow text-cognac mb-4 block">{eyebrow}</span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary font-light mb-6">
            {heading}
          </h2>
          <p className="text-textBody text-base md:text-lg leading-relaxed">{intro}</p>
        </motion.div>

        {/* Staggered trio — owner centred & lower, others flanking */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 lg:gap-12 items-start max-w-5xl mx-auto">
          {leftMember && <TeamPortrait member={leftMember} />}

          {owner && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className={`flex flex-col items-center ${showCta ? "sm:mt-16 lg:mt-24" : "sm:mt-10"}`}
            >
              {showCta && (
                <Link
                  href="/om-os"
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-cognac/40 bg-cream/40 px-9 py-3 text-sm font-medium tracking-wide text-textPrimary backdrop-blur-sm transition-colors hover:border-cognac hover:bg-cognac hover:text-white"
                >
                  Læs mere
                </Link>
              )}
              <div className="text-center mb-5">
                <p className="font-heading text-xl lg:text-2xl text-textPrimary font-light">
                  {owner.name}
                </p>
                <p className="eyebrow text-cognac text-[10px] mt-1.5">{owner.role}</p>
              </div>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-cognac/10">
                <Image
                  src={getTeamPhoto(owner)}
                  alt={`${owner.name} — ${owner.role}`}
                  fill
                  className="object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </motion.div>
          )}

          {rightMember && <TeamPortrait member={rightMember} delay={0.2} />}
        </div>
      </div>
    </section>
  );
}
