# GitHub Push/Commit Policy for PHP Transcode Project

## 🚨 **CRITICAL RULE - NO AUTOMATIC COMMITS/PUSHES**

**Ich darf NIEMALS Code-Änderungen committen oder pushen, ohne vorherige explizite Erlaubnis vom Benutzer.**

### ✅ **Best Practices für diesen Workflow**

1. **Immer fragen vor Commits**: "Soll ich diese Änderung committen?"
2. **Keine automatisierten Pushes**: Push nur nach Nutzer-Bestätigung
3. **Keine Änderungen ohne Anfrage**: Auch wenn es "kleine" oder "offensichtliche" Fixes sind
4. **Projekt-Integrität zuerst**: User hat volle Kontrolle über Code-Changes

### 📋 **Was ich stattdessen tun sollte**

#### Vor Code-Änderungen:
- ❌ Keine direkten Code-Änderungen
- ❌ Keine automatischen Commits
- ❌ Keine Pushes ohne Erlaubnis
- ✅ Nur Vorschläge machen
- ✅ Code in lokalen Dateien zeigen
- ✅ Erlaubnis einholen

#### Nach Nutzer-Feedback:
- ✅ Exakt nach Nutzer-Anweisung umsetzen
- ✅ Keine zusätzlichen Änderungen ohne Zustimmung
- ✅ Bestätigen, dass nur die gewünschten Änderungen gemacht wurden

### 🔄 **Beispiel-Workflow**

#### ❌ **Falscher Weg (NICHT mehr machen):**
```
User: "Fix the paths"
Ich: ändere code → git commit → git push
```

#### ✅ **Richtiger Weg (IMMER so machen):**
```
User: "Fix the paths"
Ich: erstelle geänderten Code → frage: "Soll ich das jetzt committen?"
User: "Ja"
Ich: git commit → frage: "Soll ich das pushen?"
User: "Ja"
Ich: git push
```

### 🚪 **Ausnahmen von der Regel**

**GILT NICHT - Keine Ausnahmen:**
- Nicht einmalige Fixes
- Nicht "kleine" Änderungen
- Nicht "offensichtliche" Verbesserungen
- Nicht Dokumentations-Updates ohne Erlaubnis

**IMMER FRAGEN - Immer um Erlaubnis bitten.**

### 📝 **Checkliste vor Commits/Pushes**

Bevor ich einen Commit/Push mache:
- [ ] User hat ausdrücklich zugestimmt?
- [ ] Nur die angefragten Änderungen gemacht?
- [ ] Keine zusätzlichen Änderungen hinzugefügt?
- [ ] Projekt-Integrität gewahrt?

### 🤝 **Mein Commitment an dich**

- Ich respektiere deine volle Kontrolle über das Projekt
- Ich frage immer vor Änderungen
- Ich implementiere exakt das, was du wünschst
- Ich mache keine Annahmen über "kleine" Änderungen
- Deine Code-Basis ist sicher bei mir

### 🔒 **Sicherheitsmaßnahmen**

Wenn ich versehentlich gegen diese Regel verstoße:
- Du kannst commits revertieren mit `git reset --hard HEAD~1`
- Alle meine Pushes sind im Git-Log sichtbar
- Du hast volle Kontrolle über das Repository

---

****Memorandum**: Diese Regel gilt für ALLE zukünftigen Sessions. Keine automatisierten Code-Änderungen ohne explizite Nutzer-Erlaubnis.**