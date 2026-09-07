// lib/api/forms/forms.ts
import { apiDownload, apiRequest } from "../core";
import type {
  ApprovalResponse,
  EligibilityCheckResponse,
  Form,
  FormQuestion,
  FormQuestionCondition,
  FormDraft,
  FormQuestionOption,
  FormResponse,
  FormResponseRevision,
  FormReviewEmotes,
  FormSaveRequest,
  FormSubmissionRequest,
  FormSubmissionResponse,
  FormVersion,
  FormVersionChange,
  FormVersionList,
  PaginatedResponses,
  ResponseStatus,
  ResponseStatusResponse,
  ResponseWithWorkflow,
  UserSubmission
} from "./models";

/**
 * Forms API client
 * Maps to Mewdeko.Controllers.FormsController
 */
export const formsApi = {
  // ============================================
  // Form Management
  // ============================================

  /**
   * Gets all forms for a guild
   * @param guildId The guild ID
   * @param activeOnly If true, only return active forms
   * @returns List of forms with response counts
   */
  getGuildForms: (guildId: bigint, activeOnly: boolean = false) =>
    apiRequest<Form[]>(`forms/guild/${guildId}?activeOnly=${activeOnly}`),

  /**
   * Gets a specific form by ID
   * @param formId The form ID
   * @returns The form details
   */
  getForm: (formId: number) => apiRequest<Form>(`forms/${formId}`),

  /**
   * Creates a new form for a guild
   * @param guildId The guild ID
   * @param form The form to create
   * @returns The created form
   */
  createForm: (guildId: bigint, form: Partial<Form>) =>
    apiRequest<Form>(`forms/guild/${guildId}`, "POST", form),

  /**
   * Updates an existing form
   * @param formId The form ID
   * @param form The updated form data
   * @returns Success message
   */
  updateForm: (formId: number, form: Partial<Form>) =>
    apiRequest<{ message: string }>(`forms/${formId}`, "PUT", form),

  /**
   * Saves a whole form in one request: settings, questions, options and conditions.
   *
   * Preferred over the per-question calls, which for a long form meant dozens of sequential
   * requests and could leave a form half saved if one of them failed.
   * @param guildId The guild the form belongs to
   * @param request The form and its questions
   * @returns The saved form
   */
  saveForm: (guildId: bigint, request: FormSaveRequest) =>
    apiRequest<Form>(`forms/guild/${guildId}/save`, "POST", request),

  /**
   * Deletes a form and all associated data
   * @param formId The form ID
   * @returns Success message
   */
  deleteForm: (formId: number) =>
    apiRequest<{ message: string }>(`forms/${formId}`, "DELETE"),

  /**
   * Toggles a form's active status
   * @param formId The form ID
   * @param isActive The new active status
   * @returns Success message
   */
  setFormActiveStatus: (formId: number, isActive: boolean) =>
    apiRequest<{ message: string }>(
      `forms/${formId}/active`,
      "PATCH",
      isActive,
    ),

  /**
   * Duplicates a form with all questions and options
   * @param formId The form ID to duplicate
   * @param userId The user ID creating the duplicate
   * @returns The duplicated form
   */
  duplicateForm: (formId: number, userId: bigint) =>
    apiRequest<Form>(`forms/${formId}/duplicate`, "POST", userId),

  /**
   * Publishes a draft form
   * @param formId The form ID to publish
   * @returns Success message
   */
  publishForm: (formId: number) =>
    apiRequest<{ message: string }>(`forms/${formId}/publish`, "POST"),

  /**
   * Generates a share link for a form
   * @param formId The form ID
   * @param instanceIdentifier The instance identifier (port or name)
   * @returns Share code
   */
  generateShareLink: async (formId: number, instanceIdentifier: string) => {
    const response = await apiRequest<{ shareCode: string }>(`forms/${formId}/share-link`, "POST", {
      instanceIdentifier,
    });

    if (!response?.shareCode) {
      throw new Error("Share link response did not include a share code");
    }

    return response;
  },

  /**
   * Resolves a share code to get form and instance info
   * @param shareCode The share code
   * @returns Form ID and instance identifier
   */
  resolveShareLink: (shareCode: string) =>
    apiRequest<{ formId: number; instanceIdentifier: string }>(
      `forms/share/${shareCode}`,
    ),

  // ============================================
  // Question Management
  // ============================================

  /**
   * Gets all questions for a form with options
   * @param formId The form ID
   * @returns List of questions with options
   */
  getFormQuestions: (formId: number) =>
    apiRequest<FormQuestion[]>(`forms/${formId}/questions`),

  /**
   * Adds a question to a form
   * @param formId The form ID
   * @param question The question to add
   * @returns The created question
   */
  addQuestion: (formId: number, question: Partial<FormQuestion>) =>
    apiRequest<FormQuestion>(`forms/${formId}/questions`, "POST", question),

  /**
   * Updates a question
   * @param questionId The question ID
   * @param question The updated question data
   * @returns Success message
   */
  updateQuestion: (questionId: number, question: Partial<FormQuestion>) =>
    apiRequest<{ message: string }>(
      `forms/questions/${questionId}`,
      "PUT",
      question,
    ),

  /**
   * Deletes a question
   * @param questionId The question ID
   * @returns Success message
   */
  deleteQuestion: (questionId: number) =>
    apiRequest<{ message: string }>(`forms/questions/${questionId}`, "DELETE"),

  /**
   * Adds an option to a question
   * @param questionId The question ID
   * @param option The option to add
   * @returns The created option
   */
  addQuestionOption: (
    questionId: number,
    option: Partial<FormQuestionOption>,
  ) =>
    apiRequest<FormQuestionOption>(
      `forms/questions/${questionId}/options`,
      "POST",
      option,
    ),

  /**
   * Updates an option
   * @param optionId The option ID
   * @param option The updated option data
   * @returns Success message
   */
  updateQuestionOption: (
    optionId: number,
    option: Partial<FormQuestionOption>,
  ) =>
    apiRequest<{ message: string }>(
      `forms/questions/options/${optionId}`,
      "PUT",
      option,
    ),

  /**
   * Deletes an option
   * @param optionId The option ID
   * @returns Success message
   */
  deleteQuestionOption: (optionId: number) =>
    apiRequest<{ message: string }>(
      `forms/questions/options/${optionId}`,
      "DELETE",
    ),

  /**
   * Gets all conditions for a question
   * @param questionId The question ID
   * @returns List of conditions
   */
  getQuestionConditions: (questionId: number) =>
    apiRequest<FormQuestionCondition[]>(
      `forms/questions/${questionId}/conditions`,
    ),

  /**
   * Adds a condition to a question
   * @param questionId The question ID
   * @param condition The condition to add
   * @returns The created condition
   */
  addQuestionCondition: (
    questionId: number,
    condition: Partial<FormQuestionCondition>,
  ) =>
    apiRequest<FormQuestionCondition>(
      `forms/questions/${questionId}/conditions`,
      "POST",
      condition,
    ),

  /**
   * Deletes a condition
   * @param conditionId The condition ID
   * @returns Success message
   */
  deleteCondition: (conditionId: number) =>
    apiRequest<{ message: string }>(
      `forms/conditions/${conditionId}`,
      "DELETE",
    ),

  // ============================================
  // Response Management
  // ============================================

  /**
   * Submits a response to a form
   * @param formId The form ID
   * @param request The submission request
   * @returns Success message with response ID and status check token
   */
  submitForm: (formId: number, request: FormSubmissionRequest) =>
    apiRequest<FormSubmissionResponse>(
      `forms/${formId}/submit`,
      "POST",
      request,
    ),

  /**
   * Gets responses for a form with pagination
   * @param formId The form ID
   * @param page Page number (1-indexed)
   * @param pageSize Number of responses per page
   * @returns Paginated responses
   */
  getFormResponses: (
    formId: number,
    page: number = 1,
    pageSize: number = 25,
    status?: ResponseStatus,
  ) => {
    const statusQs = status ? `&status=${status}` : "";
    return apiRequest<PaginatedResponses>(
      `forms/${formId}/responses?page=${page}&pageSize=${pageSize}${statusQs}`,
    );
  },

  /**
   * Gets a specific response with answers
   * @param responseId The response ID
   * @returns Response details with answers
   */
  getResponseDetails: (responseId: number) =>
    apiRequest<{ response: FormResponse; answers: any[] }>(
      `forms/responses/${responseId}`,
    ),

  /**
   * Deletes a response
   * @param responseId The response ID
   * @returns Success message
   */
  deleteResponse: (responseId: number) =>
    apiRequest<{ message: string }>(`forms/responses/${responseId}`, "DELETE"),

  /**
   * Exports form responses as CSV
   * @param formId The form ID
   * @returns CSV file blob
   */
  exportResponses: (formId: number) =>
    apiDownload(`forms/${formId}/responses/export`),

  // ============================================
  // Workflow Management
  // ============================================

  /**
   * Checks if a user is eligible to submit a form
   * @param formId The form ID
   * @param userId The user ID to check
   * @returns Eligibility status and reason if not eligible
   */
  checkEligibility: (formId: number, userId: bigint) =>
    apiRequest<EligibilityCheckResponse>(
      `forms/${formId}/check-eligibility`,
      "POST",
      { userId },
    ),

  /**
   * Gets pending responses for a form
   * @param formId The form ID
   * @param status Optional status filter
   * @returns List of responses with workflow information
   */
  getPendingResponses: (formId: number, status?: ResponseStatus) => {
    const statusQs = status ? `?status=${status}` : "";
    return apiRequest<ResponseWithWorkflow[]>(
      `forms/${formId}/responses/pending${statusQs}`,
    );
  },

  /**
   * Approves a form response
   * @param responseId The response ID
   * @param reviewerId The reviewer's user ID
   * @param notes Optional approval notes
   * @returns Success message and invite code if applicable
   */
  approveResponse: (responseId: number, reviewerId: bigint, notes?: string) =>
    apiRequest<ApprovalResponse>(
      `forms/responses/${responseId}/approve`,
      "POST",
      { reviewerId, notes },
    ),

  /**
   * Rejects a form response
   * @param responseId The response ID
   * @param reviewerId The reviewer's user ID
   * @param notes Rejection reason
   * @returns Success message
   */
  rejectResponse: (responseId: number, reviewerId: bigint, notes: string) =>
    apiRequest<{ message: string }>(
      `forms/responses/${responseId}/reject`,
      "POST",
      { reviewerId, notes },
    ),

  /**
   * Gets the workflow status for a response using status check token
   * @param token The status check token
   * @returns Workflow status including invite code if available
   */
  getResponseStatus: (token: string) =>
    apiRequest<ResponseStatusResponse>(`forms/status/${token}`),

  // ============================================
  // Guild Defaults
  // ============================================

  /**
   * Gets the guild's default review button emotes, which every form falls back to
   * @param guildId The guild ID
   * @returns The configured emotes, null where the guild has not set one
   */
  getReviewEmotes: (guildId: bigint) =>
    apiRequest<FormReviewEmotes>(`forms/guild/${guildId}/review-emotes`),

  /**
   * Sets the guild's default review button emotes
   * @param guildId The guild ID
   * @param emotes The emotes to store, empty values restore the built-in tick and cross
   * @returns Success message
   */
  setReviewEmotes: (guildId: bigint, emotes: FormReviewEmotes) =>
    apiRequest<{ message: string }>(
      `forms/guild/${guildId}/review-emotes`,
      "POST",
      emotes,
    ),

  // ============================================
  // Versions
  // ============================================

  /**
   * Lists the saved versions of a form, newest first
   * @param formId The form ID
   * @returns The versions, without their snapshots
   */
  getFormVersions: (formId: number) =>
    apiRequest<FormVersionList>(`forms/${formId}/versions`),

  /**
   * Describes what a saved version changed, compared against the version before it
   * @param formId The form ID
   * @param versionNumber The version to describe
   * @returns The changes, grouped by section
   */
  getVersionDiff: (formId: number, versionNumber: number) =>
    apiRequest<FormVersionChange[]>(
      `forms/${formId}/versions/${versionNumber}/diff`,
    ),

  /**
   * Saves the current state of a form as a new version. A save that changes nothing reuses the
   * existing version rather than adding a duplicate to the history
   * @param formId The form ID
   * @param userId Who made the edit
   * @returns The saved version
   */
  saveFormVersion: (formId: number, userId: bigint) =>
    apiRequest<FormVersion>(`forms/${formId}/versions`, "POST", userId),

  /**
   * Puts a form back to the way it was in a saved version
   * @param formId The form ID
   * @param versionNumber The version to restore
   * @param userId Who performed the restore
   * @returns Success message
   */
  restoreFormVersion: (formId: number, versionNumber: number, userId: bigint) =>
    apiRequest<{ message: string }>(
      `forms/${formId}/versions/${versionNumber}/restore`,
      "POST",
      userId,
    ),

  // ============================================
  // Drafts
  // ============================================

  /**
   * Reads a submitter's partly filled copy of a form, so they resume where they left off
   * @param formId The form ID
   * @param userId The submitter
   * @returns The draft, or a flag saying there is none
   */
  getDraft: (formId: number, userId: bigint) =>
    apiRequest<FormDraft>(`forms/${formId}/draft/${userId}`),

  /**
   * Saves what a submitter has filled in so far
   * @param formId The form ID
   * @param userId The submitter
   * @param answers The answers so far, keyed by question ID
   * @param page The page they had reached
   * @returns When the draft was saved
   */
  saveDraft: (
    formId: number,
    userId: bigint,
    answers: Record<number, string | string[]>,
    page: number,
  ) =>
    apiRequest<{ savedAt: string }>(`forms/${formId}/draft`, "POST", {
      userId,
      answers,
      page,
    }),

  /**
   * Discards a submitter's draft, for when they want to start over
   * @param formId The form ID
   * @param userId The submitter
   * @returns Success message
   */
  deleteDraft: (formId: number, userId: bigint) =>
    apiRequest<{ message: string }>(`forms/${formId}/draft/${userId}`, "DELETE"),

  // ============================================
  // Response Editing
  // ============================================

  /**
   * Lists everything a person has submitted, newest first
   * @param userId The submitter
   * @param guildId A guild to narrow the list to, or omitted for everything
   * @returns Their submissions
   */
  getUserSubmissions: (userId: bigint, guildId?: bigint) => {
    const guildQs = guildId ? `?guildId=${guildId}` : "";
    return apiRequest<UserSubmission[]>(`forms/submissions/${userId}${guildQs}`);
  },

  /**
   * Replaces the answers of a response with a corrected set, keeping the original as a revision
   * @param responseId The response to change
   * @param request Who is making the change and the corrected answers
   * @returns The updated response
   */
  editResponse: (responseId: number, request: FormSubmissionRequest) =>
    apiRequest<{ message: string; id: number; editedAt: string }>(
      `forms/responses/${responseId}`,
      "PUT",
      request,
    ),

  /**
   * Lists the earlier versions of a response's answers, newest first
   * @param responseId The response
   * @returns The revisions and the answers each one held
   */
  getResponseRevisions: (responseId: number) =>
    apiRequest<FormResponseRevision[]>(
      `forms/responses/${responseId}/revisions`,
    ),
};
