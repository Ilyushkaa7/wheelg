# WHEELG

WHEELG is a minimalist fortune wheel web app for random selection.

The name comes from two parts:

- `wheel` - the main idea of the project
- `g` - Golubev, my surname

The project was created for a college assignment where we had to build a fortune wheel with custom settings. My version won the group contest, and even the teacher voted for it.

## Live Demo

[wheelg.ru](https://wheelg.ru)

## Why I Built It

The task was to create a fortune wheel with useful controls:

- exclusions
- custom spin speed
- multiple spins
- number range
- optional sound
- controlled probability / "bias" mode

Many projects tried to add too many features. I wanted to make the opposite: a clean, focused tool with only the controls that are actually needed.

The main idea was minimalism, a smooth user experience, and a Liquid Glass style interface.

## Features

- Random selection by number range
- Exclude specific numbers
- Random selection by custom names
- Import participant lists from `.txt` or `.json`
- Multiple spins in one series
- Slow, normal, fast, and thrill speed modes
- Optional sound
- Result history for the current session
- Explicit bias mode: 75% for an available target when at least two sectors remain
- Desktop-focused interface
- Custom domain connected through GitHub Pages

## Input Modes

### Number Range

The user can set a range, for example:

```text
1 - 30
```

and exclude some numbers:

```text
5, 8, 12
```

### Names

The user can enter names separated by commas:

```text
Ivan, Maria, Alex
```

or upload a `.txt` / `.json` file with a participant list.

TXT example:

```text
Ivan Ivanov
Maria Petrova
Alexey Sidorov
```

JSON example:

```json
[
  "Ivan Ivanov",
  "Maria Petrova",
  "Alexey Sidorov"
]
```

## Bias Mode

The app has a controlled probability mode.

When bias mode is enabled and the target ID is available, the target has a 75% chance and the remaining 25% is shared equally between other available sectors. A single remaining sector has a 100% chance. If the target is unavailable, selection is uniform. The interface displays these per-spin probabilities; exclusions can change them between spins in a series.

This is an explicit demonstration of weighted selection, included in the college assignment. Turn bias mode off for equal probabilities.

## Tech Stack

- HTML
- CSS
- JavaScript
- Canvas API
- GitHub Pages
- Custom domain

## Design

The interface was designed around a minimal Liquid Glass style.

I first imagined the design, described it through prompts, sketched the layout with a marker, and then adjusted the final result in code.

## My Role

I created the idea, interface direction, feature logic, prompts, code adjustments, and final presentation.

AI tools helped me speed up development, but the product idea, minimal design direction, testing, presentation, and final decisions were mine.

## Result

The project won the college group contest for the fortune wheel assignment.

The project combines input validation, Canvas animation, random selection and a deployed browser interface.

## Project Status

The project is deployed and available online.

Future improvements may include:

- better mobile support
- cleaner settings layout
- screenshot section in the README
- improved import validation

