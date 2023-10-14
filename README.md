# Pancakeswap Prediction Bot

## Overview

This bot was designed to help you maximize my profits in the "Pancakeswap Prediction" game. It operates in the Node.js environment and copy the strategies of successful players, helping you secure significant gains.

## Features

- **Performance Tracking:** My bot continuously monitors the performance of top traders in the Pancakeswap Prediction game and emulates their winning strategies.

- **Automated Trading:** The bot handles trading tasks on your behalf, executing orders and managing your portfolio according to the strategies it mimics.

- **Configuration and Control:** The bot's behavior can be fine-tuned using a configuration file (`.env`), allowing you to customize settings according to your preferences.

## Getting Started

Follow these steps to start using the Pancakeswap Prediction Bot:

1. **Prerequisites:** Ensure you have Node.js installed on your system. If not, you can download it from [Node.js official website](https://nodejs.org/).

2. **Clone Repository:** Clone this repository to your local machine using `git clone`.

3. **Install Dependencies:** Run `npm install` to install the required Node.js packages and dependencies.

4. **Configure .env:** Create a `.env` file in the root directory of the project and configure the settings (explained below).

5. **Run the Bot:** Execute `npm start` to start the bot. It will begin tracking and copying successful traders.

## .env Configuration

The `.env` file contains the configuration settings for the bot. Here's what each setting means:

- `PRIVATE_KEY`: Your wallet's private key. Learn how to obtain your private key from [this YouTube tutorial](https://www.youtube.com/watch?v=AM2iob1pNiU).

- `DEMO_MODE`: Set to `1` if you want the bot to run in demo mode, and `0` to run in live mode.

- `COPY_WIN_RATE`: Minimum win rate percentage for the bot to copy a player.

- `COPY_ROUNDS_PLAYED`: Minimum number of rounds a player must have participated in to be considered for copying.

- `BET_AMOUNT`: The amount to bet.

- `MARTINGALE`: Set to `1` if you want the bot to use the Martingale strategy, and `0` to disable it.

- `MARTINGALE_MULTIPLIER`: The multiplier for the Martingale strategy.

- `TIME_TO_BET`: The time (in seconds) before the end of a round when the bot should place a bet.

- `BSC_BASE_RPC`: The base Binance Smart Chain RPC provider.

- `BSC_RPC_LIST`: A comma-separated list of Binance Smart Chain RPC providers for data redundancy.

Make sure to customize these settings in the `.env` file to match your preferences and specific use case.

## Disclaimer

Trading cryptocurrencies and using automated bots carries inherent risks. Past performance is not indicative of future results. Only use this bot if you fully understand the risks and have cryptocurrency trading experience. Trade responsibly, and never invest more than you can afford to lose.

## Contribution

Feel free to contribute to this project by forking the repository, making improvements, and submitting pull requests. Your contributions are highly appreciated!

## License

This project is licensed under the [MIT License](LICENSE.md).

Happy trading, and may your profits soar with the Pancakeswap Prediction Bot!