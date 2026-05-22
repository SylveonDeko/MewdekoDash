// lib/utils/formValidation.ts
import type { FormQuestion } from "$lib/api/forms/models";
import { containsZalgo } from "$lib/utils/sanitize";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates the question text: presence, Zalgo characters, and length.
 */
function validateQuestionText(
  question: Partial<FormQuestion>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!question.questionText?.trim()) {
    errors.push({
      field: "questionText",
      message: "Question text is required",
    });
  }

  if (question.questionText && containsZalgo(question.questionText)) {
    errors.push({
      field: "questionText",
      message:
        "Question text contains invalid characters (excessive combining marks)",
    });
  }

  if (question.questionText && question.questionText.length > 500) {
    errors.push({
      field: "questionText",
      message: "Question text cannot exceed 500 characters",
    });
  }

  return errors;
}

/**
 * Validates min/max length constraints for text questions.
 */
function validateTextLengthConstraints(
  question: Partial<FormQuestion>,
): ValidationError[] {
  if (
    question.questionType !== "short_text" &&
    question.questionType !== "long_text"
  ) {
    return [];
  }

  const errors: ValidationError[] = [];

  if (
    question.minLength !== undefined &&
    question.maxLength !== undefined &&
    question.minLength > question.maxLength
  ) {
    errors.push({
      field: "minLength",
      message: "Minimum length cannot be greater than maximum length",
    });
  }

  if (question.minLength !== undefined && question.minLength < 0) {
    errors.push({
      field: "minLength",
      message: "Minimum length cannot be negative",
    });
  }

  if (question.maxLength !== undefined && question.maxLength < 1) {
    errors.push({
      field: "maxLength",
      message: "Maximum length must be at least 1",
    });
  }

  if (question.maxLength !== undefined && question.maxLength > 5000) {
    errors.push({
      field: "maxLength",
      message: "Maximum length cannot exceed 5000 characters",
    });
  }

  return errors;
}

/**
 * Validates min/max value constraints for number questions.
 */
function validateNumberConstraints(
  question: Partial<FormQuestion>,
): ValidationError[] {
  if (
    question.questionType === "number" &&
    question.minValue !== undefined &&
    question.maxValue !== undefined &&
    question.minValue > question.maxValue
  ) {
    return [
      {
        field: "minValue",
        message: "Minimum value cannot be greater than maximum value",
      },
    ];
  }

  return [];
}

/**
 * Validates the option list for choice-style questions.
 */
function validateOptions(
  question: Partial<FormQuestion>,
): ValidationError[] {
  if (
    !["multiple_choice", "checkboxes", "dropdown"].includes(
      question.questionType || "",
    )
  ) {
    return [];
  }

  const errors: ValidationError[] = [];

  if (!question.options || question.options.length === 0) {
    errors.push({
      field: "options",
      message: `${getQuestionTypeLabel(question.questionType ?? "")} questions must have at least one option`,
    });
  }

  if (question.options && question.options.length > 25) {
    errors.push({
      field: "options",
      message: "Cannot have more than 25 options (Discord embed limit)",
    });
  }

  if (question.options) {
    const emptyOptions = question.options.filter(
      (opt) => !opt.optionText?.trim(),
    );
    if (emptyOptions.length > 0) {
      errors.push({
        field: "options",
        message: "All options must have text",
      });
    }

    const optionValues = question.options
      .map((opt) => opt.optionValue || opt.optionText)
      .filter(Boolean);
    const uniqueValues = new Set(optionValues);
    if (optionValues.length !== uniqueValues.size) {
      errors.push({
        field: "options",
        message: "Option values must be unique",
      });
    }
  }

  return errors;
}

/**
 * Validates conditional-logic fields when a parent question is set.
 */
function validateConditionalLogic(
  question: Partial<FormQuestion>,
): ValidationError[] {
  if (!question.conditionalParentQuestionId) return [];

  const errors: ValidationError[] = [];

  if (!question.conditionalOperator) {
    errors.push({
      field: "conditionalOperator",
      message: "Conditional operator is required when parent question is set",
    });
  }

  if (
    question.conditionalExpectedValue === undefined ||
    question.conditionalExpectedValue === ""
  ) {
    errors.push({
      field: "conditionalExpectedValue",
      message: "Expected value is required for conditional logic",
    });
  }

  if (
    question.displayOrder !== undefined &&
    question.conditionalParentQuestionId >= question.displayOrder
  ) {
    errors.push({
      field: "conditionalParentQuestionId",
      message: "Parent question must come before this question",
    });
  }

  return errors;
}

/**
 * Validates a form question for logical consistency
 * @param question The question to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateFormQuestion(
  question: Partial<FormQuestion>,
): ValidationError[] {
  const errors: ValidationError[] = [
    ...validateQuestionText(question),
    ...validateTextLengthConstraints(question),
    ...validateNumberConstraints(question),
    ...validateOptions(question),
    ...validateConditionalLogic(question),
  ];

  if (!question.questionType) {
    errors.push({
      field: "questionType",
      message: "Question type is required",
    });
  }

  if (question.placeholder && question.placeholder.length > 200) {
    errors.push({
      field: "placeholder",
      message: "Placeholder text cannot exceed 200 characters",
    });
  }

  return errors;
}

/**
 * Validates an entire form before submission
 * @param formName Form name
 * @param questions Array of questions
 * @returns Array of validation errors
 */
export function validateForm(
  formName: string,
  questions: Partial<FormQuestion>[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Form name required
  if (!formName?.trim()) {
    errors.push({
      field: "formName",
      message: "Form name is required",
    });
  }

  if (formName && formName.length > 255) {
    errors.push({
      field: "formName",
      message: "Form name cannot exceed 255 characters",
    });
  }

  // Must have at least one question
  if (questions.length === 0) {
    errors.push({
      field: "questions",
      message: "Form must have at least one question",
    });
  }

  // Validate each question
  questions.forEach((question, index) => {
    const questionErrors = validateFormQuestion(question);
    questionErrors.forEach((err) => {
      errors.push({
        field: `question-${index}-${err.field}`,
        message: `Question ${index + 1}: ${err.message}`,
      });
    });
  });

  // Check for circular dependencies in conditional logic
  const hasCircularDependency = checkCircularDependencies(questions);
  if (hasCircularDependency) {
    errors.push({
      field: "conditionalLogic",
      message: "Circular dependency detected in conditional logic",
    });
  }

  return errors;
}

/**
 * Checks for circular dependencies in conditional logic
 * @param questions Array of questions
 * @returns True if circular dependency exists
 */
function checkCircularDependencies(
  questions: Partial<FormQuestion>[],
): boolean {
  const visited = new Set<number>();
  const recursionStack = new Set<number>();

  function hasCycle(questionId: number | undefined): boolean {
    if (!questionId) return false;
    if (recursionStack.has(questionId)) return true;
    if (visited.has(questionId)) return false;

    visited.add(questionId);
    recursionStack.add(questionId);

    const question = questions.find((q) => q.id === questionId);
    if (question?.conditionalParentQuestionId) {
      if (hasCycle(question.conditionalParentQuestionId)) {
        return true;
      }
    }

    recursionStack.delete(questionId);
    return false;
  }

  for (const question of questions) {
    if (question.id && hasCycle(question.id)) {
      return true;
    }
  }

  return false;
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    short_text: "Short Text",
    long_text: "Long Text",
    multiple_choice: "Multiple Choice",
    checkboxes: "Checkboxes",
    dropdown: "Dropdown",
    number: "Number",
    email: "Email",
    url: "URL",
  };
  return labels[type] || type;
}
