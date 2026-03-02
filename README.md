# Poker Odds Calculator 🃏

A complete Texas Hold'em Poker Odds Calculator and game simulator built with React, Vite, and TypeScript. 

Calculate the winning chances (equity) for hero and opponents right in your browser quickly and accurately!

## Features
- **Fast Odds Calculation:** Instantly calculates your win, tie, and loss probabilities.
- **Two Distinct Modes:**
  - **Dealing Mode:** Deal out a full poker hand round by round (Preflop, Flop, Turn, River) to simulate real scenarios. 
  - **Manual Mode:** Set the hero's cards and the board, and find the equity against a chosen number of random opponent hands.
- **Monte Carlo Accuracy:** A robust background Monte Carlo simulation ensures high-precision equity outputs based on massive sample sizes.
- **Interactive Hand Selection:** Click any empty slot to choose from an intuitive card modal. It also includes a "Random Card" button to automatically pick from available cards.
- **Automated Nuts Detection:** Instantly identifies the absolute best possible hand (the "Nuts") on any given board.
- **Built-in Hand Rankings:** Unsure of a flush vs. a full house? Open the visual ranking guide straight from the app.
- **Flexible Player Options:** Add up to 10 players dynamically without resetting your hand parameters.

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- npm (or yarn/pnpm).

### Installation
1. Clone the repository.
2. Run `npm install` inside the project folder to prepare all dependencies.

### Running the App Locally
Start up the local Vite dev server by running:
```bash
npm run dev
```
Open up the provided `http://localhost:5173/` (or similar) link in your browser to view the application.

### Building for Production
To generate a production-ready build in the `dist/` directory, run:
```bash
npm run build
```

## How to use the App
- **Switch Modes:** The main UI shifts depending on whether dealing mode is active or not. The background styles respond accordingly.
- **Managing Players:** 
  - In *Dealing mode*, use the dedicated "+ Add Player" button up to 10 opponents. 
  - In *Manual mode*, adjust the total players stepper to match the situation you want to run.
- **Simulating Deals:** In *Dealing mode*, tap the deal button to progress through Preflop (deals 2 cards to players), Flop (deals 3 to board), Turn & River (deals 1 to board).
- **Assigning specific cards:** Need to calculate a custom hand? Click on any empty card slot on the board or in a player's hand to open the selection modal.
- **Clearing Options:** Use the reset button to wipe out all cards and active scenarios quickly without completely removing the extra players you added. Hovering over assigned players also allows spot deletion.
