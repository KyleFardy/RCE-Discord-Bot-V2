// Import the Bot class from core.js
const RCE_BOT = require('./core'); // Make sure core.js exports the class properly

// Instantiate and start the bot
const bot = new RCE_BOT(); // Create an instance of the bot

bot.start(); // Start the bot

process.on('uncaughtException', err => {
    bot.client.functions.log("error",
        `Uncaught Exception:\nMessage: ${err.message}\nStack: ${err.stack}\nError Object: ${JSON.stringify(err, null, 2)}`
    );
    // Optionally exit after logging, depending on how you want to handle crashes
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    bot.client.functions.log("error",
        `Unhandled Rejection:\nReason: ${reason?.message || reason}\nStack: ${reason?.stack || 'N/A'}\nPromise: ${JSON.stringify(promise, null, 2)}`
    );
    // Optionally exit or handle accordingly
});

// Export the `client` object from the instantiated bot for use in other files
module.exports = bot; 
