---
title: "Coding Pattern: Object Oriented Programming"
date: 2026-01-17
summary: "Overview of Object Oriented Programming in Python using League of Legends as an example."
tags: ["Python", "Coding Pattern"]
draft: false
---
## Overview

In Coding Pattern, ***Object Oriented Programming***, we will try to recognize the purpose of Object Oriented Programming and define the basic concepts that drive this concept.

## So what even is Object Oriented Programming?
**Object Oriented Programming (OOP)** is a coding paradigm that influences the way in which you code through building *objects*. We can use League of Legends as an example to explain the importance of Object Oriented Programming. Specifically, let's say somebody was tasked with programming the champion, Lux, into the game.

A person without knowledge of OOP might declare Integer variables for HP, Mana, and other Stats. This person may then write various functions to program her Q, W, and E abilities to her toolkit. 

```python
Lux_HP = 580
Lux_Mana = 480
def Lux_Q():
    ...
...

Garen_HP = 
Garen_Mana =
def garen_Q
``` 
This might work, but what happens when this person is tasked with programming another champion in the game, Garen? Or a hundred more champions? Defining a champion and their kit in this manner is nowhere near scalable and would just result in a disaster of a codebase. Not only would this user benefit from a way to easily organize and group a champion's associated variables and stats, but they also need to find a way to templatize the construction of a champion.

This is where the benefit of Object Oriented programming comes in. Instead of defining each champion’s stats and abilities as disconnected variables and functions, we can model a Champion as an object. Every champion shares common properties—health, mana, abilities—but each champion can still have unique behavior.

Within Python, the following code reveals a good example of object oriented programming.

```python
class Champion:
    def __init__(self, name, hp, mana):
        self.name = name
        self.hp = hp
        self.mana = mana

    def q_ability(self):
        raise NotImplementedError("Q ability not implemented")

    def w_ability(self):
        raise NotImplementedError("W ability not implemented")

    def e_ability(self):
        raise NotImplementedError("E ability not implemented")

    def take_damage(self, damage):
        self.hp -= damage
        print(f"{self.name} takes {damage} damage. HP remaining: {self.hp}")
```

## Four Pillars of OOP
In most programming languages, Object Oriented Programming centers itself around 4 concepts: Encapsulation, Inheritance, Abstraction, and Polymorphism.

1. **Encapsulation** promotes modularity within your code. It encourages users to bundle attributes (variables) and behaviors(functions) together to form a single unit object. 
2. **Inheritance** establishes a parent-child hierarchy between objects, in which the children can inherit certain attributes or methods from the parent. 
3. **Abstraction** simplifies the view of an object to it's bare essential functionality. It hides unecessary details from interacting objects.
4. **Polymorphism** allows you to treat objects of different types as the same base type, as long as they implement the necessary core functionality.

In the champion example above, each of the four pillars of Object Oriented Programming is naturally applied. Encapsulation is demonstrated by bundling a champion’s stats and abilities into a single Champion object rather than scattering variables and functions across the codebase. Inheritance appears when specific champions like Lux and Garen derive from the base Champion class, reusing shared logic while defining their own unique abilities. Abstraction is achieved by defining a common interface for abilities (q_ability, w_ability, e_ability) in the base class, allowing users to interact with champions without needing to know the internal implementation of each ability. Finally, Polymorphism allows different champions to be treated interchangeably as Champion objects—any champion can be passed around, stored, or acted upon in the same way, while still executing their own champion-specific behavior.

## Defining Classes in Python

To define a class in Python, use the `class` keyword. A class is a template for creating objects (instances). Each object can have its own data and functions. Example:

```python
class Champion:
    def __init__(self, name):
        self.name = name
    def charm(self):
        print(f"{self.name} blows a kiss!")

ahri = Champion("Ahri")
ahri.charm()  # Ahri blows a kiss!
```

## Instantiation

Instantiation is when you create an object from a class. The `__init__` method is the constructor and runs when you make a new object. `self` is how the object refers to itself. You call the class like a function to make an instance:

```python
eve = Champion("Evelyn")
eve.charm()  # Evelyn blows a kiss!
```
Attributes are variables on the object, methods are functions on the object.

## Inheritance in Python

Inheritance lets you make a new class based on an existing one. The new class (child) gets the attributes and methods of the parent class, but you can add or change things. Example:

```python
class ADC:
    def shoot(self):
        print("Bang!")

class Smolder(ADC):
    def shoot(self):
        print("Fireball!")

redteam_smolder = Smolder()
redteam_smolder.shoot()  # Fireball!
```

## Thinking Strategically

When designing classes, think about what data and methods you really need. Pick data structures that make your code efficient. For example, use a dictionary if you need fast lookups, or a list if you care about order. Consider how often a method will run and what time complexity matters. 