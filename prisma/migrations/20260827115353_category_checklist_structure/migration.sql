-- CreateTable: new category tables
CREATE TABLE "ProjectProgressCategory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectProgressCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceProgressCategory" (
    "id" TEXT NOT NULL,
    "maintenanceJobId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MaintenanceProgressCategory_pkey" PRIMARY KEY ("id")
);

-- Add categoryId column (nullable for now) BEFORE any inserts/updates reference it
ALTER TABLE "ProjectProgressItem" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "MaintenanceProgressItem" ADD COLUMN "categoryId" TEXT;

-- Temporarily relax the old required columns so new template-task rows
-- (which have no projectId/maintenanceJobId of their own) can be inserted
-- before the old columns are dropped below.
ALTER TABLE "ProjectProgressItem" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "MaintenanceProgressItem" ALTER COLUMN "maintenanceJobId" DROP NOT NULL;

-- Preserve existing checklist data: one "Legacy" category per project/job
-- that already has items, holding everything already checked off.
INSERT INTO "ProjectProgressCategory" ("id", "projectId", "label", "order", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || "projectId"), "projectId", 'Installation Tasks (Legacy)', 5, now(), now()
FROM (SELECT DISTINCT "projectId" FROM "ProjectProgressItem") t;

INSERT INTO "MaintenanceProgressCategory" ("id", "maintenanceJobId", "label", "order", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || "maintenanceJobId"), "maintenanceJobId", 'Installation Tasks (Legacy)', 5, now(), now()
FROM (SELECT DISTINCT "maintenanceJobId" FROM "MaintenanceProgressItem") t;

-- Point existing items at their new Legacy category
UPDATE "ProjectProgressItem" pi
SET "categoryId" = pc.id
FROM "ProjectProgressCategory" pc
WHERE pc."projectId" = pi."projectId" AND pc.label = 'Installation Tasks (Legacy)';

UPDATE "MaintenanceProgressItem" mi
SET "categoryId" = mc.id
FROM "MaintenanceProgressCategory" mc
WHERE mc."maintenanceJobId" = mi."maintenanceJobId" AND mc.label = 'Installation Tasks (Legacy)';

-- Now seed the 5 new standard categories (with full task lists) onto every
-- existing project that already has a checklist, so they match new projects.
WITH new_cats AS (
  INSERT INTO "ProjectProgressCategory" ("id", "projectId", "label", "order", "createdAt", "updatedAt")
  SELECT md5(random()::text || clock_timestamp()::text || p."projectId" || c.label), p."projectId", c.label, c.ord, now(), now()
  FROM (SELECT DISTINCT "projectId" FROM "ProjectProgressItem") p
  CROSS JOIN (VALUES
    ('Shop Drawing', 0),
    ('Fire Alarm System', 1),
    ('Emergency Lights and Exit Lights', 2),
    ('Fire Fighting System', 3),
    ('Fire Suppression System', 4)
  ) AS c(label, ord)
  RETURNING id, "projectId", label
)
INSERT INTO "ProjectProgressItem" ("id", "categoryId", "label", "completed", "order", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || nc.id || t.ord::text), nc.id, t.task, false, t.ord, now(), now()
FROM new_cats nc
JOIN (VALUES
  ('Fire Alarm System', 0, 'Installation of piping or trunking for SD, HD, MCP and sounder'),
  ('Fire Alarm System', 1, 'Installation of cables for SD, HD, MCP and sounder'),
  ('Fire Alarm System', 2, 'Installation of smoke detectors'),
  ('Fire Alarm System', 3, 'Installation of heat detectors'),
  ('Fire Alarm System', 4, 'Installation of MCP'),
  ('Fire Alarm System', 5, 'Installation of sounder'),
  ('Fire Alarm System', 6, 'Installation of FACP'),
  ('Fire Alarm System', 7, 'Installation of module and IFU'),
  ('Fire Alarm System', 8, 'Continuity testing, programming and addressing'),
  ('Fire Alarm System', 9, 'Testing and commissioning'),
  ('Emergency Lights and Exit Lights', 0, 'Installation of piping or trunking for emergency light and exit light'),
  ('Emergency Lights and Exit Lights', 1, 'Installation of cables for emergency light and exit light'),
  ('Emergency Lights and Exit Lights', 2, 'Installation of emergency light'),
  ('Emergency Lights and Exit Lights', 3, 'Installation of exit light'),
  ('Emergency Lights and Exit Lights', 4, 'Power supply connection'),
  ('Emergency Lights and Exit Lights', 5, 'Testing and commissioning'),
  ('Fire Fighting System', 0, 'Installation of HDPE pipes'),
  ('Fire Fighting System', 1, 'Pressure testing for HDPE pipes'),
  ('Fire Fighting System', 2, 'Installation of landing valves / wet risers'),
  ('Fire Fighting System', 3, 'Installation of fire hydrant'),
  ('Fire Fighting System', 4, 'Installation of fire hose cabinet'),
  ('Fire Fighting System', 5, 'Installation of fire hose reel connection and fire hose'),
  ('Fire Fighting System', 6, 'Painting of piping for fire hose reel and other G.I pipes'),
  ('Fire Fighting System', 7, 'Installation of sprinkler pipes'),
  ('Fire Fighting System', 8, 'Installation of sprinkler heads'),
  ('Fire Fighting System', 9, 'Installation of civil defense connection (breeching inlet)'),
  ('Fire Fighting System', 10, 'Installation of interfacing unit for fire alarm'),
  ('Fire Fighting System', 11, 'Installation of fire pump set (electric, diesel, jockey) and its accessories'),
  ('Fire Fighting System', 12, 'Installation of fire extinguisher cabinet'),
  ('Fire Fighting System', 13, 'Installation of fire extinguisher'),
  ('Fire Fighting System', 14, 'Supply and installation of fire blanket'),
  ('Fire Fighting System', 15, 'Testing and commissioning'),
  ('Fire Suppression System', 0, 'Installation of fire suppression piping and associated support'),
  ('Fire Suppression System', 1, 'Installation of valves, fittings, nozzles/sprinkler heads and accessories'),
  ('Fire Suppression System', 2, 'Installation of fire suppression equipment such as cylinders, tanks, pumps, control panels, release panels, or other system components as applicable'),
  ('Fire Suppression System', 3, 'Installation of detection, alarm releasing, and monitoring interfaces where applicable'),
  ('Fire Suppression System', 4, 'Functional testing and system commissioning')
) AS t(label, ord, task) ON t.label = nc.label;

-- Same for Maintenance
WITH new_job_cats AS (
  INSERT INTO "MaintenanceProgressCategory" ("id", "maintenanceJobId", "label", "order", "createdAt", "updatedAt")
  SELECT md5(random()::text || clock_timestamp()::text || j."maintenanceJobId" || c.label), j."maintenanceJobId", c.label, c.ord, now(), now()
  FROM (SELECT DISTINCT "maintenanceJobId" FROM "MaintenanceProgressItem") j
  CROSS JOIN (VALUES
    ('Shop Drawing', 0),
    ('Fire Alarm System', 1),
    ('Emergency Lights and Exit Lights', 2),
    ('Fire Fighting System', 3),
    ('Fire Suppression System', 4)
  ) AS c(label, ord)
  RETURNING id, "maintenanceJobId", label
)
INSERT INTO "MaintenanceProgressItem" ("id", "categoryId", "label", "completed", "order", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || njc.id || t.ord::text), njc.id, t.task, false, t.ord, now(), now()
FROM new_job_cats njc
JOIN (VALUES
  ('Fire Alarm System', 0, 'Installation of piping or trunking for SD, HD, MCP and sounder'),
  ('Fire Alarm System', 1, 'Installation of cables for SD, HD, MCP and sounder'),
  ('Fire Alarm System', 2, 'Installation of smoke detectors'),
  ('Fire Alarm System', 3, 'Installation of heat detectors'),
  ('Fire Alarm System', 4, 'Installation of MCP'),
  ('Fire Alarm System', 5, 'Installation of sounder'),
  ('Fire Alarm System', 6, 'Installation of FACP'),
  ('Fire Alarm System', 7, 'Installation of module and IFU'),
  ('Fire Alarm System', 8, 'Continuity testing, programming and addressing'),
  ('Fire Alarm System', 9, 'Testing and commissioning'),
  ('Emergency Lights and Exit Lights', 0, 'Installation of piping or trunking for emergency light and exit light'),
  ('Emergency Lights and Exit Lights', 1, 'Installation of cables for emergency light and exit light'),
  ('Emergency Lights and Exit Lights', 2, 'Installation of emergency light'),
  ('Emergency Lights and Exit Lights', 3, 'Installation of exit light'),
  ('Emergency Lights and Exit Lights', 4, 'Power supply connection'),
  ('Emergency Lights and Exit Lights', 5, 'Testing and commissioning'),
  ('Fire Fighting System', 0, 'Installation of HDPE pipes'),
  ('Fire Fighting System', 1, 'Pressure testing for HDPE pipes'),
  ('Fire Fighting System', 2, 'Installation of landing valves / wet risers'),
  ('Fire Fighting System', 3, 'Installation of fire hydrant'),
  ('Fire Fighting System', 4, 'Installation of fire hose cabinet'),
  ('Fire Fighting System', 5, 'Installation of fire hose reel connection and fire hose'),
  ('Fire Fighting System', 6, 'Painting of piping for fire hose reel and other G.I pipes'),
  ('Fire Fighting System', 7, 'Installation of sprinkler pipes'),
  ('Fire Fighting System', 8, 'Installation of sprinkler heads'),
  ('Fire Fighting System', 9, 'Installation of civil defense connection (breeching inlet)'),
  ('Fire Fighting System', 10, 'Installation of interfacing unit for fire alarm'),
  ('Fire Fighting System', 11, 'Installation of fire pump set (electric, diesel, jockey) and its accessories'),
  ('Fire Fighting System', 12, 'Installation of fire extinguisher cabinet'),
  ('Fire Fighting System', 13, 'Installation of fire extinguisher'),
  ('Fire Fighting System', 14, 'Supply and installation of fire blanket'),
  ('Fire Fighting System', 15, 'Testing and commissioning'),
  ('Fire Suppression System', 0, 'Installation of fire suppression piping and associated support'),
  ('Fire Suppression System', 1, 'Installation of valves, fittings, nozzles/sprinkler heads and accessories'),
  ('Fire Suppression System', 2, 'Installation of fire suppression equipment such as cylinders, tanks, pumps, control panels, release panels, or other system components as applicable'),
  ('Fire Suppression System', 3, 'Installation of detection, alarm releasing, and monitoring interfaces where applicable'),
  ('Fire Suppression System', 4, 'Functional testing and system commissioning')
) AS t(label, ord, task) ON t.label = njc.label;

-- Make categoryId required now that every row has one
ALTER TABLE "ProjectProgressItem" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "MaintenanceProgressItem" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old direct project/job links and their FKs
ALTER TABLE "ProjectProgressItem" DROP CONSTRAINT IF EXISTS "ProjectProgressItem_projectId_fkey";
ALTER TABLE "ProjectProgressItem" DROP COLUMN "projectId";

ALTER TABLE "MaintenanceProgressItem" DROP CONSTRAINT IF EXISTS "MaintenanceProgressItem_maintenanceJobId_fkey";
ALTER TABLE "MaintenanceProgressItem" DROP COLUMN "maintenanceJobId";

-- Add the new FK constraints
ALTER TABLE "ProjectProgressItem" ADD CONSTRAINT "ProjectProgressItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProjectProgressCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectProgressCategory" ADD CONSTRAINT "ProjectProgressCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceProgressItem" ADD CONSTRAINT "MaintenanceProgressItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaintenanceProgressCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceProgressCategory" ADD CONSTRAINT "MaintenanceProgressCategory_maintenanceJobId_fkey" FOREIGN KEY ("maintenanceJobId") REFERENCES "MaintenanceJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
