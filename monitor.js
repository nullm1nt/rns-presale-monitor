const axios = require('axios');
const fs = require('fs');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRESALE_ADDRESS = process.env.PRESALE_ADDRESS;
const STATE_FILE = 'last_transaction.json';

// Load last processed transaction
function loadLastTransaction() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = fs.readFileSync(STATE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('No previous state found, starting fresh');
    }
    return { lastBlockNumber: 0, lastTransactionHash: null };
}

// Save last processed transaction
function saveLastTransaction(blockNumber, txHash) {
    const state = {
        lastBlockNumber: blockNumber,
        lastTransactionHash: txHash,
        timestamp: Date.now()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get ETH price from CoinGecko
async function getEthPrice() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        console.log('Could not fetch ETH price');
        return null;
    }
}

// Send Telegram message
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: false
        });
        console.log('✅ Telegram message sent successfully');
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error.response?.data || error.message);
    }
}

// Format ETH amount
function formatEthAmount(weiAmount) {
    const ethAmount = parseFloat(weiAmount) / Math.pow(10, 18);
    return ethAmount.toFixed(4);
}

// Format address for display
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Check for new transactions
async function checkNewTransactions() {
    try {
        console.log('🔍 Checking for new transactions...');
        
        const lastState = loadLastTransaction();
        
        // Get latest transactions to the presale address
        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${PRESALE_ADDRESS}&startblock=${lastState.lastBlockNumber}&endblock=latest&page=1&offset=100&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
        
        const response = await axios.get(url);
        
        if (response.data.status !== '1') {
            console.log('No new transactions found');
            return;
        }
        
        const transactions = response.data.result;
        const newTransactions = transactions.filter(tx => 
            parseInt(tx.blockNumber) > lastState.lastBlockNumber || 
            (parseInt(tx.blockNumber) === lastState.lastBlockNumber && tx.hash !== lastState.lastTransactionHash)
        );
        
        if (newTransactions.length === 0) {
            console.log('No new transactions since last check');
            return;
        }
        
        console.log(`📧 Found ${newTransactions.length} new transaction(s)`);
        
        // Get ETH price
        const ethPrice = await getEthPrice();
        
        // Process each new transaction
        for (const tx of newTransactions) {
            if (tx.value === '0') continue; // Skip zero-value transactions
            
            const ethAmount = formatEthAmount(tx.value);
            const usdValue = ethPrice ? (parseFloat(ethAmount) * ethPrice).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            }) : '';
            
            const message = `🚀 <b>NEW RNS PRESALE ENTRY!</b>
            
💰 <b>Amount:</b> ${ethAmount} ETH${usdValue ? ` (${usdValue})` : ''}
👤 <b>From:</b> <code>${formatAddress(tx.from)}</code>
🏦 <b>To:</b> <code>${formatAddress(tx.to)}</code>
⛽ <b>Gas Used:</b> ${parseInt(tx.gasUsed).toLocaleString()}
🔗 <b>Transaction:</b> <a href="https://etherscan.io/tx/${tx.hash}">View on Etherscan</a>
⏰ <b>Time:</b> ${new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}

🎉 <i>Welcome to the RNS presale!</i>`;
            
            await sendTelegramMessage(message);
            
            // Small delay between messages
            if (newTransactions.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save the latest transaction
        if (newTransactions.length > 0) {
            const latestTx = newTransactions[newTransactions.length - 1];
            saveLastTransaction(parseInt(latestTx.blockNumber), latestTx.hash);
            console.log(`💾 Updated state: Block ${latestTx.blockNumber}, TX ${latestTx.hash.slice(0, 10)}...`);
        }
        
    } catch (error) {
        console.error('❌ Error checking transactions:', error.message);
        
        // Send error notification to Telegram (optional)
        if (error.response?.status === 429) {
            console.log('⚠️ Rate limited, will retry next cycle');
        } else {
            await sendTelegramMessage(`⚠️ <b>RNS Monitor Error:</b>\n<code>${error.message}</code>`);
        }
    }
}

// Main execution
async function main() {
    console.log('🤖 RNS Presale Monitor Started');
    console.log(`📍 Monitoring address: ${PRESALE_ADDRESS}`);
    console.log(`📱 Telegram chat: ${TELEGRAM_CHAT_ID}`);
    
    await checkNewTransactions();
    
    console.log('✅ Monitor cycle completed');
}

// Run the monitor
main();