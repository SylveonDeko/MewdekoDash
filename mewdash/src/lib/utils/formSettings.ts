import { type Form, type FormType, formTypeToInt, intToFormType } from "$lib/api/forms/models";

/**
 * Every setting on a form, held as one object.
 *
 * Kept together rather than as loose variables so the create and edit screens can share the same
 * settings panel. When they each held their own copy, the two drifted apart and one of them ended
 * up missing whole features.
 */
export interface FormSettings {
  name: string;
  description: string;
  submitChannelId: string;
  successMessage: string;
  formType: FormType;
  isDraft: boolean;
  isActive: boolean;

  // Who can submit
  requiredRoleId: string;
  minAccountAgeDays: number | null;
  allowExternalUsers: boolean;
  allowAnonymous: boolean;

  // When it is open
  opensAt: string;
  expiresAt: string;
  maxResponses: number | null;
  allowMultipleSubmissions: boolean;
  allowResubmitAfterRejection: boolean;
  requireCaptcha: boolean;
  announceChannelId: string;
  announceRoleId: string;
  announceMessage: string;

  // When someone submits
  notifyRoleId: string;
  submitRoleIds: string[];
  pendingRoleId: string;
  notificationWebhookUrl: string;

  // Reviewing
  requireApproval: boolean;
  reviewerRoleId: string;
  approveEmote: string | null;
  rejectEmote: string | null;
  approvalAddRoleIds: string[];
  approvalRemoveRoleIds: string[];
  rejectionAddRoleIds: string[];
  rejectionRemoveRoleIds: string[];

  // Carried through a save untouched, kept so older forms keep working
  approvalActionType: number;
  approvalRoleIds: string[];
  rejectionActionType: number;
  rejectionRoleIds: string[];

  // Ban appeals
  blockReappealAfterRejection: boolean;
  maxAppealAttempts: number | null;
  reappealCooldownDays: number | null;
  appealDelayDays: number | null;

  // Join applications
  autoApproveRoleIds: string[];
  inviteMaxUses: number;
  inviteMaxAge: number;
}

/** A brand new form, before anybody has changed anything. */
export function defaultFormSettings(): FormSettings {
  return {
    name: "",
    description: "",
    submitChannelId: "",
    successMessage: "",
    formType: "Regular",
    isDraft: true,
    isActive: true,

    requiredRoleId: "",
    minAccountAgeDays: null,
    allowExternalUsers: false,
    allowAnonymous: false,

    opensAt: "",
    expiresAt: "",
    maxResponses: null,
    allowMultipleSubmissions: false,
    allowResubmitAfterRejection: false,
    requireCaptcha: false,
    announceChannelId: "",
    announceRoleId: "",
    announceMessage: "",

    notifyRoleId: "",
    submitRoleIds: [],
    pendingRoleId: "",
    notificationWebhookUrl: "",

    requireApproval: false,
    reviewerRoleId: "",
    approveEmote: null,
    rejectEmote: null,
    approvalAddRoleIds: [],
    approvalRemoveRoleIds: [],
    rejectionAddRoleIds: [],
    rejectionRemoveRoleIds: [],

    approvalActionType: 0,
    approvalRoleIds: [],
    rejectionActionType: 0,
    rejectionRoleIds: [],

    blockReappealAfterRejection: false,
    maxAppealAttempts: null,
    reappealCooldownDays: null,
    appealDelayDays: null,

    autoApproveRoleIds: [],
    inviteMaxUses: 1,
    inviteMaxAge: 86400,
  };
}

/** Splits a stored comma separated list of identifiers. */
function readIds(stored: string | undefined | null): string[] {
  return stored?.split(",").filter((x) => x) ?? [];
}

/** Formats a stored moment for a datetime-local input. */
function readMoment(stored: string | null | undefined): string {
  return stored ? new Date(stored).toISOString().slice(0, 16) : "";
}

/** Reads a saved form into the shape the settings panel edits. */
export function settingsFromForm(form: Form): FormSettings {
  return {
    name: form.name,
    description: form.description ?? "",
    submitChannelId: form.submitChannelId?.toString() ?? "",
    successMessage: form.successMessage ?? "",
    formType: intToFormType(form.formType),
    isDraft: form.isDraft,
    isActive: form.isActive,

    requiredRoleId: form.requiredRoleId?.toString() ?? "",
    minAccountAgeDays: form.minAccountAgeDays ?? null,
    allowExternalUsers: form.allowExternalUsers,
    allowAnonymous: form.allowAnonymous,

    opensAt: readMoment(form.opensAt),
    expiresAt: readMoment(form.expiresAt),
    maxResponses: form.maxResponses ?? null,
    allowMultipleSubmissions: form.allowMultipleSubmissions,
    allowResubmitAfterRejection: form.allowResubmitAfterRejection ?? false,
    requireCaptcha: form.requireCaptcha,
    announceChannelId: form.announceChannelId?.toString() ?? "",
    announceRoleId: form.announceRoleId?.toString() ?? "",
    announceMessage: form.announceMessage ?? "",

    notifyRoleId: form.notifyRoleId?.toString() ?? "",
    submitRoleIds: readIds(form.submitRoleIds),
    pendingRoleId: form.pendingRoleId?.toString() ?? "",
    notificationWebhookUrl: form.notificationWebhookUrl ?? "",

    requireApproval: form.requireApproval ?? false,
    reviewerRoleId: form.reviewerRoleId?.toString() ?? "",
    approveEmote: form.approveEmote ?? null,
    rejectEmote: form.rejectEmote ?? null,
    approvalAddRoleIds: readIds(form.approvalAddRoleIds),
    approvalRemoveRoleIds: readIds(form.approvalRemoveRoleIds),
    rejectionAddRoleIds: readIds(form.rejectionAddRoleIds),
    rejectionRemoveRoleIds: readIds(form.rejectionRemoveRoleIds),

    approvalActionType: form.approvalActionType ?? 0,
    approvalRoleIds: readIds(form.approvalRoleIds),
    rejectionActionType: form.rejectionActionType ?? 0,
    rejectionRoleIds: readIds(form.rejectionRoleIds),

    blockReappealAfterRejection: form.blockReappealAfterRejection ?? false,
    maxAppealAttempts: form.maxAppealAttempts ?? null,
    reappealCooldownDays: form.reappealCooldownDays ?? null,
    appealDelayDays: form.appealDelayDays ?? null,

    autoApproveRoleIds: readIds(form.autoApproveRoleIds),
    inviteMaxUses: form.inviteMaxUses ?? 1,
    inviteMaxAge: form.inviteMaxAge ?? 86400,
  };
}

/**
 * Turns the edited settings back into the form the save endpoint takes.
 *
 * Settings that do not apply to the chosen form type are dropped here rather than being hidden and
 * quietly saved anyway, so what the screen shows and what is stored agree.
 */
export function settingsToForm(settings: FormSettings): Partial<Form> {
  const anonymous = settings.allowAnonymous;
  const appeals = settings.formType === "BanAppeal";
  const joins = settings.formType === "JoinApplication";
  const reviews = settings.requireApproval || settings.formType !== "Regular";

  const ids = (list: string[]) => (list.length > 0 ? list.join(",") : undefined);
  const id = (value: string) => (value ? BigInt(value) : undefined);

  return {
    name: settings.name,
    description: settings.description || undefined,
    submitChannelId: id(settings.submitChannelId),
    successMessage: settings.successMessage || undefined,
    formType: formTypeToInt(settings.formType) as any,
    isDraft: settings.isDraft,
    isActive: settings.isActive,

    requiredRoleId: settings.formType === "Regular" ? id(settings.requiredRoleId) : undefined,
    minAccountAgeDays: settings.minAccountAgeDays || undefined,
    allowExternalUsers: settings.formType === "Regular" ? settings.allowExternalUsers : true,
    allowAnonymous: settings.formType === "Regular" ? anonymous : false,

    opensAt: settings.opensAt || undefined,
    expiresAt: settings.expiresAt || undefined,
    maxResponses: settings.maxResponses || undefined,
    allowMultipleSubmissions: settings.allowMultipleSubmissions,
    allowResubmitAfterRejection: settings.allowResubmitAfterRejection,
    requireCaptcha: settings.requireCaptcha,
    announceChannelId: id(settings.announceChannelId),
    announceRoleId: settings.announceChannelId ? id(settings.announceRoleId) : undefined,
    announceMessage: settings.announceChannelId ? settings.announceMessage || undefined : undefined,

    notifyRoleId: id(settings.notifyRoleId),
    submitRoleIds: anonymous ? undefined : ids(settings.submitRoleIds),
    pendingRoleId: anonymous ? undefined : id(settings.pendingRoleId),
    notificationWebhookUrl: settings.notificationWebhookUrl || undefined,

    requireApproval: settings.formType === "Regular" ? settings.requireApproval : true,
    reviewerRoleId: reviews ? id(settings.reviewerRoleId) : undefined,
    approveEmote: reviews ? settings.approveEmote || undefined : undefined,
    rejectEmote: reviews ? settings.rejectEmote || undefined : undefined,

    approvalAddRoleIds: anonymous || !reviews ? undefined : ids(settings.approvalAddRoleIds),
    approvalRemoveRoleIds: anonymous || !reviews ? undefined : ids(settings.approvalRemoveRoleIds),
    rejectionAddRoleIds: anonymous || !reviews ? undefined : ids(settings.rejectionAddRoleIds),
    rejectionRemoveRoleIds: anonymous || !reviews ? undefined : ids(settings.rejectionRemoveRoleIds),

    approvalActionType: settings.approvalActionType,
    approvalRoleIds: ids(settings.approvalRoleIds),
    rejectionActionType: settings.rejectionActionType,
    rejectionRoleIds: ids(settings.rejectionRoleIds),

    blockReappealAfterRejection: appeals ? settings.blockReappealAfterRejection : false,
    maxAppealAttempts: appeals ? settings.maxAppealAttempts || undefined : undefined,
    reappealCooldownDays: appeals ? settings.reappealCooldownDays || undefined : undefined,
    appealDelayDays: appeals ? settings.appealDelayDays || undefined : undefined,

    autoApproveRoleIds: joins ? ids(settings.autoApproveRoleIds) : undefined,
    inviteMaxUses: joins ? settings.inviteMaxUses : undefined,
    inviteMaxAge: joins ? settings.inviteMaxAge : undefined,
  };
}
