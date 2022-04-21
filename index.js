const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options.js");
const token = "5373048166:AAGaOaw4HHmtMvh-1MCTdFaGLuQeQ6-2u_k";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Сейчас я загадаю цифру от 0 до 9, а ты угадай!"
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию о пользователе" },
    { command: "/game", description: "Игра угадай цифру" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/744/1fd/7441fd81-d1db-309b-8b03-0c1d296943c8/1.jpg"
      );
      return bot.sendMessage(chatId, "Добро пожаловать");
    }
    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз!");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chat = msg.message.chat.id;
    console.log(data);
    if (data === "/again") {
      return startGame(chat);
    }
    if (+data === chats[chat]) {
      return await bot.sendMessage(
        chat,
        `Поздравляю ты отгадал цифру ${chats[chat]}`,
        againOptions
      );
    } else {
      return await bot.sendMessage(
        chat,
        `К сожалению ты не угадал, бот загадал цифру ${chats[chat]}`,
        againOptions
      );
    }
  });
};

start();
