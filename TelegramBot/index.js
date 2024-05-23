const TelegramBot = require('node-telegram-bot-api');

const token = 'Your T0ken ftrom bot father';


const bot = new TelegramBot(token, { polling: true });


const userData = {};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to Inspire Bot. Use /help to see available commands.");
});

// Listen for /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Available commands:\n" +
      "/order - Place a new order\n" +
      "/progress - Check the progress of your order"
  );
});

// Listen for /order command
bot.onText(/\/order/, (msg) => {
    userData[msg.chat.id] = {}; // Initialize user data object

    // Ask for user's name
    bot.sendMessage(msg.chat.id, "Please enter your name:");

    bot.once('message', (msg) => {
        userData[msg.chat.id].name = msg.text;

        bot.sendMessage(msg.chat.id, "Please enter your middle name (if any):");

        bot.once('message', (msg) => {
            userData[msg.chat.id].middleName = msg.text;

            bot.sendMessage(msg.chat.id, "Please enter your last name:");

            bot.once('message', (msg) => {
                userData[msg.chat.id].lastName = msg.text;

                bot.sendMessage(msg.chat.id, "Please enter your phone number (including country code):");

                bot.once('message', (msg) => {
                    userData[msg.chat.id].phone = msg.text;

                    bot.sendMessage(msg.chat.id, "Please enter your email address (optional):");

                    //  email
                    bot.once('message', (msg) => {
                        userData[msg.chat.id].email = msg.text;

                        // Provide options for payment gateways
                        const paymentOptions = {
                            reply_markup: JSON.stringify({
                                keyboard: [
                                    [{ text: 'CBE' }, { text: 'Chapa' }],
                                    [{ text: 'Stripe' }, { text: 'Telebirr' }]
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: true
                            })
                        };

                        // a payment gateway
                        bot.sendMessage(msg.chat.id, "Please choose a payment gateway:", paymentOptions)
                            .then(() => {
                                // user's choice
                                bot.once('message', (msg) => {
                                    const chosenPaymentGateway = msg.text;

                                    // Confirm the order and provide a summary
                                    bot.sendMessage(msg.chat.id, `Your order is confirmed. Payment will be processed via ${chosenPaymentGateway}.`);

                                    // Clear user data
                                    delete userData[msg.chat.id];
                                });
                            });
                    });
                });
            });
        });
    });
});

// Listen for /progress command
bot.onText(/\/progress/, (msg) => {
    bot.sendMessage(msg.chat.id, "Your order is currently being processed.");
});
