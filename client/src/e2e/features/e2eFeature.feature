Feature: A feature in root

  Background::
    Given a root precondition

  Scenario: a complex scenario
    Given a second root precondition
      And another root precondition
      But not the third root precondition
     When a root action
      And another root action
      But not the third root action
     Then a root result
      And another root result
      But not the third root result

  Scenario: a second but simple scenario
     When a simple root action
     Then a simple root result
