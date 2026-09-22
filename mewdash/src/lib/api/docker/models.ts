// lib/api/docker/models.ts

/** Whether the bot could reach a Docker daemon, mirrored from DockerAvailability. */
export const DockerAvailability = {
  Available: 0,
  NotConfigured: 1,
  Unreachable: 2,
} as const;
export type DockerAvailability = (typeof DockerAvailability)[keyof typeof DockerAvailability];

/** Where a compose job is up to, mirrored from DockerJobStatus. */
export const DockerJobStatus = {
  Running: 0,
  Succeeded: 1,
  Failed: 2,
} as const;
export type DockerJobStatus = (typeof DockerJobStatus)[keyof typeof DockerJobStatus];

/** A container state change the daemon can be asked for. */
export type DockerContainerAction = "start" | "stop" | "restart";

/** A compose operation the bot can run on a project: fetch newer images, bring up, or both. */
export type DockerComposeOperation = "pull" | "up" | "update";

/** One container as the daemon lists it. */
export interface DockerContainerInfo {
  /** The full container id. */
  id: string;
  name: string;
  image: string;
  /** running, exited, paused, restarting, created or dead. */
  state: string;
  /** The daemon's human readable status such as "Up 4 days (healthy)". */
  status: string;
  /** healthy, unhealthy or "health: starting", or absent without a healthcheck. */
  health?: string;
  /** ISO timestamp of when the container was created. */
  createdAt: string;
  composeProject?: string;
  composeService?: string;
  /** Published ports in "host:container/proto" form. */
  ports: string[];
  /** Whether this is the container the answering bot instance runs in. */
  isSelf: boolean;
  /** Whether the container was started with a TTY. */
  tty: boolean;
}

/** A compose project reconstructed from container labels. */
export interface DockerComposeProject {
  name: string;
  workingDir?: string;
  configFiles: string[];
  running: number;
  total: number;
  /** Whether the compose files are visible from the bot, so pull and up can be run. */
  operable: boolean;
}

/** The daemon summary with every container and project on the host. */
export interface DockerOverview {
  availability: DockerAvailability;
  message?: string;
  endpoint?: string;
  serverVersion?: string;
  operatingSystem?: string;
  architecture?: string;
  running: number;
  stopped: number;
  images: number;
  composeAvailable: boolean;
  containers: DockerContainerInfo[];
  projects: DockerComposeProject[];
}

/** A one shot resource sample for a running container. */
export interface DockerContainerStats {
  id: string;
  cpuPercent: number;
  memoryBytes: number;
  memoryLimitBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  pids: number;
  sampledAt: string;
}

/** One log line with the daemon's timestamp. */
export interface DockerLogLine {
  /** RFC 3339 with nanoseconds, passed back unchanged as the next cursor. */
  timestamp: string;
  isError: boolean;
  text: string;
}

/** A run of log lines plus the cursor for what comes after them. */
export interface DockerLogChunk {
  containerId: string;
  lines: DockerLogLine[];
  cursor?: string;
}

/** What happened when the daemon was asked to change a container's state. */
export interface DockerActionResult {
  success: boolean;
  message?: string;
}

/** The newest image published for the bot, as Docker Hub reports it. */
export interface DockerPublishedImage {
  repository: string;
  tag: string;
  /** The commit the tag points at, when a sha tag shares its digest. */
  gitSha?: string;
  digest?: string;
  publishedAt?: string;
  checkedAt: string;
  /** Why the registry could not be queried, or absent when it answered. */
  error?: string;
}

/** What one bot instance runs and whether a newer image is published. */
export interface DockerSelfInfo {
  botVersion: string;
  gitSha?: string;
  buildDate?: string;
  startedAt: string;
  /** The container the instance runs in, or absent when it runs directly on the host. */
  container?: DockerContainerInfo;
  project?: DockerComposeProject;
  published?: DockerPublishedImage;
  /** True when a newer commit is published, false when current, absent when either side is unknown. */
  updateAvailable?: boolean;
  canUpdate: boolean;
  updateBlockedReason?: string;
}

/** A compose operation running in a helper container on the bot's host. */
export interface DockerJob {
  /** The helper container's id, also the id to poll with. */
  id: string;
  name: string;
  project: string;
  /** The services the job was limited to, empty for the whole project. */
  services: string[];
  operation: string;
  command: string;
  status: DockerJobStatus;
  startedAt: string;
  finishedAt?: string;
  exitCode?: number;
  output: string[];
}
