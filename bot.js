//7987240578:AAHIc5vrd0IxK6tlDGoMGato6JG5znwZz5s

const { Telegraf } = require('telegraf');
const axios = require('axios');

console.log("Token is:", process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);


// Хранилище времени последнего запроса
const userLastRequest = new Map();

// /start
bot.start((ctx) => ctx.reply('Салам! Пришли мне ссылку на TikTok-видео.'));

// Обработка текста
bot.on('text', async (ctx) => { 
  const userId = ctx.from.id;
  const now = Date.now();
  const lastTime = userLastRequest.get(userId) || 0;

  // Проверка: не чаще 10 секунд
  if (now - lastTime < 10000) {
    return ctx.reply('🚫 Пожалуйста, подожди 10 секунд перед следующей ссылкой.');
  }

  userLastRequest.set(userId, now); // обновляем время

  const url = ctx.message.text;

  if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
    return ctx.reply('Пожалуйста, пришли настоящую ссылку на TikTok.');
  }

  try {
    await ctx.reply('⏳ Обрабатываю ссылку, подожди немного...');

    const response = await axios.get('https://tikwm.com/api', {
      params: { url }
    });

    const videoData = response.data?.data;

    if (videoData?.play) {
      await ctx.replyWithVideo({ url: videoData.play }, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔁 Скачать другое видео', callback_data: 'repeat' }]
          ]
        }
      });
    } else {
      ctx.reply('😕 Не удалось получить видео. Попробуй другую ссылку.');
    }

  } catch (error) {
    console.error('Ошибка при обращении к API:', error.message);
    ctx.reply('🚫 Произошла ошибка. Попробуй снова позже.');
  }
});

// Обработка кнопки 🔁
bot.action('repeat', async (ctx) => {
  await ctx.answerCbQuery(); // скрывает "часики"
  await ctx.reply('Пришли следующую ссылку на TikTok-видео 👇');
});

bot.launch();
console.log('Бот запущен 🚀');
