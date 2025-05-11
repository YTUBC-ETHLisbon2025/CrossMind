const express = require('express');
const claudeAgent = require('../services/claudeAgent');
const { mnemonicToAccount } = require('viem/accounts');
const router = express.Router();

/**
 * POST /api/agent/chat
 * Send a message to the Claude agent
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await claudeAgent.sendMessage(message);
    return res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/agent/reset
 * Reset the conversation history
 */
router.post('/reset', (req, res) => {
  try {
    claudeAgent.clearHistory();
    return res.json({ success: true, message: 'Conversation history cleared' });
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get-wallet-address', (req, res) => {
  const seedPhrase = process.env.SEED_PHRASE;
  if (!seedPhrase) {
    return res.status(500).json({ error: 'Seed phrase not found' });
  }
  const walletAddress = mnemonicToAccount(seedPhrase).address;
  return res.json({ walletAddress });
})

module.exports = router; 