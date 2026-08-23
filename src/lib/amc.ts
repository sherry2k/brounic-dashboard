import { prisma } from "@/lib/prisma";

// The default checklist template applied to every new AMC visit.
// Editable per-contract after creation if a site lacks a given system
// (e.g. no sprinklers) — just remove or mark those items N/A.
export const DEFAULT_CHECKLIST_TEMPLATE: { system: string; description: string }[] = [
  { system: "EXTINGUISHER", description: "Pressure gauge in green zone" },
  { system: "EXTINGUISHER", description: "Seal intact and not tampered" },
  { system: "EXTINGUISHER", description: "Within expiry date" },
  { system: "EXTINGUISHER", description: "Signage visible and accessible" },
  { system: "FIRE_ALARM", description: "Control panel status normal" },
  { system: "FIRE_ALARM", description: "Battery backup test" },
  { system: "FIRE_ALARM", description: "Detector functionality by zone" },
  { system: "FIRE_ALARM", description: "Sounder / horn test" },
  { system: "SPRINKLER", description: "System pressure reading" },
  { system: "SPRINKLER", description: "Valve positions correct" },
  { system: "SPRINKLER", description: "No visible leaks" },
  { system: "FIRE_PUMP", description: "Jockey pump start test" },
  { system: "FIRE_PUMP", description: "Main pump start test" },
  { system: "FIRE_PUMP", description: "Standby pump start test" },
  { system: "FIRE_PUMP", description: "Fuel / battery level (diesel pumps)" },
  { system: "HYDRANT_HOSE_REEL", description: "Hydrant pressure test" },
  { system: "HYDRANT_HOSE_REEL", description: "Hose condition check" },
  { system: "HYDRANT_HOSE_REEL", description: "Cabinet accessibility" },
  { system: "EMERGENCY_LIGHTING", description: "Battery duration test" },
  { system: "EMERGENCY_LIGHTING", description: "Illumination check" },
];

/**
 * Creates an AMC contract along with its 4 quarterly visits (spaced ~90
 * days apart from the contract start date), each pre-populated with the
 * default checklist template.
 */
export async function createAMCContractWithVisits(input: {
  siteId: string;
  projectId?: string;
  contractValue?: number;
  contractStart: Date;
  contractEnd: Date;
}) {
  const quarters: { label: "Q1" | "Q2" | "Q3" | "Q4"; offsetDays: number }[] = [
    { label: "Q1", offsetDays: 0 },
    { label: "Q2", offsetDays: 90 },
    { label: "Q3", offsetDays: 180 },
    { label: "Q4", offsetDays: 270 },
  ];

  return prisma.aMCContract.create({
    data: {
      siteId: input.siteId,
      projectId: input.projectId,
      contractValue: input.contractValue,
      contractStart: input.contractStart,
      contractEnd: input.contractEnd,
      visitsPerYear: 4,
      visits: {
        create: quarters.map((q) => {
          const dueDate = new Date(input.contractStart);
          dueDate.setDate(dueDate.getDate() + q.offsetDays);
          return {
            quarter: q.label as any,
            dueDate,
            status: "UPCOMING",
            checklistItems: {
              create: DEFAULT_CHECKLIST_TEMPLATE.map((item) => ({
                system: item.system as any,
                description: item.description,
              })),
            },
          };
        }),
      },
    },
    include: { visits: { include: { checklistItems: true } } },
  });
}
