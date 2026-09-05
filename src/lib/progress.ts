export const DEFAULT_PROGRESS_STRUCTURE: { category: string; tasks: string[] }[] = [
  {
    category: "Shop Drawing",
    tasks: ["Shop Drawings Approval", "Mobilization"],
  },
  {
    category: "Fire Alarm System",
    tasks: [
      "Installation of piping or trunking for SD, HD, MCP and sounder",
      "Installation of cables for SD, HD, MCP and sounder",
      "Installation of smoke detectors",
      "Installation of heat detectors",
      "Installation of MCP",
      "Installation of sounder",
      "Installation of FACP",
      "Installation of module and IFU",
      "Continuity testing, programming and addressing",
      "Testing and commissioning",
    ],
  },
  {
    category: "Emergency Lights and Exit Lights",
    tasks: [
      "Installation of piping or trunking for emergency light and exit light",
      "Installation of cables for emergency light and exit light",
      "Installation of emergency light",
      "Installation of exit light",
      "Power supply connection",
      "Testing and commissioning",
    ],
  },
  {
    category: "Fire Fighting System",
    tasks: [
      "Installation of HDPE pipes",
      "Pressure testing for HDPE pipes",
      "Installation of landing valves / wet risers",
      "Installation of fire hydrant",
      "Installation of fire hose cabinet",
      "Installation of fire hose reel connection and fire hose",
      "Painting of piping for fire hose reel and other G.I pipes",
      "Installation of sprinkler pipes",
      "Installation of sprinkler heads",
      "Installation of civil defense connection (breeching inlet)",
      "Installation of interfacing unit for fire alarm",
      "Installation of fire pump set (electric, diesel, jockey) and its accessories",
      "Installation of fire extinguisher cabinet",
      "Installation of fire extinguisher",
      "Supply and installation of fire blanket",
      "Testing and commissioning",
    ],
  },
  {
    category: "Fire Suppression System",
    tasks: [
      "Installation of fire suppression piping and associated support",
      "Installation of valves, fittings, nozzles/sprinkler heads and accessories",
      "Installation of fire suppression equipment such as cylinders, tanks, pumps, control panels, release panels, or other system components as applicable",
      "Installation of detection, alarm releasing, and monitoring interfaces where applicable",
      "Functional testing and system commissioning",
    ],
  },
];

// "Shop Drawings Approval" (inside the Shop Drawing category) being checked
// contributes a flat 2%. Every other task — including Mobilization and all
// other categories — makes up the remaining 98%, so full completion of both
// reaches exactly 100%.
export function calculateOverallProgress(
  categories: { label?: string; items: { id: string; label: string; completed: boolean }[] }[]
) {
  const allItems = categories.flatMap((c) => c.items);

  const shopDrawingCategory = categories.find((c) => c.label === "Shop Drawing");
  const approvalItem = shopDrawingCategory?.items.find((i) => i.label === "Shop Drawings Approval");
  const approvalDone = approvalItem?.completed ?? false;

  const poolItems = approvalItem ? allItems.filter((i) => i.id !== approvalItem.id) : allItems;
  const total = poolItems.length;
  const done = poolItems.filter((i) => i.completed).length;
  const checklistPortion = total === 0 ? 0 : (done / total) * 98;
  const bonus = approvalDone ? 2 : 0;
  return Math.round(checklistPortion + bonus);
}

// Maintenance jobs don't need Shop Drawing approval — every task counts
// equally toward 100%, no special-cased bonus task.
export function calculateSimpleProgress(categories: { items: { completed: boolean }[] }[]) {
  const items = categories.flatMap((c) => c.items);
  const total = items.length;
  if (total === 0) return 0;
  const done = items.filter((i) => i.completed).length;
  return Math.round((done / total) * 100);
}
