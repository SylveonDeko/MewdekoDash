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
  DockerSelfInfo,
} from "./models";

/**
 * Headers that aim a request at one specific instance instead of the selected one. The proxy
 * resolves the port against the registered instance list, so this cannot name an arbitrary host.
 */
function instanceHeaders(port?: number): HeadersInit {
  return port === undefined ? {} : { "X-Instance-Port": port.toString() };
}

/**
 * The Docker daemon on the selected instance's host. Owner only: the bot checks the
 * dashboard JWT, so a non-owner gets a 403 from every call here.
 * Maps to Mewdeko.Controllers.DockerController
 */
export const dockerApi = {
  /** The daemon summary with every container and compose project. */
  getOverview: () => apiRequest<DockerOverview>("Docker/overview"),

  /**
   * What one instance runs and whether a newer image is published. Pass the instance's port to
   * ask a bot other than the selected one, which is how the fleet view asks every bot at once.
   */
  getSelf: (port?: number, refresh = false) =>
    apiRequest<DockerSelfInfo>(`Docker/self${refresh ? "?refresh=true" : ""}`, "GET", undefined, instanceHeaders(port)),

  /** Pulls the newest image and recreates that instance's own container. */
  updateSelf: (port?: number) =>
    apiRequest<DockerJob>("Docker/self/update", "POST", undefined, instanceHeaders(port)),

  /** Pulls the newest image and recreates every container in the selected instance's compose project. */
  updateAll: () => apiRequest<DockerJob>("Docker/self/update-all", "POST"),

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

  /** Starts a compose operation on a project, optionally limited to some services, and returns the job. */
  startComposeJob: (project: string, operation: DockerComposeOperation, services: string[] = []) =>
    apiRequest<DockerJob>(
      `Docker/projects/${encodeURIComponent(project)}/${operation}${services.length ? `?services=${encodeURIComponent(services.join(","))}` : ""}`,
      "POST",
    ),

  /** The compose jobs whose helper containers still exist, newest first, without output. */
  listJobs: () => apiRequest<DockerJob[]>("Docker/jobs"),

  /** A compose job with the output it has produced so far. */
  getJob: (id: string) => apiRequest<DockerJob>(`Docker/jobs/${id}`),
};
