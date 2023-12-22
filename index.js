const { Client, IntentsBitField } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});


const serverCoordinates = new Map();

client.on('ready', async () => {
  console.log('Logged in as ' + client.user.tag);

 
});

client.on('messageCreate', async (message) => {
  if (message.content === '/set') {
    message.reply('Awaiting coordinates...');
    const filter = (m) => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 40000,
    });

    if (collected.size === 0) {
      return message.reply('No coordinates provided. Aborting.');
    }

    const coordinateMessage = collected.first();
    const format = /(\w+) (-?\d+) (-?\d+) (-?\d+)/;
    const matches = coordinateMessage.content.match(format);

    if (!matches) {
      return message.reply(
        'Invalid format. Please provide coordinates in the format: `name x y z`.'
      );
    }

    const name = matches[1];
    const x = parseInt(matches[2]);
    const y = parseInt(matches[3]);
    const z = parseInt(matches[4]);

    // Get the server's coordinate array or create a new one if it doesn't exist
    let serverCoords = serverCoordinates.get(message.guild.id);
    if (!serverCoords) {
      serverCoords = [];
      serverCoordinates.set(message.guild.id, serverCoords);
    }

    serverCoords.push({ name, x, y, z });
    message.reply('Coordinates saved successfully!');
  }

  if (message.content === '/get') {
    message.reply('Awaiting Location...');
    const filter = (m) => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
    });

    if (collected.size === 0) {
      return message.reply('No Location provided. Aborting.');
    }

    const location = collected.first().content;

    const serverCoords = serverCoordinates.get(message.guild.id);
    if (!serverCoords) {
      return message.reply('No coordinates found for the current server.');
    }

    const foundCoords = serverCoords.find((coord) => coord.name === location);
    if (!foundCoords) {
      return message.reply('No coordinates found for the given location.');
    }

    message.reply(`${foundCoords.x}, ${foundCoords.y}, ${foundCoords.z}`);
  }

  if (message.content === '/all') {
    const serverCoords = serverCoordinates.get(message.guild.id);
    if (!serverCoords || serverCoords.length === 0) {
      return message.reply('No coordinates found for the current server.');
    }

    const locations = serverCoords.map(
      (coord) => `${coord.name} = ${coord.x}, ${coord.y}, ${coord.z}`
    );
    message.reply(locations.join('\n'));
  }

  if (message.content === '/deleteLocation') {
    message.reply('Awaiting Location to Delete...');
    const filter = (m) => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
    });

    if (collected.size === 0) {
      return message.reply('No Location provided. Aborting.');
    }

    const location = collected.first().content;

    const serverCoords = serverCoordinates.get(message.guild.id);
    if (!serverCoords) {
      return message.reply('No coordinates found for the current server.');
    }

    const index = serverCoords.findIndex((coord) => coord.name === location);
    if (index === -1) {
      return message.reply('No coordinates found for the given location.');
    }

    serverCoords.splice(index, 1);

    message.reply(`Location '${location}' has been deleted.`);
  }
});


client.login(token);
