export type SkillInstallStatus = "current" | "outdated" | "not-installed";
export type SkillTestStatus = "passed" | "failed";

export type SkillCheck = {
  id: string;
  label: string;
  passed: boolean;
  count?: number;
  message?: string;
};

export type ManagedSkill = {
  id: string;
  name: string;
  displayName: string;
  version: string;
  category: string;
  summary: string;
  description: string;
  status: "stable" | "beta";
  source: string;
  tags: string[];
  compatibility: string[];
  requirements: string[];
  directory: string;
  installTarget: string;
  installStatus: SkillInstallStatus;
  sourceChecksum: string;
  fileCount: number;
  sourceBytes: number;
  tests: {
    status: SkillTestStatus;
    passed: number;
    total: number;
    promptCases: number;
    checks: SkillCheck[];
  };
  package: {
    fileName: string;
    path: string;
    bytes: number;
    sha256: string;
  };
};

export type SkillRegistry = {
  generatedAt: string;
  summary: {
    total: number;
    installed: number;
    needsSync: number;
    passing: number;
  };
  targets: Array<{
    id: string;
    name: string;
    path: string;
    scope: string;
    installed: number;
  }>;
  skills: ManagedSkill[];
};
