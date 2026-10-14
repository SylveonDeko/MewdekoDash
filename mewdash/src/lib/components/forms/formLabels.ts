/** Localized labels for form option ids defined in $lib/api/forms/models. Resolved at render time. */
import { m } from "$lib/i18n";

export function questionTypeLabel(id: string | number): string {
  switch (String(id)) {
    case "short_text": return m.forms.labelQuestionShortText();
    case "long_text": return m.forms.labelQuestionLongText();
    case "multiple_choice": return m.common.multipleChoice();
    case "checkboxes": return m.forms.labelQuestionCheckboxes();
    case "dropdown": return m.common.dropdown();
    case "number": return m.forms.labelQuestionNumber();
    case "email": return m.forms.labelQuestionEmail();
    case "url": return m.common.url();
    case "section_break": return m.forms.labelQuestionSectionBreak();
    default: return String(id);
  }
}

export function questionTypeDescription(id: string | number): string {
  switch (String(id)) {
    case "short_text": return m.forms.labelQuestionShortTextDescription();
    case "long_text": return m.forms.labelQuestionLongTextDescription();
    case "multiple_choice": return m.forms.labelQuestionMultipleChoiceDescription();
    case "checkboxes": return m.forms.labelQuestionCheckboxesDescription();
    case "dropdown": return m.forms.labelQuestionDropdownDescription();
    case "number": return m.forms.labelQuestionNumberDescription();
    case "email": return m.forms.labelQuestionEmailDescription();
    case "url": return m.forms.labelQuestionUrlDescription();
    case "section_break": return m.forms.labelQuestionSectionBreakDescription();
    default: return String(id);
  }
}

export function formTypeLabel(id: string | number): string {
  switch (String(id)) {
    case "Regular": return m.forms.labelFormTypeRegular();
    case "BanAppeal": return m.forms.labelFormTypeBanAppeal();
    case "JoinApplication": return m.forms.labelFormTypeJoinApplication();
    default: return String(id);
  }
}

export function formTypeDescription(id: string | number): string {
  switch (String(id)) {
    case "Regular": return m.forms.labelFormTypeRegularDescription();
    case "BanAppeal": return m.forms.labelFormTypeBanAppealDescription();
    case "JoinApplication": return m.forms.labelFormTypeJoinApplicationDescription();
    default: return String(id);
  }
}

export function responseStatusLabel(id: string | number): string {
  switch (String(id)) {
    case "Pending": return m.forms.labelStatusPending();
    case "UnderReview": return m.forms.labelStatusUnderReview();
    case "Approved": return m.common.approved();
    case "Rejected": return m.forms.labelStatusRejected();
    default: return String(id);
  }
}

export function conditionalTypeLabel(id: string | number): string {
  switch (String(id)) {
    case "0": return m.forms.labelConditionType0();
    case "1": return m.forms.labelConditionType1();
    case "2": return m.forms.labelConditionType2();
    case "3": return m.forms.labelConditionType3();
    case "4": return m.forms.labelConditionType4();
    case "5": return m.forms.multiConditionTitle();
    default: return String(id);
  }
}

export function conditionalTypeDescription(id: string | number): string {
  switch (String(id)) {
    case "0": return m.forms.labelConditionType0Description();
    case "1": return m.forms.labelConditionType1Description();
    case "2": return m.forms.labelConditionType2Description();
    case "3": return m.forms.labelConditionType3Description();
    case "4": return m.forms.labelConditionType4Description();
    case "5": return m.forms.labelConditionType5Description();
    default: return String(id);
  }
}

export function conditionalOperatorLabel(id: string | number): string {
  switch (String(id)) {
    case "equals": return m.forms.labelOperatorEquals();
    case "not_equals": return m.forms.labelOperatorNotEquals();
    case "contains": return m.forms.labelOperatorContains();
    case "greater_than": return m.forms.labelOperatorGreaterThan();
    case "less_than": return m.forms.labelOperatorLessThan();
    default: return String(id);
  }
}

export function roleLogicLabel(id: string | number): string {
  switch (String(id)) {
    case "any": return m.forms.labelRoleLogicAny();
    case "all": return m.forms.labelRoleLogicAll();
    case "none": return m.forms.labelRoleLogicNone();
    default: return String(id);
  }
}

export function roleLogicDescription(id: string | number): string {
  switch (String(id)) {
    case "any": return m.forms.labelRoleLogicAnyDescription();
    case "all": return m.forms.labelRoleLogicAllDescription();
    case "none": return m.forms.labelRoleLogicNoneDescription();
    default: return String(id);
  }
}

export function permissionLabel(id: string | number): string {
  switch (String(id)) {
    case "Administrator": return m.common.permAdministrator();
    case "ManageChannels": return m.common.permManageChannels();
    case "ManageGuild": return m.forms.labelPermissionManageGuild();
    case "ManageMessages": return m.common.permManageMessages();
    case "ManageNicknames": return m.common.manageNicknames();
    case "ManageRoles": return m.common.permManageRoles();
    case "ManageWebhooks": return m.common.manageWebhooks();
    case "BanMembers": return m.common.permBanMembers();
    case "KickMembers": return m.common.permKickMembers();
    case "ModerateMembers": return m.common.permModerateMembers();
    case "ViewAuditLog": return m.forms.labelPermissionViewAuditLog();
    default: return String(id);
  }
}

export function roleActionLabel(id: string | number): string {
  switch (String(id)) {
    case "0": return m.common.none();
    case "1": return m.forms.labelRoleAction1();
    case "2": return m.common.removeRoles();
    default: return String(id);
  }
}

export function roleActionDescription(id: string | number): string {
  switch (String(id)) {
    case "0": return m.forms.labelRoleAction0Description();
    case "1": return m.forms.labelRoleAction1Description();
    case "2": return m.forms.labelRoleAction2Description();
    default: return String(id);
  }
}

/** Names a page for its tab: its heading, or its number when it has none. */
export function pageLabel(pages: Array<{ heading?: { questionText?: string | null } | null }>, index: number): string {
  const heading = pages[index]?.heading?.questionText?.trim();
  return heading ? heading : m.forms.pageBarPageNumber({ number: index + 1 });
}
