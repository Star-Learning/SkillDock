import { installSkill, scanSkillRegistry, syncInstalledSkills } from "./lib/skill-registry.mjs";
import { getSkillStatsSnapshot, recordSkillEvent } from "./lib/skill-stats.mjs";

const [command = "list", skillId] = process.argv.slice(2);

if (command === "list" || command === "status") {
  const skills = await scanSkillRegistry();
  for (const skill of skills) {
    console.log(`${skill.id}\tv${skill.version}\t${skill.tests.status}\t${skill.installStatus}`);
  }
} else if (command === "test") {
  const skills = await scanSkillRegistry();
  const selected = skillId ? skills.filter((skill) => skill.id === skillId) : skills;
  if (selected.length === 0) throw new Error(`未找到 Skill: ${skillId}`);
  for (const skill of selected) console.log(`${skill.id}: ${skill.tests.passed}/${skill.tests.total} checks passed`);
  if (selected.some((skill) => skill.tests.status !== "passed")) process.exitCode = 1;
} else if (command === "install") {
  if (!skillId) throw new Error("请提供要安装的 Skill id");
  const skill = await installSkill(skillId);
  console.log(`Installed ${skill.id} -> ${skill.installTarget}`);
} else if (command === "sync") {
  const synced = await syncInstalledSkills(skillId);
  console.log(synced.length ? `Synced: ${synced.join(", ")}` : "All installed skills are already current.");
} else if (command === "record-use") {
  if (!skillId) throw new Error("请提供实际使用的 Skill id");
  const skill = (await scanSkillRegistry()).find((item) => item.id === skillId);
  if (!skill) throw new Error(`未找到 Skill: ${skillId}`);
  const stats = await recordSkillEvent(skillId, "use");
  console.log(`Recorded use: ${skillId} (${stats.uses})`);
} else if (command === "stats") {
  const skills = await scanSkillRegistry();
  const stats = await getSkillStatsSnapshot(skills.map((skill) => skill.id));
  console.log(`Site views: ${stats.site.views}; clicks: ${stats.site.clicks}`);
  console.log(`Total uses: ${stats.totals.uses}; downloads: ${stats.totals.downloads}`);
  for (const skill of skills) console.log(`${skill.id}\tuses=${stats.skills[skill.id].uses}\tdownloads=${stats.skills[skill.id].downloads}\tclicks=${stats.skills[skill.id].clicks}`);
} else {
  throw new Error(`未知命令: ${command}. 可用命令: list, test, install, sync, record-use, stats`);
}
