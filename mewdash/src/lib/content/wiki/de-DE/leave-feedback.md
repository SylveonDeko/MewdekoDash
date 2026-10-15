---
title: Austritts-Feedback
slug: leave-feedback
summary: Wenn ein Server den Bot entfernt, bekommt dessen Owner eine DM mit der Frage, warum. Die Antworten werden auf einer Dashboard-Seite gesammelt, die nur der Bot-Owner sieht.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, Austritts-Feedback, Kick-Feedback, Abwanderung, Umfrage, nur Owner, Bot-Owner]
related: [invites]
---

## Was es macht

Jedes Mal, wenn der Bot aus einem Server gekickt wird oder ihn verlässt, schickt er dem Server-Owner eine kurze DM. Die DM enthält ein Dropdown mit häufigen Gründen, einen Button **Etwas schreiben**, der ein Textfeld öffnet, und einen Button **Nein danke**. Die Antwort ist optional, und die DM sagt das auch.

Jede Antwort wird mit dem Namen des Servers, seiner Mitgliederzahl, seinem Owner und der Zeit gespeichert, die der Bot dort war. Ist ein Berichts-Kanal eingerichtet, wird dort zusätzlich ein Zusammenfassungs-Embed gepostet, das aktualisiert wird, wenn der Owner später einen Kommentar hinzufügt.

Das ist ein Feature auf Bot-Ebene. Es gibt keine Einstellung pro Server, und die Dashboard-Seite erscheint nur für den Bot-Owner.

> [!NOTE]
> Nur der Bot-Owner sieht die Seite Austritts-Feedback. Andere Dashboard-Nutzer bekommen sie nicht in der Seitenleiste und können sie nicht öffnen.

## Wofür du es nutzen kannst

- Herausfinden, ob Server wegen fehlender Funktionen, Verwirrung bei der Einrichtung oder Zuverlässigkeitsproblemen gehen.
- Server erkennen, die den Bot nur zum Testen hinzugefügt haben, damit ihr Weggang ignoriert werden kann.
- Owner erreichen, die einen Kommentar geschrieben und Kontaktdaten hinterlassen haben.
- Nachverfolgen, wie oft Owner überhaupt antworten.

## Die Abfrage

Die DM trägt den Titel „Schade, dass ich gehe!“ und erklärt, dass der Bot gerade aus dem genannten Server entfernt wurde. Das Dropdown bietet diese Gründe in dieser Reihenfolge an:

| Schlüssel | Anzeige für den Owner |
| --- | --- |
| `not_needed` | Wir haben ihn nicht mehr gebraucht |
| `confusing` | Zu verwirrend einzurichten |
| `missing_features` | Fehlende Funktionen, die wir wollten |
| `unreliable` | Er war kaputt oder unzuverlässig |
| `other_bot` | Wir sind zu einem anderen Bot gewechselt |
| `temporary` | Vorübergehend, ich füge ihn wieder hinzu |
| `testing` | Nur zum Testen von etwas |

Die Auswahl eines Grundes speichert ihn sofort und bietet das Textfeld erneut an. Das Textfeld ist ein einzeiliges Absatzfeld mit der Frage „Was hätten wir besser machen können?“ und auf 1000 Zeichen begrenzt. **Nein danke** markiert den Eintrag als verworfen, und er wird nie gemeldet.

Regeln, die verhindern, dass das lästig wird:

- Einem Server wird höchstens einmal alle dreißig Tage diese Frage gestellt, egal wie oft er den Bot hinzufügt und entfernt.
- Sind die DMs des Owners geschlossen, wird nichts gespeichert.
- Ist das Feature ausgeschaltet, wird nichts gesendet.

## Status

Jeder Eintrag landet in einem von drei Zuständen, nach denen das Dashboard filtert.

| Status | Bedeutung |
| --- | --- |
| Beantwortet | Der Owner hat einen Grund gewählt oder einen Kommentar geschrieben |
| Verworfen | Der Owner hat **Nein danke** gedrückt |
| Keine Antwort | Die DM wurde gesendet, bisher kam nichts zurück |

## Einstellungen

Die Seite hat zwei Tabs, **Antworten** und **Einstellungen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Owner fragen, warum der Bot entfernt wurde | an | Ob die DM überhaupt gesendet wird |
| Berichts-Kanal-ID | leer | Kanal, der pro Antwort ein Zusammenfassungs-Embed erhält. Ist er leer, wird der Join-/Austritts-Log-Kanal des Bots verwendet. |

Unter dem Kanalfeld zeigt die Seite an, auf welchen Kanal und Server die ID verweist, und ob der Bot ihn erreichen kann.

Der Tab **Antworten** hat sechs Zähler, **Gesendete Anfragen**, **Beantwortet**, **Mit Kommentar**, **Verworfen**, **Keine Antwort** und **Antwortquote**, eine Aufschlüsselung **Genannte Gründe** und eine Tabelle mit den Spalten **Verlassen**, **Server**, **Grund** und **Status**. Du kannst nach Grund und Status filtern (der Statusfilter hat zusätzlich die Option **Hat einen Kommentar hinterlassen**), nach Servername oder Kommentartext suchen, eine Zeile öffnen, um den vollständigen Kommentar zu lesen, und einen Eintrag löschen. **Antwortquote** zählt beantwortete und verworfene Anfragen zusammen.

## Einrichtung Schritt für Schritt

1. Melde dich mit dem Konto des Bot-Owners im Dashboard an und öffne **Austritts-Feedback**.
2. Prüfe im Tab **Einstellungen**, dass **Owner fragen, warum der Bot entfernt wurde** aktiviert ist. Das ist standardmäßig so.
3. Füge eine Kanal-ID in **Berichts-Kanal-ID** ein und klicke auf **Kanal speichern**, oder lass das Feld leer, um den Join-/Austritts-Kanal zu verwenden.
4. Entferne den Bot aus einem Testserver, den du besitzt, und beantworte die DM.
5. Prüfe den Tab **Antworten** und den Berichts-Kanal auf den Eintrag.

## Befehle

Dieses Feature gibt es nur im Dashboard. Es gibt keine Bot-Befehle; Owner antworten über die Buttons und das Dropdown in der DM.

## Tipps und Stolperfallen

- Der Bot schreibt nur der Person eine DM, die Discord als Server-Owner führt, nicht demjenigen, der den Bot gekickt hat.
- Die Sperrzeit von dreißig Tagen gilt pro Server. Ein Server, der den Bot innerhalb dieses Zeitraums erneut hinzufügt und wieder entfernt, wird nicht ein zweites Mal gefragt.
- Die Zusammenfassung geht in den eingerichteten Kanal oder, falls keiner gesetzt ist, in den Join-/Austritts-Log-Kanal aus den Zugangsdaten des Bots. Existiert keiner von beiden, werden Antworten trotzdem gespeichert und sind auf der Seite sichtbar.
- Das Löschen eines Eintrags im Dashboard löscht das bereits im Berichts-Kanal gepostete Embed nicht.
