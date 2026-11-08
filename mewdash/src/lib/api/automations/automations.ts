// lib/api/automations/automations.ts
import { apiRequest } from "../core";
import type {
  Automation,
  AutomationRequest,
  AutomationRun,
  AutomationSchema,
  AutomationTemplate,
  AutomationTemplateRequest,
  AutomationTemplateResult,
  AutomationTestRequest,
  AutomationTestResult,
} from "./models";

/**
 * Automations API
 * Maps to Mewdeko.Controllers.AutomationsController
 */
export const automationsApi = {
  /**
   * Lists the automations of a guild
   * @param guildId The guild ID
   */
  getAutomations: (guildId: bigint) =>
    apiRequest<Automation[]>(`automations/${guildId}`),

  /**
   * Gets one automation
   * @param guildId The guild ID
   * @param id The automation ID
   */
  getAutomation: (guildId: bigint, id: number) =>
    apiRequest<Automation>(`automations/${guildId}/${id}`),

  /**
   * Creates an automation. A 400 carries the path and message of each problem found.
   * @param guildId The guild ID
   * @param request The automation
   */
  createAutomation: (guildId: bigint, request: AutomationRequest) =>
    apiRequest<Automation>(`automations/${guildId}`, "POST", request),

  /**
   * Replaces the settings, conditions and actions of an automation
   * @param guildId The guild ID
   * @param id The automation ID
   * @param request The automation
   */
  updateAutomation: (guildId: bigint, id: number, request: AutomationRequest) =>
    apiRequest<Automation>(`automations/${guildId}/${id}`, "PUT", request),

  /**
   * Turns an automation on or off
   * @param guildId The guild ID
   * @param id The automation ID
   * @param enabled Whether it should run
   */
  setEnabled: (guildId: bigint, id: number, enabled: boolean) =>
    apiRequest<Automation>(`automations/${guildId}/${id}/enabled`, "PATCH", {
      enabled,
    }),

  /**
   * Deletes an automation and its run log
   * @param guildId The guild ID
   * @param id The automation ID
   */
  deleteAutomation: (guildId: bigint, id: number) =>
    apiRequest<void>(`automations/${guildId}/${id}`, "DELETE"),

  /**
   * Runs an automation once as a member, ignoring its conditions and cooldown
   * @param guildId The guild ID
   * @param id The automation ID
   * @param request The member to act as and the channel to run in
   */
  testAutomation: (guildId: bigint, id: number, request: AutomationTestRequest) =>
    apiRequest<AutomationTestResult>(
      `automations/${guildId}/${id}/test`,
      "POST",
      request,
    ),

  /**
   * Gets the latest runs of an automation, newest first
   * @param guildId The guild ID
   * @param id The automation ID
   * @param limit The most runs to return, up to 50
   */
  getRuns: (guildId: bigint, id: number, limit = 50) =>
    apiRequest<AutomationRun[]>(
      `automations/${guildId}/${id}/runs?limit=${limit}`,
    ),

  /**
   * Lists the starter templates and what each needs to be told
   * @param guildId The guild ID
   */
  getTemplates: (guildId: bigint) =>
    apiRequest<AutomationTemplate[]>(`automations/${guildId}/templates`),

  /**
   * Creates the automations of a template
   * @param guildId The guild ID
   * @param templateId The template ID
   * @param request What the template needs to be told
   */
  createFromTemplate: (
    guildId: bigint,
    templateId: string,
    request: AutomationTemplateRequest,
  ) =>
    apiRequest<AutomationTemplateResult>(
      `automations/${guildId}/templates/${templateId}`,
      "POST",
      request,
    ),

  /**
   * Describes every trigger, condition and action with its fields
   * @param guildId The guild ID
   */
  getSchema: (guildId: bigint) =>
    apiRequest<AutomationSchema>(`automations/${guildId}/schema`),
};
