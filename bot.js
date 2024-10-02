// Import the Bot class from core.js
const RCE_BOT = require('./core'); // Make sure core.js exports the class properly

// Instantiate and start the bot
const bot = new RCE_BOT(); // Create an instance of the bot

bot.start(); // Start the bot

process.on('uncaughtException', err => {
    bot.client.functions.log("error",`Uncaught Exception : ${JSON.stringify(err.message)}`)
})
process.on('unhandledRejection', (reason, promise) => {
    bot.client.functions.log("error", 'Unhandled Rejection At ' + JSON.stringify(reason) + `, Reason : ${JSON.stringify(reason.message)}`)
})

// Export the `client` object from the instantiated bot for use in other files
module.exports = bot; 
