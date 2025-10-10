// lib/api/forms/forms.ts
import { apiRequest } from "../core";
import type {
  Form,
  FormQuestion,
  FormQuestionOption,
  FormResponse,
  FormSubmissionRequest,
  FormSubmissionResponse,
  PaginatedResponses,
  ResponseStatus,
  ResponseWithWorkflow,
  EligibilityCheckResponse,
  ApprovalResponse,
  ResponseStatusResponse,
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
  generateShareLink: (formId: number, instanceIdentifier: string) =>
    apiRequest<{ shareCode: string }>(
      `forms/${formId}/share-link`,
      "POST",
      instanceIdentifier,
    ),

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
  getFormResponses: (formId: number, page: number = 1, pageSize: number = 50) =>
    apiRequest<PaginatedResponses>(
      `forms/${formId}/responses?page=${page}&pageSize=${pageSize}`,
    ),

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
  exportResponses: async (formId: number): Promise<Blob> => {
    const response = await fetch(`/api/forms/${formId}/responses/export`, {
      headers: {
        "x-api-key": "your-api-key", // This will be set by the proxy
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export responses");
    }

    return await response.blob();
  },

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
  getPendingResponses: (formId: number, status?: ResponseStatus) =>
    apiRequest<ResponseWithWorkflow[]>(
      `forms/${formId}/responses/pending${status ? `?status=${status}` : ""}`,
    ),

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
};
