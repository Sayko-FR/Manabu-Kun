const { Collection, Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { getServerDB } = require('./Commands_prefix/DataBase.js');
require('dotenv').config();

const client = new Client ({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

//Stockage commandes prefixes
client.prefixCommands = new Collection();
const prefix = process.env.PREFIX || "$";

const commandPath = path.join(__dirname, 'Commands_prefix');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandPath, file));
    if (command.name) {
        client.prefixCommands.set(command.name, command);
    }
}
console.log(`${client.prefixCommands.size} commandes préfices ont été chargées.`);

// Quand le bot est prêt
client.on('clientReady', async () => {
    console.log(`Connecté en tant que : ${client.user.tag}`);

    client.guilds.cache.forEach(async guild => {

        const db = getServerDB(guild.id);
        const members = await guild.members.fetch();

        members.forEach(member => {
            if(member.user.bot) return;

            const row = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(member.id);

            if(!row) {
                db.prepare("INSERT INTO banques (user_id, banque) VALUES (?, ?)").run(member.id, 0);
            }
        });

        console.log(`✅ Base de données initialisé pour le serveur : ${guild.name}`);
    });

    console.log('✅ Base de données des joueurs initialisée !');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName) || client.prefixCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (err) {
        console.error(err);
        message.reply("Une erreur est survenu lors du chargement de la commande");
    }
});

client.login(process.env.TOKEN)
    .then(() => console.log('🔑 Tentative de connexion...'))
    .catch(err => console.error('❌ Erreur lors de la connexion :', err));