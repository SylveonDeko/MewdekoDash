---
title: Befehlsberechtigungen
slug: permissions
summary: Lege fest, wer welche Befehle wo ausführen darf, mit einer geordneten Liste aus Erlauben- und Verbieten-Regeln für Befehle und Module, bezogen auf den ganzen Server, eine Rolle, einen Kanal, eine Kategorie oder ein einzelnes Mitglied.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, Berechtigungen, Befehlsberechtigungen, erlauben, verbieten, Berechtigungsrolle, Befehl deaktivieren, Modul deaktivieren, Abklingzeit, Schwarze Liste]
related: [administration, help, filter, moderation]
---

## Was es macht

Standardmäßig steht jeder Befehl allen zur Verfügung, die die Discord-Berechtigungen zulassen. Befehlsberechtigungen legen eine serverspezifische Regelliste darüber. Jede Regel sagt, ob ein Befehl, ein Modul oder alle Module für den ganzen Server, eine Rolle, einen Kanal, eine Kategorie oder ein Mitglied erlaubt oder verboten ist. Wenn jemand einen Befehl ausführt, geht der Bot die Liste durch, wendet die erste passende Regel an und lässt den Befehl entweder durch oder stoppt ihn.

Blockierte Befehle scheitern stillschweigend, es sei denn, der **ausführliche Modus** ist an. Dann antwortet der Bot mit der Nummer und dem Text der Regel, die ihn blockiert hat. Slash-Commands bekommen immer eine ephemere Erklärung.

Regeln können von Administratoren verwaltet werden oder von allen, die die von dir gewählte **Berechtigungsrolle** haben. Dieselbe Liste findest du im Dashboard unter **Verwaltung**, im Bereich **Automatisierung & Einstellungen**, als Karte **Befehlsberechtigungen**.

Zwei verwandte Werkzeuge gehören dazu. Befehls-Cooldowns begrenzen, wie oft ein Befehl pro Mitglied auf einem Server verwendet werden kann. Discord-Berechtigungs-Überschreibungen im Verwaltungsmodul ersetzen die Discord-Berechtigung, die ein Befehl normalerweise verlangt, zum Beispiel damit Inhaber von „Nachrichten verwalten" einen Befehl nutzen können, der normalerweise Administrator erfordert.

## Wofür du es nutzen kannst

- Spaß- und NSFW-Befehle aus ernsten Kanälen heraushalten.
- Das Musikmodul überall ausschalten, außer in einem Kanal für Bot-Befehle.
- Einer Helfer-Rolle `warn` erlauben, ohne ihr „Nachrichten verwalten" oder Administrator zu geben.
- Ein störendes Mitglied komplett von der Bot-Nutzung ausschließen.
- Einen lauten Befehl wie `roll` auf einmal alle zehn Sekunden pro Mitglied begrenzen.

## Wie eine Regel aufgebaut ist

Jede Regel hat drei Teile.

| Teil | Optionen |
| --- | --- |
| Was | Ein Befehl, ein Modul oder alle Module |
| Für | Der ganze Server, eine Rolle, ein Kanal, eine Kategorie oder ein bestimmter Nutzer |
| Aktion | Erlauben oder verbieten |

Die Befehlsnamen in der Tabelle unten kodieren die ersten beiden Teile. Die ersten Buchstaben wählen das Ziel (`s` Server, `r` Rolle, `c` Kanal, `ca` Kategorie, `u` Nutzer), die letzten den Umfang (`cmd` Befehl, `mdl` Modul), und die Formen `all...mdls` decken jedes Modul ab.

| Befehl | Erstellte Regel |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Ein Befehl für den ganzen Server |
| `srvrmdl <module> <enable|disable>` | Ein Modul für den ganzen Server |
| `allsrvrmdls <enable|disable>` | Jedes Modul für den ganzen Server |
| `rolecmd <command> <enable|disable> <role>` | Ein Befehl für eine Rolle |
| `rolemdl <module> <enable|disable> <role>` | Ein Modul für eine Rolle |
| `allrolemdls <enable|disable> <role>` | Jedes Modul für eine Rolle |
| `chnlcmd <command> <enable|disable> <#channel>` | Ein Befehl in einem Kanal |
| `chnlmdl <module> <enable|disable> <#channel>` | Ein Modul in einem Kanal |
| `allchnlmdls <enable|disable> <#channel>` | Jedes Modul in einem Kanal |
| `catcmd <command> <enable|disable> <category>` | Ein Befehl in jedem Kanal einer Kategorie |
| `catmdl <module> <enable|disable> <category>` | Ein Modul in einer Kategorie |
| `allcatmdls <enable|disable> <category>` | Jedes Modul in einer Kategorie |
| `usrcmd <command> <enable|disable> @user` | Ein Befehl für ein Mitglied |
| `usrmdl <module> <enable|disable> @user` | Ein Modul für ein Mitglied |
| `allusrmdls <enable|disable> @user` | Jedes Modul für ein Mitglied |

Chat-Trigger zählen als Befehle: Gib die Nummer oder den Text des Triggers an, wo ein Befehlsname erwartet wird.

> [!EXAMPLE]
> `srvrmdl nsfw disable` und danach `chnlmdl nsfw enable #adult` blockieren das NSFW-Modul überall außer in einem Kanal.

## Reihenfolge der Regeln

`listperms` zeigt die Liste ab 1 nummeriert an. Regel 1 ist immer „alle Module für den ganzen Server erlauben" und kann weder bearbeitet noch entfernt werden; sie ist der Rückfall, wenn nichts anderes zutrifft.

Neue Regeln werden ans Ende der Liste angehängt. Wenn ein Befehl ausgeführt wird, prüft der Bot die Regeln ab der höchsten Nummer in Richtung Regel 1, und die erste Regel, bei der Ziel und Umfang beide passen, entscheidet. Das heißt, die zuletzt hinzugefügte passende Regel gewinnt, weshalb das obige Beispiel funktioniert: Das Erlauben für den Kanal wurde nach dem Verbieten für den Server hinzugefügt.

`moveperm <from> <to>` ändert die Position einer Regel und nummeriert alles neu, sodass du eine Ausnahme über oder unter eine allgemeinere Regel schieben kannst, ohne sie neu zu erstellen. `removeperm <number>` löscht eine Regel. `resetperms` setzt die Liste zurück auf Regel 1 und benötigt Administrator.

Das Dashboard listet dieselben Regeln mit Pfeilen zum Verschieben nach oben und unten und einem Löschen-Button pro Regel.

## Ausführlicher Modus

`verbose` schaltet um, ob ein blockierter Textbefehl eine Fehlermeldung bekommt, die die blockierende Regel nennt, etwa „permission 4 (`.chnlmdl nsfw disable #general`) prevents this". Standardmäßig ist er aus. Ist er aus, werden blockierte Befehle stillschweigend ignoriert, was für die meisten Server richtig ist und verhindert, dass Mitglieder ausprobieren, was sie nicht ausführen können. Slash-Commands antworten immer ephemer mit dem Grund, egal wie diese Einstellung steht.

## Wer Regeln ändern darf

Jeder Befehl in diesem Modul läuft durch eine zusätzliche Schranke. Administratoren dürfen sie immer verwenden. Alle anderen brauchen die mit `permrole <role>` festgelegte **Berechtigungsrolle**. Ohne eine solche wird Nicht-Administratoren gesagt, dass sie Admin-Berechtigungen brauchen (nur wenn der ausführliche Modus an ist), und der Befehl stoppt. `permrole` ohne Argument zeigt die aktuelle Rolle; `permrole reset` löscht sie. Die Rolle `@everyone` kann nicht verwendet werden.

`resetperms` und `permrole` selbst benötigen darüber hinaus immer Administrator.

## Cooldowns

`cmdcooldown <command> [time]` legt einen Cooldown pro Mitglied für einen Befehl auf diesem Server fest, von 1 Sekunde bis zu 90000 Sekunden (25 Stunden). Gib keine Zeit oder `0s` an, um ihn zu löschen. `allcmdcooldowns` listet die aktuellen Cooldowns auf. Diese gelten zusätzlich zu einem eventuell bereits eingebauten Cooldown des Befehls.

## Discord-Berechtigungs-Überschreibungen

Das Verwaltungsmodul kann die Discord-Berechtigung ersetzen, die ein Befehl verlangt. `dpo <command> <permissions...>` sorgt dafür, dass der Befehl statt der eingebauten die aufgeführten Berechtigungen verlangt, zum Beispiel `dpo purge ManageMessages`. Führe `dpo <command>` ohne Berechtigungen aus, um die Überschreibung zu entfernen, `dpol`, um sie aufzulisten, und `dpor`, um nach einer Bestätigung alle zu löschen. Alle drei benötigen Administrator.

Eine Überschreibung ersetzt nur die eingebaute Discord-Anforderung. Die oben beschriebenen Befehlsberechtigungs-Regeln gelten weiterhin, und die Befehlsseite von `help <command>` zeigt die ursprüngliche Anforderung durchgestrichen mit der Überschreibung daneben.

## Das Schnellmenü in der Hilfe

`help <command>` zeigt Administratoren einen Berechtigungs-Button. Er öffnet ein Schnellmenü für genau diesen Befehl, das die Regeln zeigt, die ihn betreffen, vor redundanten Regeln warnt (zwei Regeln mit demselben Ziel und Umfang), anbietet, sie aufzulösen, und es dir erlaubt, Erlauben- und Verbieten-Regeln für den Befehl hinzuzufügen oder seine Berechtigungen zurückzusetzen, ohne die Hilfeseite zu verlassen.

## Steuerung durch den Bot-Owner

Drei Befehlsgruppen sind den Bot-Ownern vorbehalten und wirken auf jeden Server: Globale Berechtigungen (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) deaktivieren ein Modul oder einen Befehl überall, und die schwarze Liste (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) sorgt dafür, dass der Bot überhaupt nicht mehr auf einen Nutzer, Kanal oder Server reagiert. Ein global deaktiviertes Modul zeigt im Hilfemenü einen Globus und ein Kreuz.

## Einstellungen

Öffne im Dashboard **Verwaltung**, dann den Bereich **Automatisierung & Einstellungen** und die Karte **Befehlsberechtigungen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Ausführliche Berechtigungen | aus | Nutzern mitteilen, wenn eine Regel einen Befehl blockiert |
| Berechtigungsrolle | keine | Mitglieder mit dieser Rolle können Regeln per Befehl bearbeiten |
| Regeln | nur Regel 1 | Die geordnete Liste; hinzufügen mit **Aktion**, **Was** und **Für**, dann einem Modul, Befehl, einer Rolle, einem Kanal, einer Kategorie oder Nutzer-ID |

Die Karte zeigt außerdem die Anzahl eigener Regeln und ob der ausführliche Modus an ist. Die Karte **Berechtigungs-Überschreibungen** im selben Bereich verwaltet Discord-Berechtigungs-Überschreibungen: Wähle einen Bot-Befehl und die **Benötigte Discord-Berechtigung**, die er statt der eingebauten verlangen soll.

## Einrichtung Schritt für Schritt

1. Entscheide dich für die Grundform: meist „alles erlaubt, ein paar Dinge verboten" oder „alles verboten, dann in Bot-Kanälen erlaubt".
2. Für die zweite Form führst du `allsrvrmdls disable` aus, dann `allchnlmdls enable #bot-commands`.
3. Halte die Moderation für das Team am Laufen: `rolemdl moderation enable @Mods` und `rolemdl administration enable @Mods`.
4. Führe `listperms` aus und lies es von unten nach oben, denn in dieser Reihenfolge arbeitet der Bot. Nutze `moveperm`, wenn eine Ausnahme unter der Regel steht, die sie überschreiben soll.
5. Gib vertrauenswürdigem Team `permrole @Mods`, damit es Regeln ohne Administrator anpassen kann.
6. Schalte `verbose` beim Testen ein, damit du siehst, welche Regel greift, und schalte es danach wieder aus.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Slash-Versionen liegen unter `/permissions`, zum Beispiel `/permissions servercommand`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrator oder Berechtigungsrolle | Die nummerierte Regelliste anzeigen |
| `verbose [true|false]` | `v` | Administrator oder Berechtigungsrolle | Meldungen für blockierte Befehle umschalten |
| `permrole [role|reset]` | `pr` | Administrator | Die Berechtigungsrolle anzeigen, festlegen oder zurücksetzen |
| `removeperm <number>` | `rp` | Administrator oder Berechtigungsrolle | Eine Regel löschen |
| `moveperm <from> <to>` | `mp` | Administrator oder Berechtigungsrolle | Regeln neu anordnen |
| `resetperms` | | Administrator | Jede Regel löschen |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrator oder Berechtigungsrolle | Befehlsregel, ganzer Server |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrator oder Berechtigungsrolle | Modulregel, ganzer Server |
| `allsrvrmdls <enable|disable>` | `asm` | Administrator oder Berechtigungsrolle | Alle Module, ganzer Server |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrator oder Berechtigungsrolle | Befehlsregel für eine Rolle |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrator oder Berechtigungsrolle | Modulregel für eine Rolle |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrator oder Berechtigungsrolle | Alle Module für eine Rolle |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrator oder Berechtigungsrolle | Befehlsregel in einem Kanal |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrator oder Berechtigungsrolle | Modulregel in einem Kanal |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrator oder Berechtigungsrolle | Alle Module in einem Kanal |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrator oder Berechtigungsrolle | Befehlsregel in einer Kategorie |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrator oder Berechtigungsrolle | Modulregel in einer Kategorie |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrator oder Berechtigungsrolle | Alle Module in einer Kategorie |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrator oder Berechtigungsrolle | Befehlsregel für ein Mitglied |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrator oder Berechtigungsrolle | Modulregel für ein Mitglied |
| `allusrmdls <enable|disable> @user` | `aum` | Administrator oder Berechtigungsrolle | Alle Module für ein Mitglied |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrator oder Berechtigungsrolle | Einen Cooldown setzen oder löschen |
| `allcmdcooldowns` | `acmdcds` | Administrator oder Berechtigungsrolle | Cooldowns auflisten |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrator | Eine Discord-Berechtigungs-Überschreibung setzen oder entfernen |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrator | Überschreibungen auflisten |
| `discordpermoverridereset` | `dpor` | Administrator | Alle Überschreibungen löschen |
| `globalmodule <module>` | `gmod` | Bot-Owner | Ein Modul überall umschalten |
| `globalcommand <command>` | `gcmd` | Bot-Owner | Einen Befehl überall umschalten |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Bot-Owner | Globale Sperren auflisten |
| `resetglobalperms` | | Bot-Owner | Globale Sperren löschen |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Bot-Owner | Einen Nutzer auf die schwarze Liste setzen |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Bot-Owner | Einen Kanal auf die schwarze Liste setzen |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Bot-Owner | Einen Server auf die schwarze Liste setzen |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Bot-Owner | Die Durchsetzung der schwarzen Liste erneut ausführen |

## Tipps und Stolperfallen

- `resetperms` ist von der Regelprüfung ausgenommen, sodass du dich immer von einer Regel erholen kannst, die alles gesperrt hat, solange du Administrator bist.
- Regeln werden über den kanonischen Namen des Befehls abgeglichen, daher sind `srvrcmd clear disable` und `srvrcmd purge disable` dieselbe Regel. Verwende den ersten Namen aus `help <command>`.
- Eine Regel für „alle Module" deckt auch das Berechtigungsmodul ab. Wenn du einer Rolle alles verbietest, können Mitglieder mit nur dieser Rolle auch `listperms` nicht ausführen.
- Kategorie-Regeln verwenden die übergeordnete Kategorie des Kanals zum Zeitpunkt der Ausführung des Befehls; Threads erben von ihrem übergeordneten Kanal.
- Discord-Berechtigungs-Überschreibungen ändern, welche Discord-Berechtigung verlangt wird, nicht, wen die Regeln zulassen. Nutze beides zusammen: eine Überschreibung, um die Hürde zu senken, dann eine Regel, um einzuschränken, wo.
- Berechtigungsregeln gelten nie in DMs.
- Das Dashboard beschriftet die Zielauswahl mit Ganzer Server, Eine Rolle, Ein Kanal, Eine Kategorie und Ein bestimmter Nutzer; die Nutzer-Option nimmt eine eingefügte Nutzer-ID.
