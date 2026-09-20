// lib/api/docker/docker.ts
import { apiRequest } from "../core";
import type {
  DockerActionResult,
  DockerComposeOperation,
  DockerContainerAction,
  DockerContainerStats,
  DockerJob,
  DockerLogChunk,
  DockerOverview,
} from "./models";

/**
 * The Docker daemon on the selected instance's host. Owner only: the bot checks the
 * dashboard JWT, so a non-owner gets a 403 from every call here.
 * Maps to Mewdeko.Controllers.DockerController
 */
export const dockerApi = {
  /** The daemon summary with every container and compose project. */
  getOverview: () => apiRequest<DockerOverview>("Docker/overview"),

  /** One resource sample for a running container. */
  getStats: (id: string) => apiRequest<DockerContainerStats>(`Docker/containers/${id}/stats`),

  /** The last `tail` lines of a container's log. */
  getLogs: (id: string, tail: number) => apiRequest<DockerLogChunk>(`Docker/containers/${id}/logs?tail=${tail}`),

  /** The lines written after `cursor`, for live following. */
  getLogsSince: (id: string, cursor: string) =>
    apiRequest<DockerLogChunk>(`Docker/containers/${id}/logs?since=${encodeURIComponent(cursor)}`),

  /** Asks the daemon to start, stop or restart a container. */
  runAction: (id: string, action: DockerContainerAction) =>
    apiRequest<DockerActionResult>(`Docker/containers/${id}/${action}`, "POST"),

  /** Starts a compose operation on a project and returns the job to poll. */
  startComposeJob: (project: string, operation: DockerComposeOperation) =>
    apiRequest<DockerJob>(`Docker/projects/${encodeURIComponent(project)}/${operation}`, "POST"),

  /** The compose jobs still held in memory on the host, newest first. */
  listJobs: () => apiRequest<DockerJob[]>("Docker/jobs"),

  /** A compose job with the output it has produced so far. */
  getJob: (id: string) => apiRequest<DockerJob>(`Docker/jobs/${id}`),
};
