const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options.js");
const token = "5373048166:AAGaOaw4HHmtMvh-1MCTdFaGLuQeQ6-2u_k";
const sequelize = require("./db.js");
const bot = new TelegramApi(token, { polling: true });
const UserModel = require("./models");
const chats = {};

const startGame = async (chatId) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log("Подключения к бд сломалось", e);
  }

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
    console.log(text, chatId);
    try {
      if (text === "/start") {
        await UserModel.findOne({ chatId });

        await bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/744/1fd/7441fd81-d1db-309b-8b03-0c1d296943c8/1.jpg"
        );
        console.log("1");

        return bot.sendMessage(chatId, "Добро пожаловать");
      }
      if (text === "/info") {
        const user = await UserModel.findOne({ chatId });

        return bot.sendMessage(
          chatId,
          `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`
        );
      }

      if (text === "/game") {
        return startGame(chatId);
      }

      return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз!");
    } catch (e) {
      return bot.sendMessage(chatId, e);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log(data);
    if (data === "/again") {
      return startGame(chatId);
    }
    const user = await UserModel.findOne({chatId})
    if (+data === chats[chatId]) {
      user.right += 1
      await bot.sendMessage(
        chatId,
        `Поздравляю ты отгадал цифру ${chats[chatId]}`,
        againOptions
      );
    } else {
      user.wrong += 1
      await bot.sendMessage(
        chatId,
        `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`,
        againOptions
      );
    }
    await user.save();
  });
};

start();
