const {getServerDB} = require('./DataBase');

module.exports = {
    name: 'addyen',
    aliases: ['ay'],
    description: "Ajoute une valeur de yens a un joueur",

    async execute(message, args) {
        db = getServerDB(message.guild.id);
        const quantity = parseInt(args[0]);
        const target = message.mentions.users.last();

        const allowedRoles = ["1403888481356353639"];
        if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
            return message.channel.send("❌ Tu n'as pas la permissions d'utilisé cette commande.")
        }

        
        if (!quantity || isNaN(quantity)) {
            return message.channel.send("❌ Tu dois mentionner une certaines quantité");
        }

        if (!target) {
            return message.channel.send("❌ Tu dois mentionner un joueur");
        }

        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(target.id);

        const row = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(target.id);

        const newBalance = row.banque + quantity;

        db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(quantity, target.id);

        return message.channel.send(
            `+ ${quantity}¥ ! **${target.username}** a désormais ${newBalance}¥`
        );
    }
};