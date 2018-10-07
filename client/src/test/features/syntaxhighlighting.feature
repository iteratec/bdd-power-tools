# language: de
# Kommentar
Funktionalität: Einfärbung der Gherkin Keywords

  @tag: Kategorie
  Szenario: Einfärbung von Szenario
    Angenommen es gibt schon steps in anderen .feature files
    """
    docStrings
    """
    Und dann noch Tabellendaten
    | Spalte1 | Spalte2 |
    | Wert    | Wert    |
    Wenn ich ein neues Szenario schreibe
    Dann bekomme ich bestehende "Schritte" vorgeschlagen

