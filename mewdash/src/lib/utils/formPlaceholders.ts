import { m } from "$lib/i18n";

export interface FormPlaceholder {
  category: string;
  name: string;
  description: string;
}

/**
 * The placeholders a form fills in. The announcement has no submitter, so it leaves the user
 * ones out.
 *
 * @param withUser Whether the text is shown to the person who submitted.
 * @returns The placeholders to offer in the editor.
 */
export function formPlaceholderList(withUser: boolean = true): FormPlaceholder[] {
  const form = m.forms.publicMetaFormFallback();
  const server = m.features.categoryServer();

  const list: FormPlaceholder[] = [
    { category: form, name: "%form.name%", description: m.placeholders.formName() },
    { category: form, name: "%form.link%", description: m.placeholders.formLink() },
    { category: form, name: "%form.role%", description: m.placeholders.formRole() },
    { category: form, name: "%form.submissions%", description: m.placeholders.formSubmissions() },
    { category: form, name: "%form.opensat%", description: m.placeholders.formOpensat() },
    { category: form, name: "%form.expiresat%", description: m.placeholders.formExpiresat() },
    { category: server, name: "%server.name%", description: m.placeholders.serverName() },
    { category: server, name: "%server.id%", description: m.placeholders.serverId() }
  ];

  if (withUser) {
    const user = m.multigreets.placeholderCategoryJoin();
    list.push(
      { category: user, name: "%user.mention%", description: m.placeholders.userMention() },
      { category: user, name: "%user.id%", description: m.placeholders.userId() },
      { category: user, name: "%user.name%", description: m.placeholders.userName() },
      { category: user, name: "%user.globalname%", description: m.placeholders.userGlobalname() }
    );
  }

  return list;
}
