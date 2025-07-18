<<<<<<< HEAD
# RNS Presale Monitor Bot

24/7 Telegram bot that monitors ETH deposits to the RNS presale address and sends notifications to your Telegram group.

## Features
- ✅ Monitors ETH transactions every 2 minutes
- ✅ Sends formatted notifications with transaction details
- ✅ Shows USD value of deposits
- ✅ Includes Etherscan links
- ✅ Runs completely free on GitHub Actions
- ✅ Tracks last processed transaction to avoid duplicates

## Setup Instructions

1. **Fork this repository**
2. **Add GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `TELEGRAM_BOT_TOKEN`: `7844566364:AAFEmZPwViBVK--lVdE3QQhgC1bQPiiYrpM`
   - `TELEGRAM_CHAT_ID`: `-1002529721649`
   - `ETHERSCAN_API_KEY`: `UF1C799NDAK3N4W2H9HV56D3EN4DMBTWXA`
   - `PRESALE_ADDRESS`: `0xe92A4c99F316D62BFf221cf61939072093267b51`

3. **Enable GitHub Actions** (Actions tab → Enable)
4. **Manual trigger** first run (Actions → RNS Presale Monitor → Run workflow)

## How It Works
- GitHub Actions runs the monitor every 2 minutes
- Checks Etherscan API for new transactions to presale address
- Sends Telegram notifications when deposits are found
- Saves state to avoid duplicate notifications

## Message Format
```
🚀 NEW RNS PRESALE ENTRY!

💰 Amount: 0.5000 ETH ($1,250.00)
👤 From: 0x1234...5678
🏦 To: 0xe92A...7b51
⛽ Gas Used: 21,000
🔗 Transaction: View on Etherscan
⏰ Time: 1/18/2025, 10:30:00 AM

🎉 Welcome to the RNS presale!
```

## Monitoring Status
The bot automatically tracks the last processed transaction to ensure no duplicates are sent.
=======
# rns-presale-monitor
>>>>>>> 6ff8feb9ac6c42e921590f6f83c0879de43ab6ed
