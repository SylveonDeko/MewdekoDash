// lib/utils/formValidation.ts
import type { FormQuestion } from "$lib/api/forms/models";
import { containsZalgo } from "$lib/utils/sanitize";
import { m } from "$lib/i18n";
import { questionTypeLabel } from "$lib/components/forms/formLabels";

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
      message: m.shared.validationQuestionTextRequired(),
    });
  }

  if (question.questionText && containsZalgo(question.questionText)) {
    errors.push({
      field: "questionText",
      message:
        m.shared.validationQuestionTextInvalidChars(),
    });
  }

  if (question.questionText && question.questionText.length > 500) {
    errors.push({
      field: "questionText",
      message: m.shared.validationQuestionTextTooLong(),
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
      message: m.shared.validationMinLengthGreaterThanMax(),
    });
  }

  if (question.minLength !== undefined && question.minLength < 0) {
    errors.push({
      field: "minLength",
      message: m.shared.validationMinLengthNegative(),
    });
  }

  if (question.maxLength !== undefined && question.maxLength < 1) {
    errors.push({
      field: "maxLength",
      message: m.shared.validationMaxLengthTooSmall(),
    });
  }

  if (question.maxLength !== undefined && question.maxLength > 5000) {
    errors.push({
      field: "maxLength",
      message: m.shared.validationMaxLengthTooLarge(),
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
        message: m.shared.validationMinValueGreaterThanMax(),
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
      message: m.shared.validationOptionsRequired({ type: questionTypeLabel(question.questionType ?? "") }),
    });
  }

  if (question.options && question.options.length > 25) {
    errors.push({
      field: "options",
      message: m.shared.validationOptionsTooMany(),
    });
  }

  if (question.options) {
    const emptyOptions = question.options.filter(
      (opt) => !opt.optionText?.trim(),
    );
    if (emptyOptions.length > 0) {
      errors.push({
        field: "options",
        message: m.shared.validationOptionsEmptyText(),
      });
    }

    const optionValues = question.options
      .map((opt) => opt.optionValue || opt.optionText)
      .filter(Boolean);
    const uniqueValues = new Set(optionValues);
    if (optionValues.length !== uniqueValues.size) {
      errors.push({
        field: "options",
        message: m.shared.validationOptionsNotUnique(),
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
      message: m.shared.validationConditionalOperatorRequired(),
    });
  }

  if (
    question.conditionalExpectedValue === undefined ||
    question.conditionalExpectedValue === ""
  ) {
    errors.push({
      field: "conditionalExpectedValue",
      message: m.shared.validationConditionalValueRequired(),
    });
  }

  if (
    question.displayOrder !== undefined &&
    question.conditionalParentQuestionId >= question.displayOrder
  ) {
    errors.push({
      field: "conditionalParentQuestionId",
      message: m.shared.validationParentMustPrecede(),
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
      message: m.shared.validationQuestionTypeRequired(),
    });
  }

  if (question.placeholder && question.placeholder.length > 200) {
    errors.push({
      field: "placeholder",
      message: m.shared.validationPlaceholderTooLong(),
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
      message: m.shared.validationFormNameRequired(),
    });
  }

  if (formName && formName.length > 255) {
    errors.push({
      field: "formName",
      message: m.shared.validationFormNameTooLong(),
    });
  }

  // Must have at least one question
  if (questions.length === 0) {
    errors.push({
      field: "questions",
      message: m.shared.validationFormNeedsQuestion(),
    });
  }

  // Validate each question
  questions.forEach((question, index) => {
    const questionErrors = validateFormQuestion(question);
    questionErrors.forEach((err) => {
      errors.push({
        field: `question-${index}-${err.field}`,
        message: m.shared.validationQuestionPrefixed({ number: index + 1, message: err.message }),
      });
    });
  });

  // Check for circular dependencies in conditional logic
  const hasCircularDependency = checkCircularDependencies(questions);
  if (hasCircularDependency) {
    errors.push({
      field: "conditionalLogic",
      message: m.shared.validationCircularDependency(),
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
