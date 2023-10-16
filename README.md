# Pancakeswap Prediction Bot

## Overview

The Pancakeswap Prediction Bot is a powerful tool designed to help you maximize your profits in the "Pancakeswap Prediction" game. Operating in the Node.js environment, this bot excels at copying the trading strategies of successful players, offering a secure and highly profitable experience.

## Features

- **Smart Copying:** Our bot automatically scans the blockchain for players with win rates exceeding 70%, making the Martingale strategy significantly safer and more lucrative.

- **Automated Trading:** The bot takes care of trading tasks on your behalf, executing orders and managing your portfolio based on the strategies of top-performing traders.

- **Configuration and Control:** Customize the bot's behavior using a configuration file (`.env`) to match your preferences and trading goals.

## Getting Started

To begin using the Pancakeswap Prediction Bot:

1. **Prerequisites:** Ensure you have Node.js installed on your system. If not, you can download it from the [Node.js official website](https://nodejs.org/).

2. **Clone Repository:** Clone this repository to your local machine using `git clone`.

3. **Install Dependencies:** Run `npm install` to install the required Node.js packages and dependencies.

4. **Configure .env:** Create a `.env` file in the project's root directory and customize the settings (explained below).

5. **Run the Bot:** Execute `npm start` to start the bot. It will automatically search for top-performing traders with win rates above 70% and begin tracking and copying their strategies.

## .env Configuration

The `.env` file contains the configuration settings for the bot. Here's what each setting means:

- `PRIVATE_KEY`: Your cryptocurrency wallet's private key.

- `DEMO_MODE`: Set to `1` for demo mode, and `0` for live trading.

- `COPY_WIN_RATE`: Minimum win rate percentage for the bot to copy a player (set to 70% or higher for maximum safety and profitability).

- `COPY_ROUNDS_PLAYED`: Minimum number of rounds a player must have participated in to be considered for copying.

- `BET_AMOUNT`: The amount to bet.

- `MARTINGALE`: Set to `1` for Martingale usage, and `0` to disable it.

- `MARTINGALE_MULTIPLIER`: The multiplier for the Martingale strategy.

- `TIME_TO_BET`: The time (in seconds) before the end of a round when the bot should place a bet.

- `BSC_BASE_RPC`: The base Binance Smart Chain RPC provider.

- `BSC_RPC_LIST`: A comma-separated list of Binance Smart Chain RPC providers for data redundancy.

Customize these settings in the `.env` file to align with your preferences and objectives.

## Disclaimer

Trading cryptocurrencies and using automated bots carries inherent risks. Past performance is not indicative of future results. Only use this bot if you fully understand the risks and have cryptocurrency trading experience. Trade responsibly and never invest more than you can afford to lose.

## Contribution

You're welcome to contribute to this project by forking the repository, making improvements, and submitting pull requests. Your contributions are highly appreciated!

## License

This project is licensed under the [MIT License](LICENSE.md).

Happy trading, and may your profits soar with the Pancakeswap Prediction Bot!
