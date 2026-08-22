"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/components/SectionHeader";
import { experience } from "@/data/experience";
import { transition } from "@/lib/motion";

type GroupedRole = {
  company: string;
  roles: typeof experience;
};

function groupByCompany(items: typeof experience): GroupedRole[] {
  const order: string[] = [];
  const map = new Map<string, typeof experience>();

  for (const job of items) {
    const current = map.get(job.company);
    if (current) {
      current.push(job);
    } else {
      map.set(job.company, [job]);
      order.push(job.company);
    }
  }

  return order.map((company) => ({
    company,
    roles: map.get(company) ?? [],
  }));
}

export function ExperienceSection() {
  const groups = groupByCompany(experience);

  return (
    <section
      id="experience"
      className="relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Experience"
          title={
            <>
              Where the work{" "}
              <span className="italic text-[var(--accent-strong)]">happened.</span>
            </>
          }
          description="Contract, part-time, and teaching roles across research software, accessibility, and AI engineering."
        />

        <ol className="space-y-4">
          {groups.map((group, i) => (
            <motion.li
              key={group.company}
              className="panel rounded-3xl p-6 md:p-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...transition.card, delay: i * 0.05 }}
            >
              <h3 className="font-serif text-2xl text-[var(--ink)] md:text-3xl">
                {group.company}
              </h3>

              <div className="mt-6 space-y-8">
                {group.roles.map((job) => (
                  <article
                    key={`${job.company}-${job.period}-${job.title}`}
                    className="grid gap-3 border-t border-[var(--line)] pt-6 md:grid-cols-[minmax(0,1fr)_220px]"
                  >
                    <div>
                      <h4 className="text-base text-[var(--ink)]">{job.title}</h4>
                      <p className="mt-1 text-sm text-[var(--faint)]">{job.location}</p>
                      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                        {job.highlights.map((line) => (
                          <li key={line} className="flex gap-3">
                            <span
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                              aria-hidden
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--faint)] md:text-right">
                      {job.period}
                    </p>
                  </article>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
